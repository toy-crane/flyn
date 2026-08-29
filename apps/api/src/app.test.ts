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

const STORY_ID = "10000000-0000-4000-8000-000000000001";
const EPISODE_IDS = [1, 2, 3, 4, 5].map(
  (number) => `11000000-0000-4000-8000-${number.toString().padStart(12, "0")}`
);

function episodeId(number: number): string {
  const id = EPISODE_IDS[number - 1];

  if (!id) {
    throw new Error(`Episode ${number} is not in the test story.`);
  }

  return id;
}

const STORY_ROW = {
  completion_copy: "다섯 번의 사건을 영어로 지나왔어요.",
  completion_title: "첫 이야기를 끝냈어요",
  cover_emoji: "☕",
  cover_image_path: null,
  hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
  id: STORY_ID,
  intro: "매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건.",
  position: 1,
  slug: "mia-cafe",
  target_language: "en",
  title: "Mia의 카페",
};

const TEST_EPISODES = [
  {
    cast_names: ["Mia"],
    id: episodeId(1),
    number: 1,
    opening:
      "카페 카운터 앞이다.\nMia: Next in line, please!\n직원은 벌써 뒤에 선 손님을 부른다.",
    preview: "주문과 다른 커피가 나왔어요.",
    situation: "잘못 나온 커피를 원하는 커피로 바꿔 보세요",
    situation_emoji: "☕",
    stage: "사용자는 잘못 나온 커피를 바꿔야 한다.",
    title: "카페에서 생긴 일",
  },
  {
    cast_names: ["Mia"],
    id: episodeId(2),
    number: 2,
    opening:
      "다음 날 아침, 같은 카페다.\nMia: Hmm, it says declined. Do you want to try it again?",
    preview: "카드가 자꾸 튕겨요.",
    situation: "다른 방법을 찾아 계산을 끝내 보세요",
    situation_emoji: "💳",
    stage: "사용자는 다른 방법으로 결제를 끝내야 한다.",
    title: "계산이 꼬인 아침",
  },
  {
    cast_names: ["Mia", "Owen"],
    id: episodeId(3),
    number: 3,
    opening: "Owen: Oh, is this yours?",
    preview: "창가 자리에 다른 사람이 앉아 있어요.",
    situation: "맡아 둔 자리를 되찾아 보세요",
    situation_emoji: "🪑",
    stage: "사용자는 맡아 둔 자리를 정리해야 한다.",
    title: "자리를 맡아 둔 사이에",
  },
  {
    cast_names: ["Mia"],
    id: episodeId(4),
    number: 4,
    opening: "Mia: Try this one. Be honest, okay?",
    preview: "Mia가 새 메뉴의 감상을 물어요.",
    situation: "맛에 대한 생각을 솔직하게 전해 보세요",
    situation_emoji: "🥤",
    stage: "사용자는 새 음료의 감상을 전해야 한다.",
    title: "이름 없는 신메뉴",
  },
  {
    cast_names: ["Mia"],
    id: episodeId(5),
    number: 5,
    opening: "Mia: Today is my last shift here.",
    preview: "오늘이 Mia의 마지막 근무예요.",
    situation: "문 닫기 전에 하고 싶은 말을 건네 보세요",
    situation_emoji: "👋",
    stage: "사용자는 마지막 인사를 건네야 한다.",
    title: "마지막 잔",
  },
].map((episode) => ({
  ending_compromise: "일부만 해결했을 때",
  ending_failure: "해결하지 못했을 때",
  ending_success: "원하는 결과를 얻었을 때",
  story_id: STORY_ID,
  ...episode,
}));

/** A finished episode as the database hands it back. */
interface FinishedRow {
  episode: number;
  episode_id?: string;
  kind: string;
  memory_choice?: string | null;
  memory_question?: string | null;
  memory_relationship?: string | null;
  outcome: string;
}

/**
 * The season progress a signed-in request finds, and what it wrote.
 *
 * `recorded` is the whole point: the episode route is supposed to leave the
 * ending in the account before the app is told the scene is over, and a test
 * that only read the response could not tell the difference.
 */
interface EpisodeRunRow {
  completed_at: string | null;
  episode_id: string;
  messages: unknown[];
}

interface SeasonState {
  finished: FinishedRow[];
  recordAccepted?: boolean;
  recordError?: string;
  recorded: Record<string, unknown>[];
  runError?: string;
  runRecords: { args: Record<string, unknown>; name: string }[];
  runs: EpisodeRunRow[];
}

function createSeasonState(finished: FinishedRow[] = []): SeasonState {
  return { finished, recorded: [], runRecords: [], runs: [] };
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
  function finishedRows() {
    return state.finished.map(({ episode, ...row }) => ({
      episode_id: row.episode_id ?? episodeId(episode),
      finished_at: `2026-08-29T00:0${episode}:00.000Z`,
      ...row,
    }));
  }

  const client = {
    auth: {
      getUser: () =>
        Promise.resolve({
          data: { user: { id: "user-1" } },
          error: null,
        }),
    },
    from: (table: string) => {
      const filters = new Map<string, unknown>();
      const sorted: string[] = [];
      let within: { column: string; values: unknown[] } | undefined;
      let nested = false;
      const value = (row: object, column: string) =>
        (row as Record<string, unknown>)[column];
      const rows = () => {
        let source: readonly object[] = [];

        if (table === "stories") {
          source = [STORY_ROW];
        } else if (table === "episodes") {
          source = TEST_EPISODES;
        } else if (table === "episode_endings") {
          source = finishedRows();
        } else if (table === "episode_runs") {
          source = state.runs.map((run) => ({
            updated_at: "2026-08-29T00:10:00.000Z",
            ...run,
          }));
        }

        const kept = source
          .filter((row) =>
            [...filters].every(([name, wanted]) => value(row, name) === wanted)
          )
          .filter(
            (row) =>
              !within || within.values.includes(value(row, within.column))
          );
        const [by] = sorted;
        const ordered = by
          ? [...kept].sort(
              (left, right) =>
                Number(value(left, by)) - Number(value(right, by))
            )
          : kept;

        // 중첩 select는 스토리 한 줄에 그 스토리의 화 목록을 달아 준다.
        return nested
          ? ordered.map((row) => ({
              ...row,
              episodes: TEST_EPISODES.filter(
                (episode) => episode.story_id === value(row, "id")
              ),
            }))
          : ordered;
      };
      /*
        빌더 자신이 Promise다.

        PostgREST 빌더는 필터를 더 걸 수도 있고 그대로 await할 수도 있어서,
        가짜도 두 쓰임을 다 받아야 한다. then 속성을 손으로 다는 대신 진짜
        Promise에 메서드를 붙이면, 결과를 읽는 시점이 마이크로태스크로 밀려
        그 앞의 필터 호출이 모두 반영된 뒤에 행을 고른다.
      */
      const builder: object = Object.assign(
        Promise.resolve().then(() => ({ data: rows(), error: null })),
        {
          eq: (column: string, wanted: unknown) => {
            filters.set(column, wanted);

            return builder;
          },
          in: (column: string, values: unknown[]) => {
            within = { column, values };

            return builder;
          },
          maybeSingle: () =>
            Promise.resolve({ data: rows()[0] ?? null, error: null }),
          order: (column: string) => {
            sorted.push(column);

            return builder;
          },
          select: (projection?: string) => {
            nested = projection?.includes("episodes(") ?? false;

            return builder;
          },
          single: () =>
            Promise.resolve({ data: rows()[0] ?? null, error: null }),
        }
      );

      return builder;
    },
    rpc: (name: string, args: Record<string, unknown>) => {
      if (name === "finish_episode") {
        state.recorded.push(args);

        return Promise.resolve({
          data: state.recordAccepted ?? true,
          error: state.recordError ? { message: state.recordError } : null,
        });
      }

      state.runRecords.push({ args, name });

      if (!state.runError) {
        const index = state.runs.findIndex(
          (candidate) => candidate.episode_id === args.episode_id
        );
        const savedRun = {
          completed_at:
            name === "complete_episode_run" ||
            name === "complete_episode_run_fallback"
              ? new Date().toISOString()
              : null,
          episode_id: String(args.episode_id),
          messages: args.messages as unknown[],
        };

        if (index >= 0) {
          state.runs[index] = savedRun;
        } else {
          state.runs.push(savedRun);
        }
      }

      return Promise.resolve({
        error: state.runError ? { message: state.runError } : null,
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

/**
 * 교정 판정이 돌려줄 답.
 *
 * 장면과 같은 모델을 쓰되 부르는 방법이 달라서, 이 답은 `doStream`이 아니라
 * `doGenerate` 자리에 놓인다. 기본값이 "고칠 것 없음"이라 교정을 시험하지 않는
 * 테스트는 예전과 똑같이 돈다.
 */
interface CorrectionAnswer {
  entries: {
    fixed: string;
    original: string;
    pattern: string;
    why: string;
  }[];
  fixed: string;
}

const NO_CORRECTION: CorrectionAnswer = { entries: [], fixed: "" };

function createMockModel(
  text: string[],
  correction: CorrectionAnswer = NO_CORRECTION
): MockLanguageModelV4 {
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
    doGenerate: {
      content: [{ text: JSON.stringify(correction), type: "text" }],
      finishReason: { raw: undefined, unified: "stop" },
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
      warnings: [],
    },
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

function createStoppedEpisodeRequest(
  episode: string,
  messages: unknown[],
  mode: "preserve" | "replace" = "preserve"
): Request {
  return new Request(`http://localhost${EPISODE_PATH}/${episode}`, {
    body: JSON.stringify({ messages, mode }),
    headers: { "content-type": "application/json" },
    method: "PUT",
  });
}

function createHomeRequest(token?: string): Request {
  return new Request(`http://localhost${EPISODE_PATH}/home`, {
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
      createEpisodeRequest({ episodeId: episodeId(1), messages: [] })
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
        episode_id: episodeId(1),
        kind: "성공",
        language_level: undefined,
        memory_choice: undefined,
        memory_question: undefined,
        memory_relationship: undefined,
        outcome: "원하던 커피를 새로 받아냈다.",
      },
    ]);
  });

  // 기억은 결말과 같은 한 번의 출력에서 나온다. 그래서 장면과 기억이 서로
  // 어긋날 수 없고, 화면에는 결말만 보인다.
  test("stores the story memory the closing scene wrote, without showing it", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here is your iced americano.\n",
        "성공: 원하던 커피를 새로 받아냈다.\n",
        "선택: 영수증을 보여 주며 침착하게 요구했다.\n",
        "관계: Mia가 실수를 인정했다.\n",
        "질문: 내일도 이 카페에 들를지.\n",
        "수준: 중급 초반. 짧고 분명한 문장을 쓴다.",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(state.recorded).toEqual([
      {
        episode_id: episodeId(1),
        kind: "성공",
        language_level: "중급 초반. 짧고 분명한 문장을 쓴다.",
        memory_choice: "영수증을 보여 주며 침착하게 요구했다.",
        memory_question: "내일도 이 카페에 들를지.",
        memory_relationship: "Mia가 실수를 인정했다.",
        outcome: "원하던 커피를 새로 받아냈다.",
      },
    ]);
    expect(body).toContain("Here is your iced americano.");
    expect(body).not.toContain("영수증을 보여 주며");
    expect(body).not.toContain("중급 초반");
  });

  // 지난 선택이 다음 화에 돌아오는 길은 프롬프트 하나다. 사건은 그대로 두고
  // 대사와 관계와 지문만 달라진다.
  test("carries the memory of finished episodes into the next episode's prompt", async () => {
    const model = createMockModel(["Mia: Morning."]);
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          {
            episode: 1,
            kind: "성공",
            memory_choice: "영수증을 보여 주며 침착하게 요구했다.",
            memory_question: "내일도 이 카페에 들를지.",
            memory_relationship: "Mia가 실수를 인정했다.",
            outcome: "원하던 커피를 새로 받아냈다.",
          },
        ])
      ),
      model,
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("My card failed.")] })
    );

    await response.text();

    const system = model.doStreamCalls[0]?.prompt.find(
      (message) => message.role === "system"
    );
    const text = JSON.stringify(system);

    expect(text).toContain("지난 이야기");
    expect(text).toContain("1화 「카페에서 생긴 일」");
    expect(text).toContain("영수증을 보여 주며 침착하게 요구했다.");
    expect(text).toContain("Mia가 실수를 인정했다.");
  });

  // 무대는 어느 결말에서 왔든 같다. 기억이 바꾸는 것은 전개뿐이다.
  test("opens the same authored scene no matter how the last episode ended", async () => {
    const openings = await Promise.all(
      ["성공", "실패"].map(async (kind) => {
        const app = createApp({
          authMiddleware: signedInWith(
            createSeasonState([
              {
                episode: 1,
                kind,
                memory_choice: `${kind}으로 끝냈다.`,
                memory_question: "다음은.",
                memory_relationship: "달라졌다.",
                outcome: `${kind}의 결과.`,
              },
            ])
          ),
          model: createMockModel(["Mia: Morning."]),
        });
        const response = await app.request(
          createEpisodeRequest({ messages: [] })
        );

        const body = await response.text();

        // 응답마다 새로 붙는 메시지 아이디는 장면이 아니다.
        return body
          .split("\n")
          .filter((line) => !line.includes('"type":"start"'))
          .join("\n");
      })
    );

    expect(openings[0]).toContain("it says declined");
    expect(openings[0]).toBe(openings[1]);
  });

  // 줄 머리만 쓰고 내용을 다음 줄로 넘긴 기록은 데이터베이스가 거절한다. 그
  // 실패가 결말 기록 전체를 무너뜨리면 사건이 끝났는데도 화면이 닫히지 않는다.
  test("drops a note line that came in empty instead of failing the ending", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "성공: 받아냈다.\n",
        "선택: 분명하게 요구했다.\n",
        "수준:\n",
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain('"type":"data-ending"');
    expect(state.recorded[0]).toMatchObject({
      language_level: undefined,
      memory_choice: "분명하게 요구했다.",
    });
  });

  // 관찰을 길게 쓰면 열의 길이 제약에 걸린다. 기억이 조금 잘리는 편이 사건이
  // 끝나지 않는 것보다 낫다.
  test("shortens a note line that is too long for the column", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "성공: 받아냈다.\n",
        `선택: ${"가".repeat(400)}`,
      ]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );

    await response.text();

    expect(state.recorded[0]?.memory_choice).toHaveLength(300);
  });

  // 기록 줄이 오지 않아도 그 화는 끝난다. 기억만 비고 다음 화는 열린다.
  test("finishes an episode whose closing scene left no memory", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["성공: 원하던 커피를 새로 받아냈다."]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain('"type":"data-ending"');
    expect(state.recorded[0]).toMatchObject({
      episode_id: episodeId(1),
      memory_choice: undefined,
    });
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
    expect(body).toContain('"number":2');
    expect(body).toContain(`"episodeId":"${episodeId(2)}"`);
  });

  test("sends the story completion instead of a preview after the last episode", async () => {
    const state = createSeasonState(finishedSeason().slice(0, 4));
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["성공: 제대로 인사를 건넸다."]),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Take care.")] })
    );
    const body = await response.text();

    expect(body).toContain("첫 이야기를 끝냈어요");
    expect(body).toContain('"episodeId":null');
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

  test("does not stream a losing ending from another device", async () => {
    const state = createSeasonState();

    state.recordAccepted = false;

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel([
        "Mia: Here you go.\n",
        "실패: 다른 기기보다 늦게 끝났다.",
      ]),
    });
    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Excuse me.")] })
    );
    const body = await response.text();

    expect(body).toContain("Here you go.");
    expect(body).not.toContain('"type":"data-ending"');
    expect(body).toContain('"type":"error"');
    expect(
      state.runRecords.some((record) => record.name === "complete_episode_run")
    ).toBeFalse();
  });
});

/** 카페 1화에서 실제로 나올 법한 교정 하나. */
const WRONG_COFFEE: CorrectionAnswer = {
  entries: [
    {
      fixed: "the wrong coffee",
      original: "wrong coffee",
      pattern: "article-the-specific",
      why: "잘못 나온 그 하나를 짚어 말할 때는 the를 붙여요.",
    },
  ],
  fixed: "I think you gave me the wrong coffee.",
};

describe("대화 중 교정", () => {
  test("몰랐던 표현이 있으면 고친 문장을 장면과 함께 내려보낸다", async () => {
    const app = createApp({
      authMiddleware: bypassAuth,
      model: createMockModel(["Mia: Oh, sorry about that."], WRONG_COFFEE),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I think this is wrong coffee.")],
      })
    );

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(body).toContain('"type":"data-correction"');
    expect(body).toContain("I think you gave me the wrong coffee.");
    expect(body).toContain("article-the-specific");
    // 장면은 교정을 기다리지 않는다. 둘 다 같은 응답에 실려 온다.
    expect(body).toContain("Oh, sorry about that.");
  });

  test("교정이 없는 메시지에는 아무것도 붙이지 않는다", async () => {
    const app = createApp({
      authMiddleware: bypassAuth,
      model: createMockModel(["Mia: Sure."]),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I ordered an iced americano.")],
      })
    );
    const body = await response.text();

    expect(body).not.toContain('"type":"data-correction"');
  });

  // 고친 문장이 원문과 다르지 않으면 배울 것도 없다.
  test("원문과 같은 문장을 돌려주면 교정으로 치지 않는다", async () => {
    const app = createApp({
      authMiddleware: bypassAuth,
      model: createMockModel(["Mia: Sure."], {
        entries: [
          {
            fixed: "Thank you",
            original: "Thank you",
            pattern: "politeness",
            why: "고마움을 전할 때 쓰는 말이에요.",
          },
        ],
        fixed: "Thank you.",
      }),
    });

    const response = await app.request(
      createEpisodeRequest({ messages: [createUserMessage("Thank you.")] })
    );
    const body = await response.text();

    expect(body).not.toContain('"type":"data-correction"');
  });

  // 같은 패턴이 한 에피소드에서 두 번 배울 표현이 되지 않는다. 앱이 이미 받은
  // 키를 보내면 서버는 그 항목을 버린다.
  test("앱이 이미 받은 패턴은 다시 만들지 않는다", async () => {
    const app = createApp({
      authMiddleware: bypassAuth,
      model: createMockModel(["Mia: Sure."], WRONG_COFFEE),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I think this is wrong coffee.")],
        seenPatterns: ["article-the-specific"],
      })
    );
    const body = await response.text();

    expect(body).not.toContain('"type":"data-correction"');
  });

  // 항목마다 다른 키가 있어야 카드가 표현 수만큼 나뉜다. 판정이 같은 패턴을
  // 두 번 쓰면 뒤의 것은 앞의 것과 한 항목으로 겹쳐 사라진다.
  test("한 판정이 같은 패턴을 두 번 써도 항목은 하나만 남는다", async () => {
    const app = createApp({
      authMiddleware: bypassAuth,
      model: createMockModel(["Mia: Sure."], {
        entries: [
          {
            fixed: "the wrong coffee",
            original: "wrong coffee",
            pattern: "article-the-specific",
            why: "잘못 나온 그 하나를 짚을 때는 the를 붙여요.",
          },
          {
            fixed: "the wrong cup",
            original: "wrong cup",
            pattern: "article-the-specific",
            why: "잘못 나온 그 하나를 짚을 때는 the를 붙여요.",
          },
        ],
        fixed: "I think this is the wrong coffee in the wrong cup.",
      }),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [
          createUserMessage("I think this is wrong coffee in wrong cup."),
        ],
      })
    );
    const body = await response.text();

    expect(body).toContain('"type":"data-correction"');
    // 고친 문장은 두 자리를 모두 반영하되, 항목은 앞의 하나만 남는다.
    expect(body).toContain(
      "I think this is the wrong coffee in the wrong cup."
    );
    expect(body).toContain('"original":"wrong coffee"');
    expect(body).not.toContain('"original":"wrong cup"');
  });

  // 빈 문장은 화면에서 빈 띠 하나로 남는다.
  test("고친 문장이 비어 있으면 붙이지 않는다", async () => {
    const app = createApp({
      authMiddleware: bypassAuth,
      model: createMockModel(["Mia: Sure."], {
        entries: [
          {
            fixed: "",
            original: "wrong coffee",
            pattern: "article-the-specific",
            why: "the를 붙여요.",
          },
        ],
        fixed: "",
      }),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I think this is wrong coffee.")],
      })
    );
    const body = await response.text();

    expect(body).not.toContain('"type":"data-correction"');
  });

  // 원문에 없는 조각을 짚는 항목은 화면에서 강조할 자리를 찾지 못한다.
  test("원문에 없는 조각을 짚는 항목은 버린다", async () => {
    const app = createApp({
      authMiddleware: bypassAuth,
      model: createMockModel(["Mia: Sure."], {
        entries: [
          {
            fixed: "the wrong coffee",
            original: "a wrong tea",
            pattern: "article-the-specific",
            why: "the를 붙여요.",
          },
        ],
        fixed: "I think you gave me the wrong coffee.",
      }),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I think this is wrong coffee.")],
      })
    );
    const body = await response.text();

    expect(body).not.toContain('"type":"data-correction"');
  });

  // 교정을 대화 기록에 남길지는 아직 정하지 않은 결정이다. 그때까지 저장되는
  // 장면은 교정이 붙기 전과 똑같아야 한다.
  test("교정은 저장되는 대화 기록에 들어가지 않는다", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: Oh, sorry about that."], WRONG_COFFEE),
    });

    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I think this is wrong coffee.")],
      })
    );

    await response.text();

    const saved = JSON.stringify(state.runs.at(-1)?.messages ?? []);

    expect(saved).toContain("I think this is wrong coffee.");
    expect(saved).not.toContain("data-correction");
    expect(saved).not.toContain("article-the-specific");
  });

  // 교정 판정이 실패해도 이야기는 계속된다.
  test("교정 판정이 실패해도 장면은 그대로 흐른다", async () => {
    const model = createMockModel(["Mia: Oh, sorry about that."]);

    model.doGenerate = () => Promise.reject(new Error("gateway down"));

    const app = createApp({ authMiddleware: bypassAuth, model });
    const response = await app.request(
      createEpisodeRequest({
        messages: [createUserMessage("I think this is wrong coffee.")],
      })
    );

    expect(response.status).toBe(200);

    const body = await response.text();

    expect(body).toContain("Oh, sorry about that.");
    expect(body).not.toContain('"type":"data-correction"');
  });

  // 첫 장면 요청에는 사용자가 쓴 말이 없다.
  test("첫 장면을 여는 요청에는 판정을 부르지 않는다", async () => {
    const model = createMockModel(["Mia: Next in line, please!"]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(createEpisodeRequest({ messages: [] }));

    await response.text();

    expect(model.doGenerateCalls).toHaveLength(0);
  });
});

describe("POST /ai/episode/ask", () => {
  function createAskRequest(body: unknown, token?: string): Request {
    return new Request(`http://localhost${EPISODE_PATH}/ask`, {
      body: JSON.stringify(body),
      headers: {
        "content-type": "application/json",
        ...(token ? { authorization: `Bearer ${token}` } : {}),
      },
      method: "POST",
    });
  }

  const ASKED = {
    entries: WRONG_COFFEE.entries,
    fixed: WRONG_COFFEE.fixed,
    original: "I think this is wrong coffee.",
  };

  test("로그인하지 않은 요청은 받지 않는다", async () => {
    const model = createMockModel(["the를 붙여요."]);
    const app = createApp({
      authMiddleware: createUserAuthMiddleware(),
      model,
    });

    const response = await app.request(
      createAskRequest({
        correction: ASKED,
        messages: [createUserMessage("the를 왜 붙여요?")],
      })
    );

    expect(response.status).toBe(401);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("교정 없이 온 요청은 받지 않는다", async () => {
    const model = createMockModel(["the를 붙여요."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createAskRequest({ messages: [createUserMessage("the를 왜 붙여요?")] })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  test("물을 말이 없는 요청은 받지 않는다", async () => {
    const model = createMockModel(["the를 붙여요."]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createAskRequest({ correction: ASKED, messages: [] })
    );

    expect(response.status).toBe(400);
    expect(model.doStreamCalls).toHaveLength(0);
  });

  // 시트의 답은 이 교정과 이 대화 안에서 나온다. 둘 다 모델에게 간다.
  test("교정과 에피소드 스냅샷을 문맥으로 답한다", async () => {
    const model = createMockModel([
      "잘못 나온 그 커피 하나를 짚어 말하기 때문이에요.",
    ]);
    const app = createApp({ authMiddleware: bypassAuth, model });

    const response = await app.request(
      createAskRequest({
        correction: ASKED,
        messages: [
          {
            id: "s1",
            parts: [
              { data: { name: "Mia" }, id: "speaker-1", type: "data-speaker" },
              { text: "Next in line, please!", type: "text" },
            ],
            role: "assistant",
          },
          createUserMessage("the를 왜 붙여요?"),
        ],
      })
    );

    expect(response.status).toBe(200);

    const body = await response.text();
    const [call] = model.doStreamCalls;
    const system = call?.prompt.find((message) => message.role === "system");
    const prompt = JSON.stringify(call?.prompt);

    expect(JSON.stringify(system)).toContain("I think this is wrong coffee.");
    expect(JSON.stringify(system)).toContain(
      "I think you gave me the wrong coffee."
    );
    expect(prompt).toContain("Next in line, please!");
    expect(body).toContain("잘못 나온 그 커피 하나를 짚어 말하기 때문이에요.");
    // 시트는 장면 파서를 지나지 않는다. 답은 말풍선이 아니라 평범한 답변이다.
    expect(body).not.toContain('"type":"data-speaker"');
  });
});

interface HomeViewBody {
  continueCard: {
    episodeId: string;
    episodeNumber: number;
    episodeTitle: string;
    finished: number;
    hook: string;
    preview: string;
    resuming: boolean;
    storyId: string;
    title: string;
    total: number;
  } | null;
  firstTime: boolean;
  others: { storyId: string }[];
}

describe("GET /ai/episode/home", () => {
  test("rejects a request with no access token", async () => {
    const app = createApp({ authMiddleware: createUserAuthMiddleware() });

    const response = await app.request(createHomeRequest());

    expect(response.status).toBe(401);
  });

  // 처음 온 사람의 홈. 제품이 정한 첫 스토리의 1화가 카드로 선다.
  test("points at the first episode before anything is started", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(createHomeRequest());
    const view = (await response.json()) as HomeViewBody;

    expect(response.status).toBe(200);
    expect(view.firstTime).toBe(true);
    expect(view.others).toEqual([]);
    expect(view.continueCard).toMatchObject({
      episodeNumber: 1,
      episodeTitle: "카페에서 생긴 일",
      finished: 0,
      resuming: false,
      storyId: STORY_ID,
      total: 5,
    });
  });

  // 화 사이의 홈. 끝낸 만큼 진행이 차고 다음 화를 가리킨다.
  test("counts what is finished and points at the next episode", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
        ])
      ),
    });

    const response = await app.request(createHomeRequest());
    const view = (await response.json()) as HomeViewBody;

    expect(view.firstTime).toBe(false);
    expect(view.continueCard).toMatchObject({
      episodeNumber: 2,
      episodeTitle: "계산이 꼬인 아침",
      finished: 1,
      resuming: false,
    });
  });

  // 결말이 나지 않은 장면이 남아 있으면 시작이 아니라 이어 하기다.
  test("resumes the episode whose scene is still open", async () => {
    const state = createSeasonState();
    state.runs.push({
      completed_at: null,
      episode_id: episodeId(1),
      messages: [],
    });
    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(createHomeRequest());
    const view = (await response.json()) as HomeViewBody;

    expect(view.firstTime).toBe(false);
    expect(view.continueCard).toMatchObject({
      episodeNumber: 1,
      resuming: true,
    });
  });

  test("has no card left once every story is finished", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState(finishedSeason())),
    });

    const response = await app.request(createHomeRequest());
    const view = (await response.json()) as HomeViewBody;

    expect(view.continueCard).toBeNull();
    expect(view.others).toEqual([]);
  });

  // 결말 낱말은 서버 안에서만 쓴다. 홈으로 나가는 값에 실리지 않는다.
  test("never sends the ending word to the screen", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
        ])
      ),
    });

    const response = await app.request(createHomeRequest());

    expect(await response.text()).not.toContain("성공");
  });
});

describe("GET /ai/episode/stories", () => {
  test("lists every official story with its hook, cover and progress", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
        ])
      ),
    });

    const response = await app.request(`${EPISODE_PATH}/stories`);
    const view = (await response.json()) as {
      stories: {
        coverEmoji: string;
        coverImagePath: string | null;
        finished: number;
        hook: string;
        storyId: string;
        title: string;
        total: number;
      }[];
    };

    expect(response.status).toBe(200);
    expect(view.stories).toEqual([
      {
        coverEmoji: "☕",
        coverImagePath: null,
        finished: 1,
        hook: "늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요",
        storyId: STORY_ID,
        title: "Mia의 카페",
        total: 5,
      },
    ]);
  });
});

describe("GET /ai/episode/stories/:storyId", () => {
  test("answers 404 for a story that does not exist", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(
      `${EPISODE_PATH}/stories/10000000-0000-4000-8000-000000000009`
    );

    expect(response.status).toBe(404);
  });

  // 끝낸 화는 결과 한 줄을, 다음 화는 예고를, 그 뒤는 제목만 남긴다.
  test("opens the finished result, the next preview and nothing more", async () => {
    const app = createApp({
      authMiddleware: signedInWith(
        createSeasonState([
          { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
        ])
      ),
    });

    const response = await app.request(`${EPISODE_PATH}/stories/${STORY_ID}`);
    const view = (await response.json()) as {
      episodes: {
        hasTranscript: boolean;
        number: number;
        outcome: string | null;
        preview: string | null;
        state: string;
        title: string;
      }[];
      intro: string;
      next: { episodeId: string; number: number; resuming: boolean } | null;
    };

    expect(response.status).toBe(200);
    expect(view.next).toEqual({
      episodeId: episodeId(2),
      number: 2,
      resuming: false,
    });
    expect(view.episodes[0]).toMatchObject({
      hasTranscript: false,
      outcome: "새 잔을 받아냈다.",
      preview: null,
      state: "finished",
    });
    expect(view.episodes[1]).toMatchObject({
      outcome: null,
      preview: "카드가 자꾸 튕겨요.",
      state: "next",
    });
    expect(view.episodes[2]).toMatchObject({
      outcome: null,
      preview: null,
      state: "locked",
      title: "자리를 맡아 둔 사이에",
    });
  });

  test("has no next episode left once the story is finished", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState(finishedSeason())),
    });

    const response = await app.request(`${EPISODE_PATH}/stories/${STORY_ID}`);
    const view = (await response.json()) as {
      finished: number;
      next: unknown;
    };

    expect(view.next).toBeNull();
    expect(view.finished).toBe(5);
  });
});

describe("story content database contract", () => {
  test("serves the home view from the database", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(`${EPISODE_PATH}/home`);

    expect(response.status).toBe(200);
  });

  test("opens a saved episode by its stable id", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(
      `${EPISODE_PATH}/11000000-0000-4000-8000-000000000001`
    );

    expect(response.status).toBe(200);
  });

  // 경로에서 오는 값이라 모양조차 보장되지 않는다. uuid가 아닌 화 id는 없는
  // 화이지 서버 오류가 아니다.
  test("answers 404 for an episode id that is not a uuid", async () => {
    const app = createApp({
      authMiddleware: signedInWith(createSeasonState()),
    });

    const response = await app.request(`${EPISODE_PATH}/not-a-uuid`);

    expect(response.status).toBe(404);
  });

  test("saves a running scene after a model turn", async () => {
    const state = createSeasonState();
    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["Mia: What did you order?"]),
    });

    const response = await app.request(
      createEpisodeRequest({
        episodeId: "11000000-0000-4000-8000-000000000001",
        messages: [createUserMessage("This is wrong.")],
      })
    );

    await response.text();

    expect(state.runRecords.map((record) => record.name)).toEqual([
      "save_episode_run",
      "save_episode_run",
    ]);
    expect(state.runs[0]?.messages).toHaveLength(2);
  });

  test("saves a stopped active scene through the guarded fallback", async () => {
    const state = createSeasonState();
    const messages = [createUserMessage("This is wrong.")];
    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(
      createStoppedEpisodeRequest(episodeId(1), messages)
    );

    expect(response.status).toBe(204);
    expect(state.runRecords.at(-1)).toMatchObject({
      args: { episode_id: episodeId(1), messages },
      name: "save_episode_run_fallback",
    });
  });

  test("keeps a regenerated answer's intentional transcript cut", async () => {
    const state = createSeasonState();
    const messages = [createUserMessage("Please try again.")];
    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(
      createStoppedEpisodeRequest(episodeId(1), messages, "replace")
    );

    expect(response.status).toBe(204);
    expect(state.runRecords.at(-1)).toMatchObject({
      args: { episode_id: episodeId(1), messages },
      name: "save_episode_run",
    });
  });

  test("completes a stopped ending through the guarded fallback", async () => {
    const outcome = "새 잔을 받아냈다.";
    const state = createSeasonState([{ episode: 1, kind: "성공", outcome }]);
    const messages = [
      {
        id: "ending-1",
        parts: [
          { text: "Here you go.", type: "text" },
          { data: { kind: "성공", outcome }, type: "data-ending" },
        ],
        role: "assistant",
      },
    ];
    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(
      createStoppedEpisodeRequest(episodeId(1), messages)
    );

    expect(response.status).toBe(204);
    expect(state.runRecords.at(-1)).toMatchObject({
      args: { episode_id: episodeId(1), messages },
      name: "complete_episode_run_fallback",
    });
  });

  test("returns the account's saved active scene for another app launch", async () => {
    const state = createSeasonState();

    state.runs.push({
      completed_at: null,
      episode_id: episodeId(1),
      messages: [createUserMessage("This is wrong.")],
    });

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(`${EPISODE_PATH}/${episodeId(1)}`);
    const session = (await response.json()) as {
      messages: unknown[];
      readOnly: boolean;
    };
    const [saved] = state.runs;

    if (!saved) {
      throw new Error("The saved test run is missing.");
    }

    expect(response.status).toBe(200);
    expect(session.messages).toEqual(saved.messages);
    expect(session.readOnly).toBeFalse();
  });

  test("returns a completed transcript as read-only", async () => {
    const state = createSeasonState([
      { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
    ]);

    state.runs.push({
      completed_at: "2026-08-28T00:00:00.000Z",
      episode_id: episodeId(1),
      messages: [createUserMessage("I ordered an iced americano.")],
    });

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(`${EPISODE_PATH}/${episodeId(1)}`);
    const session = (await response.json()) as {
      messages: unknown[];
      readOnly: boolean;
    };

    expect(response.status).toBe(200);
    expect(session.messages).toHaveLength(1);
    expect(session.readOnly).toBeTrue();
  });

  test("does not offer a transcript for an ending migrated without messages", async () => {
    const state = createSeasonState([
      { episode: 1, kind: "성공", outcome: "옛 결말" },
    ]);
    const app = createApp({ authMiddleware: signedInWith(state) });

    const response = await app.request(`${EPISODE_PATH}/${episodeId(1)}`);

    expect(response.status).toBe(404);
  });

  test("marks only completed conversations as reviewable on the story detail", async () => {
    const state = createSeasonState([
      { episode: 1, kind: "성공", outcome: "새 잔을 받아냈다." },
      { episode: 2, kind: "타협", outcome: "현금으로 냈다." },
    ]);

    state.runs.push({
      completed_at: "2026-08-28T00:00:00.000Z",
      episode_id: episodeId(1),
      messages: [createUserMessage("Done")],
    });

    const app = createApp({ authMiddleware: signedInWith(state) });
    const response = await app.request(`${EPISODE_PATH}/stories/${STORY_ID}`);
    const view = (await response.json()) as {
      episodes: { hasTranscript: boolean }[];
    };

    expect(view.episodes[0]?.hasTranscript).toBeTrue();
    expect(view.episodes[1]?.hasTranscript).toBeFalse();
  });

  test("keeps playing when an active-scene save fails", async () => {
    const state = createSeasonState();

    state.runError = "connection refused";

    const model = createMockModel(["Mia: What did you order?"]);
    const app = createApp({ authMiddleware: signedInWith(state), model });
    const response = await app.request(
      createEpisodeRequest({
        episodeId: episodeId(1),
        messages: [createUserMessage("This is wrong.")],
      })
    );
    const body = await response.text();

    expect(response.status).toBe(200);
    expect(body).toContain("What did you order?");
    expect(model.doStreamCalls).toHaveLength(1);
  });

  test("keeps the ending when completing its transcript fails", async () => {
    const state = createSeasonState();

    state.runError = "connection refused";

    const app = createApp({
      authMiddleware: signedInWith(state),
      model: createMockModel(["성공: 원하던 커피를 새로 받아냈다."]),
    });
    const response = await app.request(
      createEpisodeRequest({
        episodeId: episodeId(1),
        messages: [createUserMessage("This is wrong.")],
      })
    );
    const body = await response.text();

    expect(state.recorded).toHaveLength(1);
    expect(body).toContain('"type":"data-ending"');
    expect(
      state.runRecords.some((record) => record.name === "complete_episode_run")
    ).toBeTrue();
  });
});
