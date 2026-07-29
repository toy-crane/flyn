import { act, renderHook } from "@testing-library/react-native";

jest.mock("./auth/errors", () => ({
  ...jest.requireActual("./auth/errors"),
  reportAuthFailure: jest.fn(),
}));

import { reportAuthFailure } from "./auth/errors";
import { IGNORED, useAuthAction } from "./use-auth-action";

const mockReport = reportAuthFailure as jest.Mock;

const ok = () => Promise.resolve(null);
const fails = (error: string) => () => Promise.resolve({ error });
const throws = (message: string) => () => Promise.reject(new Error(message));

beforeEach(() => {
  jest.resetAllMocks();
});

describe("useAuthAction", () => {
  it("성공은 null, 재진입은 IGNORED — 둘을 구분한다", async () => {
    const { result } = await renderHook(() => useAuthAction());

    let release: (() => void) | undefined;
    const slow = () =>
      new Promise<null>((resolve) => {
        release = () => resolve(null);
      });

    let first: unknown;
    let second: unknown;

    await act(async () => {
      const a = result.current.run(slow, "test");
      const b = result.current.run(slow, "test");
      release?.();
      first = await a;
      second = await b;
    });

    expect(first).toBeNull();
    expect(second).toBe(IGNORED);
  });

  it("헬퍼가 던져도 화면이 잠기지 않는다", async () => {
    const { result } = await renderHook(() => useAuthAction());

    await act(async () => {
      await result.current.run(throws("first"), "test");
    });
    expect(result.current.failure).not.toBeNull();

    // busy가 풀리지 않으면 이후 모든 호출이 조용히 죽는다.
    let second: unknown;
    await act(async () => {
      second = await result.current.run(ok, "test");
    });

    expect(second).toBeNull();
    expect(result.current.failure).toBeNull();
  });

  it("원문은 콘솔로 보내고 화면에는 사람이 읽을 문장만 남긴다", async () => {
    const { result } = await renderHook(() => useAuthAction());

    await act(async () => {
      await result.current.run(fails("Network request failed"), "apple");
    });

    expect(mockReport).toHaveBeenCalledWith("apple", "Network request failed");
    expect(result.current.failure?.kind).toBe("network");
    expect(result.current.failure?.message).not.toContain("Network request");
  });

  it("다시 시도하면 이전 실패를 먼저 지운다", async () => {
    const { result } = await renderHook(() => useAuthAction());

    await act(async () => {
      await result.current.run(fails("boom"), "test");
    });
    expect(result.current.failure).not.toBeNull();

    await act(async () => {
      await result.current.run(ok, "test");
    });
    expect(result.current.failure).toBeNull();
  });

  // pending은 표시용이고 중복 제출을 막는 것은 busy ref다. 한 act 스코프 안에서는
  // 중간 렌더가 커밋되지 않아 비행 중 pending을 관찰할 수 없으므로, 여기서는
  // 끝난 뒤 꺼져 있는지만 본다 — 가드 자체는 첫 테스트(IGNORED)가 잡는다.
  it("작업이 끝나면 pending이 꺼진다", async () => {
    const { result } = await renderHook(() => useAuthAction());

    await act(async () => {
      await result.current.run(fails("boom"), "test");
    });

    expect(result.current.pending).toBe(false);
    expect(result.current.pendingContext).toBeNull();
  });

  it("진행 중인 action의 context를 노출한다", async () => {
    const { result } = await renderHook(() => useAuthAction());
    let release: (() => void) | undefined;
    const slow = () =>
      new Promise<null>((resolve) => {
        release = () => resolve(null);
      });

    let request = Promise.resolve<unknown>(undefined);
    await act(async () => {
      request = result.current.run(slow, "apple");
      await Promise.resolve();
    });

    expect(result.current.pending).toBe(true);
    expect(result.current.pendingContext).toBe("apple");

    await act(async () => {
      release?.();
      await request;
    });

    expect(result.current.pendingContext).toBeNull();
  });
});
