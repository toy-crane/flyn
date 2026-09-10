import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { spawnSync, YAML } from "bun";

test("모바일 배포는 API 성공 뒤 실행하고 로컬 호출은 원격 요청 전에 차단한다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/ci.yml", import.meta.url),
      "utf8"
    )
  ) as {
    jobs: {
      deploy_mobile: {
        if: string;
        needs: string[];
        steps: { run?: string; env?: Record<string, string> }[];
      };
    };
  };
  const mobile = workflow.jobs.deploy_mobile;
  expect(mobile.needs).toEqual([
    "changes",
    "plan",
    "deploy_database",
    "deploy_edge",
    "deploy_api",
  ]);
  expect(mobile.if).toContain("needs.deploy_api.result");
  expect(mobile.if).toContain("needs.changes.outputs.mobile == 'true'");
  const install = mobile.steps.find((item) =>
    item.run?.includes("eas-cli@24.0.0")
  );
  // Kept outside the repository so pull request jobs never install it.
  expect(install?.run).toContain("$HOME/.cache/flyn-cli-eas");
  expect(install?.run).not.toContain("--frozen-lockfile");
  const step = mobile.steps.find(
    (item) => item.run === "bun scripts/ci/release-mobile.ts"
  );
  expect(Object.keys(step?.env ?? {}).sort()).toEqual(["EXPO_TOKEN"]);
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
