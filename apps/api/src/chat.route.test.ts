import { beforeAll, beforeEach, describe, expect, it } from "bun:test";
import { exportJWK, generateKeyPair, type JWK, SignJWT } from "jose";
import type {
  ChatDependencies,
  ChatMessage,
  ChatModel,
  ChatRepository,
} from "./chat";

const USER_ID = "22222222-2222-2222-2222-222222222222";
const ROOM_ID = "33333333-3333-3333-3333-333333333333";
const KID = "chat-route-test-key";

let signingKey: CryptoKey;
let createApiApp: typeof import("./index").createApiApp;
let repository: MemoryChatRepository;
let model: FakeChatModel;
let app: ReturnType<typeof createApiApp>;

class MemoryChatRepository implements ChatRepository {
  room:
    | {
        id: string;
        title: string;
        userId: string;
      }
    | undefined = {
    id: ROOM_ID,
    title: "새 채팅",
    userId: USER_ID,
  };

  messages: ChatMessage[] = [];

  findOwnedRoom(roomId: string, userId: string) {
    if (this.room?.id !== roomId || this.room.userId !== userId) {
      return Promise.resolve(null);
    }

    return Promise.resolve(this.room);
  }

  findMessage(roomId: string, messageId: string) {
    return Promise.resolve(
      this.messages.find(
        (message) => message.chatRoomId === roomId && message.id === messageId
      ) ?? null
    );
  }

  insertUserMessage(message: ChatMessage) {
    this.messages.push(message);
    return Promise.resolve();
  }

  listMessages(roomId: string) {
    return Promise.resolve(
      this.messages.filter((message) => message.chatRoomId === roomId)
    );
  }

  updateRoomTitle(roomId: string, title: string) {
    if (this.room?.id === roomId) {
      this.room.title = title;
    }
    return Promise.resolve();
  }

  insertAssistantMessage(message: ChatMessage) {
    this.messages.push(message);
    return Promise.resolve();
  }
}

class FakeChatModel implements ChatModel {
  generatedHistories: ChatMessage[][] = [];
  generateCount = 0;
  replayCount = 0;
  outcome:
    | { kind: "complete"; text: string }
    | { kind: "stopped"; text: string }
    | { kind: "error" } = {
    kind: "complete",
    text: "반가워요.",
  };

  async generate({
    messages,
    onFinish,
  }: Parameters<ChatDependencies["model"]["generate"]>[0]) {
    this.generateCount += 1;
    this.generatedHistories.push(messages);

    if (this.outcome.kind === "error") {
      throw new Error("gateway unavailable");
    }

    await onFinish({
      isAborted: this.outcome.kind === "stopped",
      text: this.outcome.text,
    });

    return new Response(`stream:${this.outcome.text}`);
  }

  replay({ text }: Parameters<ChatDependencies["model"]["replay"]>[0]) {
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

async function send(
  body: unknown,
  {
    roomId = ROOM_ID,
    withAuth = true,
  }: { roomId?: string; withAuth?: boolean } = {}
) {
  const headers = new Headers({ "content-type": "application/json" });

  if (withAuth) {
    headers.set("authorization", `Bearer ${await mintToken()}`);
  }

  return app.request(`/chats/${roomId}/messages`, {
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
  repository = new MemoryChatRepository();
  model = new FakeChatModel();
  app = createApiApp({
    chat: {
      createRepository: () => repository,
      model,
    },
  });
});

describe("POST /chats/:chatId/messages 인증과 입력", () => {
  it("Authorization 헤더가 없으면 401", async () => {
    const response = await send(
      { content: "안녕", id: "user-1" },
      { withAuth: false }
    );

    expect(response.status).toBe(401);
  });

  it("본문이 비었거나 4,000자를 넘으면 400", async () => {
    const empty = await send({ content: " \n ", id: "user-1" });
    const long = await send({ content: "가".repeat(4001), id: "user-2" });
    const malformed = await send({ messages: [], roomId: ROOM_ID });

    expect(empty.status).toBe(400);
    expect(long.status).toBe(400);
    expect(malformed.status).toBe(400);
    expect(repository.messages).toHaveLength(0);
  });

  it("없거나 남의 채팅방은 같은 404", async () => {
    repository.room = undefined;

    const missing = await send({ content: "안녕", id: "user-1" });
    const unknown = await send(
      { content: "안녕", id: "user-1" },
      { roomId: "44444444-4444-4444-4444-444444444444" }
    );

    expect(missing.status).toBe(404);
    expect(unknown.status).toBe(404);
    expect(repository.messages).toHaveLength(0);
  });
});

describe("POST /chats/:chatId/messages 저장과 스트리밍", () => {
  it("사용자 메시지를 먼저 저장하고 DB 기록으로 응답을 스트리밍한다", async () => {
    const response = await send({
      content: "  첫 줄 제목  \n둘째 줄  ",
      id: "user-1",
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe(
      "application/octet-stream"
    );
    expect(response.headers.get("content-encoding")).toBe("none");
    expect(await response.text()).toBe("stream:반가워요.");
    expect(repository.room?.title).toBe("첫 줄 제목");
    expect(repository.messages).toEqual([
      expect.objectContaining({
        content: "첫 줄 제목  \n둘째 줄",
        id: "user-1",
        role: "user",
        status: "complete",
      }),
      expect.objectContaining({
        content: "반가워요.",
        role: "assistant",
        status: "complete",
      }),
    ]);
    expect(model.generatedHistories[0]).toEqual([
      expect.objectContaining({ content: "첫 줄 제목  \n둘째 줄" }),
    ]);
  });

  it("제목은 첫 줄을 40 grapheme까지만 한 번 정한다", async () => {
    const grapheme = "👨‍👩‍👧‍👦";
    const firstMessage = `${grapheme.repeat(41)}\n무시되는 둘째 줄`;

    await send({ content: firstMessage, id: "user-1" });
    const firstTitle = repository.room?.title;
    await send({ content: "두 번째 메시지", id: "user-2" });

    expect(firstTitle).toBe(grapheme.repeat(40));
    expect(repository.room?.title).toBe(firstTitle);
  });

  it("같은 ID와 본문의 재요청은 메시지와 모델 호출을 중복하지 않는다", async () => {
    const input = { content: "안녕", id: "user-1" };

    const first = await send(input);
    await first.text();
    const second = await send(input);

    expect(second.status).toBe(200);
    expect(await second.text()).toBe("replay:반가워요.");
    expect(repository.messages).toHaveLength(2);
    expect(model.generateCount).toBe(1);
    expect(model.replayCount).toBe(1);
  });

  it("같은 ID의 다른 본문은 409", async () => {
    const first = await send({ content: "원문", id: "user-1" });
    await first.text();

    const conflict = await send({ content: "바뀐 본문", id: "user-1" });

    expect(conflict.status).toBe(409);
    expect(model.generateCount).toBe(1);
  });

  it("중단된 부분 응답은 stopped로 저장한다", async () => {
    model.outcome = { kind: "stopped", text: "여기까지" };

    const response = await send({ content: "길게 답해줘", id: "user-1" });
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

    const response = await send({ content: "답해줘", id: "user-1" });
    await response.text();

    expect(repository.messages).toHaveLength(1);
    expect(repository.messages[0]?.role).toBe("user");
  });

  it("Gateway 시작 실패는 사용자 메시지를 남기고 재시도 가능한 500", async () => {
    model.outcome = { kind: "error" };

    const response = await send({ content: "답해줘", id: "user-1" });

    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({
      error: "AI 응답을 시작하지 못했습니다.",
      retryable: true,
    });
    expect(repository.messages).toEqual([
      expect.objectContaining({ id: "user-1", role: "user" }),
    ]);
  });
});
