import { expect, test } from "bun:test";
import { VercelApiDelivery, vercelProject } from "./vercel-delivery";

const request = {
  remoteId: null,
  requestId: "request-1",
  service: "api" as const,
  sha: "a".repeat(40),
};
const deployment = {
  id: "dpl_fixture",
  meta: { flynCommitSHA: request.sha, flynRequestId: request.requestId },
  projectId: vercelProject,
  readyState: "READY",
  target: "production",
};

for (const [name, change, expected] of [
  ["빌드 중", { readyState: "BUILDING" }, "pending"],
  ["빌드 실패", { readyState: "ERROR" }, "failure"],
  ["취소", { readyState: "CANCELED" }, "failure"],
  ["알 수 없는 상태", { readyState: "UNKNOWN" }, "pending"],
] as const) {
  test(`${name} 상태는 성공으로 기록하지 않는다`, async () => {
    const delivery = new VercelApiDelivery({
      api: async () => ({ ...deployment, ...change }),
      deploy: () => Promise.resolve(),
      probe: async () => true,
    });
    expect(
      await delivery.inspect({ ...request, remoteId: deployment.id })
    ).toEqual({ remoteId: deployment.id, status: expected });
  });
}

for (const change of [
  { projectId: "another-project" },
  { target: "preview" },
  { meta: { ...deployment.meta, flynCommitSHA: "b".repeat(40) } },
  { meta: { ...deployment.meta, flynRequestId: "other-request" } },
]) {
  test(`다른 배포 대상은 거절한다: ${JSON.stringify(change)}`, async () => {
    const delivery = new VercelApiDelivery({
      api: async () => ({ ...deployment, ...change }),
      deploy: () => Promise.resolve(),
      probe: async () => true,
    });
    await expect(
      delivery.inspect({ ...request, remoteId: deployment.id })
    ).rejects.toThrow("배포 대상");
  });
}

for (const oldAlias of [true, false]) {
  test(`운영 별칭이나 HTTP가 준비되지 않으면 대기한다: ${oldAlias}`, async () => {
    const delivery = new VercelApiDelivery({
      api: async (path) =>
        path.includes("flyn-api.vercel.app") && oldAlias
          ? { id: "dpl_old" }
          : deployment,
      deploy: () => Promise.resolve(),
      probe: async () => false,
    });
    expect(
      (await delivery.inspect({ ...request, remoteId: deployment.id })).status
    ).toBe("pending");
  });
}

test("배포 요청의 응답 유실 뒤에는 조회만으로 기존 작업을 복구한다", async () => {
  let starts = 0;
  const delivery = new VercelApiDelivery({
    api: async (path) =>
      path.startsWith("/v7/")
        ? { deployments: [{ ...deployment, uid: deployment.id }] }
        : deployment,
    deploy: () => {
      starts += 1;
      return Promise.reject(new Error("response lost"));
    },
    probe: async () => true,
  });
  await expect(delivery.start(request)).rejects.toThrow("response lost");
  expect((await delivery.inspect(request)).status).toBe("success");
  expect(starts).toBe(1);
});

test("같은 요청의 READY 배포와 운영 별칭 및 HTTP를 확인해야 성공한다", async () => {
  let probes = 0;
  const delivery = new VercelApiDelivery({
    api: async (path) =>
      path.startsWith("/v7/")
        ? { deployments: [{ ...deployment, uid: deployment.id }] }
        : deployment,
    deploy: () => Promise.resolve(),
    probe: () => {
      probes += 1;
      return Promise.resolve(true);
    },
  });
  expect(await delivery.inspect(request)).toEqual({
    remoteId: "dpl_fixture",
    status: "success",
  });
  expect(probes).toBe(1);
});

test("응답을 잃은 배포가 조회되지 않아도 새 배포를 요청하지 않는다", async () => {
  let starts = 0;
  const delivery = new VercelApiDelivery({
    api: async () => ({ deployments: [], pagination: { next: null } }),
    deploy: () => {
      starts += 1;
      return Promise.resolve();
    },
    probe: async () => true,
  });
  expect(
    await delivery.inspect({
      remoteId: null,
      requestId: "request-1",
      service: "api",
      sha: "a".repeat(40),
    })
  ).toEqual({ remoteId: null, status: "pending" });
  expect(starts).toBe(0);
});
