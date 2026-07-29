import { act, renderHook } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";
import {
  DEFAULT_COOLDOWN_SECONDS,
  useResendCooldown,
} from "./use-resend-cooldown";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});

/** 틱과 그로 인한 상태 전이를 act 안에서 정리한다. */
function advance(seconds: number) {
  return act(async () => {
    jest.advanceTimersByTime(seconds * 1000);
    await Promise.resolve();
  });
}

describe("useResendCooldown", () => {
  it("기본 cooldown은 30초다", async () => {
    const { result } = await renderHook(() => useResendCooldown());

    expect(DEFAULT_COOLDOWN_SECONDS).toBe(30);
    expect(result.current.remaining).toBe(30);
  });

  it("도착하자마자 쿨다운이 돌고 있다", async () => {
    const { result } = await renderHook(() => useResendCooldown(60));

    expect(result.current.remaining).toBe(60);
    expect(result.current.canResend).toBe(false);
  });

  it("시간이 지나면 남은 초가 줄고 끝나면 열린다", async () => {
    const { result } = await renderHook(() => useResendCooldown(3));

    await advance(1);
    expect(result.current.remaining).toBe(2);

    await advance(2);
    expect(result.current.remaining).toBe(0);
    expect(result.current.canResend).toBe(true);
  });

  it("restart가 다시 잠근다", async () => {
    const { result } = await renderHook(() => useResendCooldown(1));

    await advance(1);
    expect(result.current.canResend).toBe(true);

    await act(async () => {
      result.current.restart(30);
      await Promise.resolve();
    });

    expect(result.current.remaining).toBe(30);
    expect(result.current.canResend).toBe(false);
  });

  it("백그라운드로 틱이 멈춰도 남은 시간을 실제 경과로 계산한다", async () => {
    let onAppStateChange: ((state: AppStateStatus) => void) | undefined;
    jest
      .spyOn(AppState, "addEventListener")
      .mockImplementation((_type, listener) => {
        onAppStateChange = listener;
        return { remove: jest.fn() };
      });

    const { result } = await renderHook(() => useResendCooldown(60));

    // interval은 돌리지 않은 채 실제 시계만 이동시켜 background 정지를 재현한다.
    await act(async () => {
      jest.setSystemTime(Date.now() + 61_000);
      onAppStateChange?.("active");
      await Promise.resolve();
    });

    expect(result.current.remaining).toBe(0);
    expect(result.current.canResend).toBe(true);
  });
});
