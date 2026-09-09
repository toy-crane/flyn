import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
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
