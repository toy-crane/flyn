import { afterEach, expect, test } from "bun:test";
import {
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { serve, spawn, spawnSync, YAML } from "bun";
import {
  APPROVAL_LABEL,
  CODEX_BOT,
  CODEX_CONTEXT,
  codexReviewState,
  destructiveVerdict,
  findings,
  forbiddenIgnores,
  type IssueComment,
  renderReport,
} from "./merge-gate";

const FILE = "supabase/migrations/20260102000000_next.sql";
const HEAD = "f201715e7c3a4b5d6e7f8091a2b3c4d5e6f70812";
const cli = new URL("./merge-gate.ts", import.meta.url).pathname;

const DROP = [
  "create table public.keep (id int);",
  "",
  "-- 삭제 이유: 교정 25건은 표현 돌아보기로 옮겼다.",
  "-- 2026-09-10 사용자가 신규 전환에 한해 삭제를 승인했다.",
  "drop table public.episode_corrections;",
].join("\n");

function violation(line: number, rule = "ban-drop-table", file = FILE) {
  return {
    file,
    help: null,
    line,
    message: "Dropping a table may break existing clients.",
    rule_name: rule,
  };
}

test("삭제 문장 위의 이유 주석을 찾고 줄 번호를 1부터 센다", () => {
  const [found] = findings([{ path: FILE, text: DROP }], [violation(4)]);
  expect(found).toMatchObject({
    dataLoss: true,
    line: 5,
    reasoned: true,
    rule: "ban-drop-table",
    statement: "drop table public.episode_corrections;",
  });
});

test("이유 주석이 없거나 빈 줄로 떨어져 있거나 내용이 없으면 이유로 치지 않는다", () => {
  for (const text of [
    "drop table public.a;",
    "-- 삭제 이유: 옛 표\n\ndrop table public.a;",
    "-- 삭제 이유:\ndrop table public.a;",
    "-- 옛 표를 지운다\ndrop table public.a;",
  ]) {
    const last = text.split("\n").length - 1;
    const [found] = findings([{ path: FILE, text }], [violation(last)]);
    expect({ reasoned: found?.reasoned, text }).toEqual({
      reasoned: false,
      text,
    });
  }
});

test("여러 줄 문장은 문장이 시작하는 줄 위의 주석을 본다", () => {
  const text = [
    "-- 삭제 이유: 쓰지 않는 열이다.",
    "alter table public.stories",
    "  drop column legacy;",
  ].join("\n");
  const [found] = findings(
    [{ path: FILE, text }],
    [violation(2, "ban-drop-column")]
  );
  expect(found?.reasoned).toBe(true);
});

test("데이터를 지우지 않는 규칙은 참고로만 남긴다", () => {
  const found = findings(
    [
      {
        path: FILE,
        text: "alter table public.a alter column b drop not null;",
      },
    ],
    [violation(0, "ban-drop-not-null")]
  );
  expect(found[0]).toMatchObject({ dataLoss: false, reasoned: false });
  expect(destructiveVerdict(found, [], false).pass).toBe(true);
});

test("데이터를 지우는 규칙을 끄는 squawk-ignore 주석을 찾는다", () => {
  const text = [
    "-- squawk-ignore ban-drop-table",
    "drop table public.a;",
    "-- squawk-ignore require-lock-timeout",
    "-- squawk-ignore-file",
    "-- squawk-ignore-file ban-drop-column, renaming-column",
  ].join("\n");
  expect(
    forbiddenIgnores([{ path: FILE, text }]).map((item) => item.line)
  ).toEqual([1, 4, 5]);
});

test("삭제 문장은 이유 주석과 승인 라벨이 모두 있어야 통과한다", () => {
  const reasoned = findings([{ path: FILE, text: DROP }], [violation(4)]);
  const bare = findings(
    [{ path: FILE, text: "drop table public.a;" }],
    [violation(0)]
  );
  const ignore = { line: 1, path: FILE, text: "-- squawk-ignore-file" };
  expect(destructiveVerdict(reasoned, [], true).pass).toBe(true);
  expect(destructiveVerdict(reasoned, [], false).pass).toBe(false);
  expect(destructiveVerdict(bare, [], true).pass).toBe(false);
  expect(destructiveVerdict([], [], false).pass).toBe(true);
  expect(destructiveVerdict([], [ignore], true).pass).toBe(false);
});

test("PR 댓글은 삭제 문장의 위치를 head 커밋 링크로 먼저 보여 준다", () => {
  const found = findings(
    [{ path: FILE, text: DROP }],
    [violation(0, "require-lock-timeout"), violation(4)]
  );
  const report = renderReport({
    files: [FILE],
    found,
    ignores: [],
    repository: "toy-crane/flyn",
    sha: HEAD,
    verdict: destructiveVerdict(found, [], false),
  });
  expect(report).toContain("<!-- flyn-migration-check -->");
  expect(report).toContain(
    `https://github.com/toy-crane/flyn/blob/${HEAD}/${FILE}#L5`
  );
  expect(report).toContain("ban-drop-table");
  expect(report).toContain(APPROVAL_LABEL);
  // Lock and timeout advice stays folded so the dropped table reads first.
  expect(report.indexOf("require-lock-timeout")).toBeGreaterThan(
    report.indexOf("<details>")
  );
  expect(report.indexOf("ban-drop-table")).toBeLessThan(
    report.indexOf("<details>")
  );
});

function summary(commit: string, status = "✅ **Completed**"): IssueComment {
  return {
    body: [
      "<!-- codex-pull-request-review-summary -->",
      "",
      "## Codex Review Summary",
      "",
      "| Review | Status | Commit | Review trigger |",
      "| --- | --- | --- | --- |",
      `| 📝 **Code Review** | ${status} <relative-time datetime="2026-09-11T00:05:00Z">x</relative-time> | \`${commit}\` | PR opened |`,
    ].join("\n"),
    created_at: "2026-09-11T00:00:00Z",
    html_url: "https://github.com/toy-crane/flyn/pull/1#issuecomment-1",
    updated_at: "2026-09-11T00:05:00Z",
    user: { login: CODEX_BOT },
  };
}

const limit: IssueComment = {
  body: "You have reached your Codex usage limits for code reviews.",
  created_at: "2026-09-11T00:10:00Z",
  html_url: "https://github.com/toy-crane/flyn/pull/1#issuecomment-2",
  user: { login: CODEX_BOT },
};

test("Codex 요약 댓글이 head 커밋의 리뷰 완료를 보여 주면 통과한다", () => {
  const result = codexReviewState([summary(HEAD.slice(0, 7))], HEAD);
  expect(result.state).toBe("success");
  expect(result.targetUrl).toContain("issuecomment-1");
});

test("다른 커밋의 리뷰, 진행 중인 리뷰, 리뷰 없음은 기다린다", () => {
  expect(codexReviewState([summary("1234567")], HEAD).state).toBe("pending");
  expect(
    codexReviewState([summary(HEAD.slice(0, 7), "⏳ **In progress**")], HEAD)
      .state
  ).toBe("pending");
  expect(codexReviewState([], HEAD).state).toBe("pending");
});

test("Codex가 아닌 사람이 쓴 같은 모양의 댓글은 리뷰로 치지 않는다", () => {
  const forged = { ...summary(HEAD.slice(0, 7)), user: { login: "toy-crane" } };
  expect(codexReviewState([forged], HEAD).state).toBe("pending");
});

test("가장 최근 Codex 댓글이 사용량 한도 안내면 실패로 알린다", () => {
  expect(codexReviewState([summary("1234567"), limit], HEAD).state).toBe(
    "failure"
  );
  // A later completed review on the head commit wins over an old notice.
  const later = {
    ...summary(HEAD.slice(0, 7)),
    updated_at: "2026-09-11T01:00:00Z",
  };
  expect(codexReviewState([limit, later], HEAD).state).toBe("success");
});

test("상태 설명은 GitHub 제한인 140자를 넘지 않는다", () => {
  for (const comments of [[], [summary(HEAD.slice(0, 7))], [limit]]) {
    expect(
      codexReviewState(comments, HEAD).description.length
    ).toBeLessThanOrEqual(140);
  }
});

interface GateWorkflow {
  concurrency?: unknown;
  jobs: Record<
    string,
    | {
        if: string;
        name: string;
        permissions: Record<string, string>;
        steps: { run?: string }[];
      }
    | undefined
  >;
  on: {
    issue_comment: { types: string[] };
    pull_request: { types: string[] };
  };
  permissions: Record<string, string>;
}

function workflow(name: string) {
  return YAML.parse(
    readFileSync(
      new URL(`../../.github/workflows/${name}`, import.meta.url),
      "utf8"
    )
  );
}

test("merge 게이트는 PR 갱신, 라벨, 댓글에 반응하고 제목 수정에는 반응하지 않는다", () => {
  const gateFile = workflow("merge-gate.yml") as GateWorkflow;
  expect(gateFile.on.pull_request.types).toEqual([
    "opened",
    "synchronize",
    "reopened",
    "ready_for_review",
    "labeled",
    "unlabeled",
  ]);
  expect(gateFile.on.issue_comment.types).toEqual(["created", "edited"]);
  // A cancelled run could skip removing a stale approval.
  expect(gateFile).not.toHaveProperty("concurrency");
  expect(gateFile.permissions).toEqual({});
});

function gateJob(name: string) {
  const job = (workflow("merge-gate.yml") as GateWorkflow).jobs[name];
  if (!job) {
    throw new Error(`${name} job이 없습니다.`);
  }
  return job;
}

test("삭제 문장 검사 잡 이름은 브랜치 보호의 필수 검사 이름이다", () => {
  const destructive = gateJob("destructive");
  expect(destructive.name).toBe("Destructive migration approval");
  expect(destructive.if).toContain("github.event_name == 'pull_request'");
  expect(destructive.permissions).toEqual({
    contents: "read",
    "pull-requests": "write",
  });
  const commands = destructive.steps.map((step) => step.run).join("\n");
  expect(commands).toContain("squawk-cli@2.65.0");
  expect(commands).toContain("bun scripts/ci/merge-gate.ts destructive");
});

test("Codex 상태는 PR 갱신과 Codex 봇의 댓글에서만 다시 쓴다", () => {
  const codex = gateJob("codex");
  expect(codex.if).toContain(
    `github.event.comment.user.login == '${CODEX_BOT}'`
  );
  expect(codex.if).not.toContain("labeled");
  expect(codex.permissions).toEqual({
    issues: "read",
    "pull-requests": "read",
    statuses: "write",
  });
  expect(codex.steps.at(-1)?.run).toBe("bun scripts/ci/merge-gate.ts codex");
});

test("CI 워크플로는 라벨 이벤트로 다시 돌지 않는다", () => {
  const ci = workflow("ci.yml") as { on: { pull_request: unknown } };
  // No activity types means GitHub's default of opened, synchronize, reopened.
  expect(ci.on.pull_request).toBeNull();
});

interface Call {
  body: unknown;
  method: string;
  path: string;
}

const roots: string[] = [];
afterEach(() => {
  for (const root of roots.splice(0)) {
    rmSync(root, { force: true, recursive: true });
  }
});

function repository(files: Record<string, string>) {
  const root = mkdtempSync(join(tmpdir(), "flyn-merge-gate-"));
  roots.push(root);
  const git = (...args: string[]) => {
    const result = spawnSync(["git", ...args], { cwd: root });
    if (result.exitCode !== 0) {
      throw new Error(result.stderr.toString());
    }
    return result.stdout.toString().trim();
  };
  git("init", "--quiet");
  git("config", "user.name", "CI test");
  git("config", "user.email", "ci@example.test");
  git("config", "commit.gpgsign", "false");
  writeFileSync(join(root, "README.md"), "base\n");
  git("add", ".");
  git("commit", "--quiet", "-m", "base");
  const base = git("rev-parse", "HEAD");
  for (const [path, text] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), text);
  }
  git("add", ".");
  git("commit", "--quiet", "-m", "head");
  const head = git("rev-parse", "HEAD");
  const bin = join(root, ".bin");
  mkdirSync(bin);
  writeFileSync(
    join(bin, "squawk"),
    '#!/bin/sh\nprintf "%s" "$FAKE_SQUAWK"\nexit 1\n',
    { mode: 0o755 }
  );
  return { base, bin, head, root };
}

async function gate(
  mode: "codex" | "destructive",
  event: unknown,
  cwd: string,
  bin: string,
  squawk: unknown[],
  respond: (method: string, path: string) => Response | undefined
) {
  const calls: Call[] = [];
  const server = serve({
    async fetch(request) {
      const url = new URL(request.url);
      const text = await request.text();
      calls.push({
        body: text ? JSON.parse(text) : undefined,
        method: request.method,
        path: url.pathname,
      });
      return (
        respond(request.method, url.pathname) ??
        new Response('{"message":"Not Found"}', { status: 404 })
      );
    },
    port: 0,
  });
  const eventPath = join(cwd, ".event.json");
  writeFileSync(eventPath, JSON.stringify(event));
  try {
    const child = spawn([process.execPath, cli, mode], {
      cwd,
      env: {
        FAKE_SQUAWK: JSON.stringify(squawk),
        GH_TOKEN: "test-token",
        GITHUB_API_URL: `http://localhost:${server.port}`,
        GITHUB_EVENT_PATH: eventPath,
        GITHUB_REPOSITORY: "toy-crane/flyn",
        GITHUB_STEP_SUMMARY: join(cwd, ".summary.md"),
        PATH: `${bin}:${process.env.PATH}`,
      },
      stderr: "pipe",
      stdout: "pipe",
    });
    const code = await child.exited;
    return { calls, code, stderr: await new Response(child.stderr).text() };
  } finally {
    server.stop(true);
  }
}

const json = (value: unknown, status = 200) =>
  new Response(JSON.stringify(value), {
    headers: { "Content-Type": "application/json" },
    status,
  });
const LABEL_PATH = `/repos/toy-crane/flyn/issues/7/labels/${encodeURIComponent(APPROVAL_LABEL)}`;

test("새 커밋이 오면 승인 라벨을 먼저 떼고 판정한다", async () => {
  const repo = repository({ [FILE]: DROP });
  let labels = [{ name: APPROVAL_LABEL }];
  const result = await gate(
    "destructive",
    {
      action: "synchronize",
      pull_request: {
        base: { sha: repo.base },
        head: { sha: repo.head },
        number: 7,
      },
    },
    repo.root,
    repo.bin,
    [violation(4)],
    (method, path) => {
      if (method === "DELETE" && path === LABEL_PATH) {
        labels = [];
        return json([]);
      }
      if (path === "/repos/toy-crane/flyn/issues/7/labels") {
        return json(labels);
      }
      if (path === "/repos/toy-crane/flyn/issues/7/comments") {
        return method === "GET" ? json([]) : json({ id: 1 }, 201);
      }
    }
  );
  expect(result.code).toBe(1);
  const order = result.calls.map((call) => `${call.method} ${call.path}`);
  expect(order.indexOf(`DELETE ${LABEL_PATH}`)).toBeLessThan(
    order.indexOf("GET /repos/toy-crane/flyn/issues/7/labels")
  );
  const posted = result.calls.find((call) => call.method === "POST");
  expect(JSON.stringify(posted?.body)).toContain(APPROVAL_LABEL);
});

test("사람이 라벨을 붙이면 이유 주석이 있는 삭제 문장이 통과하고 댓글을 고친다", async () => {
  const repo = repository({ [FILE]: DROP });
  const result = await gate(
    "destructive",
    {
      action: "labeled",
      pull_request: {
        base: { sha: repo.base },
        head: { sha: repo.head },
        number: 7,
      },
    },
    repo.root,
    repo.bin,
    [violation(4)],
    (method, path) => {
      if (path === "/repos/toy-crane/flyn/issues/7/labels") {
        return json([{ name: APPROVAL_LABEL }]);
      }
      if (
        method === "GET" &&
        path === "/repos/toy-crane/flyn/issues/7/comments"
      ) {
        return json([
          {
            body: "<!-- flyn-migration-check -->\nold",
            id: 5,
            user: { login: "github-actions[bot]" },
          },
        ]);
      }
      if (
        method === "PATCH" &&
        path === "/repos/toy-crane/flyn/issues/comments/5"
      ) {
        return json({ id: 5 });
      }
    }
  );
  expect({ code: result.code, stderr: result.stderr }).toEqual({
    code: 0,
    stderr: "",
  });
  expect(result.calls.some((call) => call.method === "DELETE")).toBe(false);
  expect(result.calls.some((call) => call.method === "POST")).toBe(false);
  expect(result.calls.some((call) => call.method === "PATCH")).toBe(true);
});

test("새 마이그레이션이 없는 PR은 squawk 없이 통과하고 댓글을 만들지 않는다", async () => {
  const repo = repository({ "apps/api/src/index.ts": "export {};\n" });
  rmSync(join(repo.bin, "squawk"));
  const result = await gate(
    "destructive",
    {
      action: "opened",
      pull_request: {
        base: { sha: repo.base },
        head: { sha: repo.head },
        number: 7,
      },
    },
    repo.root,
    repo.bin,
    [],
    (method, path) => {
      if (path === "/repos/toy-crane/flyn/issues/7/labels") {
        return json([]);
      }
      if (
        method === "GET" &&
        path === "/repos/toy-crane/flyn/issues/7/comments"
      ) {
        return json([]);
      }
    }
  );
  expect({ code: result.code, stderr: result.stderr }).toEqual({
    code: 0,
    stderr: "",
  });
  expect(result.calls.some((call) => call.method === "POST")).toBe(false);
});

test("Codex 댓글 이벤트는 PR head 커밋에 Codex 상태를 쓴다", async () => {
  const repo = repository({ "docs/note.md": "head\n" });
  const result = await gate(
    "codex",
    {
      action: "edited",
      comment: { user: { login: CODEX_BOT } },
      issue: { number: 7, pull_request: {} },
    },
    repo.root,
    repo.bin,
    [],
    (method, path) => {
      if (path === "/repos/toy-crane/flyn/pulls/7") {
        return json({
          head: { sha: HEAD },
          html_url: "https://github.com/toy-crane/flyn/pull/7",
          state: "open",
        });
      }
      if (path === "/repos/toy-crane/flyn/issues/7/comments") {
        return json([summary(HEAD.slice(0, 7))]);
      }
      if (
        method === "POST" &&
        path === `/repos/toy-crane/flyn/statuses/${HEAD}`
      ) {
        return json({}, 201);
      }
    }
  );
  expect({ code: result.code, stderr: result.stderr }).toEqual({
    code: 0,
    stderr: "",
  });
  const status = result.calls.find((call) => call.method === "POST");
  expect(status?.body).toMatchObject({
    context: CODEX_CONTEXT,
    state: "success",
  });
});
