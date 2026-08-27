import { describe, expect, test } from "bun:test";
import { inspect } from "node:util";

import { APICallError, type LanguageModelV4StreamPart } from "@ai-sdk/provider";
import { withSupabase } from "@supabase/server/adapters/hono";
import { MockLanguageModelV4, simulateReadableStream } from "ai/test";
import type { MiddlewareHandler } from "hono";

import { createApp } from "./app";

const CHAT_PATH = "/ai/chat";
const EPISODE_PATH = "/ai/episode";

/**
 * A real Supabase project is not reachable from a unit test, so the URL is the
 * one piece of environment the middleware still needs to get as far as reading
 * credentials. Everything after that — missing header, unverifiable token — is
 * the real check running.
 */
function createUserAuthMiddleware(): MiddlewareHandler {
  return withSupabase({
    auth: "user",
    env: { url: "http://localhost:54321" },
  });
}

/** A finished episode as the database hands it back. */
interface FinishedRow {
  episode: number;
  kind: string;
  outcome: string;
}

/**
 * The season progress a signed-in request finds, and what it wrote.
 *
 * `recorded` is the whole point: the episode route is supposed to leave the
 * ending in the account before the app is told the scene is over, and a test
 * that only read the response could not tell the difference.
 */
interface SeasonState {
  finished: FinishedRow[];
  recordError?: string;
  recorded: {
    episode: number;
    kind: string;
    outcome: string;
    season: number;
  }[];
}

function createSeasonState(finished: FinishedRow[] = []): SeasonState {
  return { finished, recorded: [] };
}

/** Every episode of the season, ended. */
function finishedSeason(): FinishedRow[] {
  return [1, 2, 3, 4, 5].map((episode) => ({
    episode,
    kind: "성공",
    outcome: `${episode}화를 끝냈다.`,
  }));
}

/**
 * Stands in for a request whose token and current user both still exist,
 * reaching a database that holds `state`.
 */
function signedInWith(state: SeasonState): MiddlewareHandler {
  const client = {
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: { id: "user-1" } },
          error: null,
        }),
    },
    from: () => {
      const builder = {
        eq: () => builder,
        order: () => Promise.resolve({ data: state.finished, error: null }),
        select: () => builder,
      };

      return builder;
    },
    rpc: (_name: string, args: FinishedRow & { season: number }) => {
      state.recorded.push(args);

      return Promise.resolve({
        error: state.recordError ? { message: state.recordError } : null,
      });
    },
  };

  return (c, next) => {
    c.set("supabaseContext", { supabase: client } as never);

    return next();
  };
}

/** A signed-in request whose account has not finished anything yet. */
const bypassAuth: MiddlewareHandler = signedInWith(createSeasonState());

/** A validly signed token left on a device after its account was deleted. */
const deletedUserAuth: MiddlewareHandler = (c, next) => {
  c.set("supabaseContext", {
    supabase: {
      auth: {
        getUser: () =>
          Promise.resolve({
            data: { user: null },
            error: new Error("User from sub claim in JWT does not exist"),
          }),
      },
    },
  } as never);

  return next();
};

function createMockModel(text: string[]): MockLanguageModelV4 {
  const chunks: LanguageModelV4StreamPart[] = [
    { type: "stream-start", warnings: [] },
    { id: "0", type: "text-start" },
    ...text.map((delta) => ({ delta, id: "0", type: "text-delta" as const })),
    { id: "0", type: "text-end" },
    {
      finishReason: { raw: undefined, unified: "stop" },
      type: "finish",
      usage: {
        inputTokens: {
          cacheRead: undefined,
          cacheWrite: undefined,
          noCache: undefined,
          total: undefined,
        },
        outputTokens: {
          reasoning: undefined,
          text: undefined,
          total: undefined,
        },
      },
    },
  ];

  return new MockLanguageModelV4({
    doStream: {
      stream: simulateReadableStream({
        chunkDelayInMs: null,
        chunks,
        initialDelayInMs: null,
      }),
    },
  });
}

function createChatRequest(body: unknown, token?: string): Request {
  return new Request(`http://localhost${CHAT_PATH}`, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    method: "POST",
  });
}

function createEpisodeRequest(body: unknown, token?: string): Request {
  return new Request(`http://localhost${EPISODE_PATH}`, {
    body: JSON.stringify(body),
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    method: "POST",
  });
}

function createSeasonRequest(token?: string): Request {
  return new Request(`http://localhost${EPISODE_PATH}/season`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
}

function createUserMessage(text: string) {
  return {
    id: "m1",
    parts: [{ text, type: "text" }],
    role: "user",
  };
}

/** Polls until the stream-side effect of an abort has had time to land. */
function until(predicate: () => boolean, timeoutMs = 1000): Promise<void> {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      if (predicate()) {
        resolve();

        return;
      }

      if (Date.now() > deadline) {
        reject(new Error("Condition did not become true in time"));

        return;
      }

      setTimeout(tick, 10);
    };

    tick();
  });
}

/**
 * A model whose stream never ends on its own, so the only way the call can
 * stop is the abort under test. The signal `doStream` actually received stays
 * readable on `doStreamCalls` afterwards.
 */
function neverEndingModel(): MockLanguageModelV4 {
  return new MockLanguageModelV4({
    doStream: () =>
      Promise.resolve({
        stream: new ReadableStream<LanguageModelV4StreamPart>({
          start(controller) {
            controller.enqueue({ type: "stream-start", warnings: [] });
            controller.enqueue({ id: "0", type: "text-start" });
            controller.enqueue({
              delta: "첫 조각",
              id: "0",
              type: "text-delta",
            });
            // Never closes: a finish would end the request without the abort.
          },
        }),
      }),
  });
}

/**
 * Sends an authenticated chat request wired to an AbortController, reads the
 * first body chunk so the stream is really flowing, then aborts.
 */
async function abortMidStream(
  app: ReturnType<typeof createApp>,
  message: string
): Promise<void> {
  const controller = new AbortController();
  const request = new Request(`http://localhost${CHAT_PATH}`, {
    body: JSON.stringify({ messages: [createUserMessage(message)] }),
    headers: { "content-type": "application/json" },
    method: "POST",
    signal: controller.signal,
  });

  const response = await app.request(request);

  expect(response.status).toBe(200);

  const reader = response.body?.getReader();

  if (!reader) {
    throw new Error("Response has no body to read");
  }

  await reader.read();
  controller.abort();

  // Reading past the abort surfaces the cancellation; the error itself is the
  // expected outcome, not a failure of the test.
  await reader.read().catch(() => undefined);
}

describe("GET /health", () => {
  test("answers without credentials or AI configuration", async () => {
    const response = await createApp({
      authMiddleware: createUserAuthMiddleware(),
    }).request("/health");

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: "ok" });
  });
});

describe("POST /ai/chat", () => {
  test("rejects a request with no access token before calling the model", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({
      authMiddleware: createUserAuthMiddleware(),
      model,
    });

    const response = await app.request(
      createChatRequest({ messages: [createUserMessage("안녕")] })
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("rejects an access token it cannot verify before calling the model", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({
      authMiddleware: createUserAuthMiddleware(),
      model,
    });

    const response = await app.request(
      createChatRequest(
        { messages: [createUserMessage("안녕")] },
        "not-a-real-token"
      )
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("rejects a deleted user before calling the model", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({ authMiddleware: deletedUserAuth, model });

    const response = await app.request(
      createChatRequest({ messages: [createUserMessage("안녕")] })
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("returns a UI message stream for an authenticated request", async () => {
    const model = createMockModel(["안녕", "하세요"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createChatRequest({ messages: [createUserMessage("안녕")] })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("x-vercel-ai-ui-message-stream")).toBe("v1");

    const body = await response.text();

    expect(body).toContain('"type":"text-delta"');
    expect(body).toContain("안녕");
    expect(body).toContain("하세요");
    expect(model.doStreamCalls).toHaveLength(1);
  });

  test("turns screenplay lines into speaker parts and narration", async () => {
    const model = createMockModel([
      "국물 김이 오른다.\n",
      "만복: 어서 와.\n",
      "준호: 사장님, 저도요.",
    ]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createChatRequest({ messages: [createUserMessage("안녕하세요")] })
    );

    expect(response.status).toBe(200);

    const body = await response.text();

    // The line heads become speaker parts; the spoken words flow as plain
    // deltas without the name prefix the model wrote.
    expect(body).toContain('"type":"data-speaker"');
    expect(body).toContain('"name":"만복"');
    expect(body).toContain('"name":null');
    expect(body).toContain("어서 와.");
    expect(body).not.toContain("만복:");
  });

  test("restores speaker parts as screenplay lines for the model", async () => {
    const model = createMockModel(["만복: 또 왔네."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createChatRequest({
        messages: [
          createUserMessage("안녕하세요"),
          {
            id: "m2",
            parts: [
              {
                data: { name: "준호" },
                id: "speaker-1",
                type: "data-speaker",
              },
              { text: "어서 와, 처음 보는 얼굴이네.", type: "text" },
            ],
            role: "assistant",
          },
          {
            id: "m3",
            parts: [{ text: "네, 처음이에요", type: "text" }],
            role: "user",
          },
        ],
      })
    );

    expect(response.status).toBe(200);
    await response.text();

    // Without this, the model would see last scene's words with no idea who
    // said them.
    const prompt = JSON.stringify(model.doStreamCalls[0]?.prompt);

    expect(prompt).toContain("준호:");
    expect(prompt).toContain("어서 와, 처음 보는 얼굴이네.");
  });

  test("rejects a malformed body before calling the model", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createChatRequest({ messages: [{ role: "user" }] })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("keeps the conversation out of the log when the provider fails", async () => {
    const secret = "내-주민등록번호-900101-1234567";
    // The shape the AI SDK actually produces: the error carries the request it
    // sent, so anything that prints the object prints the conversation.
    const model = new MockLanguageModelV4({
      doStream: () =>
        Promise.reject(
          new APICallError({
            message: "Unauthorized",
            requestBodyValues: {
              messages: [{ content: secret, role: "user" }],
            },
            responseBody: '{"error":"bad key"}',
            statusCode: 401,
            url: "https://ai-gateway.example/v1/chat",
          })
        ),
    });
    const app = createApp({ authMiddleware: bypassAuth, model });
    const written: string[] = [];
    const realError = console.error;

    // `inspect`, not `String`: that is what a console does with an object, and
    // it is the step that would expose the error's own properties.
    console.error = (...parts: unknown[]) => {
      written.push(parts.map((part) => inspect(part, { depth: 6 })).join(" "));
    };

    try {
      const response = await app.request(
        createChatRequest({ messages: [createUserMessage(secret)] })
      );

      await response.text();
    } finally {
      console.error = realError;
    }

    expect(written.join("\n")).not.toContain(secret);
    expect(written.join("\n")).toContain("Request failed on");
  });

  test("rejects a body that is not an AI SDK message list", async () => {
    const model = createMockModel(["안녕하세요"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(createChatRequest({ prompt: "안녕" }));

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("passes the request abort through to the model call", async () => {
    const model = neverEndingModel();
    const app = createApp({ authMiddleware: bypassAuth, model });

    await abortMidStream(app, "안녕");

    // `streamText` may hand the model a derived signal, so the check is that
    // the signal it received fired, not that it is the request's own object.
    await until(() => model.doStreamCalls[0]?.abortSignal?.aborted === true);
  });

  test("logs an abort as method and path only", async () => {
    const secret = "내-주민등록번호-900101-1234567";
    const model = neverEndingModel();
    const app = createApp({ authMiddleware: bypassAuth, model });
    const written: string[] = [];
    const realLog = console.log;
    const realError = console.error;

    console.log = (...parts: unknown[]) => {
      written.push(parts.map((part) => inspect(part, { depth: 6 })).join(" "));
    };
    console.error = (...parts: unknown[]) => {
      written.push(parts.map((part) => inspect(part, { depth: 6 })).join(" "));
    };

    try {
      await abortMidStream(app, secret);
      await until(() =>
        written.some((line) => line.includes("Request aborted on"))
      );
    } finally {
      console.log = realLog;
      console.error = realError;
    }

    const log = written.join("\n");

    expect(log).toContain("Request aborted on");
    expect(log).toContain("POST");
    expect(log).toContain(CHAT_PATH);
    expect(log).not.toContain(secret);
  });

  test("keeps reasoning out of the response while text passes through", async () => {
    const reasoning = "모델이 몰래 생각한 내용";
    const chunks: LanguageModelV4StreamPart[] = [
      { type: "stream-start", warnings: [] },
      { id: "r0", type: "reasoning-start" },
      { delta: reasoning, id: "r0", type: "reasoning-delta" },
      { id: "r0", type: "reasoning-end" },
      { id: "0", type: "text-start" },
      { delta: "안녕", id: "0", type: "text-delta" },
      { delta: "하세요", id: "0", type: "text-delta" },
      { id: "0", type: "text-end" },
      {
        finishReason: { raw: undefined, unified: "stop" },
        type: "finish",
        usage: {
          inputTokens: {
            cacheRead: undefined,
            cacheWrite: undefined,
            noCache: undefined,
            total: undefined,
          },
          outputTokens: {
            reasoning: undefined,
            text: undefined,
            total: undefined,
          },
        },
      },
    ];
    const model = new MockLanguageModelV4({
      doStream: {
        stream: simulateReadableStream({
          chunkDelayInMs: null,
          chunks,
          initialDelayInMs: null,
        }),
      },
    });
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createChatRequest({ messages: [createUserMessage("안녕")] })
    );

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(body).not.toContain("reasoning");
    expect(body).not.toContain(reasoning);
    expect(body).toContain('"type":"text-delta"');
    expect(body).toContain("안녕");
    expect(body).toContain("하세요");
  });
});

describe("POST /ai/episode", () => {
  test("rejects a request with no access token before calling the model", async () => {
    const model = createMockModel(["Mia: Sorry about that."]);
    const app = createApp({
      authMiddleware: createUserAuthMiddleware(),
      model,
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("This is wrong")] })
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  // 입력하기 전에 상대가 먼저 말한다. 정해 둔 장면이라 기다림도 없고, 다시
  // 들어와도 같은 카페가 열린다.
  test("opens the first scene itself, without calling the model", async () => {
    const model = createMockModel(["Mia: Sorry about that."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(createEpisodeRequest({ messages: [] }));

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(model.doStreamCalls).toHaveLength(0);
    // 대사는 화자가 붙은 영어 한 줄, 상황은 이름 없는 한국어 지문으로 흐른다.
    expect(body).toContain('"name":"Mia"');
    expect(body).toContain('"name":null');
    expect(body).toContain("Next in line, please!");
    expect(body).toContain("카페 카운터");
    expect(body).not.toContain("Mia:");
  });

  test("turns the model's scene into speaker parts and narration", async () => {
    const model = createMockModel([
      "Mia: Oh, I am sorry.\n",
      "직원이 잔을 내려놓는다.",
    ]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("This is not what I ordered.")],
      })
    );

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(body).toContain('"type":"data-speaker"');
    expect(body).toContain('"name":"Mia"');
    expect(body).toContain("Oh, I am sorry.");
    expect(body).toContain("직원이 잔을 내려놓는다.");
    expect(body).not.toContain("Mia:");
  });

  // 결말은 사용자의 말이 만든다. 모델이 사건을 닫았다고 쓰면 그 줄은 말풍선이
  // 아니라 에피소드를 닫는 판정으로 내려간다.
  test("closes the episode when the model writes an ending", async () => {
    const model = createMockModel([
      "Mia: Here is your iced americano.\n",
      "성공: 원하던 커피를 새로 받아냈다.",
    ]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I ordered an iced americano.")],
      })
    );

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(body).toContain('"type":"data-ending"');
    expect(body).toContain('"kind":"성공"');
    expect(body).toContain("원하던 커피를 새로 받아냈다.");
    expect(body).not.toContain("성공:");
  });

  test("leaves a scene that is still running without an ending", async () => {
    const model = createMockModel(["Mia: What did you order?"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("This is wrong.")],
      })
    );

    const body = await response.text();

    expect(body).not.toContain('"type":"data-ending"');
  });

  // 첫 장면을 서버가 썼더라도 다음 호출의 입력은 앱이 되돌려 보낸 그 장면이다.
  test("restores the scene so far as screenplay lines for the model", async () => {
    const model = createMockModel(["Mia: Let me check."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({
        messages: [
          {
            id: "m1",
            parts: [
              { data: { name: null }, id: "speaker-1", type: "data-speaker" },
              { text: "카페 카운터 앞이다.", type: "text" },
              { data: { name: "Mia" }, id: "speaker-2", type: "data-speaker" },
              { text: "Next in line, please!", type: "text" },
            ],
            role: "assistant",
          },
          createUserMessage("Excuse me, this is not my order."),
        ],
      })
    );

    expect(response.status).toBe(200);
    await response.text();

    const prompt = JSON.stringify(model.doStreamCalls[0]?.prompt);

    expect(prompt).toContain("Mia:");
    expect(prompt).toContain("Next in line, please!");
  });

  test("rejects a body that is not an AI SDK message list", async () => {
    const model = createMockModel(["Mia: Sorry."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createEpisodeRequest({ prompt: "start" })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  // 어떤 화가 열리는지는 계정의 진행이 정한다. 1화를 끝낸 사람이 에피소드를
  // 열면 2화의 각본이 나온다.
  test("opens the episode the account's progress points at", async () => {
    const state = createSeasonState([
      { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
    ]);
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: Sorry."]),
    });

    const response = await app.request(createEpisodeRequest({ messages: [] }));
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("it says declined");
    expect(body).not.toContain("Next in line");
  });

  // 끝난 화를 다시 열려는 요청이거나 화면이 뒤처진 요청이다. 어느 쪽이든
  // 조용히 다른 화를 열어 주지 않는다.
  test("refuses an episode that is not the one to play now", async () => {
    const state = createSeasonState([
      { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
    ]);
    const model = createMockModel(["Mia: Sorry."]);
    const app = createApp({ authMiddleware: signedInWith(state), model });

    const response = await app.request(
      createEpisodeRequest({ episode: 1, messages: [] })
    );

    expect(response.status).toBe(409);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("refuses to open anything once the season is finished", async () => {
    const model = createMockModel(["Mia: Sorry."]);
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState(finishedSeason())),
      model,
    });

    const response = await app.request(createEpisodeRequest({ messages: [] }));

    expect(response.status).toBe(409);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  // 마무리 화면을 보지 않고 앱을 꺼도 그 화는 끝난 것으로 남아야 한다. 그래서
  // 앱이 아니라 서버가 남긴다.
  test("records the ending in the account before closing the scene", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here is your iced americano.\n",
        "성공: 원하던 커피를 새로 받아냈다.",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I ordered an iced americano.")],
      })
    );

    await response.text();

    expect(state.recorded).toEqual([
      {
        episode: 1,
        kind: "성공",
        outcome: "원하던 커피를 새로 받아냈다.",
        season: 1,
      },
    ]);
  });

  // 예고는 각본에 미리 쓴 글이라 결말과 같은 응답에 실려 온다.
  test("sends the next episode's preview with the ending", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
      model: createMockModel(["성공: 원하던 커피를 새로 받아냈다."]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain('"type":"data-next-up"');
    expect(body).toContain("계산이 꼬인 아침");
    expect(body).toContain('"episode":2');
  });

  test("sends the season's completion instead of a preview after the last episode", async () => {
    const state = createSeasonState(finishedSeason().slice(0, 4));
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["성공: 제대로 인사를 건넸다."]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Take care.")] })
    );
    const body = await response.text();

    expect(body).toContain("시즌 1을 끝냈어요");
    expect(body).toContain('"episode":null');
  });

  // 결말을 남기지 못했는데 화면이 끝난 척하면, 사용자는 다음 화를 눌렀다가
  // 같은 화를 다시 만난다. 그럴 바에는 오류를 보고 다시 시도하는 편이 낫다.
  test("leaves the episode open when the ending cannot be recorded", async () => {
    const state = createSeasonState();

    state.recordError = "connection refused";

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here you go.\n",
        "성공: 원하던 커피를 새로 받아냈다.",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain("Here you go.");
    expect(body).not.toContain('"type":"data-ending"');
    expect(body).toContain('"type":"error"');
  });
});

describe("GET /ai/episode/season", () => {
  test("rejects a request with no access token", async () => {
    const app = createApp({ authMiddleware: createUserAuthMiddleware() });

    const response = await app.request(createSeasonRequest());

    expect(response.status).toBe(401);
  });

  // 아직 아무것도 끝내지 않은 사람의 홈. 1화 하나만 있다.
  test("points at the first episode before anything is finished", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(createSeasonRequest());
    const view = (await response.json()) as {
      finished: unknown[];
      next: { episode: number; title: string } | null;
      total: number;
    };

    expect(response.status).toBe(200);
    expect(view.finished).toEqual([]);
    expect(view.next).toMatchObject({ episode: 1, title: "카페에서 생긴 일" });
    expect(view.total).toBe(5);
  });

  // 진행 중인 홈. 끝낸 화는 결말과 제목을 달고 목록으로 남는다.
  test("carries the finished episodes and the next one while a season runs", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
        ])
      ),
    });

    const response = await app.request(createSeasonRequest());
    const view = (await response.json()) as {
      finished: {
        episode: number;
        kind: string;
        outcome: string;
        title: string;
      }[];
      next: { episode: number; title: string } | null;
    };

    expect(view.finished).toEqual([
      {
        episode: 1,
        kind: "성공",
        outcome: "새 잔을 받아냈다.",
        title: "카페에서 생긴 일",
      },
    ]);
    expect(view.next).toMatchObject({ episode: 2, title: "계산이 꼬인 아침" });
  });

  test("has no next episode once the season is finished", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState(finishedSeason())),
    });

    const response = await app.request(createSeasonRequest());
    const view = (await response.json()) as {
      completion: { title: string };
      finished: unknown[];
      next: unknown;
    };

    expect(view.next).toBeNull();
    expect(view.finished).toHaveLength(5);
    expect(view.completion.title).toBe("시즌 1을 끝냈어요");
  });
});
