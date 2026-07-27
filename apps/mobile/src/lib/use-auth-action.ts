import { useCallback, useRef, useState } from "react";
import {
  type AuthErrorInfo,
  describeAuthError,
  reportAuthFailure,
} from "./auth/errors";

/**
 * 재진입으로 무시된 호출을 성공(null)과 구분한다 — 둘 다 falsy면 UI가 앞으로
 * 나가버린다(코드를 보내지도 않고 코드 입력 화면으로 넘어가는 식으로).
 */
export const IGNORED = Symbol("ignored");

export type AuthActionResult = { error: string } | null | typeof IGNORED;

export interface AuthAction {
  clearFailure: () => void;
  /** 실패했을 때 보여줄 것. 성공이나 취소면 null. 원문은 여기 없다. */
  failure: AuthErrorInfo | null;
  /** 표시용. 중복 제출 차단은 ref가 따로 맡는다. */
  pending: boolean;
  run: (
    action: () => Promise<{ error: string } | null>,
    context: string
  ) => Promise<AuthActionResult>;
}

export function useAuthAction(): AuthAction {
  const [failure, setFailure] = useState<AuthErrorInfo | null>(null);
  // 렌더에 쓰이는 게 아니라 중복 제출만 막는다. 표시용은 pending이 담당한다.
  const busy = useRef(false);
  const [pending, setPending] = useState(false);

  const clearFailure = useCallback(() => {
    setFailure(null);
  }, []);

  const run = useCallback(
    async (
      action: () => Promise<{ error: string } | null>,
      context: string
    ): Promise<AuthActionResult> => {
      if (busy.current) {
        return IGNORED;
      }

      busy.current = true;
      setPending(true);
      setFailure(null);

      try {
        const result = await action();

        if (result) {
          reportAuthFailure(context, result.error);
          setFailure(describeAuthError(result.error));
        }

        return result;
      } catch (e) {
        // 헬퍼가 던지면 여기서 잡는다. finally가 없으면 busy가 영구히 잠겨 화면이 죽는다.
        const message = e instanceof Error ? e.message : String(e);
        reportAuthFailure(context, message);
        setFailure(describeAuthError(message));
        return { error: message };
      } finally {
        busy.current = false;
        setPending(false);
      }
    },
    []
  );

  return { clearFailure, failure, pending, run };
}
