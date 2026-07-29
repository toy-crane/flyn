import { describe, expect, it } from "bun:test";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import {
  CHAT_MODEL_ID,
  type ChatMessage,
  type ChatModel,
  createGatewayChatModel,
  selectChatModel,
} from "./chat";

const MESSAGES: ChatMessage[] = [
  {
    chatRoomId: "room-1",
    content: "질문",
    createdAt: "2026-07-29T00:00:00.000Z",
    id: "user-1",
    role: "user",
    status: "complete",
  },
];

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
  text = "응답",
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

function createPartialErrorModel() {
  return new MockLanguageModelV4({
    doStream: async () => ({
      stream: simulateReadableStream({
        chunkDelayInMs: null,
        chunks: [
          { id: "text-1", type: "text-start" as const },
          {
            delta: "오류 전 부분 응답",
            id: "text-1",
            type: "text-delta" as const,
          },
          {
            error: new Error("provider stream failed"),
            type: "error" as const,
          },
        ],
        initialDelayInMs: null,
      }),
    }),
  });
}

async function generate(
  model: ChatModel,
  {
    onResponse,
    signal = new AbortController().signal,
  }: {
    onResponse?: () => void;
    signal?: AbortSignal;
  } = {}
) {
  let finish:
    | {
        isAborted: boolean;
        text: string;
      }
    | undefined;
  const response = await model.generate({
    assistantMessageId: "assistant-1",
    messages: MESSAGES,
    onFinish: (result) => {
      finish = result;
      return Promise.resolve();
    },
    signal,
  });

  onResponse?.();
  await response.text();

  return finish;
}

describe("Gateway 채팅 모델 선택", () => {
  it("환경 변수와 무관하게 제품 모델을 고정한다", () => {
    const previousModel = process.env.AI_MODEL;

    try {
      process.env.AI_MODEL = "ignored/provider-model";

      expect(selectChatModel()).toBe("inclusionai/ling-3.0-flash-free");
      expect(CHAT_MODEL_ID).toBe("inclusionai/ling-3.0-flash-free");
    } finally {
      if (previousModel === undefined) {
        delete process.env.AI_MODEL;
      } else {
        process.env.AI_MODEL = previousModel;
      }
    }
  });

  it("자동 테스트가 주입한 모델을 유지한다", () => {
    const model = createTextModel();

    expect(selectChatModel(model)).toBe(model);
  });
});

describe("Gateway 채팅 모델 제한", () => {
  it("출력을 4,000 tokens로 제한하고 length 응답을 완료로 보존한다", async () => {
    const languageModel = createTextModel({
      finishReason: "length",
      text: "상한까지 생성한 응답",
    });
    const model = createGatewayChatModel({
      logger: () => undefined,
      model: languageModel,
    });

    const finish = await generate(model);

    expect(languageModel.doStreamCalls[0]?.maxOutputTokens).toBe(4000);
    expect(finish).toEqual({
      isAborted: false,
      text: "상한까지 생성한 응답",
    });
  });

  it("첫 content chunk가 제한 시간 안에 없으면 응답을 중단한다", async () => {
    const languageModel = createTextModel({ initialDelayInMs: 30 });
    const model = createGatewayChatModel({
      limits: {
        chunkMs: 100,
        firstChunkMs: 5,
        totalMs: 100,
      },
      logger: () => undefined,
      model: languageModel,
    });

    const finish = await generate(model);

    expect(finish).toEqual({
      isAborted: true,
      text: "",
    });
  });

  it("content chunk 사이가 제한 시간을 넘으면 부분 응답에서 중단한다", async () => {
    const languageModel = createTextModel({
      chunkDelayInMs: 20,
      text: "부분 응답",
    });
    const model = createGatewayChatModel({
      limits: {
        chunkMs: 5,
        firstChunkMs: 100,
        totalMs: 100,
      },
      logger: () => undefined,
      model: languageModel,
    });

    const finish = await generate(model);

    expect(finish).toEqual({
      isAborted: true,
      text: "부분 응답",
    });
  });

  it("전체 호출 시간이 제한을 넘으면 첫 chunk 전에도 중단한다", async () => {
    const languageModel = createTextModel({ initialDelayInMs: 30 });
    const model = createGatewayChatModel({
      limits: {
        chunkMs: 100,
        firstChunkMs: 100,
        totalMs: 5,
      },
      logger: () => undefined,
      model: languageModel,
    });

    const finish = await generate(model);

    expect(finish).toEqual({
      isAborted: true,
      text: "",
    });
  });
});

describe("Gateway 채팅 모델 운영 이벤트", () => {
  it("정상 완료를 본문 없이 한 번 기록한다", async () => {
    const events: unknown[] = [];
    const times = [100, 135];
    const model = createGatewayChatModel({
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
        event: "chat.model.completed",
        finishReason: "stop",
        modelId: "mock-model-id",
        outcome: "complete",
        requestId: "request-opaque-1",
        usage: {
          inputTokens: 3,
          outputTokens: 4,
          totalTokens: 7,
        },
      },
    ]);
    expect(JSON.stringify(events)).not.toContain("질문");
    expect(JSON.stringify(events)).not.toContain("응답");
  });

  it("요청 signal 중단을 사용자 중단으로 한 번 기록한다", async () => {
    const controller = new AbortController();
    const events: unknown[] = [];
    const times = [10, 19];
    const model = createGatewayChatModel({
      createRequestId: () => "request-user-stop",
      limits: {
        chunkMs: 100,
        firstChunkMs: 100,
        totalMs: 100,
      },
      logger: (event) => {
        events.push(event);
      },
      model: createTextModel({ initialDelayInMs: 30 }),
      now: () => times.shift() ?? 19,
    });

    const finish = await generate(model, {
      onResponse: () => {
        controller.abort();
      },
      signal: controller.signal,
    });

    expect(finish).toEqual({
      isAborted: true,
      text: "",
    });
    expect(events).toEqual([
      {
        durationMs: 9,
        event: "chat.model.completed",
        finishReason: null,
        modelId: "mock-model-id",
        outcome: "user_stopped",
        requestId: "request-user-stop",
        usage: {
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
        },
      },
    ]);
  });

  it("SDK timeout을 사용자 중단과 구분해 한 번 기록한다", async () => {
    const events: unknown[] = [];
    const times = [20, 27];
    const model = createGatewayChatModel({
      createRequestId: () => "request-timeout",
      limits: {
        chunkMs: 100,
        firstChunkMs: 5,
        totalMs: 100,
      },
      logger: (event) => {
        events.push(event);
      },
      model: createTextModel({ initialDelayInMs: 30 }),
      now: () => times.shift() ?? 27,
    });

    await generate(model);

    expect(events).toEqual([
      {
        durationMs: 7,
        event: "chat.model.completed",
        finishReason: null,
        modelId: "mock-model-id",
        outcome: "timeout",
        requestId: "request-timeout",
        usage: {
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
        },
      },
    ]);
  });

  it("출력 상한 도달을 length finish reason으로 기록한다", async () => {
    const events: unknown[] = [];
    const model = createGatewayChatModel({
      createRequestId: () => "request-length",
      logger: (event) => {
        events.push(event);
      },
      model: createTextModel({ finishReason: "length" }),
      now: () => 50,
    });

    await generate(model);

    expect(events).toEqual([
      expect.objectContaining({
        finishReason: "length",
        outcome: "complete",
        requestId: "request-length",
      }),
    ]);
  });

  it("provider 오류를 민감한 원문 없이 한 번 기록한다", async () => {
    const events: unknown[] = [];
    const model = createGatewayChatModel({
      createRequestId: () => "request-error",
      logger: (event) => {
        events.push(event);
      },
      model: createErrorModel(),
      now: () => 60,
    });

    const finish = await generate(model);

    expect(finish).toEqual({
      isAborted: false,
      text: "",
    });
    expect(events).toEqual([
      {
        durationMs: 0,
        event: "chat.model.completed",
        finishReason: "error",
        modelId: "mock-model-id",
        outcome: "error",
        requestId: "request-error",
        usage: {
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
        },
      },
    ]);
    expect(JSON.stringify(events)).not.toContain("secret");
    expect(JSON.stringify(events)).not.toContain("token");
  });

  it("부분 응답 뒤 stream 오류를 stopped 저장 대상으로 반환한다", async () => {
    const events: unknown[] = [];
    const model = createGatewayChatModel({
      createRequestId: () => "request-partial-error",
      logger: (event) => {
        events.push(event);
      },
      model: createPartialErrorModel(),
      now: () => 70,
    });

    const finish = await generate(model);

    expect(finish).toEqual({
      isAborted: true,
      text: "오류 전 부분 응답",
    });
    expect(events).toEqual([
      expect.objectContaining({
        finishReason: "error",
        outcome: "error",
        requestId: "request-partial-error",
      }),
    ]);
  });
});
