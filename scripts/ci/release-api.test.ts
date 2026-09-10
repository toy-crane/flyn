import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { spawnSync, YAML } from "bun";
import { requireApiDatabase } from "./release-api";

test("DB 성공 기록이 없으면 API를 배포하지 않는다", () => {
  expect(() => requireApiDatabase(null, "a".repeat(40))).toThrow("DB 성공");
});

test("로컬 실행은 API 운영 배포 연결 전에 차단한다", () => {
  const child = spawnSync(
    [process.execPath, new URL("./release-api.ts", import.meta.url).pathname],
    { env: { PATH: process.env.PATH } }
  );
  expect(child.exitCode).not.toBe(0);
  expect(child.stderr.toString()).toContain("Flyn main의 GitHub 실행");
});

test("API job은 Edge 성공 뒤 실행하며 설치에는 운영 토큰을 주지 않는다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/deploy.yml", import.meta.url),
      "utf8"
    )
  ) as {
    jobs: {
      api: {
        needs: string;
        if: string;
        steps: { run?: string; env?: Record<string, string> }[];
      };
    };
  };
  const job = workflow.jobs.api;
  expect(job.needs).toBe("edge");
  expect(job.if).toContain("refs/heads/main");
  const install = job.steps.find((step: { run?: string }) =>
    step.run?.includes("npm install")
  );
  expect(install?.env).toBeUndefined();
  expect(install?.run).toContain("vercel@51.6.1");
  expect(install?.run).toContain("--frozen-lockfile");
  const deploy = job.steps.find(
    (step: { run?: string }) => step.run === "bun scripts/ci/release-api.ts"
  );
  expect(Object.keys(deploy?.env ?? {}).sort()).toEqual([
    "DEPLOYMENT_STATE_SIGNING_KEY",
    "GH_TOKEN",
    "VERCEL_TOKEN",
  ]);
});

test("적용된 DB 이후 마이그레이션이 없는 커밋은 API 배포를 허용한다", () => {
  const head = spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim();
  expect(() => requireApiDatabase(head, head)).not.toThrow();
});

test("조회할 수 없는 DB 성공 커밋은 API 배포를 차단한다", () => {
  const head = spawnSync(["git", "rev-parse", "HEAD"]).stdout.toString().trim();
  expect(() => requireApiDatabase("0".repeat(40), head)).toThrow("DB 변경");
});
