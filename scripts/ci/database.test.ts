import { expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "bun";

const cli = new URL("./database.ts", import.meta.url).pathname;

function changedFile(
  path: string,
  before: string | null,
  after: string | null
) {
  const root = mkdtempSync(join(tmpdir(), "flyn-db-plan-"));
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
    writeFileSync(join(root, "README.md"), "base");
    mkdirSync(dirname(join(root, path)), { recursive: true });
    if (before !== null) {
      writeFileSync(join(root, path), before);
    }
    git("add", ".");
    git("commit", "--quiet", "-m", "base");
    const base = git("rev-parse", "HEAD");
    if (after === null) {
      rmSync(join(root, path));
    } else {
      writeFileSync(join(root, path), after);
    }
    git("add", ".");
    git("commit", "--quiet", "-m", "docs");
    const result = spawnSync([process.execPath, cli, "plan", base, "HEAD"], {
      cwd: root,
    });
    return {
      code: result.exitCode,
      stderr: result.stderr.toString(),
      stdout: result.stdout.toString(),
    };
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

test("문서만 바꾼 PR은 DB 검증을 요청하지 않는다", () => {
  const result = changedFile("README.md", "before", "after");
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({ database: false });
});

test("기준 브랜치의 마이그레이션을 수정한 PR은 차단한다", () => {
  const result = changedFile(
    "supabase/migrations/20260101000000_base.sql",
    "select 1;",
    "select 2;"
  );
  expect(result.code).toBe(1);
  expect(result.stderr).toContain("기존 마이그레이션");
});

test("기존 마이그레이션을 삭제한 PR은 차단한다", () => {
  expect(
    changedFile(
      "supabase/migrations/20260101000000_base.sql",
      "select 1;",
      null
    ).code
  ).toBe(1);
});

test("새 마이그레이션은 DB 검증을 요청한다", () => {
  const result = changedFile(
    "supabase/migrations/20260102000000_next.sql",
    null,
    "select 1;"
  );
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({ database: true });
});

test("DB 생성 타입만 바꾸어도 DB 검증을 요청한다", () => {
  const result = changedFile(
    "packages/supabase/src/database.types.ts",
    "before",
    "after"
  );
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({ database: true });
});
