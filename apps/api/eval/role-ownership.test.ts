import { afterEach, expect, test } from "bun:test";
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "bun";
import { episodeSystemPrompt } from "../src/features/episode/episode";
import type { Scenario } from "./role-ownership-cases";

const directories: string[] = [];

afterEach(() => {
  for (const directory of directories.splice(0)) {
    rmSync(directory, { force: true, recursive: true });
  }
});

function prepare() {
  const directory = mkdtempSync(resolve(tmpdir(), "flyn-role-eval-test-"));
  directories.push(directory);
  const result = command("prepare", directory);
  expect(result.exitCode).toBe(0);
  const manifest = JSON.parse(
    readFileSync(resolve(directory, "manifest.json"), "utf8")
  ) as { jobs: unknown[]; scenarios: (Scenario & { after: string })[] };
  return { directory, manifest };
}

function command(action: "prepare" | "run", directory: string) {
  return spawnSync(
    [
      process.execPath,
      resolve(import.meta.dir, "role-ownership.ts"),
      action,
      directory,
    ],
    {
      env: {
        ...process.env,
        AI_GATEWAY_API_KEY: "unused-test-key",
        AI_GATEWAY_MODEL: "openai/gpt-5.6-luna",
      },
    }
  );
}

test("고정 평가의 이전 프롬프트가 현재 운영 프롬프트와 같다", () => {
  const { directory, manifest } = prepare();
  expect(manifest.scenarios).toHaveLength(13);
  expect(manifest.jobs).toHaveLength(130);
  for (const scenario of manifest.scenarios) {
    expect(scenario.before).toBe(episodeSystemPrompt(scenario.script));
    expect(scenario.after).not.toBe(scenario.before);
  }
  expect(existsSync(resolve(directory, "responses.jsonl"))).toBe(false);
});

test.each([0, 12])(
  "입력 %i의 이전 프롬프트가 바뀌면 호출과 결과 기록 전에 중단한다",
  (index) => {
    const { directory, manifest } = prepare();
    const scenario = manifest.scenarios[index];
    if (!scenario) {
      throw new Error("평가 입력이 없다.");
    }
    scenario.before += "\nUnexpected baseline change";
    // 검사가 고장 나도 이 자동 테스트가 실제 모델을 호출하지 않게 한다.
    manifest.jobs = [];
    writeFileSync(
      resolve(directory, "manifest.json"),
      JSON.stringify(manifest)
    );
    const result = command("run", directory);
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr.toString()).toContain(
      `Baseline prompt changed: ${scenario.id}`
    );
    expect(existsSync(resolve(directory, "responses.jsonl"))).toBe(false);
    expect(existsSync(resolve(directory, "gate.json"))).toBe(false);
  }
);
