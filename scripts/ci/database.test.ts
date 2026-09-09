import { expect, test } from "bun:test";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { spawnSync } from "bun";

const cli = new URL("./database.ts", import.meta.url).pathname;

function changedFile(
  path: string,
  before: string | null,
  after: string | null,
  extra: Record<string, string> = {}
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
    for (const [name, content] of Object.entries(extra)) {
      mkdirSync(dirname(join(root, name)), { recursive: true });
      writeFileSync(join(root, name), content);
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

test("새 마이그레이션에 데이터 영향 설명이 없으면 차단한다", () => {
  const result = changedFile(
    "supabase/migrations/20260102000000_next.sql",
    null,
    "select 1;"
  );
  expect(result.code).toBe(1);
  expect(result.stderr).toContain("데이터 영향");
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

test("데이터 변환을 선언했지만 보존 SQL이 없으면 차단한다", () => {
  const result = changedFile(
    "supabase/migrations/20260102000000_next.sql",
    null,
    "select 1;",
    {
      "supabase/upgrade-tests/20260102000000/impact.json": JSON.stringify({
        impact: "preserve",
        reason: "기존 값을 새 형식으로 옮긴다",
      }),
    }
  );
  expect(result.code).toBe(1);
  expect(result.stderr).toContain("before.sql");
});

test("빈 테이블 추가는 이유를 기록하고 보존 DB 검사를 건너뛴다", () => {
  const result = changedFile(
    "supabase/migrations/20260102000000_next.sql",
    null,
    "create table example (id int);",
    {
      "supabase/upgrade-tests/20260102000000/impact.json": JSON.stringify({
        impact: "none",
        reason: "기존 테이블에 접근하지 않는 빈 테이블 추가",
      }),
    }
  );
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({ database: true, upgrades: [] });
});

test("데이터 변환은 해당 버전의 보존 검사를 요청한다", () => {
  const result = changedFile(
    "supabase/migrations/20260102000000_next.sql",
    null,
    "select 1;",
    {
      "supabase/upgrade-tests/20260102000000/after.test.sql": "select 1;",
      "supabase/upgrade-tests/20260102000000/before.sql": "select 1;",
      "supabase/upgrade-tests/20260102000000/impact.json": JSON.stringify({
        impact: "preserve",
        reason: "ID와 값을 보존한다",
      }),
    }
  );
  expect(result.code).toBe(0);
  expect(JSON.parse(result.stdout)).toEqual({
    database: true,
    upgrades: ["20260102000000"],
  });
});

test("데이터 영향 이유가 비었거나 잘못된 분류이면 차단한다", () => {
  for (const impact of [
    { impact: "none", reason: " " },
    { impact: "typo", reason: "test" },
  ]) {
    const result = changedFile(
      "supabase/migrations/20260102000000_next.sql",
      null,
      "select 1;",
      {
        "supabase/upgrade-tests/20260102000000/impact.json":
          JSON.stringify(impact),
      }
    );
    expect(result.code).toBe(1);
  }
});
