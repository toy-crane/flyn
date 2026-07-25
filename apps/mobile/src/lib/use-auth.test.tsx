import { act, renderHook } from "@testing-library/react-native";

jest.mock("./query-client", () => ({
  queryClient: { clear: jest.fn() },
}));

jest.mock("./supabase", () => ({
  supabase: {
    auth: {
      getClaims: jest.fn(),
      onAuthStateChange: jest.fn(),
      signOut: jest.fn(),
    },
  },
  supabaseConfigured: true,
}));

import { queryClient } from "./query-client";
import { supabase } from "./supabase";
import { useAuth } from "./use-auth";

const mockAuth = supabase.auth as unknown as {
  getClaims: jest.Mock;
  onAuthStateChange: jest.Mock;
  signOut: jest.Mock;
};
const mockClear = (queryClient as unknown as { clear: jest.Mock }).clear;

interface Session {
  user: { id: string; is_anonymous?: boolean };
}
type Listener = (event: string, session: Session | null) => void;

let listener: Listener;
let unsubscribe: jest.Mock;

/** 리스너 호출과 그로 인한 비동기 상태 전이를 act 안에서 정리한다. */
function emit(event: string, session: Session | null) {
  return act(async () => {
    listener(event, session);
    await Promise.resolve();
  });
}

/** discardStoredSession이 setTimeout(0)으로 미뤄둔 로그아웃까지 흘려보낸다. */
function flushTimers() {
  return act(async () => {
    jest.advanceTimersByTime(1);
    await Promise.resolve();
  });
}

beforeEach(() => {
  // clearAllMocks는 호출 기록만 지우고 mockResolvedValue를 남겨 테스트가 순서에
  // 묶인다. reset 후 각 테스트가 필요한 구현만 세운다.
  jest.resetAllMocks();
  jest.useFakeTimers();

  unsubscribe = jest.fn();
  mockAuth.signOut.mockResolvedValue({ error: null });
  mockAuth.onAuthStateChange.mockImplementation((cb: Listener) => {
    listener = cb;
    return { data: { subscription: { unsubscribe } } };
  });
});

afterEach(() => {
  jest.useRealTimers();
});

describe("useAuth", () => {
  it("구독 직후에는 loading이다", async () => {
    const { result } = await renderHook(() => useAuth());

    expect(result.current.kind).toBe("loading");
  });

  it("세션 없는 INITIAL_SESSION은 signedOut으로 떨어진다", async () => {
    const { result } = await renderHook(() => useAuth());

    await emit("INITIAL_SESSION", null);

    expect(result.current).toEqual({ kind: "signedOut" });
  });

  it("SIGNED_IN은 검증 왕복 없이 ready가 된다", async () => {
    const { result } = await renderHook(() => useAuth());

    await emit("SIGNED_IN", { user: { id: "user-1" } });

    expect(result.current).toEqual({ kind: "ready", userId: "user-1" });
    expect(mockAuth.getClaims).not.toHaveBeenCalled();
  });

  it("복원된 INITIAL_SESSION은 getClaims 검증을 거쳐 ready가 된다", async () => {
    mockAuth.getClaims.mockResolvedValue({
      data: { claims: { sub: "user-1" } },
      error: null,
    });
    const { result } = await renderHook(() => useAuth());

    await emit("INITIAL_SESSION", { user: { id: "user-1" } });

    expect(result.current).toEqual({ kind: "ready", userId: "user-1" });
  });

  it("검증에 실패한 INITIAL_SESSION은 저장된 세션을 지우고 signedOut이 된다", async () => {
    mockAuth.getClaims.mockResolvedValue({
      data: null,
      error: { message: "invalid token" },
    });
    const { result } = await renderHook(() => useAuth());

    await emit("INITIAL_SESSION", { user: { id: "user-1" } });
    await flushTimers();

    expect(result.current).toEqual({ kind: "signedOut" });
    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it("getClaims가 던져도 loading에 갇히지 않는다", async () => {
    mockAuth.getClaims.mockRejectedValue(new Error("Network request failed"));
    const { result } = await renderHook(() => useAuth());

    await emit("INITIAL_SESSION", { user: { id: "user-1" } });

    expect(result.current).toEqual({ kind: "signedOut" });
  });

  it("익명 세션은 JWT가 유효해도 로그인으로 치지 않는다", async () => {
    mockAuth.getClaims.mockResolvedValue({
      data: { claims: { is_anonymous: true, sub: "anon-1" } },
      error: null,
    });
    const { result } = await renderHook(() => useAuth());

    await emit("INITIAL_SESSION", { user: { id: "anon-1" } });
    await flushTimers();

    expect(result.current).toEqual({ kind: "signedOut" });
    // 지우지 않으면 다음 실행에서 그대로 되살아난다.
    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it("갱신으로 들어온 익명 세션도 거부한다", async () => {
    const { result } = await renderHook(() => useAuth());

    await emit("TOKEN_REFRESHED", {
      user: { id: "anon-1", is_anonymous: true },
    });
    await flushTimers();

    expect(result.current).toEqual({ kind: "signedOut" });
    expect(mockAuth.signOut).toHaveBeenCalled();
  });

  it("TOKEN_REFRESHED는 검증 없이 ready를 유지한다", async () => {
    const { result } = await renderHook(() => useAuth());

    await emit("TOKEN_REFRESHED", { user: { id: "user-1" } });

    expect(result.current).toEqual({ kind: "ready", userId: "user-1" });
    expect(mockAuth.getClaims).not.toHaveBeenCalled();
  });

  it("SIGNED_OUT은 signedOut으로 떨어지며 캐시를 비운다", async () => {
    const { result } = await renderHook(() => useAuth());

    await emit("SIGNED_IN", { user: { id: "user-1" } });
    await emit("SIGNED_OUT", null);

    expect(result.current).toEqual({ kind: "signedOut" });
    // 비우지 않으면 다음 사용자가 이전 사용자의 행을 그대로 본다.
    expect(mockClear).toHaveBeenCalled();
  });

  it("언마운트하면 구독을 해제한다", async () => {
    const { unmount } = await renderHook(() => useAuth());

    await unmount();

    expect(unsubscribe).toHaveBeenCalled();
  });
});
