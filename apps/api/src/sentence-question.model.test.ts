import { describe, expect, it } from "bun:test";
import { simulateReadableStream } from "ai";
import { MockLanguageModelV4 } from "ai/test";
import {
  createGatewaySentenceQuestionModel,
  type QuestionEpisode,
  type QuestionedSentence,
  SENTENCE_QUESTION_MODEL_ID,
  type SentenceQuestionMessage,
  type SentenceQuestionModel,
} from "./sentence-question";

const EPISODE: QuestionEpisode = {
  id: "episode-1",
  partnerRole: "바리스타 Maya",
  scenarioDescription: "여행 중 들어간 작은 카페예요.",
  scenarioTitle: "포틀랜드 카페에서 첫 주문",
  userRole: "처음 방문한 여행객",
};

const SENTENCE: QuestionedSentence = {
  delivered: "Sound good. Can you make it oat milk?",
  improvedSentence: "Sounds good. Can you make it with oat milk?",
  reasons: ["make it with를 쓰면 무엇으로 만들어 달라는 뜻이 돼요."],
  sourceText: "Sound good. Can you make it oat milk?",
};

const MESSAGES: SentenceQuestionMessage[] = [
  {
    content: "with 빼고 말하면 진짜 못 알아들어요?",
    createdAt: "2026-08-05T00:00:00.000Z",
    episodeId: "episode-1",
    id: "question-1",
    messageId: "user-1",
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

function createTextModel(text = "대부분 알아듣긴 해요.") {
  return new MockLanguageModelV4({
    doStream: () =>
      Promise.resolve({
        stream: simulateReadableStream({
          chunkDelayInMs: null,
          chunks: [
            { id: "text-1", type: "text-start" as const },
            { delta: text, id: "text-1", type: "text-delta" as const },
            { id: "text-1", type: "text-end" as const },
            {
              finishReason: { raw: undefined, unified: "stop" as const },
              logprobs: undefined,
              type: "finish" as const,
              usage: USAGE,
            },
          ],
          initialDelayInMs: null,
        }),
      }),
  });
}

async function generate(
  model: SentenceQuestionModel,
  { sentence = SENTENCE }: { sentence?: QuestionedSentence } = {}
) {
  let finish: { isAborted: boolean; text: string } | undefined;
  const response = await model.generate({
    answerId: "answer-1",
    episode: EPISODE,
    messages: MESSAGES,
    onFinish: (result) => {
      finish = result;
      return Promise.resolve();
    },
    sentence,
    signal: new AbortController().signal,
  });
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

describe("문장 질문 모델 고정", () => {
  it("역할마다 모델 ID를 코드에 따로 적는다", () => {
    const previousModel = process.env.AI_MODEL;

    try {
      process.env.AI_MODEL = "ignored/provider-model";

      expect(SENTENCE_QUESTION_MODEL_ID).toBe("openai/gpt-5.6-luna");
    } finally {
      if (previousModel === undefined) {
        delete process.env.AI_MODEL;
      } else {
        process.env.AI_MODEL = previousModel;
      }
    }
  });
});

describe("문장 질문 응답", () => {
  it("대상 문장과 첨삭을 프롬프트에 나른다", async () => {
    const languageModel = createTextModel();
    const model = createGatewaySentenceQuestionModel({
      logger: () => undefined,
      model: languageModel,
    });

    await generate(model);
    const instructions = systemPrompt(languageModel.doStreamCalls);

    expect(instructions).toContain("Sound good. Can you make it oat milk?");
    expect(instructions).toContain(
      "Sounds good. Can you make it with oat milk?"
    );
    expect(instructions).toContain("make it with를 쓰면");
    expect(instructions).toContain("포틀랜드 카페에서 첫 주문");
    // 여기는 학습 질문을 주고받는 자리다. 상대역을 계속 연기하면 안 된다.
    expect(instructions).toContain("상대역을 연기하거나 롤플레잉을 이어가지");
  });

  it("판정이 아직 없는 문장에도 답한다", async () => {
    const languageModel = createTextModel();
    const model = createGatewaySentenceQuestionModel({
      logger: () => undefined,
      model: languageModel,
    });

    await generate(model, {
      sentence: {
        delivered: "What do you recommend today?",
        improvedSentence: null,
        reasons: [],
        sourceText: "오늘 커피 뭐가 좋아요?",
      },
    });
    const instructions = systemPrompt(languageModel.doStreamCalls);

    expect(instructions).toContain("What do you recommend today?");
    expect(instructions).toContain("더 자연스러운 문장: 없음");
  });

  it("사람이 기다리는 호출이라 가장 낮은 reasoning으로 부른다", async () => {
    const languageModel = createTextModel();
    const model = createGatewaySentenceQuestionModel({
      logger: () => undefined,
      model: languageModel,
    });

    await generate(model);

    expect(languageModel.doStreamCalls[0]?.reasoning).toBe("low");
  });

  it("답을 스트리밍하고 저장할 전문을 돌려준다", async () => {
    const model = createGatewaySentenceQuestionModel({
      logger: () => undefined,
      model: createTextModel(),
    });

    const { body, finish } = await generate(model);

    expect(body).toContain("대부분 알아듣긴 해요.");
    expect(body).toContain('"messageId":"answer-1"');
    expect(finish).toEqual({ isAborted: false, text: "대부분 알아듣긴 해요." });
  });

  it("저장된 답은 다시 부르지 않고 그대로 재생한다", async () => {
    const model = createGatewaySentenceQuestionModel({
      logger: () => undefined,
    });

    const response = await model.replay({
      answerId: "answer-1",
      text: "대부분 알아듣긴 해요.",
    });
    const body = await response.text();

    expect(body).toContain("대부분 알아듣긴 해요.");
    expect(body).toContain('"messageId":"answer-1"');
  });

  it("완료를 본문 없이 한 번 기록한다", async () => {
    const events: { modelId: string; outcome: string; role: string }[] = [];
    const model = createGatewaySentenceQuestionModel({
      logger: (event) => {
        events.push({
          modelId: event.modelId,
          outcome: event.outcome,
          role: event.role,
        });
      },
      model: createTextModel(),
    });

    await generate(model);

    expect(events).toEqual([
      {
        modelId: "mock-model-id",
        outcome: "complete",
        role: "sentence.question",
      },
    ]);
  });
});
