import { expect, test } from "bun:test";
import {
  cpSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync, YAML } from "bun";

interface ValidationWorkflow {
  jobs: {
    required: { steps: { run: string }[] };
    validate: {
      steps: { run?: string }[];
      strategy: { matrix: { command: string[] } };
    };
  };
}

test("PR 검증은 코드·타입·테스트 명령을 모두 실행한다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/validate.yml", import.meta.url),
      "utf8"
    )
  ) as ValidationWorkflow;

  expect(workflow.jobs.validate.strategy.matrix.command).toEqual([
    "check",
    "check-types",
    "test",
  ]);
  expect(workflow.jobs.validate.steps.at(-1)?.run).toBe(
    'bun run "$CHECK_COMMAND"'
  );
});

test("필수 검사는 실패·취소·건너뛰기를 성공으로 처리하지 않는다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/validate.yml", import.meta.url),
      "utf8"
    )
  ) as ValidationWorkflow;
  const command = workflow.jobs.required.steps[0]?.run;
  expect(command).toBeDefined();
  if (!command) {
    throw new Error("필수 검사 명령이 없습니다.");
  }
  for (const result of ["success", "failure", "cancelled", "skipped", ""]) {
    const child = spawnSync(["bash", "-e", "-c", command], {
      env: { PATH: process.env.PATH, VALIDATION_RESULT: result },
    });
    expect(child.exitCode === 0).toBe(result === "success");
  }
});

test("DB 변경 없음만 건너뛰기를 허용하고 실행 실패는 차단한다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/database.yml", import.meta.url),
      "utf8"
    )
  ) as ValidationWorkflow;
  const command = workflow.jobs.required.steps[0]?.run;
  if (!command) {
    throw new Error("DB 필수 검사 명령이 없습니다.");
  }
  for (const [plan, needed, result, passes] of [
    ["success", "false", "skipped", true],
    ["success", "true", "success", true],
    ["success", "true", "failure", false],
    ["success", "true", "skipped", false],
    ["failure", "false", "skipped", false],
    ["success", "", "skipped", false],
  ] as const) {
    const child = spawnSync(["bash", "-e", "-c", command], {
      env: {
        DATABASE_NEEDED: needed,
        DATABASE_RESULT: result,
        PATH: process.env.PATH,
        PLAN_RESULT: plan,
      },
    });
    expect(child.exitCode === 0).toBe(passes);
  }
});

test("DB 수동 실행은 현재 커밋의 부모와 비교하고 DB 검사를 요청한다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/database.yml", import.meta.url),
      "utf8"
    )
  ) as {
    jobs: { changes: { steps: { id?: string; run?: string }[] } };
  };
  const command = workflow.jobs.changes.steps.find(
    (step) => step.id === "plan"
  )?.run;
  if (!command) {
    throw new Error("DB 변경 판정 명령이 없습니다.");
  }
  const directory = mkdtempSync(join(tmpdir(), "flyn-db-dispatch-"));
  const root = join(directory, "repo");
  mkdirSync(join(root, "scripts/ci"), { recursive: true });
  mkdirSync(join(root, "supabase/migrations"), { recursive: true });
  for (const file of ["database.ts", "database-verify.ts"]) {
    cpSync(new URL(file, import.meta.url), join(root, "scripts/ci", file));
  }
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
    const old = join(root, "supabase/migrations/20260101000000_old.sql");
    writeFileSync(old, "select 1;");
    git("add", ".");
    git("commit", "--quiet", "-m", "old history");
    rmSync(old);
    git("add", ".");
    git("commit", "--quiet", "-m", "historical cleanup");
    const parent = git("rev-parse", "HEAD");
    writeFileSync(join(root, "README.md"), "docs only");
    git("add", ".");
    git("commit", "--quiet", "-m", "docs");
    const head = git("rev-parse", "HEAD");
    const output = join(directory, "output");
    const result = spawnSync(["bash", "-e", "-c", command], {
      cwd: root,
      env: {
        BASE_SHA: "",
        EVENT_NAME: "workflow_dispatch",
        GITHUB_OUTPUT: output,
        HEAD_SHA: head,
        PATH: process.env.PATH,
      },
    });
    expect(result.exitCode).toBe(0);
    const values = readFileSync(output, "utf8");
    expect(values).toContain(`base=${parent}\n`);
    expect(values).toContain("database=true\n");
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
});
