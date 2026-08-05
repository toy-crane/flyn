import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";
import type {
  DeliveredSentence,
  EpisodeMessage,
  RoleplayDependencies,
  RoleplayEpisode,
  RoleplayModel,
  RoleplayRepository,
} from "./roleplay";

const USER_ID = "22222222-2222-2222-2222-222222222222";
const EPISODE_ID = "33333333-3333-3333-3333-333333333333";
const KID = "roleplay-route-test-key";

let signingKey: CryptoKey;
let createApiApp: typeof import("./index").createApiApp;
let repository: MemoryRoleplayRepository;
let model: FakeRoleplayModel;
let app: ReturnType<typeof createApiApp>;

const EPISODE: RoleplayEpisode = {
  goals: [
    "오늘의 원두 추천 받기",
    "우유를 오트밀크로 바꿔 주문하기",
    "근처 가볼 만한 곳 물어보기",
  ],
  id: EPISODE_ID,
  partnerRole: "바리스타 Maya",
  scenarioDescription: "여행 중 들어간 작은 카페예요.",
  scenarioTitle: "포틀랜드 카페에서 첫 주문",
  status: "active",
  turnLimit: 20,
  userRole: "처음 방문한 여행객",
};

class MemoryRoleplayRepository implements RoleplayRepository {
  episode: RoleplayEpisode | undefined = EPISODE;
  ownerId = USER_ID;
  messages: EpisodeMessage[] = [];

  findOwnedEpisode(episodeId: string, userId: string) {
    if (this.episode?.id !== episodeId || this.ownerId !== userId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.episode);
  }

  findMessage(episodeId: string, messageId: string) {
    return Promise.resolve(
      this.messages.find(
        (message) => message.episodeId === episodeId && message.id === messageId
      ) ?? null
    );
  }

  listMessages(episodeId: string) {
    return Promise.resolve(
      this.messages.filter((message) => message.episodeId === episodeId)
    );
  }

  insertUserMessage(message: EpisodeMessage) {
    this.messages.push(message);
    return Promise.resolve();
  }

  insertAssistantMessage(message: EpisodeMessage) {
    this.messages.push(message);
    return Promise.resolve();
  }

  deleteStoppedAssistantMessage(episodeId: string, messageId: string) {
    this.messages = this.messages.filter(
      (message) =>
        message.episodeId !== episodeId ||
        message.id !== messageId ||
        message.role !== "assistant" ||
        message.status !== "stopped"
    );
    return Promise.resolve();
  }
}

class FakeRoleplayModel implements RoleplayModel {
  delivered: DeliveredSentence[] = [];
  generatedHistories: EpisodeMessage[][] = [];
  generateCount = 0;
  replayCount = 0;
  translated: string[] = [];
  translation: { kind: "error" } | { kind: "text"; text: string } = {
    kind: "text",
    text: "What do you recommend today?",
  };
  outcome:
    | { kind: "complete"; text: string }
    | { kind: "error" }
    | { kind: "stopped"; text: string } = {
    kind: "complete",
    text: "Sure thing.",
  };

  translate({ text }: Parameters<RoleplayModel["translate"]>[0]) {
    this.translated.push(text);

    if (this.translation.kind === "error") {
      return Promise.reject(new Error("gateway unavailable"));
    }

    return Promise.resolve(this.translation.text);
  }

  async generate({
    delivered,
    messages,
    onFinish,
  }: Parameters<RoleplayModel["generate"]>[0]) {
    this.generateCount += 1;
    this.generatedHistories.push(messages);
    this.delivered.push(delivered);

    if (this.outcome.kind === "error") {
      throw new Error("gateway unavailable");
    }

    await onFinish({
      isAborted: this.outcome.kind === "stopped",
      text: this.outcome.text,
    });

    return new Response(`stream:${delivered.text}|${this.outcome.text}`);
  }

  replay({ delivered, text }: Parameters<RoleplayModel["replay"]>[0]) {
    this.replayCount += 1;
    this.delivered.push(delivered);

    return new Response(`replay:${delivered.text}|${text}`);
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
  body: unknown,
  {
    episodeId = EPISODE_ID,
    withAuth = true,
  }: { episodeId?: string; withAuth?: boolean } = {}
) {
  const headers = new Headers({ "content-type": "application/json" });

  if (withAuth) {
    headers.set("authorization", `Bearer ${await mintToken()}`);
  }

  return app.request(`/episodes/${episodeId}/messages`, {
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
  repository = new MemoryRoleplayRepository();
  model = new FakeRoleplayModel();
  const roleplay: RoleplayDependencies = {
    createRepository: () => repository,
    model,
  };
  app = createApiApp({ roleplay });
});

describe("POST /episodes/:episodeId/messages 인증과 입력", () => {
  it("Authorization 헤더가 없으면 401", async () => {
    const response = await send(
      { content: "Hello", id: "user-1" },
      { withAuth: false }
    );

    expect(response.status).toBe(401);
  });

  it("본문이 비었거나 4,000자를 넘으면 400", async () => {
    const empty = await send({ content: " \n ", id: "user-1" });
    const long = await send({ content: "a".repeat(4001), id: "user-2" });
    const malformed = await send({ messages: [] });

    expect(empty.status).toBe(400);
    expect(long.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(repository.messages).toHaveLength(0);
  });

  it("없거나 남의 에피소드는 같은 404", async () => {
    repository.ownerId = "44444444-4444-4444-4444-444444444444";
    const other = await send({ content: "Hello", id: "user-1" });

    repository.episode = undefined;
    const missing = await send({ content: "Hello", id: "user-1" });

    expect(other.status).toBe(404);
    expect(missing.status).toBe(404);
    expect(repository.messages).toHaveLength(0);
  });
});

describe("전달되는 문장", () => {
  it("영어는 원문 그대로 전달하고 번역을 부르지 않는다", async () => {
    const response = await send({
      content: "  Could you recommend today's coffee?  ",
      id: "user-1",
    });

    expect(response.status).toBe(200);
    expect(await response.text()).toBe(
      "stream:Could you recommend today's coffee?|Sure thing."
    );
    expect(model.translated).toEqual([]);
    expect(repository.messages[0]).toEqual(
      expect.objectContaining({
        content: "Could you recommend today's coffee?",
        id: "user-1",
        role: "user",
      })
    );
  });

  it("한글은 번역한 영어를 전달하고 그 문장만 남긴다", async () => {
    const response = await send({
      content: "오늘 커피 뭐가 좋아요?",
      id: "user-1",
    });

    expect(await response.text()).toBe(
      "stream:What do you recommend today?|Sure thing."
    );
    expect(model.translated).toEqual(["오늘 커피 뭐가 좋아요?"]);
    // 입력 원문은 여기 남지 않는다 — 판정 행이 갖는다.
    expect(repository.messages[0]).toEqual(
      expect.objectContaining({
        content: "What do you recommend today?",
        role: "user",
      })
    );
    expect(model.generatedHistories[0]).toEqual([
      expect.objectContaining({ content: "What do you recommend today?" }),
    ]);
  });

  it("전달된 문장을 응답과 함께 앱에 돌려준다", async () => {
    await send({ content: "오늘 커피 뭐가 좋아요?", id: "user-1" });

    expect(model.delivered).toEqual([
      { messageId: "user-1", text: "What do you recommend today?" },
    ]);
  });

  it("번역이 실패하면 아무것도 남기지 않고 재시도 가능한 500", async () => {
    model.translation = { kind: "error" };

    const response = await send({
      content: "오늘 커피 뭐가 좋아요?",
      id: "user-1",
    });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "대화 요청을 처리하지 못했습니다.",
      retryable: true,
    });
    expect(repository.messages).toHaveLength(0);
    expect(model.generateCount).toBe(0);
  });
});

describe("저장과 스트리밍", () => {
  it("사용자 메시지를 먼저 저장하고 DB 기록으로 응답을 스트리밍한다", async () => {
    const response = await send({ content: "Hi there", id: "user-1" });

    expect(response.headers.get("content-type")).toBe(
      "application/octet-stream"
    );
    expect(response.headers.get("content-encoding")).toBe("none");
    expect(await response.text()).toBe("stream:Hi there|Sure thing.");
    expect(repository.messages).toEqual([
      expect.objectContaining({
        content: "Hi there",
        id: "user-1",
        role: "user",
        status: "complete",
      }),
      expect.objectContaining({
        content: "Sure thing.",
        role: "assistant",
        status: "complete",
      }),
    ]);
  });

  it("같은 ID의 재요청은 메시지와 모델 호출을 중복하지 않는다", async () => {
    const input = { content: "오늘 커피 뭐가 좋아요?", id: "user-1" };

    const first = await send(input);
    await first.text();
    const second = await send(input);

    expect(await second.text()).toBe(
      "replay:What do you recommend today?|Sure thing."
    );
    expect(repository.messages).toHaveLength(2);
    expect(model.generateCount).toBe(1);
    expect(model.replayCount).toBe(1);
    // 이미 전달한 문장을 다시 번역하면 말풍선에 남은 문장과 어긋난다.
    expect(model.translated).toHaveLength(1);
  });

  it("중단된 응답의 같은-ID 재요청은 부분 응답을 버리고 새로 생성한다", async () => {
    const input = { content: "Tell me more", id: "user-1" };
    model.outcome = { kind: "stopped", text: "여기까지" };

    const first = await send(input);
    await first.text();

    model.outcome = { kind: "complete", text: "새 완료 응답" };
    const retry = await send(input);

    expect(await retry.text()).toBe("stream:Tell me more|새 완료 응답");
    expect(model.generateCount).toBe(2);
    expect(model.replayCount).toBe(0);
    expect(repository.messages).toEqual([
      expect.objectContaining({ id: "user-1", role: "user" }),
      expect.objectContaining({ content: "새 완료 응답", role: "assistant" }),
    ]);
  });

  it("중단된 부분 응답은 stopped로 저장한다", async () => {
    model.outcome = { kind: "stopped", text: "여기까지" };

    const response = await send({ content: "Tell me more", id: "user-1" });
    await response.text();

    expect(repository.messages.at(-1)).toEqual(
      expect.objectContaining({
        content: "여기까지",
        role: "assistant",
        status: "stopped",
      })
    );
  });

  it("한 글자도 받지 못한 중단은 AI 메시지를 만들지 않는다", async () => {
    model.outcome = { kind: "stopped", text: "" };

    const response = await send({ content: "Tell me more", id: "user-1" });
    await response.text();

    expect(repository.messages).toHaveLength(1);
    expect(repository.messages[0]?.role).toBe("user");
  });

  it("Gateway 시작 실패는 사용자 메시지를 남기고 재시도 가능한 500", async () => {
    model.outcome = { kind: "error" };

    const response = await send({ content: "Tell me more", id: "user-1" });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "AI 응답을 시작하지 못했습니다.",
      retryable: true,
    });
    expect(repository.messages).toEqual([
      expect.objectContaining({ id: "user-1", role: "user" }),
    ]);
  });

  it("지난 대화 전체를 모델 입력으로 다시 읽는다", async () => {
    const first = await send({ content: "Hi there", id: "user-1" });
    await first.text();
    const second = await send({
      content: "One oat latte please",
      id: "user-2",
    });
    await second.text();

    expect(
      model.generatedHistories[1]?.map((message) => message.content)
    ).toEqual(["Hi there", "Sure thing.", "One oat latte please"]);
  });
});
