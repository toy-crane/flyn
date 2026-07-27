import { beforeEach, describe, expect, it } from "bun:test";
import { type AccountStore, deleteAccount } from "./account";
import type { AppleGateway } from "./apple";

// 삭제 순서만 보는 테스트다. HTTP도 Supabase도 Apple도 끼지 않는다 —
// 되돌릴 수 없는 판단이 어디서 멈추는지가 전부다.

const USER = "11111111-1111-1111-1111-111111111111";

let calls: string[];

function store(overrides: Partial<AccountStore> = {}): AccountStore {
  return {
    deleteUser: () => {
      calls.push("deleteUser");
      return Promise.resolve(true);
    },
    hasAppleIdentity: () => Promise.resolve(false),
    readAppleRefreshToken: () => Promise.resolve("stored-refresh-token"),
    ...overrides,
  };
}

function apple(revokes: boolean): AppleGateway {
  return {
    exchange: () => Promise.resolve(null),
    revoke: () => {
      calls.push("revoke");
      return Promise.resolve(revokes);
    },
  };
}

beforeEach(() => {
  calls = [];
});

describe("deleteAccount — Apple 연결이 없는 계정", () => {
  it("바로 지운다", async () => {
    const outcome = await deleteAccount(store(), apple(true), USER);

    expect(outcome).toEqual({ kind: "deleted" });
    // 취소할 것이 없으므로 Apple을 부르지 않는다.
    expect(calls).toEqual(["deleteUser"]);
  });

  it("삭제 실패를 성공으로 보고하지 않는다", async () => {
    const outcome = await deleteAccount(
      store({ deleteUser: () => Promise.resolve(false) }),
      apple(true),
      USER
    );

    expect(outcome).toEqual({ kind: "deleteFailed" });
  });
});

describe("deleteAccount — Apple 연결이 있는 계정", () => {
  const appleUser = { hasAppleIdentity: () => Promise.resolve(true) };

  it("Apple 취소가 먼저고 그다음이 삭제다", async () => {
    const outcome = await deleteAccount(store(appleUser), apple(true), USER);

    expect(outcome).toEqual({ kind: "deleted" });
    expect(calls).toEqual(["revoke", "deleteUser"]);
  });

  // §5 — 먼저 지우면 누가 어떤 token을 취소해야 하는지가 사라져 재시도 자체가
  // 불가능해지고, Apple 쪽 승인만 영원히 남는다.
  it("Apple 취소가 실패하면 사용자를 지우지 않는다", async () => {
    const outcome = await deleteAccount(store(appleUser), apple(false), USER);

    expect(outcome).toEqual({ kind: "appleRevokeFailed" });
    expect(calls).toEqual(["revoke"]);
  });

  it("보관된 token이 없으면 중단한다", async () => {
    const outcome = await deleteAccount(
      store({
        ...appleUser,
        readAppleRefreshToken: () => Promise.resolve(null),
      }),
      apple(true),
      USER
    );

    expect(outcome).toEqual({ kind: "appleTokenUnavailable" });
    expect(calls).toEqual([]);
  });

  // 설정이 없다는 이유로 취소를 건너뛰면 심사 요구를 어긴 채 조용히 지나간다.
  it("Apple 설정이 없으면 중단한다", async () => {
    const outcome = await deleteAccount(store(appleUser), null, USER);

    expect(outcome).toEqual({ kind: "appleTokenUnavailable" });
    expect(calls).toEqual([]);
  });
});

// identity 조회에 실패했을 때 "Apple 아님"으로 단정하면 취소를 건너뛴 채
// 계정을 지운다. 되돌릴 수 없는 쪽으로 기울지 않게 한다.
describe("deleteAccount — identity를 확인하지 못했을 때", () => {
  it("Apple 계정으로 보고 취소를 요구한다", async () => {
    const outcome = await deleteAccount(
      store({
        hasAppleIdentity: () => Promise.resolve(true),
        readAppleRefreshToken: () => Promise.resolve(null),
      }),
      null,
      USER
    );

    expect(outcome).toEqual({ kind: "appleTokenUnavailable" });
    expect(calls).toEqual([]);
  });
});
