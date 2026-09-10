import { expect, test } from "bun:test";
import {
  type DeliveryObservation,
  type DeliveryRequest,
  deliverService,
} from "./delivery-execution";

const request: DeliveryRequest = {
  remoteId: null,
  requestId: "https://github.com/toy-crane/flyn/actions/runs/1",
  service: "api",
  sha: "a".repeat(40),
};

function observation(
  status: DeliveryObservation["status"],
  remoteId: string | null = "dpl_1"
): DeliveryObservation {
  return { remoteId, status };
}

test("이미 올라간 커밋은 다시 배포하지 않는다", async () => {
  const started: string[] = [];
  await expect(
    deliverService(request, {
      inspect: () => Promise.resolve(observation("success")),
      start: () => {
        started.push("start");
        return Promise.resolve(observation("success"));
      },
    })
  ).resolves.toBe("already");
  expect(started).toEqual([]);
});

test("이 커밋의 배포 기록이 없으면 새로 시작한다", async () => {
  let started = 0;
  await expect(
    deliverService(request, {
      inspect: () => Promise.resolve(observation("pending", null)),
      start: () => {
        started += 1;
        return Promise.resolve(observation("success"));
      },
    })
  ).resolves.toBe("delivered");
  expect(started).toBe(1);
});

test("이미 진행 중인 요청은 새로 만들지 않고 이어받는다", async () => {
  let started = 0;
  const waited: (string | null)[] = [];
  await expect(
    deliverService(request, {
      inspect: () => Promise.resolve(observation("pending", "dpl_live")),
      start: () => {
        started += 1;
        return Promise.resolve(observation("success"));
      },
      wait: (current) => {
        waited.push(current.remoteId);
        return Promise.resolve(observation("success", "dpl_live"));
      },
    })
  ).resolves.toBe("delivered");
  expect(started).toBe(0);
  expect(waited).toEqual(["dpl_live"]);
});

test("같은 커밋의 실패한 배포는 다시 시도한다", async () => {
  let started = 0;
  await expect(
    deliverService(request, {
      inspect: () => Promise.resolve(observation("failure")),
      start: () => {
        started += 1;
        return Promise.resolve(observation("success"));
      },
    })
  ).resolves.toBe("delivered");
  expect(started).toBe(1);
});

test("배포 실패는 성공으로 넘어가지 않는다", async () => {
  await expect(
    deliverService(request, {
      inspect: () => Promise.resolve(observation("pending", null)),
      start: () => Promise.resolve(observation("failure")),
    })
  ).rejects.toThrow("api");
});

test("끝나지 않은 배포를 성공으로 보지 않는다", async () => {
  await expect(
    deliverService(request, {
      inspect: () => Promise.resolve(observation("pending", null)),
      start: () => Promise.resolve(observation("pending")),
    })
  ).rejects.toThrow("api");
});

test("성공한 배포에는 원격 실행 ID가 있어야 한다", async () => {
  await expect(
    deliverService(request, {
      inspect: () => Promise.resolve(observation("pending", null)),
      start: () => Promise.resolve(observation("success", null)),
    })
  ).rejects.toThrow("원격");
});

test("대기가 끝나지 않으면 성공으로 보지 않는다", async () => {
  let waits = 0;
  await expect(
    deliverService(
      request,
      {
        inspect: () => Promise.resolve(observation("pending", "dpl_live")),
        start: () => Promise.resolve(observation("pending")),
        wait: () => {
          waits += 1;
          return Promise.resolve(observation("pending", "dpl_live"));
        },
      },
      2
    )
  ).rejects.toThrow("api");
  expect(waits).toBe(2);
});
