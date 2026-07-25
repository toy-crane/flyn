import { act, renderHook } from "@testing-library/react-native";

jest.mock("./supabase", () => ({
  supabase: {
    auth: {
      getClaims: jest.fn(),
      onAuthStateChange: jest.fn(),
    },
  },
  supabaseConfigured: true,
}));

import { supabase } from "./supabase";
import { useAuth } from "./use-auth";

const mockAuth = supabase.auth as unknown as {
  getClaims: jest.Mock;
  onAuthStateChange: jest.Mock;
};

interface Session {
  user: { id: string };
}
type Listener = (event: string, session: Session | null) => void;

let listener: Listener;

/** 리스너 호출과 그로 인한 비동기 상태 전이를 act 안에서 정리한다. */
function emit(event: string, session: Session | null) {
  return act(async () => {
    listener(event, session);
    await Promise.resolve();
  });
}

beforeEach(() => {
  jest.clearAllMocks();
  mockAuth.onAuthStateChange.mockImplementation((cb: Listener) => {
    listener = cb;
    return { data: { subscription: { unsubscribe: jest.fn() } } };
  });
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

  it("검증에 실패한 INITIAL_SESSION은 signedOut으로 떨어진다", async () => {
    mockAuth.getClaims.mockResolvedValue({
      data: null,
      error: { message: "invalid token" },
    });
    const { result } = await renderHook(() => useAuth());

    await emit("INITIAL_SESSION", { user: { id: "user-1" } });

    expect(result.current).toEqual({ kind: "signedOut" });
  });

  it("SIGNED_OUT은 signedOut으로 떨어진다", async () => {
    const { result } = await renderHook(() => useAuth());

    await emit("SIGNED_IN", { user: { id: "user-1" } });
    await emit("SIGNED_OUT", null);

    expect(result.current).toEqual({ kind: "signedOut" });
  });
});
