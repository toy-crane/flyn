import { expect, test } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawnSync, YAML } from "bun";

const { publish, compare, run } = require("./fingerprint-labels.cjs");
const target = {
  base: "b".repeat(40),
  head: "a".repeat(40),
  number: 1,
  owner: "test",
  repo: "test",
};

function fixture() {
  const labels = new Set(["bug", "Fingerprint:changed"]);
  const github = {
    rest: {
      issues: {
        addLabels: ({ labels: names }: { labels: string[] }) => {
          for (const name of names) {
            labels.add(name);
          }
        },
        getLabel: () => Promise.resolve({ data: {} }),
        removeLabel: ({ name }: { name: string }) => {
          labels.delete(name);
        },
      },
      pulls: {
        get: async () => ({
          data: {
            base: { sha: "b".repeat(40) },
            head: { sha: "a".repeat(40) },
            state: "open",
          },
        }),
      },
    },
  };
  return { github, labels };
}

test("fingerprint 결과가 같으면 반대 라벨을 지우고 compatible만 남긴다", async () => {
  const { github, labels } = fixture();
  await publish(
    github,
    {
      base: "b".repeat(40),
      head: "a".repeat(40),
      number: 1,
      owner: "test",
      repo: "test",
    },
    "compatible"
  );
  expect([...labels].sort()).toEqual(["Fingerprint:compatible", "bug"]);
});

test.each(["changed", "error", "pending"])(
  "%s도 이전 fingerprint 라벨을 남기지 않는다",
  async (status) => {
    const { github, labels } = fixture();
    labels.add("Fingerprint:compatible");
    await publish(github, target, status);
    expect([...labels].sort()).toEqual(
      status === "pending" ? ["bug"] : [`Fingerprint:${status}`, "bug"]
    );
  }
);

test("늦게 끝난 이전 커밋 결과는 최신 PR 라벨을 바꾸지 않는다", async () => {
  const { github, labels } = fixture();
  await publish(github, { ...target, head: "c".repeat(40) }, "compatible");
  expect([...labels].sort()).toEqual(["Fingerprint:changed", "bug"]);
});

test("두 정상 해시만 비교하고 누락·오류 결과를 compatible로 바꾸지 않는다", () => {
  const data = {
    base: target.base,
    baseHash: "d".repeat(40),
    head: target.head,
    headHash: "d".repeat(40),
  };
  expect(compare(data, target.head, target.base)).toBe("compatible");
  expect(
    compare({ ...data, headHash: "e".repeat(40) }, target.head, target.base)
  ).toBe("changed");
  expect(compare(data, "f".repeat(40), target.base)).toBe("stale");
  for (const invalid of [
    null,
    {},
    { ...data, headHash: "" },
    { ...data, baseHash: "ERROR" },
  ]) {
    expect(() => compare(invalid, target.head, target.base)).toThrow();
  }
});

test.each(["success", "failure", "invalid", "old-attempt"])(
  "workflow_run의 %s 결과를 안전하게 라벨로 반영한다",
  async (scenario) => {
    const { github: boundary, labels } = fixture();
    const directory = mkdtempSync(join(tmpdir(), "flyn-label-test-"));
    const failures: string[] = [];
    try {
      const path = join(directory, "result.json");
      writeFileSync(
        path,
        JSON.stringify(
          scenario === "invalid"
            ? {}
            : {
                base: target.base,
                baseHash: "e".repeat(40),
                head: target.head,
                headHash: "e".repeat(40),
              }
        )
      );
      const zip = spawnSync(["zip", "-j", "-", path]);
      expect(zip.exitCode).toBe(0);
      const current = {
        conclusion: scenario === "failure" ? "failure" : "success",
        event: "pull_request",
        head_sha: target.head,
        id: 10,
        pull_requests: [{ number: 1 }],
        run_attempt: 2,
        status: "completed",
        workflow_id: 5,
      };
      const github = {
        rest: {
          ...boundary.rest,
          actions: {
            downloadArtifact: () => Promise.resolve({ data: zip.stdout }),
            getWorkflow: () => Promise.resolve({ data: { id: 5 } }),
            getWorkflowRun: () => Promise.resolve({ data: current }),
            listWorkflowRunArtifacts: () =>
              Promise.resolve({
                data: {
                  artifacts: [
                    {
                      expired: false,
                      id: 9,
                      name: "fingerprint-result",
                      size_in_bytes: zip.stdout.length,
                    },
                  ],
                },
              }),
            listWorkflowRuns: () =>
              Promise.resolve({ data: { workflow_runs: [current] } }),
          },
          pulls: {
            get: () =>
              Promise.resolve({
                data: {
                  base: { repo: { full_name: "test/test" }, sha: target.base },
                  head: { sha: target.head },
                  number: 1,
                  state: "open",
                },
              }),
          },
        },
      };
      await run({
        context: {
          payload: {
            workflow_run: {
              id: 10,
              run_attempt: scenario === "old-attempt" ? 1 : 2,
            },
          },
          repo: { owner: "test", repo: "test" },
        },
        core: {
          error: (message: string) => failures.push(message),
          setFailed: (message: string) => failures.push(message),
        },
        github,
      });
      const expected: Record<string, string> = {
        failure: "Fingerprint:error",
        invalid: "Fingerprint:error",
        "old-attempt": "Fingerprint:changed",
        success: "Fingerprint:compatible",
      };
      expect([...labels].sort()).toEqual([
        expected[scenario] ?? "unknown",
        "bug",
      ]);
      expect(failures.length > 0).toBe(
        scenario === "failure" || scenario === "invalid"
      );
    } finally {
      rmSync(directory, { force: true, recursive: true });
    }
  }
);

test("PR 계산은 읽기 전용이고 라벨 작업은 기본 브랜치 코드만 사용한다", () => {
  const source = readFileSync(
    new URL("../../.github/workflows/fingerprint.yml", import.meta.url),
    "utf8"
  );
  const labels = readFileSync(
    new URL("../../.github/workflows/fingerprint-labels.yml", import.meta.url),
    "utf8"
  );
  const workflow = YAML.parse(source) as {
    permissions: Record<string, string>;
    on: Record<string, unknown>;
  };
  expect(workflow.permissions).toEqual({ contents: "read" });
  expect(workflow.on.pull_request).toBeDefined();
  expect(source).not.toContain("secrets.");
  expect(source).not.toContain("MOBILE_EXPO_STATIC_CONFIG");
  expect(labels).toContain("github.event.repository.default_branch");
  expect(labels).not.toContain("pull_request_target");
  expect(labels).not.toContain("bun install");
});
