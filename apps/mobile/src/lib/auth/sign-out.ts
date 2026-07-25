import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../supabase";

// 다른 auth 헬퍼와 같은 규약: 성공은 null, 실패만 { error }.
export async function signOut(): Promise<{ error: string } | null> {
  // Google 네이티브 세션도 지워야 다음 로그인에서 계정 선택 시트가 다시 뜬다.
  await GoogleSignin.signOut().catch(() => {
    // Google로 로그인한 적이 없어도 Supabase 로그아웃은 계속한다.
  });

  try {
    // 오프라인 등으로 실패하면 로컬 세션이 남고 SIGNED_OUT도 안 온다 — 삼키면
    // 버튼이 죽은 것처럼 보이므로 호출자가 알 수 있게 돌려준다.
    const { error } = await supabase.auth.signOut();

    return error ? { error: error.message } : null;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
