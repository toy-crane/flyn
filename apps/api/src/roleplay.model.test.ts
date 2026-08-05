import { describe, expect, it } from "bun:test";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import type { JudgmentUpdate } from "./judgment";
import {
  createGatewayRoleplayModel,
  type EpisodeMessage,
  needsTranslation,
  ROLEPLAY_MODEL_ID,
  type RoleplayEpisode,
  RoleplayHttpError,
  type RoleplayModel,
  TRANSLATION_MODEL_ID,
} from "./roleplay";

const EPISODE: RoleplayEpisode = {
  goals: [
    { achievedAt: null, position: 1, sentence: "오늘의 원두 추천 받기" },
    {
      achievedAt: null,
      position: 2,
      sentence: "우유를 오트밀크로 바꿔 주문하기",
    },
    { achievedAt: null, position: 3, sentence: "근처 가볼 만한 곳 물어보기" },
  ],
  id: "episode-1",
  partnerRole: "바리스타 Maya",
  scenarioDescription: "여행 중 들어간 작은 카페예요.",
  scenarioTitle: "포틀랜드 카페에서 첫 주문",
  status: "active",
  turnLimit: 20,
  userRole: "처음 방문한 여행객",
};

const MESSAGES: EpisodeMessage[] = [
  {
    content: "Sound good. Can you make it oat milk?",
    createdAt: "2026-08-05T00:00:00.000Z",
    episodeId: "episode-1",
    id: "user-1",
    role: "user",
    status: "complete",
  },
];

const DELIVERED = {
  messageId: "user-1",
  text: "Sound good. Can you make it oat milk?",
};

const USAGE = {
  inputTokens: {
    cacheRead: undefined,
    cacheWrite: undefined,
    noCache: 3,
    total: 3,
  },
  outputTokens: {
    reasoning: undefined,
    text: 4,
    total: 4,
  },
};

function createTextModel({
  chunkDelayInMs = null,
  finishReason = "stop",
  initialDelayInMs = null,
  text = "Sure thing — one oat flat white coming up.",
}: {
  chunkDelayInMs?: number | null;
  finishReason?: "length" | "stop";
  initialDelayInMs?: number | null;
  text?: string;
} = {}) {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunkDelayInMs,
        chunks: [
          { id: "text-1", type: "text-start" as const },
          { delta: text, id: "text-1", type: "text-delta" as const },
          { id: "text-1", type: "text-end" as const },
          {
            finishReason: { raw: undefined, unified: finishReason },
            logprobs: undefined,
            type: "finish" as const,
            usage: USAGE,
          },
        ],
        initialDelayInMs,
      }),
    }),
  });
}

function createErrorModel() {
  return new MockLanguageModelV4({
    doStream: () =>
      Promise.reject(
        new Error("secret 응답 본문과 token이 포함된 provider 오류")
      ),
  });
}

function createTranslationModel(text: string) {
  return new MockLanguageModelV4({
    doGenerate: () =>
      Promise.resolve({
        content: [{ text, type: "text" as const }],
        finishReason: { raw: undefined, unified: "stop" as const },
        usage: USAGE,
        warnings: [],
      }),
  });
}

async function generate(
  model: RoleplayModel,
  {
    judgment = Promise.resolve(null),
    onResponse,
    signal = new AbortController().signal,
  }: {
    judgment?: Promise<JudgmentUpdate | null>;
    onResponse?: () => void;
    signal?: AbortSignal;
  } = {}
) {
  let finish: { isAborted: boolean; text: string } | undefined;
  const response = await model.generate({
    assistantMessageId: "assistant-1",
    delivered: DELIVERED,
    episode: EPISODE,
    judgment,
    messages: MESSAGES,
    onFinish: (result) => {
      finish = result;
      return Promise.resolve();
    },
    signal,
  });

  onResponse?.();
  const body = await response.text();

  return { body, finish };
}

function systemPrompt(calls: { prompt: unknown }[]) {
  const [call] = calls;
  const prompt = (call?.prompt ?? []) as {
    content: unknown;
    role: string;
  }[];

  return prompt
    .filter((message) => message.role === "system")
    .map((message) => String(message.content))
    .join("\n");
}

describe("롤플레잉 모델 고정", () => {
  it("역할마다 모델 ID를 코드에 따로 적는다", () => {
    const previousModel = process.env.AI_MODEL;

    try {
      process.env.AI_MODEL = "ignored/provider-model";

      expect(ROLEPLAY_MODEL_ID).toBe("openai/gpt-5.6-luna");
      expect(TRANSLATION_MODEL_ID).toBe("openai/gpt-5.6-luna");
    } finally {
      if (previousModel === undefined) {
        delete process.env.AI_MODEL;
      } else {
        process.env.AI_MODEL = previousModel;
      }
    }
  });
});

describe("롤플레잉 응답", () => {
  it("상황·역할·목표와 선해 지침을 프롬프트에 나른다", async () => {
    const languageModel = createTextModel();
    const model = createGatewayRoleplayModel({
      logger: () => undefined,
      model: languageModel,
    });

    await generate(model);
    const instructions = systemPrompt(languageModel.doStreamCalls);

    expect(instructions).toContain("포틀랜드 카페에서 첫 주문");
    expect(instructions).toContain("바리스타 Maya");
    expect(instructions).toContain("처음 방문한 여행객");
    expect(instructions).toContain("우유를 오트밀크로 바꿔 주문하기");
    expect(instructions).toContain("의도를 선해해");
    expect(instructions).toContain("정말 알아들을 수 없을 때만");
    // 첨삭은 판정 호출의 몫이다. 롤플레잉 프롬프트가 함께 시키지 않는다.
    expect(instructions).toContain("고쳐 주지 않고");
  });

  it("사람이 기다리는 호출이라 가장 낮은 reasoning으로 부른다", async () => {
    const languageModel = createTextModel();
    const model = createGatewayRoleplayModel({
      logger: () => undefined,
      model: languageModel,
    });

    await generate(model);

    expect(languageModel.doStreamCalls[0]?.reasoning).toBe("low");
  });

  it("전달된 문장을 응답과 같은 스트림에 얹어 보낸다", async () => {
    const model = createGatewayRoleplayModel({
      logger: () => undefined,
      model: createTextModel(),
    });

    const { body, finish } = await generate(model);

    expect(body).toContain('"type":"data-delivered"');
    expect(body).toContain("Sound good. Can you make it oat milk?");
    expect(finish).toEqual({
      isAborted: false,
      text: "Sure thing — one oat flat white coming up.",
    });
  });

  it("저장된 응답을 재생할 때도 전달된 문장을 함께 보낸다", async () => {
    const model = createGatewayRoleplayModel({ logger: () => undefined });

    const response = await model.replay({
      assistantMessageId: "assistant-1",
      delivered: DELIVERED,
      judgment: Promise.resolve(null),
      status: "complete",
      text: "Sure thing.",
    });
    const body = await response.text();

    expect(body).toContain('"type":"data-delivered"');
    expect(body).toContain("Sound good. Can you make it oat milk?");
    expect(body).toContain("Sure thing.");
  });

  it("첫 content chunk가 제한 시간 안에 없으면 응답을 중단한다", async () => {
    const model = createGatewayRoleplayModel({
      limits: { chunkMs: 100, firstChunkMs: 5, totalMs: 100 },
      logger: () => undefined,
      model: createTextModel({ initialDelayInMs: 30 }),
    });

    const { finish } = await generate(model);

    expect(finish).toEqual({ isAborted: true, text: "" });
  });

  it("정상 완료를 본문 없이 한 번 기록한다", async () => {
    const events: unknown[] = [];
    const times = [100, 135];
    const model = createGatewayRoleplayModel({
      createRequestId: () => "request-opaque-1",
      logger: (event) => {
        events.push(event);
      },
      model: createTextModel(),
      now: () => times.shift() ?? 135,
    });

    await generate(model);

    expect(events).toEqual([
      {
        durationMs: 35,
        event: "roleplay.model.completed",
        finishReason: "stop",
        modelId: "mock-model-id",
        outcome: "complete",
        requestId: "request-opaque-1",
        role: "roleplay.reply",
        usage: { inputTokens: 3, outputTokens: 4, totalTokens: 7 },
      },
    ]);
    expect(JSON.stringify(events)).not.toContain("oat milk");
  });

  it("provider 오류를 민감한 원문 없이 한 번 기록한다", async () => {
    const events: unknown[] = [];
    const model = createGatewayRoleplayModel({
      createRequestId: () => "request-error",
      logger: (event) => {
        events.push(event);
      },
      model: createErrorModel(),
      now: () => 60,
    });

    const { finish } = await generate(model);

    expect(finish).toEqual({ isAborted: false, text: "" });
    expect(events).toEqual([
      expect.objectContaining({
        finishReason: "error",
        outcome: "error",
        role: "roleplay.reply",
      }),
    ]);
    expect(JSON.stringify(events)).not.toContain("secret");
    expect(JSON.stringify(events)).not.toContain("token");
  });
});

const ACHIEVED: JudgmentUpdate = {
  goals: [
    {
      achievedAt: "2026-08-05T00:00:05.000Z",
      messageId: "user-1",
      position: 1,
    },
  ],
};

/** lib 사이의 ReadableStream 타입 차이를 피해 읽는 모양만 요구한다. */
interface ChunkReader {
  read: () => Promise<{ done: boolean; value?: Uint8Array }>;
}

async function readUntil(reader: ChunkReader, marker: string) {
  const decoder = new TextDecoder();
  let seen = "";
  let done = false;

  while (!(done || seen.includes(marker))) {
    // biome-ignore lint/performance/noAwaitInLoops: 스트림은 앞 청크를 받아야 다음 청크가 온다.
    const { done: finished, value } = await reader.read();

    done = finished;
    seen += decoder.decode(value, { stream: true });
  }

  return seen;
}

async function drain(reader: ChunkReader) {
  const decoder = new TextDecoder();
  let rest = "";
  let done = false;

  while (!done) {
    // biome-ignore lint/performance/noAwaitInLoops: 스트림은 앞 청크를 받아야 다음 청크가 온다.
    const { done: finished, value } = await reader.read();

    done = finished;
    rest += decoder.decode(value, { stream: true });
  }

  return rest;
}

describe("같은 스트림에 얹히는 판정", () => {
  it("판정을 롤플레잉 응답과 같은 스트림에 data part로 얹는다", async () => {
    const model = createGatewayRoleplayModel({
      logger: () => undefined,
      model: createTextModel(),
    });

    const { body } = await generate(model, {
      judgment: Promise.resolve(ACHIEVED),
    });

    expect(body).toContain('"type":"data-judgment"');
    expect(body).toContain('"position":1');
    expect(body).toContain('"messageId":"user-1"');
  });

  it("판정이 늦게 와도 대화가 먼저 흐르고 응답은 그 전에 저장된다", async () => {
    let release: () => void = () => undefined;
    const judgment = new Promise<JudgmentUpdate | null>((resolve) => {
      release = () => resolve(ACHIEVED);
    });
    let finish: { isAborted: boolean; text: string } | undefined;
    const model = createGatewayRoleplayModel({
      logger: () => undefined,
      model: createTextModel(),
    });
    const response = await model.generate({
      assistantMessageId: "assistant-1",
      delivered: DELIVERED,
      episode: EPISODE,
      judgment,
      messages: MESSAGES,
      onFinish: (result) => {
        finish = result;
        return Promise.resolve();
      },
      signal: new AbortController().signal,
    });
    const reader = (
      response.body as unknown as { getReader: () => ChunkReader }
    ).getReader();

    const beforeJudgment = await readUntil(reader, '"type":"finish"');
    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(beforeJudgment).toContain("one oat flat white");
    expect(beforeJudgment).not.toContain("data-judgment");
    // 응답 저장은 판정을 기다리지 않는다.
    expect(finish).toEqual({
      isAborted: false,
      text: "Sure thing — one oat flat white coming up.",
    });

    release();

    expect(await drain(reader)).toContain('"type":"data-judgment"');
  });

  it("판정이 실패하거나 채운 목표가 없으면 아무것도 얹지 않는다", async () => {
    const model = createGatewayRoleplayModel({
      logger: () => undefined,
      model: createTextModel(),
    });

    const failed = await generate(model, { judgment: Promise.resolve(null) });
    const empty = await generate(model, {
      judgment: Promise.resolve({ goals: [] }),
    });

    expect(failed.body).not.toContain("data-judgment");
    expect(failed.body).toContain("one oat flat white");
    expect(empty.body).not.toContain("data-judgment");
  });

  it("저장된 응답을 재생할 때도 판정이 같은 스트림에 온다", async () => {
    const model = createGatewayRoleplayModel({ logger: () => undefined });

    const response = await model.replay({
      assistantMessageId: "assistant-1",
      delivered: DELIVERED,
      judgment: Promise.resolve(ACHIEVED),
      status: "complete",
      text: "Sure thing.",
    });

    expect(await response.text()).toContain('"type":"data-judgment"');
  });
});

describe("한글 번역", () => {
  it("한글이 섞여 있을 때만 번역을 거친다", () => {
    expect(needsTranslation("오늘 커피 뭐가 좋아요?")).toBe(true);
    expect(needsTranslation("I want 커피 two cups")).toBe(true);
    expect(needsTranslation("Could you recommend today's coffee?")).toBe(false);
  });

  it("상황과 역할을 나르고 옮긴 문장만 남긴다", async () => {
    const languageModel = createTranslationModel(
      '  "Could you recommend today\'s coffee?"  '
    );
    const model = createGatewayRoleplayModel({
      logger: () => undefined,
      translationModel: languageModel,
    });

    const delivered = await model.translate({
      episode: EPISODE,
      signal: new AbortController().signal,
      text: "오늘 커피 뭐가 좋아요?",
    });
    const instructions = systemPrompt(languageModel.doGenerateCalls);

    expect(delivered).toBe("Could you recommend today's coffee?");
    expect(instructions).toContain("포틀랜드 카페에서 첫 주문");
    expect(instructions).toContain("처음 방문한 여행객");
    expect(instructions).toContain("내용을 더하거나 빼지 않는다");
    expect(languageModel.doGenerateCalls[0]?.reasoning).toBe("low");
  });

  it("빈 번역은 전달하지 않고 재시도 가능한 오류로 만든다", async () => {
    const model = createGatewayRoleplayModel({
      logger: () => undefined,
      translationModel: createTranslationModel("   "),
    });

    await expect(
      model.translate({
        episode: EPISODE,
        signal: new AbortController().signal,
        text: "오늘 커피 뭐가 좋아요?",
      })
    ).rejects.toMatchObject({ retryable: true, status: 500 });
  });

  it("번역 호출 실패를 재시도 가능한 오류로 기록한다", async () => {
    const events: unknown[] = [];
    const model = createGatewayRoleplayModel({
      createRequestId: () => "request-translation-error",
      logger: (event) => {
        events.push(event);
      },
      now: () => 10,
      translationModel: new MockLanguageModelV4({
        doGenerate: () => Promise.reject(new Error("gateway unavailable")),
      }),
    });

    const failure = await model
      .translate({
        episode: EPISODE,
        signal: new AbortController().signal,
        text: "오늘 커피 뭐가 좋아요?",
      })
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(RoleplayHttpError);
    expect(failure).toMatchObject({ retryable: true, status: 500 });
    expect(events).toEqual([
      expect.objectContaining({
        outcome: "error",
        requestId: "request-translation-error",
        role: "roleplay.translation",
      }),
    ]);
  });
});
