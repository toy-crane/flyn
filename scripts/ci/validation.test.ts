import { expect, test } from "bun:test";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync, YAML } from "bun";
import { affectedPackages, changedPaths, planChanges } from "./changes";

interface Job {
  environment?: { name?: string };
  if?: string;
  name?: string;
  needs?: string | string[];
  steps: { id?: string; name?: string; run?: string; uses?: string }[];
  strategy?: { matrix: { command: string[] } };
}

function ci() {
  return YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/ci.yml", import.meta.url),
      "utf8"
    )
  ) as {
    concurrency: { group: string; "cancel-in-progress": string; queue: string };
    jobs: Record<string, Job | undefined>;
    on: Record<string, unknown>;
  };
}

function gate(job: Job) {
  const command = job.steps[0]?.run;
  if (!command) {
    throw new Error("필수 검사 명령이 없습니다.");
  }
  return command;
}

test("검증과 배포가 한 워크플로에 있고 나머지 워크플로는 사라졌다", () => {
  const workflow = ci();
  expect(Object.keys(workflow.jobs)).toEqual([
    "changes",
    "validate",
    "database",
    "required_validation",
    "required_database",
    "plan",
    "deploy_database",
    "deploy_edge",
    "deploy_api",
    "deploy_mobile",
  ]);
  for (const name of ["validate", "database", "deploy", "claude"]) {
    expect(
      existsSync(
        new URL(`../../.github/workflows/${name}.yml`, import.meta.url).pathname
      )
    ).toBe(false);
  }
});

test("PR 검증은 코드·타입·테스트 명령을 모두 실행한다", () => {
  const { validate } = ci().jobs;
  if (!validate?.strategy) {
    throw new Error("validate job이 없습니다.");
  }
  expect(validate.strategy.matrix.command).toEqual([
    "check",
    "check-types",
    "test",
  ]);
  expect(validate.steps.at(-1)?.run).toBe('bun run "$CHECK_COMMAND"');
});

test("필수 검사 이름은 브랜치 보호 설정과 같게 유지한다", () => {
  const { jobs } = ci();
  expect(jobs.required_validation?.name).toBe("Required validation");
  expect(jobs.required_database?.name).toBe("Required database validation");
});

test("필수 검사는 실패·취소·건너뛰기를 성공으로 처리하지 않는다", () => {
  const command = gate(ci().jobs.required_validation as Job);
  for (const [plan, needed, result, passes] of [
    ["success", "false", "skipped", true],
    ["success", "true", "success", true],
    ["success", "true", "failure", false],
    ["success", "true", "cancelled", false],
    ["success", "true", "skipped", false],
    ["failure", "false", "skipped", false],
    ["success", "", "skipped", false],
  ] as const) {
    const child = spawnSync(["bash", "-e", "-c", command], {
      env: {
        PATH: process.env.PATH,
        PLAN_RESULT: plan,
        VALIDATION_NEEDED: needed,
        VALIDATION_RESULT: result,
      },
    });
    expect(child.exitCode === 0).toBe(passes);
  }
});

test("DB 변경 없음만 건너뛰기를 허용하고 실행 실패는 차단한다", () => {
  const command = gate(ci().jobs.required_database as Job);
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

test("배포는 두 필수 검사를 통과한 같은 실행에서만 이어진다", () => {
  const { plan } = ci().jobs;
  expect(plan?.needs).toEqual([
    "changes",
    "required_validation",
    "required_database",
  ]);
  expect(plan?.if).toContain("refs/heads/main");
  expect(plan?.if).toContain("toy-crane/flyn");
  expect(plan?.if).toContain("needs.changes.outputs.deploy == 'true'");
});

test("검사 결과를 별도 API로 조회하는 코드가 남아 있지 않다", () => {
  const workflow = readFileSync(
    new URL("../../.github/workflows/ci.yml", import.meta.url),
    "utf8"
  );
  expect(workflow).not.toContain("release-checks");
  expect(workflow).not.toContain("DEPLOYMENT_STATE_SIGNING_KEY");
  for (const name of ["release-checks.ts", "delivery-journal.ts"]) {
    expect(existsSync(new URL(name, import.meta.url).pathname)).toBe(false);
  }
});

test("PR은 진행 중 실행을 취소하고 운영 실행은 대기열에서 기다린다", () => {
  const { concurrency } = ci();
  expect(concurrency.group).toContain("ci-pull-");
  expect(concurrency.group).toContain("flyn-production-deployment");
  expect(concurrency["cancel-in-progress"]).toContain(
    "github.event_name == 'pull_request'"
  );
  expect(concurrency.queue).toBe("max");
});

test("문서만 바꾼 커밋은 검사와 배포를 모두 건너뛴다", () => {
  const root = new URL("../../", import.meta.url).pathname;
  const directory = mkdtempSync(join(tmpdir(), "flyn-plan-changes-"));
  const clone = join(directory, "repo");
  try {
    // A clean checkout, because `turbo query affected` also counts
    // uncommitted work and this session's tree is dirty.
    expect(
      spawnSync(["git", "clone", "--quiet", "--local", root, clone]).exitCode
    ).toBe(0);
    const git = (...args: string[]) => {
      const result = spawnSync(["git", ...args], { cwd: clone });
      if (result.exitCode !== 0) {
        throw new Error(result.stderr.toString());
      }
      return result.stdout.toString().trim();
    };
    git("config", "user.name", "Fixture");
    git("config", "user.email", "fixture@example.test");
    git("config", "commit.gpgsign", "false");
    const base = git("rev-parse", "HEAD");
    writeFileSync(join(clone, "docs/plan-changes-fixture.md"), "docs only\n");
    git("add", "docs/plan-changes-fixture.md");
    git("commit", "-qm", "docs fixture");
    const head = git("rev-parse", "HEAD");
    expect(git("diff", "--name-only", base, head)).toBe(
      "docs/plan-changes-fixture.md"
    );
    expect(
      planChanges({
        affected: affectedPackages(base, head, clone),
        edgeConfiguration: false,
        paths: changedPaths(base, head, clone),
      })
    ).toEqual({
      api: false,
      database: false,
      edge: false,
      mobile: false,
      validate: false,
    });
  } finally {
    rmSync(directory, { force: true, recursive: true });
  }
}, 60_000);
