import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { supabase } from "../supabase";

// 클라이언트 ID는 공개값 — 앱 번들 노출이 안전하다. 웹 ID는 Supabase가 aud 검증에 쓴다.
GoogleSignin.configure({
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
});

// 성공·취소는 null, 실패만 { error } — 취소에 에러 UI를 띄우지 않기 위한 구분.
export async function signInWithGoogle(): Promise<{ error: string } | null> {
  try {
    const response = await GoogleSignin.signIn();

    if (response.type === "cancelled") {
      return null;
    }

    const { idToken } = response.data;

    if (!idToken) {
      return { error: "Google이 ID 토큰을 주지 않았다" };
    }

    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });

    return error ? { error: error.message } : null;
  } catch (e) {
    return { error: e instanceof Error ? e.message : String(e) };
  }
}
