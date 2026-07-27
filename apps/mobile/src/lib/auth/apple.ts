import {
  type AppleAuthenticationCredential,
  AppleAuthenticationScope,
  signInAsync,
} from "expo-apple-authentication";
import { supabase } from "../supabase";
import { rememberProviderName } from "./name-candidate";

// credential의 authorizationCode는 쓰지 않는다. Apple 승인 취소를 하지 않기로
// 했기 때문이다 — docs/decisions/no-apple-token-revocation.md.

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

  // Apple은 fullName을 최초 로그인 1회만 준다 — 지금 놓치면 영영 못 받는다.
  const fullName = [
    credential.fullName?.givenName,
    credential.fullName?.familyName,
  ]
    .filter(Boolean)
    .join(" ");

  // **로그인 전에 기억한다.** signInWithIdToken이 SIGNED_IN을 쏘는 순간
  // 온보딩이 마운트돼 이름 후보를 읽는데, 아래 updateUser는 별도 왕복이라
  // 늦으면 진다. 값은 이미 기기에 있으니 서버를 거쳐 되받을 이유가 없다.
  if (fullName) {
    rememberProviderName(fullName);
  }

  const { error } = await supabase.auth.signInWithIdToken({
    provider: "apple",
    token: credential.identityToken,
  });

  if (error) {
    return { error: error.message };
  }

  // 다음 실행·다른 기기에서는 세션 메타데이터가 유일한 출처다.
  if (fullName) {
    await supabase.auth.updateUser({ data: { full_name: fullName } });
  }

  return null;
}
