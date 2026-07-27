import {
  type AppleAuthenticationCredential,
  AppleAuthenticationScope,
  signInAsync,
} from "expo-apple-authentication";
import { rpc } from "../rpc";
import { supabase } from "../supabase";
import { reportAuthFailure } from "./errors";

/**
 * authorization code를 서버로 보내 refresh token으로 바꿔 보관하게 한다(§6).
 * 계정 삭제 때 Apple 승인을 취소할 유일한 수단이다.
 *
 * **실패해도 로그인을 되돌리지 않는다.** 세션은 이미 발급됐고, 여기서 실패를
 * 이유로 로그인을 깨면 사용자는 들어갈 방법이 없어진다. 대신 code는 Apple
 * 로그인마다 새로 오므로 다음 로그인에서 저절로 복구된다 — 그때까지는 계정
 * 삭제가 중단되고, 그 중단은 조용하지 않다(§5).
 */
async function storeRevocationToken(authorizationCode: string): Promise<void> {
  try {
    const response = await rpc.apple.credentials.$post({
      json: { authorizationCode },
    });

    if (!response.ok) {
      reportAuthFailure("apple:store-token", `HTTP ${response.status}`);
    }
  } catch (e) {
    reportAuthFailure(
      "apple:store-token",
      e instanceof Error ? e.message : String(e)
    );
  }
}

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

  // 세션이 선 뒤에 보낸다 — 이 요청은 인증 게이트를 지나야 한다.
  if (credential.authorizationCode) {
    await storeRevocationToken(credential.authorizationCode);
  }

  return null;
}
