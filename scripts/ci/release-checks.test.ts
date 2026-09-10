import { expect, test } from "bun:test";
import { readFileSync } from "node:fs";
import { serve, spawnSync, YAML } from "bun";
import { requireReleaseChecks } from "./release-checks";

test("같은 SHA의 필수 검사가 실패하면 배포를 허용하지 않는다", async () => {
  const server = serve({
    fetch: () =>
      Response.json({
        check_runs: [
          {
            app: { id: 15_368 },
            conclusion: "failure",
            head_sha: "a".repeat(40),
            id: 1,
            name: "Required validation",
            status: "completed",
          },
        ],
        total_count: 1,
      }),
    port: 0,
  });
  try {
    await expect(
      requireReleaseChecks("a".repeat(40), "fixture", server.url.origin, {
        maxPolls: 1,
        pollMilliseconds: 0,
      })
    ).rejects.toThrow("필수 검사");
  } finally {
    await server.stop(true);
  }
});

for (const invalid of [
  "missing",
  "wrong-sha",
  "wrong-app",
  "pending",
  "skipped",
]) {
  test(`필수 검사 ${invalid} 응답은 배포를 차단한다`, async () => {
    const server = serve({
      fetch: (request) => {
        const name = new URL(request.url).searchParams.get("check_name");
        return Response.json({
          check_runs:
            invalid === "missing"
              ? []
              : [
                  {
                    app: { id: invalid === "wrong-app" ? 1 : 15_368 },
                    conclusion: invalid === "skipped" ? "skipped" : "success",
                    head_sha:
                      invalid === "wrong-sha" ? "b".repeat(40) : "a".repeat(40),
                    name,
                    status: invalid === "pending" ? "in_progress" : "completed",
                  },
                ],
          total_count: invalid === "missing" ? 0 : 1,
        });
      },
      port: 0,
    });
    try {
      await expect(
        requireReleaseChecks("a".repeat(40), "fixture", server.url.origin, {
          maxPolls: 1,
          pollMilliseconds: 0,
        })
      ).rejects.toThrow("필수 검사");
    } finally {
      await server.stop(true);
    }
  });
}

test("같은 SHA의 두 필수 검사가 성공하면 배포를 허용한다", async () => {
  const server = serve({
    fetch: (request) =>
      Response.json({
        check_runs: [
          {
            app: { id: 15_368 },
            conclusion: "success",
            head_sha: "a".repeat(40),
            name: new URL(request.url).searchParams.get("check_name"),
            status: "completed",
          },
        ],
        total_count: 1,
      }),
    port: 0,
  });
  try {
    await requireReleaseChecks("a".repeat(40), "fixture", server.url.origin);
  } finally {
    await server.stop(true);
  }
});

test("main push 직후에는 필수 검사가 생기고 끝날 때까지 기다린다", async () => {
  const calls = new Map<string, number>();
  const server = serve({
    fetch: (request) => {
      const name = new URL(request.url).searchParams.get("check_name") ?? "";
      const attempt = (calls.get(name) ?? 0) + 1;
      calls.set(name, attempt);
      const checkRuns =
        attempt === 1
          ? []
          : [
              {
                app: { id: 15_368 },
                conclusion: attempt === 2 ? null : "success",
                head_sha: "a".repeat(40),
                name,
                status: attempt === 2 ? "in_progress" : "completed",
              },
            ];
      return Response.json({
        check_runs: checkRuns,
        total_count: checkRuns.length,
      });
    },
    port: 0,
  });
  try {
    await requireReleaseChecks("a".repeat(40), "fixture", server.url.origin, {
      maxPolls: 3,
      pollMilliseconds: 0,
    });
    expect([...calls.values()]).toEqual([3, 3]);
  } finally {
    await server.stop(true);
  }
});

test("로컬이나 PR 실행에서는 DB 배포 CLI가 원격 연결 전에 중단된다", () => {
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

test("배포 workflow는 main push와 수동 실행에 공통 직렬 대기를 사용한다", () => {
  const workflow = YAML.parse(
    readFileSync(
      new URL("../../.github/workflows/deploy.yml", import.meta.url),
      "utf8"
    )
  ) as {
    on: Record<string, unknown>;
    concurrency: Record<string, unknown>;
    jobs: {
      database: {
        if: string;
        steps: { name?: string; env?: Record<string, string>; run?: string }[];
      };
    };
  };
  expect(Object.keys(workflow.on)).toEqual(["push", "workflow_dispatch"]);
  expect(workflow.on.push).toEqual({ branches: ["main"] });
  expect(workflow.concurrency).toEqual({
    "cancel-in-progress": false,
    group: "flyn-production-deployment",
    queue: "max",
  });
  expect(workflow.jobs.database.if).toContain("refs/heads/main");
  const { steps } = workflow.jobs.database;
  const gate = steps.findIndex(
    (step) => step.run === "bun scripts/ci/release-checks.ts"
  );
  const firstSecret = steps.findIndex(
    (step) => step.env?.SUPABASE_ACCESS_TOKEN
  );
  expect(gate).toBeGreaterThan(-1);
  expect(firstSecret).toBeGreaterThan(gate);
});
