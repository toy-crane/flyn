import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { spawnSync, YAML } from "bun";

test("모바일 배포는 API 성공 뒤 실행하고 로컬 호출은 원격 요청 전에 차단한다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/deploy.yml", import.meta.url),
      "utf8"
    )
  ) as {
    jobs: {
      mobile: {
        needs: string;
        steps: { run?: string; env?: Record<string, string> }[];
      };
    };
  };
  expect(workflow.jobs.mobile.needs).toBe("api");
  const install = workflow.jobs.mobile.steps.find((item) =>
    item.run?.includes("eas-cli@24.0.0")
  );
  expect(install?.run).toContain("cd /tmp");
  const step = workflow.jobs.mobile.steps.find(
    (item) => item.run === "bun scripts/ci/release-mobile.ts"
  );
  expect(Object.keys(step?.env ?? {}).sort()).toEqual([
    "DEPLOYMENT_STATE_SIGNING_KEY",
    "EXPO_TOKEN",
    "GH_TOKEN",
  ]);
  const child = spawnSync(
    [
      process.execPath,
      new URL("./release-mobile.ts", import.meta.url).pathname,
    ],
    { env: { PATH: process.env.PATH } }
  );
  expect(child.exitCode).not.toBe(0);
  expect(child.stderr.toString()).toContain("Flyn main의 GitHub 실행");
});
