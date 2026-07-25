import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../supabase";

export async function signOut(): Promise<void> {
  // Google 네이티브 세션도 지워야 다음 로그인에서 계정 선택 시트가 다시 뜬다.
  await GoogleSignin.signOut().catch(() => {
    // Google로 로그인한 적이 없어도 Supabase 로그아웃은 계속한다.
  });
  await supabase.auth.signOut();
}
