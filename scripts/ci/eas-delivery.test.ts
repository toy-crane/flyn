import { expect, test } from "bun:test";
import { serve } from "bun";
import type { DeliveryRequest } from "./delivery-execution";
import { EasDelivery } from "./eas-delivery";

const request: DeliveryRequest = {
  remoteId: null,
  requestId: "11111111-1111-4111-8111-111111111111",
  service: "mobile",
  sha: "a".repeat(40),
};
const id = "22222222-2222-4222-8222-222222222222";
const identity = {
  key: "identity",
  outputs: { release_sha: request.sha, request_id: request.requestId },
  status: "success",
};

test("EAS 요청 응답을 잃어도 같은 커밋과 요청의 완료된 Update를 조회하고 재발행하지 않는다", async () => {
  let posts = 0;
  const server = serve({
    async fetch(req) {
      if (req.method === "POST") {
        posts += 1;
        expect(await req.json()).toEqual({
          appId: "7d2f7888-8fc8-4ecb-b430-9fee421c68cc",
          fileName: "internal.yml",
          gitRef: request.sha,
          inputs: { release_sha: request.sha, request_id: request.requestId },
        });
        return new Response("lost", { status: 503 });
      }
      return Response.json({
        data: {
          gitCommitHash: request.sha,
          id,
          jobs: [
            identity,
            {
              key: "get_build",
              outputs: { build_id: "existing" },
              status: "success",
            },
            {
              key: "check_existing",
              outputs: { action: "update" },
              status: "success",
            },
            {
              key: "update_ios",
              outputs: { first_update_group_id: "group" },
              status: "success",
            },
          ],
          status: "success",
        },
      });
    },
    port: 0,
  });
  try {
    const remote = new EasDelivery({
      listRuns: () =>
        Promise.resolve([
          { gitCommitHash: request.sha, id, workflowFileName: "internal.yml" },
        ]),
      maxPolls: 1,
      origin: server.url.origin,
      pollMilliseconds: 0,
      token: "fixture",
    });
    await expect(remote.start(request)).rejects.toThrow("503");
    expect(await remote.inspect(request)).toEqual({
      remoteId: id,
      status: "success",
    });
    expect(posts).toBe(1);
  } finally {
    server.stop(true);
  }
});

test("호환 빌드를 새로 제출한 뒤 설치 가능 확인과 Update가 모두 끝나야 완료한다", async () => {
  const run = {
    gitCommitHash: request.sha,
    id,
    jobs: [
      identity,
      {
        key: "get_build",
        outputs: { build_id: "existing" },
        status: "success",
      },
      {
        key: "check_existing",
        outputs: { action: "submit" },
        status: "success",
      },
      { key: "submit_existing", status: "success", submissionId: "submission" },
      { key: "verify_submitted", status: "success" },
      {
        key: "update_submitted",
        outputs: { first_update_group_id: "group" },
        status: "success",
      },
    ],
    status: "success",
  };
  const server = serve({ fetch: () => Response.json({ data: run }), port: 0 });
  try {
    const remote = new EasDelivery({
      listRuns: () => Promise.resolve([]),
      maxPolls: 1,
      origin: server.url.origin,
      token: "fixture",
    });
    expect(await remote.inspect({ ...request, remoteId: id })).toEqual({
      remoteId: id,
      status: "success",
    });
  } finally {
    server.stop(true);
  }
});

test("Apple 처리 확인 없는 EAS 성공과 다른 요청의 실행은 완료로 기록하지 않는다", async () => {
  let run: {
    id: string;
    gitCommitHash: string;
    status: string;
    jobs: {
      key: string;
      status: string;
      outputs?: Record<string, string>;
      buildId?: string;
      submissionId?: string;
    }[];
  } = {
    gitCommitHash: request.sha,
    id,
    jobs: [
      identity,
      { buildId: "build", key: "build_ios", status: "success" },
      { key: "submit_ios", status: "success", submissionId: "submit" },
    ],
    status: "success",
  };
  const server = serve({
    fetch: () => Response.json({ data: run }),
    port: 0,
  });
  const remote = new EasDelivery({
    listRuns: () =>
      Promise.resolve([
        { gitCommitHash: request.sha, id, workflowFileName: "internal.yml" },
      ]),
    maxPolls: 1,
    origin: server.url.origin,
    pollMilliseconds: 0,
    token: "fixture",
  });
  try {
    await expect(remote.inspect({ ...request, remoteId: id })).rejects.toThrow(
      "증거"
    );
    run = {
      ...run,
      jobs: [...run.jobs, { key: "verify_new", status: "success" }],
    };
    expect((await remote.inspect({ ...request, remoteId: id })).status).toBe(
      "success"
    );
    expect(
      (
        await remote.inspect({
          ...request,
          requestId: "33333333-3333-4333-8333-333333333333",
        })
      ).status
    ).toBe("pending");
    run = { ...run, status: "in-progress" };
    expect(await remote.inspect({ ...request, remoteId: id })).toEqual({
      remoteId: id,
      status: "pending",
    });
    run = { ...run, status: "failure" };
    expect((await remote.inspect({ ...request, remoteId: id })).status).toBe(
      "failure"
    );
  } finally {
    server.stop(true);
  }
});
