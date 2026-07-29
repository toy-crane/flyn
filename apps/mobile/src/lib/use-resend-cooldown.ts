import { useCallback, useEffect, useState } from "react";
import { AppState } from "react-native";

/** 앱이 보장하는 OTP 재발송 간격. 서버가 더 길게 알려주면 그 값으로 덮는다. */
export const DEFAULT_COOLDOWN_SECONDS = 30;

const TICK_MS = 1000;

function secondsUntil(deadline: number): number {
  return Math.max(0, Math.ceil((deadline - Date.now()) / TICK_MS));
}

export interface ResendCooldown {
  canResend: boolean;
  /** 남은 초. 0이면 다시 보낼 수 있다. */
  remaining: number;
  /** 재발송 직후 호출한다. 서버가 알려준 초가 있으면 그 값으로. */
  restart: (seconds?: number) => void;
}

/**
 * 코드 화면에 도착한 시점이 곧 발송 직후이므로 쿨다운은 처음부터 돌고 있다.
 *
 * 남은 시간을 카운터로 세지 않고 **마감 시각에서 역산한다** — setInterval은 앱이
 * 백그라운드로 가면 멈추므로, 돌아왔을 때 카운터 방식은 실제보다 길게 남았다고
 * 우긴다.
 */
export function useResendCooldown(
  initialSeconds: number = DEFAULT_COOLDOWN_SECONDS
): ResendCooldown {
  const [deadline, setDeadline] = useState(
    () => Date.now() + initialSeconds * TICK_MS
  );
  const [remaining, setRemaining] = useState(() => secondsUntil(deadline));

  useEffect(() => {
    setRemaining(secondsUntil(deadline));

    if (deadline <= Date.now()) {
      return;
    }

    const id = setInterval(() => {
      const next = secondsUntil(deadline);
      setRemaining(next);

      if (next === 0) {
        clearInterval(id);
      }
    }, TICK_MS);

    return () => clearInterval(id);
  }, [deadline]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (state) => {
      if (state === "active") {
        setRemaining(secondsUntil(deadline));
      }
    });

    return () => subscription?.remove();
  }, [deadline]);

  const restart = useCallback((seconds: number = DEFAULT_COOLDOWN_SECONDS) => {
    setDeadline(Date.now() + seconds * TICK_MS);
  }, []);

  return { canResend: remaining === 0, remaining, restart };
}
