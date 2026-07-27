import { act, renderHook } from "@testing-library/react-native";
import { useResendCooldown } from "./use-resend-cooldown";

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
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
    // 카운터로 세면 틱이 안 돈 만큼 남았다고 우긴다. 마감 시각 역산이면 정확하다.
    const { result } = await renderHook(() => useResendCooldown(60));

    // 틱은 한 번만 돌지만 실제 시계는 60초를 넘어간다.
    await act(async () => {
      jest.setSystemTime(Date.now() + 61_000);
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(result.current.remaining).toBe(0);
    expect(result.current.canResend).toBe(true);
  });
});
