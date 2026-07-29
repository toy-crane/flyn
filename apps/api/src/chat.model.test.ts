import { describe, expect, it } from "bun:test";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import {
  type ChatMessage,
  type ChatModel,
  createGatewayChatModel,
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

async function generate(model: ChatModel) {
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
    signal: new AbortController().signal,
  });

  await response.text();

  return finish;
}

describe("Gateway 채팅 모델 제한", () => {
  it("출력을 4,000 tokens로 제한하고 length 응답을 완료로 보존한다", async () => {
    const languageModel = createTextModel({
      finishReason: "length",
      text: "상한까지 생성한 응답",
    });
    const model = createGatewayChatModel({ model: languageModel });

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
      model: languageModel,
    });

    const finish = await generate(model);

    expect(finish).toEqual({
      isAborted: true,
      text: "",
    });
  });
});
