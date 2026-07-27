import { useEffect, useState } from "react";
import { forgetProviderName } from "./auth/name-candidate";
import { queryClient } from "./query-client";
import { supabase, supabaseConfigured } from "./supabase";

type AuthState =
  | { kind: "loading" }
  | { kind: "ready"; userId: string }
  | { kind: "signedOut" }
  | { kind: "failed"; reason: string };

type Verification = { kind: "ok"; userId: string } | { kind: "rejected" };

const REJECTED: Verification = { kind: "rejected" };

// getSession과 달리 서명·만료를 검증한다. WebCrypto가 없는 RN에서는 getUser()로 폴백한다.
// 던지는 경우(네트워크 실패 등)까지 삼켜야 한다 — 여기서 새면 상태가 loading에 갇힌다.
async function verify(): Promise<Verification> {
  try {
    const { data, error } = await supabase.auth.getClaims();

    if (error || !data) {
      return REJECTED;
    }

    // 02의 익명 세션이 저장소에 남아 있을 수 있다. JWT는 유효하므로 서명 검증만으로는
    // 걸러지지 않는다 — 로그인으로 인정하지 않는다.
    if (data.claims.is_anonymous === true) {
      return REJECTED;
    }

    const { sub } = data.claims;

    return typeof sub === "string" ? { kind: "ok", userId: sub } : REJECTED;
  } catch {
    return REJECTED;
  }
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

    // 검증은 네트워크 왕복이라, 그 사이 도착한 이벤트를 늦게 덮어쓰지 않도록 막는다.
    let cancelled = false;

    // 캐시는 사용자 단위로 나뉘어 있지 않다. 비우지 않으면 다음 사용자가 이전 사용자의
    // 행을 그대로 본다(RLS는 서버 경계라 클라이언트 캐시를 막지 못한다).
    const signOutState = () => {
      queryClient.clear();
      // 기기에 기억해 둔 provider 이름도 함께 버린다 — 안 그러면 다음 사용자의
      // 온보딩에 앞 사용자의 이름이 미리 채워진다.
      forgetProviderName();
      setState({ kind: "signedOut" });
    };

    // 콜백 안에서 auth 메서드를 직접 부르면 내부 락과 엉킨다 — 다음 틱으로 미룬다.
    const discardStoredSession = () => {
      setTimeout(() => {
        supabase.auth.signOut().catch(() => {
          // 이미 로그아웃 상태로 그릴 참이라 실패해도 더 할 일이 없다.
        });
      }, 0);
    };

    // 구독 직후 INITIAL_SESSION이 한 번 오고 이후 로그인·갱신·로그아웃마다 다시 온다.
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        signOutState();
        return;
      }

      // 저장소에서 복원된 INITIAL_SESSION만 검증이 필요하다. 나머지는 방금 발급된
      // 세션이라, 갱신마다 폴백 왕복을 치르지 않는다.
      if (event !== "INITIAL_SESSION") {
        if (session.user.is_anonymous) {
          discardStoredSession();
          signOutState();
          return;
        }

        setState({ kind: "ready", userId: session.user.id });
        return;
      }

      verify().then((result) => {
        if (cancelled) {
          return;
        }

        if (result.kind === "ok") {
          setState({ kind: "ready", userId: result.userId });
          return;
        }

        // 익명이거나 검증에 실패했다. 지우지 않으면 다음 실행에서 그대로 되살아난다.
        discardStoredSession();
        signOutState();
      });
    });

    return () => {
      cancelled = true;
      data.subscription.unsubscribe();
    };
  }, []);

  return state;
}
