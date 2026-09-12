import { appendFileSync, readFileSync } from "node:fs";
import { spawnSync } from "bun";

/**
 * Merging a pull request is the production approval, so two required checks
 * guard the merge: a person approves statements that drop data, and Codex has
 * reviewed the head commit. See docs/decisions/continuous-delivery.md.
 */

/** Put on a pull request only by a person who read the dropping statements. */
export const APPROVAL_LABEL = "DB:destructive-approved";
/** Written by the migration's author directly above a dropping statement. */
export const REASON_PREFIX = "-- 삭제 이유:";
export const CODEX_BOT = "chatgpt-codex-connector[bot]";
/** Commit status context that branch protection requires. */
export const CODEX_CONTEXT = "Codex review";

const REPORT_MARKER = "<!-- flyn-migration-check -->";
const REPORT_AUTHOR = "github-actions[bot]";
const CODEX_SUMMARY_MARKER = "<!-- codex-pull-request-review-summary -->";
/** squawk rules whose statements lose stored data. Every other rule is advice. */
const DATA_LOSS_RULES = new Set([
  "ban-drop-column",
  "ban-drop-database",
  "ban-drop-table",
  "ban-truncate-cascade",
]);
/** squawk reports this when it cannot parse a file, then skips every rule. */
const SYNTAX_ERROR = "syntax-error";
/** Any squawk-ignore, whether in a line, trailing, or block comment. */
const IGNORE_MENTION = /squawk-ignore(?:-file)?\b([^\n]*)/g;
const RULE_LIST = /[\s,:]+/;
const TRAILING_COMMENT = /--.*$/;
const ROW_COMMIT = /`([0-9a-f]{7,40})`/;

export interface SquawkViolation {
  file: string;
  help: string | null;
  /** Zero-based, as squawk's JSON reporter writes it. */
  line: number;
  message: string;
  rule_name: string;
}

export interface MigrationFile {
  path: string;
  text: string;
}

export interface Finding {
  dataLoss: boolean;
  help: string | null;
  /** One-based, as a person and a GitHub link count lines. */
  line: number;
  message: string;
  path: string;
  reasoned: boolean;
  rule: string;
  statement: string;
}

export interface IgnoreDirective {
  line: number;
  path: string;
  text: string;
}

export interface Verdict {
  pass: boolean;
  problems: string[];
}

const isComment = (line: string) => line.trimStart().startsWith("--");

/** squawk points at the clause, so walk back to where the statement begins. */
function statementStart(lines: string[], index: number) {
  let start = index;
  while (start > 0) {
    const previous = lines[start - 1] ?? "";
    // A trailing comment still ends the previous statement at its semicolon.
    const code = previous.replace(TRAILING_COMMENT, "").trimEnd();
    if (!previous.trim() || isComment(previous) || code.endsWith(";")) {
      return start;
    }
    start -= 1;
  }
  return start;
}

/** The comment block touching the statement must carry a non-empty reason. */
function hasReason(lines: string[], start: number) {
  for (let above = start - 1; above >= 0; above -= 1) {
    const line = (lines[above] ?? "").trimStart();
    if (!line.startsWith("--")) {
      return false;
    }
    if (
      line.startsWith(REASON_PREFIX) &&
      line.slice(REASON_PREFIX.length).trim()
    ) {
      return true;
    }
  }
  return false;
}

export function findings(
  files: MigrationFile[],
  violations: SquawkViolation[]
): Finding[] {
  const sources = new Map(
    files.map((file) => [file.path, file.text.split("\n")])
  );
  return violations
    .map((violation) => {
      const lines = sources.get(violation.file);
      if (!lines) {
        throw new Error(
          `검사하지 않은 파일의 squawk 결과입니다: ${violation.file}`
        );
      }
      const start = statementStart(lines, violation.line);
      const dataLoss = DATA_LOSS_RULES.has(violation.rule_name);
      return {
        dataLoss,
        help: violation.help,
        line: violation.line + 1,
        message: violation.message,
        path: violation.file,
        reasoned: dataLoss && hasReason(lines, start),
        rule: violation.rule_name,
        statement: lines
          .slice(start, violation.line + 1)
          .map((line) => line.trim())
          .join(" "),
      };
    })
    .sort(
      (a, b) =>
        Number(b.dataLoss) - Number(a.dataLoss) ||
        a.path.localeCompare(b.path) ||
        a.line - b.line
    );
}

/** An ignore comment would hide a dropping statement from the report. */
export function forbiddenIgnores(files: MigrationFile[]): IgnoreDirective[] {
  const found: IgnoreDirective[] = [];
  for (const file of files) {
    const lines = file.text.split("\n");
    for (const match of file.text.matchAll(IGNORE_MENTION)) {
      const [listed = ""] = (match[1] ?? "").split("*/");
      const rules = listed.split(RULE_LIST).filter(Boolean);
      if (
        rules.length === 0 ||
        rules.some((rule) => DATA_LOSS_RULES.has(rule))
      ) {
        const line = file.text.slice(0, match.index).split("\n").length;
        found.push({
          line,
          path: file.path,
          text: (lines[line - 1] ?? "").trim(),
        });
      }
    }
  }
  return found;
}

export function destructiveVerdict(
  found: Finding[],
  ignores: IgnoreDirective[],
  approved: boolean
): Verdict {
  const dropping = found.filter((item) => item.dataLoss);
  const unreasoned = dropping.filter((item) => !item.reasoned).length;
  const unreadable = found.filter((item) => item.rule === SYNTAX_ERROR).length;
  const problems: string[] = [];
  if (ignores.length > 0) {
    problems.push(
      "데이터를 지우는 규칙을 끄는 `squawk-ignore` 주석은 쓸 수 없습니다. 주석을 지우고 이유 주석과 라벨로 승인받으세요."
    );
  }
  if (unreasoned > 0) {
    problems.push(
      `\`${REASON_PREFIX}\` 주석이 없는 삭제 문장이 ${unreasoned}개 있습니다. 문장 바로 윗줄에 무엇이 사라지고 왜 지워도 되는지 적으세요.`
    );
  }
  if (unreadable > 0 && !approved) {
    problems.push(
      `squawk가 읽지 못한 문장이 ${unreadable}개 있어 그 파일에서 데이터를 지우는 문장을 확인하지 못했습니다. 사람이 파일 전체를 읽어야 합니다.`
    );
  }
  if ((dropping.length > 0 || unreadable > 0) && !approved) {
    problems.push(
      `사람이 이유를 읽고 PR에 \`${APPROVAL_LABEL}\` 라벨을 붙여야 합니다.`
    );
  }
  return { pass: problems.length === 0, problems };
}

interface ReportInput {
  files: string[];
  found: Finding[];
  ignores: IgnoreDirective[];
  repository: string;
  sha: string;
  verdict: Verdict;
}

const cell = (text: string) =>
  text.replaceAll("|", "\\|").replaceAll("`", "'").replaceAll("\n", " ");
const shorten = (text: string, size = 120) =>
  text.length > size ? `${text.slice(0, size - 1)}…` : text;

export function renderReport(input: ReportInput) {
  const { files, found, ignores, repository, sha, verdict } = input;
  const link = (path: string, line: number) =>
    `[${path.split("/").at(-1)}:${line}](https://github.com/${repository}/blob/${sha}/${path}#L${line})`;
  // A person must read these: statements that drop data, and statements squawk
  // could not parse, which hide whatever else is in their file.
  const blocking = found.filter(
    (item) => item.dataLoss || item.rule === SYNTAX_ERROR
  );
  const advice = found.filter((item) => !blocking.includes(item));
  const reason = (item: Finding) => {
    if (!item.dataLoss) {
      return "해당 없음";
    }
    return item.reasoned ? "있음" : "없음";
  };
  const lines = [REPORT_MARKER, "### 마이그레이션 삭제 문장 검사", ""];
  if (files.length === 0) {
    lines.push("이 PR에는 새 마이그레이션이 없습니다.");
    return lines.join("\n");
  }
  if (!verdict.pass) {
    lines.push(
      "**merge할 수 없습니다.**",
      "",
      ...verdict.problems.map((problem) => `- ${problem}`),
      ""
    );
  } else if (blocking.length > 0) {
    lines.push(
      `사람이 확인해야 하는 문장 ${blocking.length}개를 승인했습니다.`,
      ""
    );
  } else {
    lines.push("새 마이그레이션에 데이터를 지우는 문장이 없습니다.", "");
  }
  if (blocking.length > 0) {
    lines.push(
      "| 위치 | 규칙 | 문장 | 이유 주석 |",
      "| --- | --- | --- | --- |",
      ...blocking.map(
        (item) =>
          `| ${link(item.path, item.line)} | \`${item.rule}\` | \`${cell(shorten(item.statement))}\` | ${reason(item)} |`
      ),
      "",
      "새 커밋을 push하면 승인 라벨이 떨어집니다. 바뀐 SQL을 다시 읽고 라벨을 붙이세요.",
      ""
    );
  }
  if (ignores.length > 0) {
    lines.push(
      "| 위치 | 쓸 수 없는 주석 |",
      "| --- | --- |",
      ...ignores.map(
        (item) => `| ${link(item.path, item.line)} | \`${cell(item.text)}\` |`
      ),
      ""
    );
  }
  if (advice.length > 0) {
    lines.push(
      "<details>",
      `<summary>그 밖에 squawk가 짚은 문장 ${advice.length}개 (merge를 막지 않습니다)</summary>`,
      "",
      "| 위치 | 규칙 | 내용 |",
      "| --- | --- | --- |",
      ...advice.map(
        (item) =>
          `| ${link(item.path, item.line)} | [\`${item.rule}\`](https://squawkhq.com/docs/${item.rule}) | ${cell(item.message)} |`
      ),
      "",
      "</details>",
      ""
    );
  }
  lines.push(
    `검사한 파일: ${files.map((path) => `\`${path}\``).join(", ")} (head \`${sha.slice(0, 7)}\`)`
  );
  return lines.join("\n");
}

export interface IssueComment {
  body: string;
  created_at: string;
  html_url: string;
  id?: number;
  updated_at?: string;
  user: { login: string } | null;
}

export interface CodexState {
  description: string;
  state: "failure" | "pending" | "success";
  targetUrl?: string;
}

const touched = (comment: IssueComment) =>
  comment.updated_at ?? comment.created_at;

/**
 * Codex reports every finished review, with or without findings, by editing
 * one summary comment whose table names the reviewed commit. A clean review
 * leaves no pull request review behind, so the summary is the only signal.
 */
export function codexReviewState(
  comments: IssueComment[],
  head: string
): CodexState {
  const short = head.slice(0, 7);
  const codex = comments.filter((comment) => comment.user?.login === CODEX_BOT);
  const summary = codex
    .filter((comment) => comment.body.includes(CODEX_SUMMARY_MARKER))
    .at(-1);
  const reviewed = summary?.body.split("\n").some((row) => {
    const [, review = "", status = "", commit = ""] = row.split("|");
    const sha = ROW_COMMIT.exec(commit)?.[1];
    return (
      review.includes("Code Review") &&
      status.includes("Completed") &&
      sha !== undefined &&
      head.startsWith(sha)
    );
  });
  if (summary && reviewed) {
    return {
      description: `Codex가 head 커밋 ${short}을 리뷰했습니다.`,
      state: "success",
      targetUrl: summary.html_url,
    };
  }
  const latest = [...codex]
    .sort((a, b) => touched(a).localeCompare(touched(b)))
    .at(-1);
  if (latest?.body.includes("usage limits")) {
    return {
      description:
        "Codex 사용량 한도에 걸려 리뷰가 없습니다. 한도가 풀리면 PR에 @codex review를 남기세요.",
      state: "failure",
      targetUrl: latest.html_url,
    };
  }
  return {
    description: `head 커밋 ${short}의 Codex 리뷰를 기다립니다. push 뒤라면 PR에 @codex review를 남기세요.`,
    state: "pending",
    targetUrl: summary?.html_url,
  };
}

interface GateEvent {
  action?: string;
  issue?: { number: number; pull_request?: unknown };
  pull_request?: {
    base: { sha: string };
    head: { sha: string };
    number: number;
  };
}

interface ApiRequest {
  body?: unknown;
  method?: "DELETE" | "GET" | "PATCH" | "POST";
  missingOk?: boolean;
}

type Api = (path: string, request?: ApiRequest) => Promise<unknown>;

function readEvent() {
  const path = process.env.GITHUB_EVENT_PATH;
  if (!path) {
    throw new Error("GitHub 이벤트 파일이 필요합니다.");
  }
  return JSON.parse(readFileSync(path, "utf8")) as GateEvent;
}

function github() {
  const { GH_TOKEN: token, GITHUB_REPOSITORY: repository } = process.env;
  if (!(token && repository)) {
    throw new Error("GitHub 토큰과 저장소 이름이 필요합니다.");
  }
  const root = process.env.GITHUB_API_URL ?? "https://api.github.com";
  const call: Api = async (path, request = {}) => {
    const method = request.method ?? "GET";
    const response = await fetch(`${root}/repos/${repository}${path}`, {
      body:
        request.body === undefined ? undefined : JSON.stringify(request.body),
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      method,
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    if (response.status === 404 && request.missingOk) {
      return null;
    }
    if (!response.ok) {
      throw new Error(
        `GitHub ${method} ${path} 요청이 실패했습니다 (${response.status}).`
      );
    }
    const text = await response.text();
    return text ? (JSON.parse(text) as unknown) : null;
  };
  return { call, repository };
}

async function issueComments(call: Api, number: number) {
  const comments: IssueComment[] = [];
  for (let page = 1; ; page += 1) {
    // biome-ignore lint/performance/noAwaitInLoops: each page follows the last.
    const batch = (await call(
      `/issues/${number}/comments?per_page=100&page=${page}`
    )) as IssueComment[];
    comments.push(...batch);
    if (batch.length < 100) {
      return comments;
    }
  }
}

function git(...args: string[]) {
  const result = spawnSync(["git", ...args]);
  if (result.exitCode !== 0) {
    throw new Error(
      `git ${args[0]} 명령이 실패했습니다.\n${result.stderr.toString()}`
    );
  }
  return result.stdout.toString();
}

/** Only migrations this pull request adds. Earlier history is already live. */
function addedMigrations(base: string, head: string) {
  return git(
    "diff",
    "--name-only",
    "--no-renames",
    "--diff-filter=A",
    "-z",
    `${base}...${head}`,
    "--",
    "supabase/migrations/"
  )
    .split("\0")
    .filter((path) => path.endsWith(".sql"));
}

function squawk(paths: string[]) {
  const result = spawnSync([
    "squawk",
    "--config",
    ".squawk.toml",
    "--reporter",
    "json",
    ...paths,
  ]);
  let parsed: unknown;
  try {
    parsed = JSON.parse(result.stdout.toString());
  } catch (error) {
    throw new Error(
      `squawk 결과를 읽지 못했습니다 (종료 코드 ${result.exitCode}).\n${result.stderr.toString()}`,
      { cause: error }
    );
  }
  if (!Array.isArray(parsed)) {
    throw new Error("squawk 결과가 목록이 아닙니다.");
  }
  return parsed as SquawkViolation[];
}

async function publishReport(
  call: Api,
  number: number,
  report: string,
  create: boolean
) {
  const existing = (await issueComments(call, number)).find(
    (comment) =>
      comment.user?.login === REPORT_AUTHOR &&
      comment.body.includes(REPORT_MARKER)
  );
  if (existing?.id) {
    await call(`/issues/comments/${existing.id}`, {
      body: { body: report },
      method: "PATCH",
    });
  } else if (create) {
    await call(`/issues/${number}/comments`, {
      body: { body: report },
      method: "POST",
    });
  }
}

async function checkDestructive() {
  const event = readEvent();
  const pull = event.pull_request;
  if (!pull) {
    throw new Error("PR 이벤트에서만 삭제 문장을 검사합니다.");
  }
  const { call, repository } = github();
  if (event.action === "synchronize" || event.action === "reopened") {
    // A new head voids the earlier approval before anything reads the label.
    await call(
      `/issues/${pull.number}/labels/${encodeURIComponent(APPROVAL_LABEL)}`,
      { method: "DELETE", missingOk: true }
    );
  }
  const labels = (await call(`/issues/${pull.number}/labels?per_page=100`)) as {
    name: string;
  }[];
  const approved = labels.some((label) => label.name === APPROVAL_LABEL);
  const paths = addedMigrations(pull.base.sha, pull.head.sha);
  const files = paths.map((path) => ({
    path,
    text: git("show", `${pull.head.sha}:${path}`),
  }));
  const found = paths.length > 0 ? findings(files, squawk(paths)) : [];
  const ignores = forbiddenIgnores(files);
  const verdict = destructiveVerdict(found, ignores, approved);
  const report = renderReport({
    files: paths,
    found,
    ignores,
    repository,
    sha: pull.head.sha,
    verdict,
  });
  await publishReport(call, pull.number, report, paths.length > 0);
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (summaryPath) {
    appendFileSync(summaryPath, `${report}\n`);
  }
  if (!verdict.pass) {
    console.error(verdict.problems.join("\n"));
    process.exitCode = 1;
  }
}

/** A pull request event or a comment on a pull request names the number. */
function pullNumber(event: GateEvent) {
  if (event.pull_request) {
    return event.pull_request.number;
  }
  if (event.issue?.pull_request) {
    return event.issue.number;
  }
  throw new Error("PR 이벤트에서만 Codex 상태를 씁니다.");
}

async function reportCodex() {
  const number = pullNumber(readEvent());
  const { call } = github();
  const pull = (await call(`/pulls/${number}`)) as {
    head: { sha: string };
    html_url: string;
    state: string;
  };
  if (pull.state !== "open") {
    console.log("닫힌 PR에는 Codex 상태를 쓰지 않습니다.");
    return;
  }
  const result = codexReviewState(
    await issueComments(call, number),
    pull.head.sha
  );
  await call(`/statuses/${pull.head.sha}`, {
    body: {
      context: CODEX_CONTEXT,
      description: result.description,
      state: result.state,
      target_url: result.targetUrl ?? pull.html_url,
    },
    method: "POST",
  });
  console.log(`${CODEX_CONTEXT}: ${result.state} (${pull.head.sha})`);
}

if (import.meta.main) {
  const [mode] = process.argv.slice(2);
  if (mode === "destructive") {
    await checkDestructive();
  } else if (mode === "codex") {
    await reportCodex();
  } else {
    throw new Error("사용법: bun scripts/ci/merge-gate.ts destructive | codex");
  }
}
