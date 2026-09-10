import { expect, test } from "bun:test";
import { type DeliveryState, executeDelivery } from "./delivery-execution";

const target = "a".repeat(40);

test("빌드 완료를 기다리기 전에 원격 실행 ID를 기록하고 중단 후 같은 실행을 조회한다", async () => {
  let state: DeliveryState = {
    pending: null,
    success: { api: null, database: null, edge: null, mobile: null },
    version: 1,
  };
  const journal = {
    read: () =>
      Promise.resolve({ revision: "v", state: structuredClone(state) }),
    write: (_revision: string, next: DeliveryState) => {
      state = structuredClone(next);
      return Promise.resolve("v2");
    },
  };
  await expect(
    executeDelivery(target, {
      journal,
      plan: () => Promise.resolve(["mobile"]),
      remote: {
        inspect: () => Promise.reject(new Error("unexpected")),
        start: () => Promise.resolve({ remoteId: "eas-1", status: "pending" }),
        wait: (request) => {
          expect(state.pending?.remoteId).toBe("eas-1");
          expect(request.remoteId).toBe("eas-1");
          return Promise.reject(new Error("interrupted"));
        },
      },
    })
  ).rejects.toThrow("interrupted");
  expect(state.pending?.remoteId).toBe("eas-1");
  expect(state.success.mobile).toBeNull();
});

test("원격 실행 ID가 없는 성공 응답은 배포 완료로 기록하지 않는다", async () => {
  let state: DeliveryState = {
    pending: null,
    success: { api: null, database: null, edge: null, mobile: null },
    version: 1,
  };
  await expect(
    executeDelivery(target, {
      journal: {
        read: async () => ({
          revision: "initial",
          state: structuredClone(state),
        }),
        write: (_revision, next) => {
          state = structuredClone(next);
          return Promise.resolve("next");
        },
      },
      plan: async () => ["api"],
      remote: {
        inspect: () => Promise.reject(new Error("unexpected inspection")),
        start: async () => ({ remoteId: null, status: "success" }),
      },
    })
  ).rejects.toThrow("실행 ID");
  expect(state.success.api).toBeNull();
  expect(state.pending?.service).toBe("api");
});

test("응답 유실 후 원격 상태가 불명확하면 재요청하지 않고 대기 상태를 보존한다", async () => {
  let state: DeliveryState = {
    pending: null,
    success: { api: null, database: null, edge: null, mobile: null },
    version: 1,
  };
  let starts = 0;
  let inspections = 0;
  const dependencies = {
    journal: {
      read: async () => ({
        revision: "revision",
        state: structuredClone(state),
      }),
      write: (_revision: string, next: DeliveryState) => {
        state = structuredClone(next);
        return Promise.resolve("next");
      },
    },
    plan: async () => ["mobile" as const],
    remote: {
      inspect: () => {
        inspections += 1;
        return Promise.resolve({ remoteId: null, status: "pending" as const });
      },
      start: () => {
        starts += 1;
        return Promise.reject(new Error("response lost"));
      },
    },
  };
  await expect(executeDelivery(target, dependencies)).rejects.toThrow(
    "response lost"
  );
  const requestId = state.pending?.requestId;
  await expect(executeDelivery(target, dependencies)).rejects.toThrow(
    "pending"
  );
  expect(starts).toBe(1);
  expect(inspections).toBe(1);
  expect(state.pending?.requestId).toBe(requestId);
  expect(state.success.mobile).toBeNull();
});

test("두 실행이 같은 상태를 읽어도 기록 경쟁에서 이긴 실행만 배포를 요청한다", async () => {
  let state: DeliveryState = {
    pending: null,
    success: { api: null, database: null, edge: null, mobile: null },
    version: 1,
  };
  let version = 0;
  let starts = 0;
  const dependencies = {
    journal: {
      read: async () => ({
        revision: String(version),
        state: structuredClone(state),
      }),
      write: (revision: string, next: DeliveryState) => {
        if (revision !== String(version)) {
          return Promise.reject(new Error("conflict"));
        }
        version += 1;
        state = structuredClone(next);
        return Promise.resolve(String(version));
      },
    },
    plan: async () => ["mobile" as const],
    remote: {
      inspect: () => Promise.reject(new Error("unexpected inspection")),
      start: () => {
        starts += 1;
        return Promise.resolve({
          remoteId: "eas-1",
          status: "pending" as const,
        });
      },
    },
  };
  const results = await Promise.allSettled([
    executeDelivery(target, dependencies),
    executeDelivery(target, dependencies),
  ]);
  expect(starts).toBe(1);
  expect(results.every((result) => result.status === "rejected")).toBe(true);
  expect(state.pending?.remoteId).toBe("eas-1");
});

test("문서만 변경한 배포는 원격 요청과 상태 쓰기를 하지 않는다", async () => {
  let writes = 0;
  let starts = 0;
  await executeDelivery(target, {
    journal: {
      read: async () => ({
        revision: "initial",
        state: {
          pending: null,
          success: {
            api: target,
            database: target,
            edge: target,
            mobile: target,
          },
          version: 1,
        },
      }),
      write: () => {
        writes += 1;
        return Promise.resolve("next");
      },
    },
    plan: async () => [],
    remote: {
      inspect: () => Promise.reject(new Error("unexpected inspection")),
      start: () => {
        starts += 1;
        return Promise.reject(new Error("unexpected start"));
      },
    },
  });
  expect(writes).toBe(0);
  expect(starts).toBe(0);
});

test("이전 커밋의 원격 배포가 남아 있으면 다른 커밋을 시작하지 않는다", async () => {
  const state: DeliveryState = {
    pending: {
      remoteId: "eas-1",
      requestId: "older",
      service: "mobile",
      sha: "b".repeat(40),
    },
    success: { api: null, database: null, edge: null, mobile: null },
    version: 1,
  };
  const calls: string[] = [];
  await expect(
    executeDelivery(target, {
      journal: {
        read: async () => ({ revision: "initial", state }),
        write: () => {
          calls.push("write");
          return Promise.resolve("next");
        },
      },
      plan: async () => [],
      remote: {
        inspect: () => {
          calls.push("inspect");
          return Promise.resolve({
            remoteId: "eas-1",
            status: "success" as const,
          });
        },
        start: () => Promise.reject(new Error("unexpected start")),
      },
    })
  ).rejects.toThrow("이전 커밋");
  expect(calls).toEqual([]);
});

test("응답을 잃은 API 요청은 원격 조회로 이어 받고 성공한 DB는 다시 배포하지 않는다", async () => {
  let state: DeliveryState = {
    pending: {
      remoteId: null,
      requestId: "existing-request",
      service: "api",
      sha: target,
    },
    success: { api: null, database: target, edge: target, mobile: null },
    version: 1,
  };
  const calls: string[] = [];
  await executeDelivery(target, {
    journal: {
      read: async () => ({
        revision: "initial",
        state: structuredClone(state),
      }),
      write: (_revision, next) => {
        state = structuredClone(next);
        return Promise.resolve("next");
      },
    },
    plan: async () => ["api", "mobile"],
    remote: {
      inspect: (request) => {
        calls.push(`inspect:${request.requestId}`);
        return Promise.resolve({
          remoteId: "api-1",
          status: "success" as const,
        });
      },
      start: (request) => {
        calls.push(`start:${request.service}`);
        return Promise.resolve({
          remoteId: "mobile-1",
          status: "success" as const,
        });
      },
    },
  });
  expect(calls).toEqual(["inspect:existing-request", "start:mobile"]);
  expect(state.success).toEqual({
    api: target,
    database: target,
    edge: target,
    mobile: target,
  });
  expect(state.pending).toBeNull();
  expect(state.lastResult).toMatchObject({
    remoteId: "mobile-1",
    service: "mobile",
    sha: target,
    status: "success",
  });
});

test("DB 배포 실패 뒤에는 Edge와 API와 모바일을 요청하지 않는다", async () => {
  let state: DeliveryState = {
    pending: null,
    success: { api: null, database: null, edge: null, mobile: null },
    version: 1,
  };
  const calls: string[] = [];
  await expect(
    executeDelivery(target, {
      journal: {
        read: async () => ({
          revision: "initial",
          state: structuredClone(state),
        }),
        write: (_revision, next) => {
          state = structuredClone(next);
          return Promise.resolve("next");
        },
      },
      plan: async () => ["database", "edge", "api", "mobile"],
      remote: {
        inspect: () => Promise.reject(new Error("unexpected inspection")),
        start: (request) => {
          calls.push(request.service);
          return Promise.resolve({
            remoteId: "db-1",
            status: "failure" as const,
          });
        },
      },
    })
  ).rejects.toThrow("database");
  expect(calls).toEqual(["database"]);
  expect(state.success.database).toBeNull();
});
