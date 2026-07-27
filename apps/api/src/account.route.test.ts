import { beforeAll, describe, expect, it } from "bun:test";
import { exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";

// 게이트와 입력 검증만 본다. 삭제 순서는 account.test.ts가 따로 증명한다.

const SUB = "11111111-1111-1111-1111-111111111111";
const KID = "test-key-1";
const ACCOUNT_PATH = "/account";
const APPLE_PATH = "/apple/credentials";

let signingKey: CryptoKey;
let app: typeof import("./index")["default"];

function mintToken(): Promise<string> {
  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "ES256", kid: KID })
    .setSubject(SUB)
    .setIssuer("http://127.0.0.1:54321/auth/v1")
    .setAudience("authenticated")
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
    .sign(signingKey);
}

beforeAll(async () => {
  const keyPair = await generateKeyPair("ES256", { extractable: true });
  signingKey = keyPair.privateKey;
  const publicJwk: JWK = {
    ...(await exportJWK(keyPair.publicKey)),
    alg: "ES256",
    kid: KID,
    use: "sig",
  };

  process.env.SUPABASE_URL = "http://127.0.0.1:54321";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
  process.env.SUPABASE_JWKS = JSON.stringify({ keys: [publicJwk] });

  // Apple 자격증명이 없는 상태를 일부러 만든다 — 이 저장소에 실제 키가 없고,
  // "설정되지 않았을 때 조용히 지나가지 않는다"가 검증할 값이다.
  process.env.APPLE_CLIENT_ID = undefined;
  process.env.APPLE_KEY_ID = undefined;
  process.env.APPLE_TEAM_ID = undefined;
  process.env.APPLE_PRIVATE_KEY = undefined;

  app = (await import("./index")).default;
});

describe("계정 삭제 엔드포인트 (JWT 게이트)", () => {
  it("Authorization 헤더가 없으면 401", async () => {
    const res = await app.request(ACCOUNT_PATH, { method: "DELETE" });

    expect(res.status).toBe(401);
  });

  it("형식이 깨진 Bearer 토큰은 401", async () => {
    const res = await app.request(ACCOUNT_PATH, {
      headers: { Authorization: "Bearer not.a.jwt" },
      method: "DELETE",
    });

    expect(res.status).toBe(401);
  });
});

describe("Apple 자격증명 엔드포인트", () => {
  it("Authorization 헤더가 없으면 401", async () => {
    const res = await app.request(APPLE_PATH, {
      body: JSON.stringify({ authorizationCode: "code" }),
      headers: { "content-type": "application/json" },
      method: "POST",
    });

    expect(res.status).toBe(401);
  });

  it("authorizationCode가 없으면 400", async () => {
    const token = await mintToken();
    const res = await app.request(APPLE_PATH, {
      body: JSON.stringify({}),
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(res.status).toBe(400);
  });

  // 설정이 없는데 성공으로 답하면, 앱은 취소 수단이 보관된 줄 알고 넘어간다.
  it("Apple 설정이 없으면 성공으로 답하지 않는다", async () => {
    const token = await mintToken();
    const res = await app.request(APPLE_PATH, {
      body: JSON.stringify({ authorizationCode: "code" }),
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(res.status).toBe(503);
  });

  it("token을 응답에 담지 않는다", async () => {
    const token = await mintToken();
    const res = await app.request(APPLE_PATH, {
      body: JSON.stringify({ authorizationCode: "code" }),
      headers: {
        Authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      method: "POST",
    });

    expect(await res.text()).not.toContain("refresh");
  });
});
