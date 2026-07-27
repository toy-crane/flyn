import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../supabase";
import { reportAuthFailure } from "./errors";

/**
 * **성공·실패를 돌려주지 않는다. 로그아웃은 실패하지 않기 때문이다.**
 *
 * 원래는 "오프라인이면 로컬 세션이 남고 SIGNED_OUT도 안 온다"는 전제로
 * `{ error }`를 돌려줬는데, 설치된 auth-js에서 사실이 아니다. `_signOut`은
 * 서버 요청이 실패해도 `removeCurrentSession()`을 부른 **뒤에** 오류를
 * 돌려준다(GoTrueClient.js:3377-3380). 즉 오류가 와도 사용자는 이미 로그아웃돼
 * 있고, SIGNED_OUT이 떠서 가드가 로그인 화면으로 보낸다.
 *
 * 그 전제로 만든 얼럿이 거짓말을 했다 — 오프라인에서 로그아웃하면 로그인
 * 화면에 도착한 위로 "로그아웃하지 못했습니다"가 겹쳐 떴다.
 *
 * 서버 쪽 세션 폐기가 안 됐을 수는 있으므로 진단 가치는 남는다. 그건 콘솔로
 * 보낸다.
 */
export async function signOut(): Promise<void> {
  // Google 네이티브 세션도 지워야 다음 로그인에서 계정 선택 시트가 다시 뜬다.
  await GoogleSignin.signOut().catch(() => {
    // Google로 로그인한 적이 없어도 Supabase 로그아웃은 계속한다.
  });

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      reportAuthFailure("sign-out", error.message);
    }
  } catch (e) {
    reportAuthFailure("sign-out", e instanceof Error ? e.message : String(e));
  }
}
