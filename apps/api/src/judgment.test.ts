import { describe, expect, it } from "bun:test";
import { MockLanguageModelV4 } from "ai/test";
import {
  createGatewayJudgmentModel,
  type GoalAchievement,
  JUDGMENT_MODEL_ID,
  type JudgmentDraft,
  type JudgmentModel,
  type JudgmentRepository,
  judgeEpisodeTurn,
  type MessageJudgment,
  normalizeDraft,
  type PendingUtterance,
} from "./judgment";
import type { EpisodeMessage, RoleplayEpisode } from "./roleplay";

const EPISODE_ID = "episode-1";

function episode(
  achieved: Partial<Record<number, string>> = {}
): RoleplayEpisode {
  return {
    goals: [
      {
        achievedAt: achieved[1] ?? null,
        position: 1,
        sentence: "오늘의 원두 추천 받기",
      },
      {
        achievedAt: achieved[2] ?? null,
        position: 2,
        sentence: "우유를 오트밀크로 바꿔 주문하기",
      },
      {
        achievedAt: achieved[3] ?? null,
        position: 3,
        sentence: "근처 가볼 만한 곳 물어보기",
      },
    ],
    id: EPISODE_ID,
    partnerRole: "바리스타 Maya",
    scenarioDescription: "여행 중 들어간 작은 카페예요.",
    scenarioTitle: "포틀랜드 카페에서 첫 주문",
    status: "active",
    turnLimit: 20,
    userRole: "처음 방문한 여행객",
  };
}

function message(
  id: string,
  role: "assistant" | "user",
  content: string
): EpisodeMessage {
  return {
    content,
    createdAt: "2026-08-05T00:00:00.000Z",
    episodeId: EPISODE_ID,
    id,
    role,
    status: "complete",
  };
}

const MESSAGES: EpisodeMessage[] = [
  message("user-1", "user", "Could you recommend today's coffee?"),
  message("assistant-1", "assistant", "Today's is a natural Ethiopian."),
  message("user-2", "user", "Sound good. make it oat milk?"),
];

class MemoryJudgmentRepository implements JudgmentRepository {
  achievements: (GoalAchievement & { episodeId: string })[] = [];
  feedback: MessageJudgment[] = [];

  listJudgedMessageIds() {
    return Promise.resolve(this.feedback.map((row) => row.messageId));
  }

  insertMessageFeedback(_episodeId: string, rows: MessageJudgment[]) {
    this.feedback.push(...rows);
    return Promise.resolve();
  }

  markGoalAchieved(input: GoalAchievement & { episodeId: string }) {
    this.achievements.push(input);
    return Promise.resolve();
  }
}

function fakeModel(draft: JudgmentDraft) {
  const calls: { pending: PendingUtterance[] }[] = [];
  const model: JudgmentModel = {
    judge: ({ pending }) => {
      calls.push({ pending });
      return Promise.resolve(draft);
    },
  };

  return { calls, model };
}

function judge({
  draft,
  episode: subject = episode(),
  messages = MESSAGES,
  repository = new MemoryJudgmentRepository(),
  sourceTexts = {},
}: {
  draft: JudgmentDraft;
  episode?: RoleplayEpisode;
  messages?: EpisodeMessage[];
  repository?: MemoryJudgmentRepository;
  sourceTexts?: Record<string, string>;
}) {
  const { calls, model } = fakeModel(draft);

  return {
    calls,
    repository,
    update: judgeEpisodeTurn({
      episode: subject,
      messages,
      model,
      now: () => "2026-08-05T00:00:09.000Z",
      repository,
      signal: new AbortController().signal,
      sourceTexts,
    }),
  };
}

describe("판정 모델 고정", () => {
  it("판정 역할의 모델 ID를 코드에 따로 적는다", () => {
    expect(JUDGMENT_MODEL_ID).toBe("openai/gpt-5.6-luna");
  });
});

describe("한 턴의 판정", () => {
  it("판정이 없는 발화만 판정하고 판정·개선문·이유를 함께 남긴다", async () => {
    const { calls, repository, update } = judge({
      draft: {
        goals: [],
        sentences: [
          {
            improvedSentence: "Sounds good. Could you make it oat milk?",
            messageId: "user-2",
            reasons: ["Sound good은 Sounds good이 자연스러워요."],
            verdict: "improvable",
          },
          {
            improvedSentence: null,
            messageId: "user-1",
            reasons: [],
            verdict: "clear",
          },
        ],
      },
      sourceTexts: { "user-2": "좋아요. 오트밀크로 해 줄래요?" },
    });

    expect(await update).toEqual({ goals: [] });
    expect(calls[0]?.pending.map((item) => item.id)).toEqual([
      "user-1",
      "user-2",
    ]);
    expect(repository.feedback).toEqual([
      expect.objectContaining({
        improvedSentence: "Sounds good. Could you make it oat milk?",
        messageId: "user-2",
        reasons: ["Sound good은 Sounds good이 자연스러워요."],
        sourceText: "좋아요. 오트밀크로 해 줄래요?",
        verdict: "improvable",
      }),
      expect.objectContaining({
        improvedSentence: null,
        messageId: "user-1",
        // 원문을 잃은 지난 발화는 전달된 문장이 곧 사용자가 쓴 말이다.
        sourceText: "Could you recommend today's coffee?",
        verdict: "clear",
      }),
    ]);
  });

  it("달성한 목표에 그 발화를 함께 남긴다", async () => {
    const { repository, update } = judge({
      draft: {
        goals: [{ messageId: "user-1", position: 1 }],
        sentences: [],
      },
    });

    expect(await update).toEqual({
      goals: [
        {
          achievedAt: "2026-08-05T00:00:09.000Z",
          messageId: "user-1",
          position: 1,
        },
      ],
    });
    expect(repository.achievements).toEqual([
      {
        achievedAt: "2026-08-05T00:00:09.000Z",
        episodeId: EPISODE_ID,
        messageId: "user-1",
        position: 1,
      },
    ]);
  });

  it("이미 달성한 목표와 없는 발화는 채우지 않는다", async () => {
    const { repository, update } = judge({
      draft: {
        goals: [
          { messageId: "user-1", position: 1 },
          { messageId: "assistant-1", position: 2 },
          { messageId: "user-404", position: 3 },
        ],
        sentences: [],
      },
      episode: episode({ 1: "2026-08-05T00:00:00.000Z" }),
    });

    expect(await update).toEqual({ goals: [] });
    expect(repository.achievements).toEqual([]);
  });

  it("판정 대상이 아닌 발화의 판정은 버린다", async () => {
    const repository = new MemoryJudgmentRepository();
    repository.feedback.push({
      improvedSentence: null,
      messageId: "user-1",
      reasons: [],
      sourceText: "Could you recommend today's coffee?",
      verdict: "clear",
    });

    const { calls, update } = judge({
      draft: {
        goals: [],
        sentences: [
          {
            improvedSentence: "다시 쓴 문장",
            messageId: "user-1",
            reasons: ["이미 판정이 있는 발화"],
            verdict: "improvable",
          },
          {
            improvedSentence: null,
            messageId: "user-404",
            reasons: [],
            verdict: "clear",
          },
        ],
      },
      repository,
    });

    await update;

    expect(calls[0]?.pending.map((item) => item.id)).toEqual(["user-2"]);
    expect(repository.feedback).toHaveLength(1);
    expect(repository.feedback[0]?.verdict).toBe("clear");
  });

  it("판정할 발화도 남은 목표도 없으면 모델을 부르지 않는다", async () => {
    const repository = new MemoryJudgmentRepository();
    repository.feedback.push(
      {
        improvedSentence: null,
        messageId: "user-1",
        reasons: [],
        sourceText: "…",
        verdict: "clear",
      },
      {
        improvedSentence: null,
        messageId: "user-2",
        reasons: [],
        sourceText: "…",
        verdict: "clear",
      }
    );

    const { calls, update } = judge({
      draft: { goals: [], sentences: [] },
      episode: episode({
        1: "2026-08-05T00:00:00.000Z",
        2: "2026-08-05T00:00:01.000Z",
        3: "2026-08-05T00:00:02.000Z",
      }),
      repository,
    });

    expect(await update).toBeNull();
    expect(calls).toEqual([]);
  });
});

const PENDING: PendingUtterance[] = [
  {
    id: "user-2",
    sourceText: "Sound good. make it oat milk?",
    text: "Sound good. make it oat milk?",
  },
];

describe("판정 결과 다듬기", () => {
  it("그대로 통한 문장에는 개선문과 이유를 남기지 않는다", () => {
    expect(
      normalizeDraft(
        {
          goals: [],
          sentences: [
            {
              improvedSentence: "That is all, thank you!",
              messageId: "user-2",
              reasons: ["안 쓸 이유"],
              verdict: "clear",
            },
          ],
        },
        PENDING
      ).sentences
    ).toEqual([
      {
        improvedSentence: null,
        messageId: "user-2",
        reasons: [],
        verdict: "clear",
      },
    ]);
  });

  it("개선문이 없거나 전달된 문장과 같으면 그대로 통한 것으로 본다", () => {
    const { sentences } = normalizeDraft(
      {
        goals: [],
        sentences: [
          {
            improvedSentence: "   ",
            messageId: "user-2",
            reasons: ["이유만 있는 판정"],
            verdict: "improvable",
          },
          {
            improvedSentence: "Sound good. make it oat milk?",
            messageId: "user-2",
            reasons: ["고친 데가 없는 판정"],
            verdict: "improvable",
          },
        ],
      },
      PENDING
    );

    expect(sentences.map((sentence) => sentence.verdict)).toEqual([
      "clear",
      "clear",
    ]);
    expect(sentences.every((sentence) => sentence.reasons.length === 0)).toBe(
      true
    );
  });

  it("빈 이유와 messageId 없는 판정은 버린다", () => {
    const { goals, sentences } = normalizeDraft(
      {
        goals: [
          { messageId: "user-2", position: 1 },
          { messageId: "", position: 2 },
          { messageId: "user-2", position: "3" as unknown as number },
        ],
        sentences: [
          {
            improvedSentence: "Sounds good. Could you make it oat milk?",
            messageId: "user-2",
            reasons: ["  ", "Sound good은 Sounds good이 자연스러워요."],
            verdict: "improvable",
          },
          {
            improvedSentence: "",
            messageId: "  ",
            reasons: [],
            verdict: "clear",
          },
        ],
      },
      PENDING
    );

    expect(goals).toEqual([{ messageId: "user-2", position: 1 }]);
    expect(sentences).toEqual([
      {
        improvedSentence: "Sounds good. Could you make it oat milk?",
        messageId: "user-2",
        reasons: ["Sound good은 Sounds good이 자연스러워요."],
        verdict: "improvable",
      },
    ]);
  });
});

function createObjectModel(object: unknown) {
  return new MockLanguageModelV4({
    doGenerate: () =>
      Promise.resolve({
        content: [{ text: JSON.stringify(object), type: "text" as const }],
        finishReason: { raw: undefined, unified: "stop" as const },
        usage: {
          inputTokens: {
            cacheRead: undefined,
            cacheWrite: undefined,
            noCache: 3,
            total: 3,
          },
          outputTokens: { reasoning: undefined, text: 4, total: 4 },
        },
        warnings: [],
      }),
  });
}

function promptText(calls: { prompt: unknown }[], role: string) {
  const prompt = (calls[0]?.prompt ?? []) as {
    content: unknown;
    role: string;
  }[];

  return prompt
    .filter((entry) => entry.role === role)
    .map((entry) =>
      typeof entry.content === "string"
        ? entry.content
        : JSON.stringify(entry.content)
    )
    .join("\n");
}

describe("판정 호출", () => {
  it("판정 하나만 시키고 대화·남은 목표·판정할 발화를 나른다", async () => {
    const languageModel = createObjectModel({ goals: [], sentences: [] });
    const model = createGatewayJudgmentModel({
      logger: () => undefined,
      model: languageModel,
    });

    await model.judge({
      episode: episode({ 1: "2026-08-05T00:00:00.000Z" }),
      messages: MESSAGES,
      pending: PENDING,
      signal: new AbortController().signal,
    });
    const instructions = promptText(languageModel.doGenerateCalls, "system");
    const prompt = promptText(languageModel.doGenerateCalls, "user");

    expect(instructions).toContain("판정한다");
    expect(instructions).toContain("improvedSentence");
    // 롤플레잉 지침이 섞이면 상대가 문법을 화제로 삼는다.
    expect(instructions).not.toContain("상대역");
    expect(prompt).toContain("포틀랜드 카페에서 첫 주문");
    expect(prompt).toContain("학습자(user-2)");
    expect(prompt).toContain("- user-2: Sound good. make it oat milk?");
    // 이미 달성한 목표는 다시 보지 않는다.
    expect(prompt).not.toContain("1: 오늘의 원두 추천 받기");
    expect(prompt).toContain("2: 우유를 오트밀크로 바꿔 주문하기");
  });

  it("판정 하나를 본문 없이 기록한다", async () => {
    const events: unknown[] = [];
    const times = [100, 160];
    const model = createGatewayJudgmentModel({
      createRequestId: () => "request-judgment-1",
      logger: (event) => {
        events.push(event);
      },
      model: createObjectModel({ goals: [], sentences: [] }),
      now: () => times.shift() ?? 160,
    });

    await model.judge({
      episode: episode(),
      messages: MESSAGES,
      pending: PENDING,
      signal: new AbortController().signal,
    });

    expect(events).toEqual([
      {
        durationMs: 60,
        event: "judgment.model.completed",
        finishReason: "stop",
        modelId: "mock-model-id",
        outcome: "complete",
        requestId: "request-judgment-1",
        role: "roleplay.judgment",
        usage: { inputTokens: 3, outputTokens: 4, totalTokens: 7 },
      },
    ]);
    expect(JSON.stringify(events)).not.toContain("oat milk");
  });

  it("호출이 실패하면 기록만 남기고 오류를 그대로 올린다", async () => {
    const events: unknown[] = [];
    const model = createGatewayJudgmentModel({
      logger: (event) => {
        events.push(event);
      },
      model: new MockLanguageModelV4({
        doGenerate: () => Promise.reject(new Error("gateway unavailable")),
      }),
      now: () => 10,
    });

    await expect(
      model.judge({
        episode: episode(),
        messages: MESSAGES,
        pending: PENDING,
        signal: new AbortController().signal,
      })
    ).rejects.toThrow("gateway unavailable");
    expect(events).toEqual([
      expect.objectContaining({
        outcome: "error",
        role: "roleplay.judgment",
      }),
    ]);
  });
});
