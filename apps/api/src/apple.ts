import { importPKCS8, SignJWT } from "jose";

/**
 * Apple의 token endpoint를 다루는 자리. **여기서 나온 token은 어디에도 새지
 * 않는다** — 반환 타입에도, 오류 문자열에도, 로그에도 담지 않는다
 * (docs/decisions/store-apple-revocation-token.md).
 */

const TOKEN_URL = "https://appleid.apple.com/auth/token";
const REVOKE_URL = "https://appleid.apple.com/auth/revoke";
// client secret JWT의 aud는 Apple이 고정한 값이다.
const AUDIENCE = "https://appleid.apple.com";
// Apple은 최대 6개월을 허용하지만 요청 하나를 넘길 이유가 없다.
const SECRET_TTL_SECONDS = 300;

export interface AppleConfig {
  /** 앱 번들 ID. Supabase의 [auth.external.apple].client_id와 같다. */
  clientId: string;
  /** .p8 키의 Key ID. */
  keyId: string;
  /** .p8 파일 내용(PKCS#8 PEM). */
  privateKey: string;
  /** Apple Developer Team ID. */
  teamId: string;
}

/**
 * 넷 중 하나라도 없으면 null이다. 부분 설정으로 돌다가 삭제 시점에 실패하는
 * 것보다, 설정되지 않았다는 사실이 처음부터 드러나는 편이 낫다.
 */
export function readAppleConfig(): AppleConfig | null {
  const clientId = process.env.APPLE_CLIENT_ID;
  const keyId = process.env.APPLE_KEY_ID;
  const teamId = process.env.APPLE_TEAM_ID;
  // 환경변수 한 줄에 담기려고 개행이 \n으로 이스케이프돼 오는 것이 보통이다.
  const privateKey = process.env.APPLE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!(clientId && keyId && teamId && privateKey)) {
    return null;
  }

  return { clientId, keyId, privateKey, teamId };
}

/** Apple이 요구하는 ES256 client secret. 요청마다 새로 만든다. */
async function clientSecret(config: AppleConfig): Promise<string> {
  const key = await importPKCS8(config.privateKey, "ES256");

  return await new SignJWT({})
    .setProtectedHeader({ alg: "ES256", kid: config.keyId })
    .setIssuer(config.teamId)
    .setSubject(config.clientId)
    .setAudience(AUDIENCE)
    .setIssuedAt()
    .setExpirationTime(`${SECRET_TTL_SECONDS}s`)
    .sign(key);
}

function form(fields: Record<string, string>): RequestInit {
  return {
    body: new URLSearchParams(fields).toString(),
    headers: { "content-type": "application/x-www-form-urlencoded" },
    method: "POST",
  };
}

export interface AppleGateway {
  /** 성공하면 refresh token, 실패하면 null. token은 호출자를 넘어가지 않는다. */
  exchange: (authorizationCode: string) => Promise<string | null>;
  /** 취소에 성공하면 true. 실패를 삼키지 않는다 — §5가 삭제를 중단시킨다. */
  revoke: (refreshToken: string) => Promise<boolean>;
}

export function createAppleGateway(config: AppleConfig): AppleGateway {
  return {
    async exchange(authorizationCode) {
      const secret = await clientSecret(config);
      const response = await fetch(
        TOKEN_URL,
        form({
          client_id: config.clientId,
          client_secret: secret,
          code: authorizationCode,
          grant_type: "authorization_code",
        })
      );

      if (!response.ok) {
        return null;
      }

      const body = (await response.json()) as { refresh_token?: unknown };

      return typeof body.refresh_token === "string" ? body.refresh_token : null;
    },

    async revoke(refreshToken) {
      const secret = await clientSecret(config);
      const response = await fetch(
        REVOKE_URL,
        form({
          client_id: config.clientId,
          client_secret: secret,
          token: refreshToken,
          token_type_hint: "refresh_token",
        })
      );

      return response.ok;
    },
  };
}
