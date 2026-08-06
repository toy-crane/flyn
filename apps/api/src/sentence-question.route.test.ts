import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";
import type {
  QuestionEpisode,
  QuestionedSentence,
  SentenceQuestionDependencies,
  SentenceQuestionMessage,
  SentenceQuestionModel,
  SentenceQuestionRepository,
} from "./sentence-question";

const USER_ID = "22222222-2222-2222-2222-222222222222";
const EPISODE_ID = "33333333-3333-3333-3333-333333333333";
const KID = "sentence-question-route-test-key";

let signingKey: CryptoKey;
let createApiApp: typeof import("./index").createApiApp;
let repository: MemorySentenceQuestionRepository;
let model: FakeSentenceQuestionModel;
let app: ReturnType<typeof createApiApp>;

const EPISODE: QuestionEpisode = {
  id: EPISODE_ID,
  partnerRole: "바리스타 Maya",
  scenarioDescription: "여행 중 들어간 작은 카페예요.",
  scenarioTitle: "포틀랜드 카페에서 첫 주문",
  userRole: "처음 방문한 여행객",
};

const SENTENCES: Record<string, QuestionedSentence> = {
  "user-1": {
    delivered: "Sound good. Can you make it oat milk?",
    improvedSentence: "Sounds good. Can you make it with oat milk?",
    reasons: ["앞의 that이 생략된 3인칭 주어라 동사에 -s가 붙어요."],
    sourceText: "Sound good. Can you make it oat milk?",
  },
  "user-2": {
    delivered: "What do you recommend today?",
    improvedSentence: null,
    reasons: [],
    sourceText: "오늘 커피 뭐가 좋아요?",
  },
};

class MemorySentenceQuestionRepository implements SentenceQuestionRepository {
  episode: QuestionEpisode | undefined = structuredClone(EPISODE);
  ownerId = USER_ID;
  sentences: Record<string, QuestionedSentence> = structuredClone(SENTENCES);
  messages: SentenceQuestionMessage[] = [];

  findOwnedEpisode(episodeId: string, userId: string) {
    if (this.episode?.id !== episodeId || this.ownerId !== userId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.episode);
  }

  findQuestionedSentence(_episodeId: string, messageId: string) {
    return Promise.resolve(this.sentences[messageId] ?? null);
  }

  findQuestionMessage(episodeId: string, messageId: string, id: string) {
    return Promise.resolve(
      this.messages.find(
        (message) =>
          message.episodeId === episodeId &&
          message.messageId === messageId &&
          message.id === id
      ) ?? null
    );
  }

  listQuestionMessages(episodeId: string, messageId: string) {
    return Promise.resolve(
      this.messages.filter(
        (message) =>
          message.episodeId === episodeId && message.messageId === messageId
      )
    );
  }

  insertQuestionMessage(message: SentenceQuestionMessage) {
    this.messages.push(message);
    return Promise.resolve();
  }

  deleteStoppedAnswer(episodeId: string, messageId: string, answerId: string) {
    this.messages = this.messages.filter(
      (message) =>
        message.episodeId !== episodeId ||
        message.messageId !== messageId ||
        message.id !== answerId ||
        message.role !== "assistant" ||
        message.status !== "stopped"
    );
    return Promise.resolve();
  }
}

class FakeSentenceQuestionModel implements SentenceQuestionModel {
  generateCount = 0;
  replayCount = 0;
  sentences: QuestionedSentence[] = [];
  histories: SentenceQuestionMessage[][] = [];
  outcome:
    | { kind: "complete"; text: string }
    | { kind: "error" }
    | { kind: "stopped"; text: string } = {
    kind: "complete",
    text: "with를 빼면 오트밀크를 만들어 달라는 말로 들려요.",
  };

  async generate({
    messages,
    onFinish,
    sentence,
  }: Parameters<SentenceQuestionModel["generate"]>[0]) {
    this.generateCount += 1;
    this.histories.push(messages);
    this.sentences.push(sentence);

    if (this.outcome.kind === "error") {
      throw new Error("gateway unavailable");
    }

    await onFinish({
      isAborted: this.outcome.kind === "stopped",
      text: this.outcome.text,
    });

    return new Response(`stream:${this.outcome.text}`);
  }

  replay({ text }: Parameters<SentenceQuestionModel["replay"]>[0]) {
    this.replayCount += 1;

    return new Response(`replay:${text}`);
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

async function ask(
  body: unknown,
  {
    episodeId = EPISODE_ID,
    messageId = "user-1",
    withAuth = true,
  }: { episodeId?: string; messageId?: string; withAuth?: boolean } = {}
) {
  const headers = new Headers({ "content-type": "application/json" });

  if (withAuth) {
    headers.set("authorization", `Bearer ${await mintToken()}`);
  }

  return app.request(`/episodes/${episodeId}/messages/${messageId}/questions`, {
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
  repository = new MemorySentenceQuestionRepository();
  model = new FakeSentenceQuestionModel();
  const sentenceQuestion: SentenceQuestionDependencies = {
    createRepository: () => repository,
    model,
  };
  app = createApiApp({ sentenceQuestion });
});

describe("POST /episodes/:episodeId/messages/:messageId/questions 인증과 입력", () => {
  it("Authorization 헤더가 없으면 401", async () => {
    const response = await ask(
      { content: "with를 빼면 어때요?", id: "question-1" },
      { withAuth: false }
    );

    expect(response.status).toBe(401);
  });

  it("본문이 비었거나 4,000자를 넘으면 400", async () => {
    const empty = await ask({ content: " \n ", id: "question-1" });
    const long = await ask({ content: "가".repeat(4001), id: "question-2" });
    const malformed = await ask({ messages: [] });

    expect(empty.status).toBe(400);
    expect(long.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(repository.messages).toHaveLength(0);
  });

  it("없거나 남의 에피소드, 물어볼 수 없는 발화는 같은 404", async () => {
    repository.ownerId = "44444444-4444-4444-4444-444444444444";
    const other = await ask({ content: "왜요?", id: "question-1" });

    repository.ownerId = USER_ID;
    // 상대의 발화에는 첨삭 표시가 없으므로 물어볼 자리도 없다.
    const assistant = await ask(
      { content: "왜요?", id: "question-1" },
      { messageId: "assistant-1" }
    );

    repository.episode = undefined;
    const missing = await ask({ content: "왜요?", id: "question-1" });

    expect(other.status).toBe(404);
    expect(assistant.status).toBe(404);
    expect(missing.status).toBe(404);
    expect(repository.messages).toHaveLength(0);
  });
});

describe("문장 질문 저장", () => {
  it("질문을 먼저 남기고 답을 스트리밍한다", async () => {
    const response = await ask({
      content: "  with 빼고 말하면 진짜 못 알아들어요?  ",
      id: "question-1",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/octet-stream"
    );
    expect(await response.text()).toBe(
      "stream:with를 빼면 오트밀크를 만들어 달라는 말로 들려요."
    );
    expect(repository.messages).toEqual([
      expect.objectContaining({
        content: "with 빼고 말하면 진짜 못 알아들어요?",
        id: "question-1",
        messageId: "user-1",
        role: "user",
        status: "complete",
      }),
      expect.objectContaining({
        content: "with를 빼면 오트밀크를 만들어 달라는 말로 들려요.",
        messageId: "user-1",
        role: "assistant",
        status: "complete",
      }),
    ]);
  });

  it("나갔다 다시 물으면 지난 내용을 이어서 모델에 준다", async () => {
    await ask({ content: "첫 질문이에요.", id: "question-1" });
    await ask({ content: "그럼 이건요?", id: "question-2" });

    expect(model.histories[1]?.map((message) => message.content)).toEqual([
      "첫 질문이에요.",
      "with를 빼면 오트밀크를 만들어 달라는 말로 들려요.",
      "그럼 이건요?",
    ]);
  });

  it("문장이 다르면 서로 다른 자리에 쌓인다", async () => {
    await ask({ content: "이 문장 질문", id: "question-1" });
    await ask(
      { content: "저 문장 질문", id: "question-2" },
      { messageId: "user-2" }
    );

    const first = await repository.listQuestionMessages(EPISODE_ID, "user-1");
    const second = await repository.listQuestionMessages(EPISODE_ID, "user-2");

    expect(first.map((message) => message.content)).toEqual([
      "이 문장 질문",
      "with를 빼면 오트밀크를 만들어 달라는 말로 들려요.",
    ]);
    expect(second.map((message) => message.content)).toEqual([
      "저 문장 질문",
      "with를 빼면 오트밀크를 만들어 달라는 말로 들려요.",
    ]);
    // 두 번째 질문은 첫 문장의 지난 내용을 보지 않는다.
    expect(model.histories[1]?.map((message) => message.content)).toEqual([
      "저 문장 질문",
    ]);
  });

  it("같은 질문을 다시 보내면 저장된 답을 그대로 재생한다", async () => {
    await ask({ content: "with를 빼면요?", id: "question-1" });
    const again = await ask({ content: "with를 빼면요?", id: "question-1" });

    expect(await again.text()).toBe(
      "replay:with를 빼면 오트밀크를 만들어 달라는 말로 들려요."
    );
    expect(model.generateCount).toBe(1);
    expect(model.replayCount).toBe(1);
    expect(repository.messages).toHaveLength(2);
  });

  it("중단된 답은 중단으로 남고 다시 물으면 새로 만든다", async () => {
    model.outcome = { kind: "stopped", text: "여기까지 말하다 멈췄어요." };
    await ask({ content: "with를 빼면요?", id: "question-1" });

    expect(repository.messages[1]).toEqual(
      expect.objectContaining({ role: "assistant", status: "stopped" })
    );

    model.outcome = { kind: "complete", text: "끝까지 답했어요." };
    await ask({ content: "with를 빼면요?", id: "question-1" });

    expect(model.generateCount).toBe(2);
    expect(model.replayCount).toBe(0);
    expect(repository.messages).toEqual([
      expect.objectContaining({ id: "question-1", role: "user" }),
      expect.objectContaining({
        content: "끝까지 답했어요.",
        role: "assistant",
        status: "complete",
      }),
    ]);
  });
});

describe("모델에 주는 문장", () => {
  it("첨삭 시트가 보여 준 문장과 이유를 그대로 넘긴다", async () => {
    await ask({ content: "왜 -s가 붙어요?", id: "question-1" });

    expect(model.sentences[0]).toEqual({
      delivered: "Sound good. Can you make it oat milk?",
      improvedSentence: "Sounds good. Can you make it with oat milk?",
      reasons: ["앞의 that이 생략된 3인칭 주어라 동사에 -s가 붙어요."],
      sourceText: "Sound good. Can you make it oat milk?",
    });
  });

  it("모델이 실패하면 재시도 가능한 500으로 답한다", async () => {
    model.outcome = { kind: "error" };

    const response = await ask({ content: "왜요?", id: "question-1" });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "답변을 시작하지 못했습니다.",
      retryable: true,
    });
    // 질문은 남는다 — 다시 물어보면 그 질문에 이어서 답한다.
    expect(repository.messages).toEqual([
      expect.objectContaining({ id: "question-1", role: "user" }),
    ]);
  });
});
