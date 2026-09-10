import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { spawnSync, YAML } from "bun";

function ci() {
  return YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/ci.yml", import.meta.url),
      "utf8"
    )
  ) as {
    jobs: Record<
      string,
      | {
          if: string;
          needs: string[];
          environment?: { name: string };
          steps: { run?: string; env?: Record<string, string> }[];
        }
      | undefined
    >;
  };
}

test("Edge는 DB 다음 API 전에 실행하며 PAT는 설치 단계에 전달하지 않는다", () => {
  const { jobs } = ci();
  const edge = jobs.deploy_edge;
  if (!edge) {
    throw new Error("deploy_edge job이 없습니다.");
  }
  expect(edge.needs).toEqual(["changes", "plan", "deploy_database"]);
  expect(edge.if).toContain("needs.deploy_database.result");
  expect(edge.if).toContain("needs.changes.outputs.edge == 'true'");
  expect(edge.environment?.name).toContain(
    "needs.plan.outputs.edge_environment"
  );
  expect(jobs.deploy_api?.needs).toContain("deploy_edge");
  const install = edge.steps.find((step) => step.run?.includes("bun install"));
  expect(install?.env).toBeUndefined();
  const deploy = edge.steps.find((step) =>
    step.run?.includes("release-edge.ts")
  );
  expect(Object.keys(deploy?.env ?? {}).sort()).toEqual([
    "SUPABASE_ACCESS_TOKEN",
  ]);
});

test("DB job은 승인 환경을 판정 결과에서 받는다", () => {
  const database = ci().jobs.deploy_database;
  if (!database) {
    throw new Error("deploy_database job이 없습니다.");
  }
  expect(database.needs).toEqual(["changes", "plan"]);
  expect(database.environment?.name).toContain(
    "needs.plan.outputs.database_environment"
  );
  expect(database.if).toContain("needs.changes.outputs.database == 'true'");
});

test("로컬 실행은 Edge 배포 전에 차단한다", () => {
  const child = spawnSync(
    [process.execPath, new URL("./release-edge.ts", import.meta.url).pathname],
    { env: { PATH: process.env.PATH } }
  );
  expect(child.exitCode).not.toBe(0);
  expect(child.stderr.toString()).toContain("Flyn main의 GitHub 실행");
});

test("로컬 실행은 DB 배포 전에 차단한다", () => {
  const child = spawnSync(
    [
      process.execPath,
      new URL("./release-database.ts", import.meta.url).pathname,
    ],
    { env: { PATH: process.env.PATH } }
  );
  expect(child.exitCode).not.toBe(0);
  expect(child.stderr.toString()).toContain("Flyn main의 GitHub 실행");
});
