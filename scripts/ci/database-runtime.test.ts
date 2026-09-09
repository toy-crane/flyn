import { expect, test } from "bun:test";
import {
  appendFileSync,
  cpSync,
  mkdirSync,
  mkdtempSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "bun";

// Explicit opt-in: these tests start real, isolated Docker databases.
const runtimeTest =
  process.env.RUN_DATABASE_RUNTIME_TESTS === "1" ? test : test.skip;
const repository = resolve(import.meta.dir, "../..");
const fixtureMigration = "supabase/migrations/20990101000000_ci_fixture.sql";

async function rejectedFixture(
  change: (root: string) => void,
  message: string
) {
  const root = mkdtempSync(join(tmpdir(), "flyn-db-failure-"));
  try {
    mkdirSync(join(root, "supabase"));
    for (const name of [
      "config.toml",
      "migrations",
      "schemas",
      "tests",
      "templates",
      "seed.sql",
      "seed-story-covers.sql",
    ]) {
      cpSync(join(repository, "supabase", name), join(root, "supabase", name), {
        recursive: true,
      });
    }
    mkdirSync(join(root, "packages/supabase/src"), { recursive: true });
    cpSync(
      join(repository, "packages/supabase/src/database.types.ts"),
      join(root, "packages/supabase/src/database.types.ts")
    );
    symlinkSync(join(repository, "node_modules"), join(root, "node_modules"));
    change(root);
    const child = spawn(
      [process.execPath, join(repository, "scripts/ci/database.ts"), "verify"],
      {
        cwd: root,
        stderr: "pipe",
        stdout: "pipe",
      }
    );
    const [stdout, stderr, code] = await Promise.all([
      new Response(child.stdout).text(),
      new Response(child.stderr).text(),
      child.exited,
    ]);
    expect(code).not.toBe(0);
    expect(`${stdout}\n${stderr}`).toContain(message);
  } finally {
    rmSync(root, { force: true, recursive: true });
  }
}

runtimeTest(
  "SQL 오류가 있는 마이그레이션은 DB 검증을 실패시킨다",
  async () => {
    await rejectedFixture((root) => {
      writeFileSync(join(root, fixtureMigration), "this is not valid SQL;");
    }, "syntax error");
  },
  600_000
);

runtimeTest(
  "anon 권한을 넓힌 마이그레이션은 기존 권한 테스트가 차단한다",
  async () => {
    await rejectedFixture((root) => {
      writeFileSync(
        join(root, fixtureMigration),
        "grant select on public.profiles to anon;"
      );
    }, "anon cannot reach profiles through the Data API");
  },
  600_000
);

runtimeTest(
  "생성 타입을 갱신하지 않으면 DB 검증을 실패시킨다",
  async () => {
    await rejectedFixture((root) => {
      appendFileSync(
        join(root, "packages/supabase/src/database.types.ts"),
        "\n// stale fixture\n"
      );
    }, "DB 생성 타입이 커밋한 타입과 다릅니다");
  },
  600_000
);

runtimeTest(
  "마이그레이션에 없는 선언형 테이블은 스키마 비교가 차단한다",
  async () => {
    await rejectedFixture((root) => {
      writeFileSync(
        join(root, "supabase/schemas/99-ci-fixture.sql"),
        "create table public.ci_unmigrated (id integer primary key);"
      );
    }, "선언형 스키마와 마이그레이션이 다릅니다");
  },
  600_000
);
