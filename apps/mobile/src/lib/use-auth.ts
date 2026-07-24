import { useCallback, useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./supabase";

// 네이티브 로그인(Apple/Google)은 Task 03에서 이 훅을 교체한다.
type AuthState =
  | { kind: "loading" }
  | { kind: "ready"; userId: string }
  | { kind: "failed"; reason: string };

// getClaims는 저장소를 그대로 믿지 않고 서명과 만료를 검증한다(getSession은 안 한다).
// WebCrypto가 없는 RN에서는 supabase-js가 getUser()로 폴백해 정확성은 유지된다.
async function verifiedUserId(): Promise<string | null> {
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    return null;
  }

  const { sub } = data.claims;

  return typeof sub === "string" ? sub : null;
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ kind: "loading" });

  const settle = useCallback((userId: string | null) => {
    setState(
      userId
        ? { kind: "ready", userId }
        : { kind: "failed", reason: "세션을 검증하지 못했다" }
    );
  }, []);

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
      let userId = await verifiedUserId();

      if (!userId) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          throw error;
        }
        userId = await verifiedUserId();
      }

      if (!cancelled) {
        settle(userId);
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
        // 토큰이 갱신됐으므로 새 토큰으로 다시 검증한다.
        verifiedUserId().then((userId) => {
          if (!cancelled) {
            settle(userId);
          }
        });
      } else if (event === "SIGNED_OUT") {
        // 초기 null은 무시(부트스트랩이 로그인). SIGNED_OUT만 실패로 — 정지된 ready 방지.
        setState({ kind: "failed", reason: "세션이 만료됐다" });
      }
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, [settle]);

  return state;
}
