import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { spawnSync, YAML } from "bun";
import { requireEdgeReady } from "./edge-readiness";

test("Edge 성공 기록 없이는 API를 진행하지 않는다", () => {
  expect(() => requireEdgeReady(null, "a".repeat(40))).toThrow("먼저 배포");
  const head = spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim();
  expect(() => requireEdgeReady(head, head)).not.toThrow();
});

test("Edge는 DB 다음 API 전에 실행하며 PAT는 설치 단계에 전달하지 않는다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/deploy.yml", import.meta.url),
      "utf8"
    )
  ) as {
    jobs: {
      edge: {
        needs: string;
        steps: { run?: string; env?: Record<string, string> }[];
      };
      api: { needs: string };
    };
  };
  expect(workflow.jobs.edge.needs).toBe("database");
  expect(workflow.jobs.api.needs).toBe("edge");
  const install = workflow.jobs.edge.steps.find((step) =>
    step.run?.includes("bun install")
  );
  expect(install?.env).toBeUndefined();
  const deploy = workflow.jobs.edge.steps.find((step) =>
    step.run?.includes("release-edge.ts")
  );
  expect(Object.keys(deploy?.env ?? {}).sort()).toEqual([
    "DEPLOYMENT_STATE_SIGNING_KEY",
    "GH_TOKEN",
    "SUPABASE_ACCESS_TOKEN",
  ]);
});

test("로컬 실행은 Edge 배포 전에 차단한다", () => {
  const child = spawnSync(
    [process.execPath, new URL("./release-edge.ts", import.meta.url).pathname],
    { env: { PATH: process.env.PATH } }
  );
  expect(child.exitCode).not.toBe(0);
  expect(child.stderr.toString()).toContain("Flyn main의 GitHub 실행");
});
