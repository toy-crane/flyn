import { expect, test } from "bun:test";
import type { DeliveryRequest } from "./delivery-execution";
import { SupabaseEdgeDelivery } from "./edge-delivery";

const request: DeliveryRequest = {
  remoteId: null,
  requestId: "fixture-request",
  service: "edge",
  sha: "a".repeat(40),
};

test("Edge 배포 응답을 잃어도 같은 요청의 소스와 인증 경계를 조회해 복구한다", async () => {
  let writes = 0;
  let deployed = false;
  const remote = new SupabaseEdgeDelivery({
    deploy: () => {
      writes += 1;
      deployed = true;
      return Promise.reject(new Error("response lost"));
    },
    inspect: async () => (deployed ? "function-id:2" : null),
    probe: async () => true,
    sha: request.sha,
  });
  await expect(remote.start(request)).rejects.toThrow("response lost");
  expect(await remote.inspect(request)).toEqual({
    remoteId: "function-id:2",
    status: "success",
  });
  expect(writes).toBe(1);
});

test("소스나 인증 응답을 확인하지 못하면 성공이나 재배포로 처리하지 않는다", async () => {
  let writes = 0;
  const remote = new SupabaseEdgeDelivery({
    deploy: () => {
      writes += 1;
      return Promise.resolve();
    },
    inspect: async () => null,
    probe: async () => true,
    sha: request.sha,
  });
  expect((await remote.inspect(request)).status).toBe("pending");
  expect(writes).toBe(0);
  const broken = new SupabaseEdgeDelivery({
    deploy: () => Promise.resolve(),
    inspect: async () => "function-id:2",
    probe: async () => false,
    sha: request.sha,
  });
  expect((await broken.inspect(request)).status).toBe("pending");
  await expect(
    remote.start({ ...request, sha: "b".repeat(40) })
  ).rejects.toThrow();
  expect(writes).toBe(0);
});
