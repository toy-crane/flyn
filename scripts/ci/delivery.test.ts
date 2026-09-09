import { expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "bun";

const cli = new URL("./delivery.ts", import.meta.url).pathname;

function repository(
  run: (repo: {
    commit: (path: string, content: string) => string;
    plan: (
      target: string,
      baselines: string[]
    ) => { exitCode: number; stdout: string };
  }) => void
) {
  const root = mkdtempSync(join(tmpdir(), "flyn-delivery-plan-"));
  const git = (...args: string[]) => {
    const result = spawnSync(["git", ...args], { cwd: root });
    if (result.exitCode !== 0) {
      throw new Error(result.stderr.toString());
    }
    return result.stdout.toString().trim();
  };
  try {
    git("init", "--quiet");
    git("config", "user.name", "CI test");
    git("config", "user.email", "ci@example.test");
    run({
      commit(path, content) {
        mkdirSync(dirname(join(root, path)), { recursive: true });
        writeFileSync(join(root, path), content);
        git("add", ".");
        git("commit", "--quiet", "-m", "fixture");
        return git("rev-parse", "HEAD");
      },
      plan: (target, baselines) => {
        const result = spawnSync(
          [process.execPath, cli, "plan", target, ...baselines],
          {
            cwd: root,
          }
        );
        return { exitCode: result.exitCode, stdout: result.stdout.toString() };
      },
    });
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("문서만 바뀌면 서비스 배포를 요청하지 않는다", () => {
  repository(({ commit, plan }) => {
    const base = commit("README.md", "before");
    const head = commit("README.md", "after");
    const result = plan(head, [base, base, base, base]);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout.toString())).toEqual({
      api: [],
      database: [],
      edge: [],
      manual: [],
      mobile: [],
      sha: head,
    });
  });
});

test("API 실패 뒤 문서 커밋이 추가되어도 마지막 성공 이후 API 변경을 포함한다", () => {
  repository(({ commit, plan }) => {
    const base = commit("README.md", "base");
    const failed = commit("apps/api/src/app.ts", "changed API");
    const head = commit("README.md", "docs after failure");
    const result = plan(head, [failed, failed, base, failed]);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout.toString())).toEqual({
      api: ["apps/api/src/app.ts"],
      database: [],
      edge: [],
      manual: [],
      mobile: [],
      sha: head,
    });
  });
});

test("공유 의존성이 바뀌면 이를 사용하는 Edge Function과 API와 앱을 모두 선택한다", () => {
  repository(({ commit, plan }) => {
    const base = commit("README.md", "base");
    const head = commit("packages/shared/index.ts", "new shared contract");
    const result = plan(head, [base, base, base, base]);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout.toString())).toEqual({
      api: ["packages/shared/index.ts"],
      database: [],
      edge: ["packages/shared/index.ts"],
      manual: [],
      mobile: ["packages/shared/index.ts"],
      sha: head,
    });
  });
});

test.each([
  "supabase/seed.sql",
  "supabase/seed-story-covers.sql",
  "supabase/story-covers/example.png",
  "supabase/config.toml",
  "supabase/templates/email-otp.html",
])("%s 변경은 자동 덮어쓰기가 아니라 별도 확인 대상으로 표시한다", (path) => {
  repository(({ commit, plan }) => {
    const base = commit("README.md", "base");
    const head = commit(path, "manual content or auth change");
    const result = plan(head, [base, base, base, base]);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout.toString()).manual).toEqual([path]);
  });
});

test("앱에 포함되는 Markdown 에셋은 문서 변경으로 건너뛰지 않는다", () => {
  repository(({ commit, plan }) => {
    const base = commit("README.md", "base");
    const head = commit("apps/mobile/assets/help.md", "app content");
    const result = plan(head, [base, base, base, base]);
    expect(result.exitCode).toBe(0);
    expect(JSON.parse(result.stdout.toString()).mobile).toEqual([
      "apps/mobile/assets/help.md",
    ]);
  });
});

test("성공 이력이 없거나 대상보다 미래인 기준은 자동 추정하지 않는다", () => {
  repository(({ commit, plan }) => {
    const base = commit("README.md", "base");
    const head = commit("README.md", "next");
    expect(plan(head, [base, base, base]).exitCode).toBe(1);
    expect(plan(base, [head, head, head, head]).exitCode).toBe(1);
    expect(plan(head, ["main", base, base, base]).exitCode).toBe(1);
  });
});
