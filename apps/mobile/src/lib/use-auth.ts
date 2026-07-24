import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (!supabaseConfigured) {
      setState({
        kind: "failed",
        reason:
          "Supabase 환경변수 없음 — apps/mobile/.env.local에 EXPO_PUBLIC_SUPABASE_*를 설정하라.",
      });
      return;
    }

    // 구독 직후 INITIAL_SESSION이 한 번 오고, 이후 로그인·토큰 갱신·로그아웃마다
    // 다시 온다. 그래서 이 리스너 하나가 전체 상태를 몰고 간다.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // INITIAL_SESSION만 저장소에서 복원된 것이라 검증이 필요하다. 나머지 이벤트의
        // 세션은 방금 Auth 서버가 발급한 것이라 그대로 믿는다 — RN에서는 getClaims가
        // getUser()로 폴백해 네트워크를 타므로, 매 갱신마다 왕복하지 않도록.
        if (event !== "INITIAL_SESSION") {
          setState({ kind: "ready", userId: session.user.id });
          return;
        }

        verifiedUserId().then((userId) => {
          setState(
            userId
              ? { kind: "ready", userId }
              : { kind: "failed", reason: "세션을 검증하지 못했다" }
          );
        });
        return;
      }

      if (event === "INITIAL_SESSION") {
        // 저장된 세션이 없다 → 익명 로그인. 성공하면 SIGNED_IN으로 여기 다시 들어온다.
        supabase.auth.signInAnonymously().then(({ error }) => {
          if (error) {
            setState({ kind: "failed", reason: error.message });
          }
        });
        return;
      }

      setState({ kind: "failed", reason: "세션이 만료됐다" });
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}
