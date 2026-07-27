jest.mock("@react-native-google-signin/google-signin", () => ({
  GoogleSignin: { signOut: jest.fn() },
}));
jest.mock("./query-client", () => ({ queryClient: { clear: jest.fn() } }));
jest.mock("./rpc", () => ({ rpc: { account: { $delete: jest.fn() } } }));
jest.mock("./supabase", () => ({
  supabase: { auth: { signOut: jest.fn() } },
}));

import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { deleteAccount } from "./account";
import { queryClient } from "./query-client";
import { rpc } from "./rpc";
import { supabase } from "./supabase";

const mockDelete = rpc.account.$delete as unknown as jest.Mock;
const mockClear = (queryClient as unknown as { clear: jest.Mock }).clear;
const mockSupabaseSignOut = supabase.auth.signOut as unknown as jest.Mock;
const mockGoogleSignOut = GoogleSignin.signOut as unknown as jest.Mock;

const DELETE_FAILED = /삭제하지 못했습니다/;

function respond(ok: boolean, body: unknown = {}) {
  mockDelete.mockResolvedValue({ json: () => Promise.resolve(body), ok });
}

beforeEach(() => {
  jest.resetAllMocks();
  mockGoogleSignOut.mockResolvedValue(undefined);
  mockSupabaseSignOut.mockResolvedValue({ error: null });
});

describe("deleteAccount — 서버가 지웠을 때", () => {
  it("로컬 세션과 캐시를 비운다", async () => {
    respond(true, { deleted: true });

    await expect(deleteAccount()).resolves.toBeNull();

    expect(mockGoogleSignOut).toHaveBeenCalled();
    expect(mockSupabaseSignOut).toHaveBeenCalled();
    // 비우지 않으면 다음 사용자가 지워진 계정의 행을 그대로 본다.
    expect(mockClear).toHaveBeenCalled();
  });

  // 기본 스코프는 서버에 로그아웃을 요청하는데, 그 사용자는 방금 지워져 없다.
  it("로그아웃을 로컬 스코프로 한다", async () => {
    respond(true, { deleted: true });

    await deleteAccount();

    expect(mockSupabaseSignOut).toHaveBeenCalledWith({ scope: "local" });
  });

  // §5 — 로컬 정리가 실패해도 서버 계정을 되살리지 않는다. 강제로 버리고
  // signed-out으로 간다.
  //
  // signOut은 던지지 않고 `{ error }`로 resolve한다. 예전 `.catch`가 이걸
  // 못 잡아 실패가 조용히 지나갔으므로, 두 모양을 다 확인한다.
  it("로컬 로그아웃이 오류를 돌려줘도 캐시는 비운다", async () => {
    respond(true, { deleted: true });
    mockSupabaseSignOut.mockResolvedValue({
      error: { message: "storage unavailable" },
    });

    await expect(deleteAccount()).resolves.toBeNull();

    expect(mockClear).toHaveBeenCalled();
  });

  it("로컬 정리가 던져도 성공으로 끝내고 캐시를 비운다", async () => {
    respond(true, { deleted: true });
    mockSupabaseSignOut.mockRejectedValue(new Error("storage unavailable"));
    mockGoogleSignOut.mockRejectedValue(new Error("not signed in"));

    await expect(deleteAccount()).resolves.toBeNull();

    expect(mockClear).toHaveBeenCalled();
  });
});

describe("deleteAccount — 서버가 중단했을 때", () => {
  // 로컬 세션을 지우면 사용자는 다시 시도할 방법을 잃는다.
  it("로컬 세션을 건드리지 않는다", async () => {
    respond(false, { error: "계정을 삭제하지 못했습니다." });

    await expect(deleteAccount()).resolves.toEqual({
      error: "계정을 삭제하지 못했습니다.",
    });

    expect(mockSupabaseSignOut).not.toHaveBeenCalled();
    expect(mockClear).not.toHaveBeenCalled();
  });

  it("본문을 읽지 못하면 일반 문구로 알린다", async () => {
    mockDelete.mockResolvedValue({
      json: () => Promise.reject(new Error("not json")),
      ok: false,
    });

    const result = await deleteAccount();

    expect(result?.error).toMatch(DELETE_FAILED);
  });

  it("요청 자체가 실패해도 던지지 않는다", async () => {
    mockDelete.mockRejectedValue(new Error("Network request failed"));

    await expect(deleteAccount()).resolves.toEqual({
      error: "Network request failed",
    });
    expect(mockClear).not.toHaveBeenCalled();
  });
});
