import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { spawnSync, YAML } from "bun";
import { apiChanged } from "./release-api";

interface DeployJob {
  if: string;
  needs: string[];
  steps: { run?: string; env?: Record<string, string> }[];
}

function job(id: string) {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/ci.yml", import.meta.url),
      "utf8"
    )
  ) as { jobs: Record<string, DeployJob | undefined> };
  const found = workflow.jobs[id];
  if (!found) {
    throw new Error(`${id} job이 없습니다.`);
  }
  return found;
}

test("운영 커밋을 모르면 API를 배포한다", () => {
  expect(apiChanged(null, "a".repeat(40))).toBe(true);
});

test("운영에 올라간 커밋과 내용이 같으면 API를 다시 배포하지 않는다", () => {
  const head = spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim();
  expect(apiChanged(head, head)).toBe(false);
});

test("운영 커밋보다 이전 버전은 배포하지 않는다", () => {
  const head = spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim();
  expect(() => apiChanged("0".repeat(40), head)).toThrow("이전 버전");
});

test("로컬 실행은 API 운영 배포 연결 전에 차단한다", () => {
  const child = spawnSync(
    [process.execPath, new URL("./release-api.ts", import.meta.url).pathname],
    { env: { PATH: process.env.PATH } }
  );
  expect(child.exitCode).not.toBe(0);
  expect(child.stderr.toString()).toContain("Flyn main의 GitHub 실행");
});

test("API job은 DB와 Edge 뒤에 실행하고 배포 도구에만 운영 토큰을 준다", () => {
  const api = job("deploy_api");
  expect(api.needs).toEqual([
    "changes",
    "plan",
    "deploy_database",
    "deploy_edge",
  ]);
  expect(api.if).toContain("needs.deploy_database.result");
  expect(api.if).toContain("needs.deploy_edge.result");
  expect(api.if).toContain("needs.changes.outputs.api == 'true'");
  const install = api.steps.find((step) => step.run?.includes("npm install"));
  expect(install?.env).toBeUndefined();
  expect(install?.run).toContain("vercel@51.6.1");
  const deploy = api.steps.find(
    (step) => step.run === "bun scripts/ci/release-api.ts"
  );
  expect(Object.keys(deploy?.env ?? {}).sort()).toEqual(["VERCEL_TOKEN"]);
});

test("배포 도구는 저장소 밖에 설치하고 버전으로 캐시한다", () => {
  const install = job("deploy_api").steps.find((step) =>
    step.run?.includes("npm install")
  );
  expect(install?.run).toContain("$HOME/.cache/flyn-cli");
  expect(install?.run).toContain("GITHUB_PATH");
  const lockfile = JSON.parse(
    readFileSync(new URL("../../package.json", import.meta.url), "utf8")
  ) as { dependencies?: Record<string, string> };
  expect(lockfile.dependencies?.vercel).toBeUndefined();
});
