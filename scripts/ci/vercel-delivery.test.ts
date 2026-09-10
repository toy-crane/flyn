import { expect, test } from "bun:test";
import { VercelApiDelivery, vercelProject } from "./vercel-delivery";

const request = {
  remoteId: null,
  requestId: "https://github.com/toy-crane/flyn/actions/runs/1",
  service: "api" as const,
  sha: "a".repeat(40),
};
const deployment = {
  id: "dpl_fixture",
  meta: { flynCommitSHA: request.sha, flynRequestId: request.requestId },
  projectId: vercelProject,
  readyState: "READY",
  target: "production",
  uid: "dpl_fixture",
};
const older = {
  ...deployment,
  id: "dpl_old",
  meta: { flynCommitSHA: "b".repeat(40) },
  uid: "dpl_old",
};

function delivery(
  live: unknown,
  deployments: unknown[] = [],
  probe = true,
  deploy: () => Promise<void> = () => Promise.resolve()
) {
  return new VercelApiDelivery({
    api: (path) =>
      Promise.resolve(
        path.startsWith("/v7/") ? { deployments } : (live as object)
      ),
    deploy,
    probe: () => Promise.resolve(probe),
  });
}

test("운영 도메인이 이 커밋을 서비스하면 성공으로 본다", async () => {
  expect(await delivery(deployment).inspect(request)).toEqual({
    remoteId: "dpl_fixture",
    status: "success",
  });
});

test("운영 도메인의 커밋이 지금 올라간 커밋이다", async () => {
  await expect(delivery(deployment).liveCommit()).resolves.toBe(request.sha);
  await expect(delivery(older).liveCommit()).resolves.toBe("b".repeat(40));
  await expect(delivery({ id: "dpl_x" }).liveCommit()).resolves.toBeNull();
});

test("HTTP 경계가 준비되지 않으면 성공으로 보지 않는다", async () => {
  expect(await delivery(deployment, [], false).inspect(request)).toEqual({
    remoteId: "dpl_fixture",
    status: "pending",
  });
});

for (const [name, state, expected] of [
  ["빌드 중", "BUILDING", "pending"],
  ["대기 중", "QUEUED", "pending"],
  ["빌드 실패", "ERROR", "failure"],
  ["취소", "CANCELED", "failure"],
] as const) {
  test(`운영에 없는 ${name} 배포는 성공으로 기록하지 않는다`, async () => {
    expect(
      await delivery(older, [{ ...deployment, readyState: state }]).inspect(
        request
      )
    ).toEqual({ remoteId: "dpl_fixture", status: expected });
  });
}

test("같은 커밋의 실패한 배포가 있어도 진행 중 배포를 먼저 본다", async () => {
  expect(
    await delivery(older, [
      { ...deployment, readyState: "ERROR", uid: "dpl_failed" },
      { ...deployment, readyState: "BUILDING", uid: "dpl_running" },
    ]).inspect(request)
  ).toEqual({ remoteId: "dpl_running", status: "pending" });
});

test("다른 커밋의 배포는 이 커밋의 결과로 보지 않는다", async () => {
  expect(await delivery(older, [older]).inspect(request)).toEqual({
    remoteId: null,
    status: "pending",
  });
});

test("응답을 잃은 배포는 조회로 복구하고 새 배포를 요청하지 않는다", async () => {
  let starts = 0;
  const runtime = delivery(deployment, [deployment], true, () => {
    starts += 1;
    return Promise.reject(new Error("response lost"));
  });
  await expect(runtime.start(request)).rejects.toThrow("response lost");
  expect((await runtime.inspect(request)).status).toBe("success");
  expect(starts).toBe(1);
});

test("운영 배포 응답이 올바르지 않으면 거절한다", async () => {
  await expect(delivery(null).inspect(request)).rejects.toThrow("운영 배포");
  await expect(
    new VercelApiDelivery({
      api: (path) =>
        Promise.resolve(path.startsWith("/v7/") ? {} : (older as object)),
      deploy: () => Promise.resolve(),
      probe: () => Promise.resolve(true),
    }).inspect(request)
  ).rejects.toThrow("배포 목록");
});

test("다른 프로젝트나 대상의 운영 배포는 성공으로 보지 않는다", async () => {
  const pending = { remoteId: null, status: "pending" } as const;
  const [other, preview] = await Promise.all([
    delivery({ ...deployment, projectId: "another-project" }, []).inspect(
      request
    ),
    delivery({ ...deployment, target: "preview" }, []).inspect(request),
  ]);
  expect(other).toEqual(pending);
  expect(preview).toEqual(pending);
});
