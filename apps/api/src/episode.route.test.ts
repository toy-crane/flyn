import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";
import type {
  Episode,
  EpisodeDraft,
  EpisodeModel,
  EpisodeRepository,
  EpisodeRoles,
  EpisodeRoleTarget,
  EpisodeScenario,
} from "./episode";

const USER_ID = "22222222-2222-2222-2222-222222222222";
const KID = "episode-route-test-key";
const SCENARIO: EpisodeScenario = {
  description: "여행 중 들어간 작은 카페예요. 처음 주문해요.",
  title: "포틀랜드 카페에서 첫 주문",
};
const ROLES: EpisodeRoles = {
  partnerRole: "바리스타 Maya",
  userRole: "처음 방문한 여행객",
};

let signingKey: CryptoKey;
let createApiApp: typeof import("./index").createApiApp;
let repository: MemoryEpisodeRepository;
let model: FakeEpisodeModel;
let app: ReturnType<typeof createApiApp>;

class MemoryEpisodeRepository implements EpisodeRepository {
  episodes: Episode[] = [];

  insertEpisode({
    goals,
    roles,
    scenario,
    turnLimit,
  }: Parameters<EpisodeRepository["insertEpisode"]>[0]) {
    const episode: Episode = {
      createdAt: "2026-08-05T00:00:00.000Z",
      goals: goals.map((sentence, index) => ({
        achievedAt: null,
        position: index + 1,
        sentence,
      })),
      id: `episode-${this.episodes.length + 1}`,
      partnerRole: roles.partnerRole,
      scenarioDescription: scenario.description,
      scenarioTitle: scenario.title,
      status: "active",
      turnLimit,
      updatedAt: "2026-08-05T00:00:00.000Z",
      userRole: roles.userRole,
    };

    this.episodes.push(episode);

    return Promise.resolve(episode);
  }
}

class FakeEpisodeModel implements EpisodeModel {
  draftCount = 0;
  goalsCount = 0;
  roleCount = 0;
  scenarioCount = 0;
  lastExcluded: string[] = [];
  lastRoleTarget: EpisodeRoleTarget | null = null;
  failure: Error | null = null;

  generateScenarios({ excluded }: { excluded: string[] }) {
    this.scenarioCount += 1;
    this.lastExcluded = excluded;

    if (this.failure) {
      return Promise.reject(this.failure);
    }

    return Promise.resolve(
      [1, 2, 3].map((index) => ({
        description: `설명 ${this.scenarioCount}-${index}`,
        title: `상황 ${this.scenarioCount}-${index}`,
      }))
    );
  }

  generateDraft(): Promise<EpisodeDraft> {
    this.draftCount += 1;

    if (this.failure) {
      return Promise.reject(this.failure);
    }

    return Promise.resolve({
      goals: [`목표 ${this.draftCount}-1`, "목표 2", "목표 3"],
      partnerRole: `상대 ${this.draftCount}`,
      userRole: `나 ${this.draftCount}`,
    });
  }

  generateRole({ target }: { target: EpisodeRoleTarget }) {
    this.roleCount += 1;
    this.lastRoleTarget = target;

    return Promise.resolve(`새 ${target} 역할 ${this.roleCount}`);
  }

  generateGoals({ excluded }: { excluded: string[] }) {
    this.goalsCount += 1;
    this.lastExcluded = excluded;

    return Promise.resolve([
      `새 목표 ${this.goalsCount}-1`,
      `새 목표 ${this.goalsCount}-2`,
      `새 목표 ${this.goalsCount}-3`,
    ]);
  }
}

function mintToken() {
  return new SignJWT({ role: "authenticated" })
    .setProtectedHeader({ alg: "ES256", kid: KID })
    .setSubject(USER_ID)
    .setIssuer("http://127.0.0.1:54321/auth/v1")
    .setAudience("authenticated")
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + 3600)
    .sign(signingKey);
}

async function send(
  path: string,
  body: unknown,
  { withAuth = true }: { withAuth?: boolean } = {}
) {
  const headers = new Headers({ "content-type": "application/json" });

  if (withAuth) {
    headers.set("authorization", `Bearer ${await mintToken()}`);
  }

  return app.request(path, {
    body: JSON.stringify(body),
    headers,
    method: "POST",
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

  ({ createApiApp } = await import("./index"));
});

beforeEach(() => {
  repository = new MemoryEpisodeRepository();
  model = new FakeEpisodeModel();
  app = createApiApp({
    episode: {
      createRepository: () => repository,
      model,
    },
  });
});

describe("에피소드 생성 인증", () => {
  it("Authorization 헤더가 없으면 모든 생성 경로가 401", async () => {
    const routes = [
      "/episodes/scenarios",
      "/episodes/draft",
      "/episodes/draft/role",
      "/episodes/draft/goals",
      "/episodes",
    ];

    const responses = await Promise.all(
      routes.map((route) => send(route, {}, { withAuth: false }))
    );

    for (const response of responses) {
      expect(response.status).toBe(401);
    }

    expect(model.scenarioCount).toBe(0);
    expect(repository.episodes).toHaveLength(0);
  });
});

describe("POST /episodes/scenarios", () => {
  it("상황 후보 3개를 만든다", async () => {
    const response = await send("/episodes/scenarios", {});

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      scenarios: [
        { description: "설명 1-1", title: "상황 1-1" },
        { description: "설명 1-2", title: "상황 1-2" },
        { description: "설명 1-3", title: "상황 1-3" },
      ],
    });
  });

  it("이미 보여준 후보를 넘기면 모델이 그 목록을 받는다", async () => {
    await send("/episodes/scenarios", { excluded: ["상황 1-1", " ", 7] });

    expect(model.lastExcluded).toEqual(["상황 1-1"]);
  });

  it("모델이 실패하면 다시 시도할 수 있다고 답한다", async () => {
    model.failure = new Error("gateway unavailable");

    const response = await send("/episodes/scenarios", {});

    expect(response.status).toBe(500);
    expect(await response.json()).toMatchObject({ retryable: true });
  });
});

describe("POST /episodes/draft", () => {
  it("선택한 상황의 역할과 목표를 한 번에 만든다", async () => {
    const response = await send("/episodes/draft", { scenario: SCENARIO });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      goals: ["목표 1-1", "목표 2", "목표 3"],
      partnerRole: "상대 1",
      userRole: "나 1",
    });
    expect(model.draftCount).toBe(1);
    expect(model.goalsCount).toBe(0);
  });

  it("상황이 없으면 400", async () => {
    const response = await send("/episodes/draft", {
      scenario: { description: "", title: "제목" },
    });

    expect(response.status).toBe(400);
    expect(model.draftCount).toBe(0);
  });
});

describe("POST /episodes/draft/role", () => {
  it("고른 역할 하나만 다시 만든다", async () => {
    const response = await send("/episodes/draft/role", {
      ...ROLES,
      scenario: SCENARIO,
      target: "partner",
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ role: "새 partner 역할 1" });
    expect(model.lastRoleTarget).toBe("partner");
    expect(model.goalsCount).toBe(0);
    expect(model.draftCount).toBe(0);
  });

  it("역할 대상이 없으면 400", async () => {
    const response = await send("/episodes/draft/role", {
      ...ROLES,
      scenario: SCENARIO,
    });

    expect(response.status).toBe(400);
    expect(model.roleCount).toBe(0);
  });
});

describe("POST /episodes/draft/goals", () => {
  it("목표 3개만 묶어서 다시 만든다", async () => {
    const response = await send("/episodes/draft/goals", {
      ...ROLES,
      excluded: ["이전 목표"],
      scenario: SCENARIO,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      goals: ["새 목표 1-1", "새 목표 1-2", "새 목표 1-3"],
    });
    expect(model.lastExcluded).toEqual(["이전 목표"]);
    expect(model.roleCount).toBe(0);
  });
});

describe("POST /episodes", () => {
  it("진행 중 에피소드를 코드가 소유한 턴 상한과 함께 저장한다", async () => {
    const response = await send("/episodes", {
      ...ROLES,
      goals: ["목표 1", "목표 2", "목표 3"],
      scenario: SCENARIO,
      // 클라이언트가 보낸 턴 상한은 무시된다.
      turnLimit: 3,
    });

    expect(response.status).toBe(200);
    expect(await response.json()).toMatchObject({
      goals: [
        { achievedAt: null, position: 1, sentence: "목표 1" },
        { achievedAt: null, position: 2, sentence: "목표 2" },
        { achievedAt: null, position: 3, sentence: "목표 3" },
      ],
      partnerRole: ROLES.partnerRole,
      scenarioTitle: SCENARIO.title,
      status: "active",
      turnLimit: 20,
      userRole: ROLES.userRole,
    });
    expect(repository.episodes).toHaveLength(1);
  });

  it("목표가 3개가 아니면 저장하지 않는다", async () => {
    const response = await send("/episodes", {
      ...ROLES,
      goals: ["목표 1", "목표 2"],
      scenario: SCENARIO,
    });

    expect(response.status).toBe(400);
    expect(repository.episodes).toHaveLength(0);
  });

  it("본문이 JSON이 아니면 400", async () => {
    const response = await app.request("/episodes", {
      body: "not json",
      headers: new Headers({
        authorization: `Bearer ${await mintToken()}`,
        "content-type": "application/json",
      }),
      method: "POST",
    });

    expect(response.status).toBe(400);
    expect(repository.episodes).toHaveLength(0);
  });
});
