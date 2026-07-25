import { useEffect, useState } from "react";
import { supabase, supabaseConfigured } from "./supabase";

type AuthState =
  | { kind: "loading" }
  | { kind: "ready"; userId: string }
  | { kind: "signedOut" }
  | { kind: "failed"; reason: string };

// getSession과 달리 서명·만료를 검증한다. WebCrypto가 없는 RN에서는 getUser()로 폴백한다.
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

    // 구독 직후 INITIAL_SESSION이 한 번 오고 이후 로그인·갱신·로그아웃마다 다시 온다.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        // 저장소에서 복원된 INITIAL_SESSION만 검증이 필요하다. 나머지는 방금 발급된
        // 세션이라, 갱신마다 폴백 왕복을 치르지 않는다.
        if (event !== "INITIAL_SESSION") {
          setState({ kind: "ready", userId: session.user.id });
          return;
        }

        // 검증 실패는 만료된 세션으로 보고 로그인 화면으로 보낸다.
        verifiedUserId().then((userId) => {
          setState(userId ? { kind: "ready", userId } : { kind: "signedOut" });
        });
        return;
      }

      // 세션 없음 — 미로그인·로그아웃·만료 모두 로그인 화면으로 떨어뜨린다.
      setState({ kind: "signedOut" });
    });

    return () => data.subscription.unsubscribe();
  }, []);

  return state;
}
