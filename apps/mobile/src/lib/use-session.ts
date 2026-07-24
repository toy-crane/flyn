import type { Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./supabase";

// 익명 로그인 세션 부트스트랩. 마운트 시 기존 세션이 없으면 익명 로그인한다.
// 네이티브 로그인(Apple/Google)은 Task 03에서 이 훅을 교체/확장한다.
type SessionState =
  | { kind: "loading" }
  | { kind: "ready"; session: Session }
  | { kind: "failed"; reason: string };

export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ kind: "loading" });

  useEffect(() => {
    if (!supabaseConfigured) {
      setState({
        kind: "failed",
        reason:
          "Supabase 환경변수 없음 — apps/mobile/.env.local에 EXPO_PUBLIC_SUPABASE_*를 설정하라.",
      });
      return;
    }

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

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) {
        return;
      }
      if (session) {
        setState({ kind: "ready", session });
      } else if (event === "SIGNED_OUT") {
        // 초기 null(INITIAL_SESSION)은 무시한다(부트스트랩이 익명 로그인). SIGNED_OUT은
        // 세션 소실이므로 실패로 표시해 정지된 ready 상태를 막는다.
        setState({ kind: "failed", reason: "세션이 만료됐다" });
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
