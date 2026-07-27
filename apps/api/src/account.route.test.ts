import { afterAll, beforeAll, describe, expect, it, spyOn } from "bun:test";
import { exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";

// 서버 기동 없는 계정 삭제 테스트. JWT는 jose로 직접 서명해 인라인 JWKS로
// 오프라인 검증하고, admin 삭제가 치는 Auth 엔드포인트만 fetch로 가로챈다.

const SUB = "11111111-1111-1111-1111-111111111111";
const KID = "test-key-1";
const ACCOUNT_PATH = "/account";
const DELETE_USER_URL = `http://127.0.0.1:54321/auth/v1/admin/users/${SUB}`;

let signingKey: CryptoKey;
let app: typeof import("./index")["default"];
let fetchSpy: ReturnType<typeof spyOn>;

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

/** admin 삭제만 가로챈다. 나머지 요청은 이 테스트에서 일어나지 않는다. */
function stubDeleteUser(status: number) {
  fetchSpy.mockImplementation((input: string | URL | Request) => {
    const url = input instanceof Request ? input.url : String(input);

    if (url.startsWith(DELETE_USER_URL)) {
      return Promise.resolve(
        new Response(status === 200 ? "{}" : '{"message":"boom"}', {
          headers: { "content-type": "application/json" },
          status,
        })
      );
    }

    return Promise.resolve(new Response("{}", { status: 200 }));
  });
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

  fetchSpy = spyOn(globalThis, "fetch");

  // env 세팅 후 앱을 로드해야 미들웨어가 값을 읽는다.
  app = (await import("./index")).default;
});

afterAll(() => {
  // bun은 파일 간 프로세스를 공유하므로 전역 fetch 스텁을 복원한다.
  fetchSpy.mockRestore();
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

describe("계정 삭제 엔드포인트", () => {
  it("유효한 토큰이면 자기 사용자를 지운다", async () => {
    stubDeleteUser(200);
    const token = await mintToken();

    const res = await app.request(ACCOUNT_PATH, {
      headers: { Authorization: `Bearer ${token}` },
      method: "DELETE",
    });

    expect(res.status).toBe(200);
    // 토큰의 sub 말고 다른 사용자를 지우면 안 된다.
    const calls = fetchSpy.mock.calls as unknown as [string | URL | Request][];
    const deletedSelf = calls.some(([input]) =>
      String(input instanceof Request ? input.url : input).startsWith(
        DELETE_USER_URL
      )
    );

    expect(deletedSelf).toBe(true);
  });

  // 실패를 성공으로 답하면 앱이 로컬 세션을 비우고 로그인 화면으로 가버려,
  // 사용자는 지워졌다고 믿는데 계정은 그대로 남는다.
  it("삭제 실패를 성공으로 보고하지 않는다", async () => {
    stubDeleteUser(500);
    const token = await mintToken();

    const res = await app.request(ACCOUNT_PATH, {
      headers: { Authorization: `Bearer ${token}` },
      method: "DELETE",
    });

    expect(res.status).toBe(500);
    expect(await res.json()).toMatchObject({ retryable: true });
  });

  /**
   * 첫 요청이 서버에서 성공했는데 응답이 유실되면 앱에는 세션이 남아 사용자가
   * 다시 누른다. 그때 404를 실패로 답하면 **영원히 지울 수 없다** — 앱 안에서
   * 계정을 지울 수 있어야 한다는 요구를 정확히 어긴다.
   */
  it("이미 없는 사용자는 성공으로 답한다 — 재시도가 막히지 않는다", async () => {
    stubDeleteUser(404);
    const token = await mintToken();

    const res = await app.request(ACCOUNT_PATH, {
      headers: { Authorization: `Bearer ${token}` },
      method: "DELETE",
    });

    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ deleted: true });
  });
});
