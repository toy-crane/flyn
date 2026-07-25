import {
  type AppleAuthenticationCredential,
  AppleAuthenticationScope,
  signInAsync,
} from "expo-apple-authentication";
import { supabase } from "../supabase";

// 성공·취소는 null, 실패만 { error }를 돌려준다 — 취소에 에러 UI를 띄우지 않기 위한 구분.
export async function signInWithApple(): Promise<{ error: string } | null> {
  let credential: AppleAuthenticationCredential;

  try {
    credential = await signInAsync({
      requestedScopes: [
        AppleAuthenticationScope.FULL_NAME,
        AppleAuthenticationScope.EMAIL,
      ],
    });
  } catch (e) {
    if ((e as { code?: string }).code === "ERR_REQUEST_CANCELED") {
      return null;
    }
    return { error: e instanceof Error ? e.message : String(e) };
  }

  if (!credential.identityToken) {
    return { error: "Apple이 identity token을 주지 않았다" };
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
  });

  if (error) {
    return { error: error.message };
  }

  // Apple은 fullName을 최초 로그인 1회만 준다 — 지금 보관하지 않으면 유실된다.
  const fullName = [
    credential.fullName?.givenName,
    credential.fullName?.familyName,
  ]
    .filter(Boolean)
    .join(" ");

  if (fullName) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  return null;
}
