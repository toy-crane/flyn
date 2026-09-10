import { appendFileSync } from "node:fs";
import { spawnSync } from "bun";
import { lastSuccessfulSha } from "./base-commit";
import {
  affectedPackages,
  type ChangePlan,
  changedPaths,
  planChanges,
  repoRoot,
  requireCleanCheckout,
} from "./changes";

const SHA = /^[a-f0-9]{40}$/;

/** Nothing to compare against, so every check and every service is a target. */
const everything: ChangePlan = {
  api: true,
  database: true,
  edge: true,
  mobile: true,
  validate: true,
};

/**
 * The dedicated database plan also blocks rewritten migration history and
 * requires an impact note, so it runs whenever a base commit exists.
 */
function databaseCheck(base: string, sha: string) {
  const result = spawnSync(
    ["bun", "scripts/ci/database.ts", "plan", base, sha],
    { cwd: repoRoot }
  );
  if (result.exitCode !== 0) {
    throw new Error(result.stderr.toString().trim() || "DB 변경 판정 실패");
  }
  return Boolean(JSON.parse(result.stdout.toString()).database);
}

async function resolveBase() {
  const {
    BASE_SHA: explicit,
    GITHUB_RUN_ID: runId,
    GITHUB_SHA: sha,
    GH_TOKEN: token,
  } = process.env;
  if (explicit) {
    if (!SHA.test(explicit)) {
      throw new Error("기준 커밋이 올바르지 않습니다.");
    }
    return explicit;
  }
  if (!(runId && sha && SHA.test(sha))) {
    throw new Error("변경 판정에는 실행 ID와 커밋이 필요합니다.");
  }
  return await lastSuccessfulSha({ runId, token, workflow: "ci.yml" });
}

async function main() {
  const output = process.env.GITHUB_OUTPUT;
  const sha = process.env.GITHUB_SHA;
  if (!(output && sha && SHA.test(sha))) {
    throw new Error("GitHub 실행에서만 변경을 판정합니다.");
  }
  requireCleanCheckout();
  const base = await resolveBase();
  let plan = everything;
  let check = true;
  if (base) {
    plan = planChanges({
      affected: affectedPackages(base, sha),
      paths: changedPaths(base, sha),
    });
    check = databaseCheck(base, sha);
  }
  const deploy = plan.api || plan.database || plan.edge || plan.mobile;
  const lines = [
    `base=${base ?? ""}`,
    `validate=${plan.validate}`,
    `db_check=${check}`,
    `database=${plan.database}`,
    `edge=${plan.edge}`,
    `api=${plan.api}`,
    `mobile=${plan.mobile}`,
    `deploy=${deploy}`,
  ];
  appendFileSync(output, `${lines.join("\n")}\n`);
  console.log(
    base
      ? `기준 커밋 ${base.slice(0, 8)} 대비 판정: ${lines.slice(1).join(", ")}`
      : `기준 커밋이 없어 전체를 대상으로 잡습니다: ${lines.slice(1).join(", ")}`
  );
}

if (import.meta.main) {
  await main();
}
