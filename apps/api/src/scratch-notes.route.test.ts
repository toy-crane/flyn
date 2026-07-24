import { afterAll, beforeAll, describe, expect, it, spyOn } from "bun:test";
import { exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";

// 서버 기동 없는 JWT 게이트 테스트: jose ES256 키를 인라인 JWKS(SUPABASE_JWKS)로 넣어
// 오프라인 검증하고, admin .select()의 fetch만 스텁한다(검증은 fetch를 안 탄다).

const SUB = "11111111-1111-1111-1111-111111111111";
const OTHER_OWNER = "22222222-2222-2222-2222-222222222222";
const KID = "test-key-1";
const STATS_PATH = "/server/scratch-notes/stats";
const ROWS = [{ user_id: SUB }, { user_id: SUB }, { user_id: OTHER_OWNER }];

let signingKey: CryptoKey;
let forgedKey: CryptoKey;
let app: typeof import("./index")["default"];
let fetchSpy: ReturnType<typeof spyOn>;

function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

function mintToken(
  key: CryptoKey,
  exp: number = nowSeconds() + 3600
): Promise<string> {
  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "ES256", kid: KID })
    .setSubject(SUB)
    .setIssuer("http://127.0.0.1:54321/auth/v1")
    .setAudience("authenticated")
    .setIssuedAt()
    .setExpirationTime(exp)
    .sign(key);
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

  const forged = await generateKeyPair("ES256", { extractable: true });
  forgedKey = forged.privateKey;

  process.env.SUPABASE_URL = "http://127.0.0.1:54321";
  process.env.SUPABASE_PUBLISHABLE_KEY = "sb_publishable_test";
  process.env.SUPABASE_SECRET_KEY = "sb_secret_test";
  process.env.SUPABASE_JWKS = JSON.stringify({ keys: [publicJwk] });

  fetchSpy = spyOn(globalThis, "fetch").mockResolvedValue(
    new Response(JSON.stringify(ROWS), {
      headers: { "content-type": "application/json" },
      status: 200,
    })
  );

  // env 세팅 후 앱을 로드해야 미들웨어가 값을 읽는다.
  app = (await import("./index")).default;
});

afterAll(() => {
  // bun은 파일 간 프로세스를 공유하므로 전역 fetch 스텁을 복원한다.
  fetchSpy.mockRestore();
});

describe("server-only scratch-notes stats 엔드포인트 (JWT 게이트)", () => {
  it("Authorization 헤더가 없으면 401", async () => {
    const res = await app.request(STATS_PATH);
    expect(res.status).toBe(401);
  });

  it("형식이 깨진 Bearer 토큰은 401", async () => {
    const res = await app.request(STATS_PATH, {
      headers: { Authorization: "Bearer not.a.jwt" },
    });
    expect(res.status).toBe(401);
  });

  it("다른 키로 서명된(위조) 토큰은 401", async () => {
    const token = await mintToken(forgedKey);
    const res = await app.request(STATS_PATH, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it("만료된 토큰은 401", async () => {
    const token = await mintToken(signingKey, nowSeconds() - 60);
    const res = await app.request(STATS_PATH, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(401);
  });

  it("유효한 토큰은 통과하고 admin 집계를 돌려준다", async () => {
    const token = await mintToken(signingKey);
    const res = await app.request(STATS_PATH, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      you: string | null;
      totalNotes: number;
      distinctOwners: number;
    };
    expect(body.you).toBe(SUB);
    expect(body.totalNotes).toBe(ROWS.length);
    expect(body.distinctOwners).toBe(2);
  });
});
