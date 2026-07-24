import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase } from "./supabase";

// 익명 로그인 세션 부트스트랩. 마운트 시 기존 세션이 없으면 익명 로그인한다.
// 네이티브 로그인(Apple/Google)은 Task 03에서 이 훅을 교체/확장한다.
type SessionState =
  | { kind: "loading" }
  | { kind: "ready"; session: Session }
  | { kind: "failed"; reason: string };

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ kind: "loading" });

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const { data: initial } = await supabase.auth.getSession();
      let { session } = initial;

      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        if (error) {
          throw error;
        }
        ({ session } = data);
      }

      if (!session) {
        throw new Error("세션을 얻지 못했다");
      }

      if (!cancelled) {
        setState({ kind: "ready", session });
      }
    }

    bootstrap().catch((error: unknown) => {
      if (!cancelled) {
        setState({
          kind: "failed",
          reason: error instanceof Error ? error.message : "알 수 없는 오류",
        });
      }
    });

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled && session) {
        setState({ kind: "ready", session });
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
