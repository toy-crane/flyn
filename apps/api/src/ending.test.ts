import { describe, expect, it } from "bun:test";
import { MockLanguageModelV4 } from "ai/test";
import {
  createGatewaySummaryModel,
  type EndingRepository,
  type EpisodeEndReason,
  endingReason,
  finishEpisode,
  SUMMARY_MODEL_ID,
} from "./ending";
import type { MessageJudgment } from "./judgment";
import type { EpisodeMessage, RoleplayEpisode } from "./roleplay";

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
  turnLimit: 3,
  userRole: "처음 방문한 여행객",
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

function userMessage(id: string, content: string): EpisodeMessage {
  return {
    content,
    createdAt: "2026-08-05T00:00:00.000Z",
    episodeId: EPISODE.id,
    id,
    role: "user",
    sourceText: null,
    status: "complete",
  };
}

function turns(count: number) {
  return Array.from({ length: count }, (_item, index) =>
    userMessage(`user-${index + 1}`, `Sentence ${index + 1}.`)
  );
}

class MemoryEndingRepository implements EndingRepository {
  feedback: MessageJudgment[] = [];
  endings: {
    episodeId: string;
    reason: EpisodeEndReason;
    summary: string | null;
  }[] = [];

  listMessageFeedback(_episodeId: string) {
    return Promise.resolve(this.feedback);
  }

  finishEpisode(input: {
    episodeId: string;
    reason: EpisodeEndReason;
    summary: string | null;
  }) {
    this.endings.push(input);
    return Promise.resolve();
  }
}

function summaryModel(text: string) {
  return createGatewaySummaryModel({
    logger: () => undefined,
    model: new MockLanguageModelV4({
      doGenerate: () =>
        Promise.resolve({
          content: [{ text, type: "text" as const }],
          finishReason: { raw: undefined, unified: "stop" as const },
          usage: USAGE,
          warnings: [],
        }),
    }),
  });
}

function failingSummaryModel() {
  return createGatewaySummaryModel({
    logger: () => undefined,
    model: new MockLanguageModelV4({
      doGenerate: () => Promise.reject(new Error("gateway unavailable")),
    }),
  });
}

describe("종료 판단", () => {
  it("남은 목표가 없으면 목표 달성으로 끝난다", () => {
    expect(endingReason({ openGoals: 0, turnLimit: 20, turnsUsed: 4 })).toBe(
      "goals_met"
    );
  });

  it("턴이 상한에 닿으면 턴 소진으로 끝난다", () => {
    expect(endingReason({ openGoals: 2, turnLimit: 3, turnsUsed: 3 })).toBe(
      "turns_exhausted"
    );
  });

  it("둘이 같은 턴에 겹치면 이룬 쪽을 남긴다", () => {
    expect(endingReason({ openGoals: 0, turnLimit: 3, turnsUsed: 3 })).toBe(
      "goals_met"
    );
  });

  it("아직 남은 목표와 턴이 있으면 끝나지 않는다", () => {
    expect(endingReason({ openGoals: 1, turnLimit: 20, turnsUsed: 4 })).toBe(
      null
    );
  });
});

describe("한 턴 뒤의 종료", () => {
  it("방금 도착한 판정까지 얹어 마지막 목표를 이룬 턴에서 끝낸다", async () => {
    const repository = new MemoryEndingRepository();
    const episode: RoleplayEpisode = {
      ...EPISODE,
      goals: [
        {
          achievedAt: "2026-08-05T00:00:00.000Z",
          position: 1,
          sentence: "오늘의 원두 추천 받기",
        },
        {
          achievedAt: "2026-08-05T00:00:01.000Z",
          position: 2,
          sentence: "우유를 오트밀크로 바꿔 주문하기",
        },
        {
          achievedAt: null,
          position: 3,
          sentence: "근처 가볼 만한 곳 물어보기",
        },
      ],
    };

    const reason = await finishEpisode({
      achievements: [
        {
          achievedAt: "2026-08-05T00:00:02.000Z",
          messageId: "user-1",
          position: 3,
        },
      ],
      episode,
      messages: turns(1),
      model: summaryModel("want to를 챙겨보세요."),
      repository,
      signal: new AbortController().signal,
    });

    expect(reason).toBe("goals_met");
    expect(repository.endings).toEqual([
      {
        episodeId: "episode-1",
        reason: "goals_met",
        summary: "want to를 챙겨보세요.",
      },
    ]);
  });

  it("상한은 코드 상수가 아니라 에피소드가 든 값으로 본다", async () => {
    const repository = new MemoryEndingRepository();

    const short = await finishEpisode({
      achievements: [],
      episode: { ...EPISODE, turnLimit: 3 },
      messages: turns(3),
      model: summaryModel("총평"),
      repository,
      signal: new AbortController().signal,
    });
    const long = await finishEpisode({
      achievements: [],
      episode: { ...EPISODE, turnLimit: 20 },
      messages: turns(3),
      model: summaryModel("총평"),
      repository,
      signal: new AbortController().signal,
    });

    expect(short).toBe("turns_exhausted");
    expect(long).toBe(null);
  });

  it("이미 끝난 에피소드의 종료 사유는 다시 정해지지 않는다", async () => {
    const repository = new MemoryEndingRepository();

    const reason = await finishEpisode({
      achievements: [],
      episode: { ...EPISODE, status: "turns_exhausted", turnLimit: 1 },
      messages: turns(3),
      model: summaryModel("총평"),
      repository,
      signal: new AbortController().signal,
    });

    expect(reason).toBe(null);
    expect(repository.endings).toEqual([]);
  });

  it("총평을 만들지 못해도 에피소드는 끝난다", async () => {
    const repository = new MemoryEndingRepository();

    const reason = await finishEpisode({
      achievements: [],
      episode: { ...EPISODE, turnLimit: 2 },
      messages: turns(2),
      model: failingSummaryModel(),
      repository,
      signal: new AbortController().signal,
    });

    expect(reason).toBe("turns_exhausted");
    expect(repository.endings).toEqual([
      { episodeId: "episode-1", reason: "turns_exhausted", summary: null },
    ]);
  });
});

describe("총평 호출", () => {
  it("모델 ID를 역할마다 따로 고정한다", () => {
    expect(SUMMARY_MODEL_ID).toBe("openai/gpt-5.6-luna");
  });

  it("판정과 전달된 문장을 함께 넘긴다", async () => {
    let prompt = "";
    const model = createGatewaySummaryModel({
      logger: () => undefined,
      model: new MockLanguageModelV4({
        doGenerate: ({ prompt: sent }) => {
          prompt = JSON.stringify(sent);

          return Promise.resolve({
            content: [{ text: "총평 한 문단", type: "text" as const }],
            finishReason: { raw: undefined, unified: "stop" as const },
            usage: USAGE,
            warnings: [],
          });
        },
      }),
    });

    const summary = await model.summarize({
      episode: EPISODE,
      feedback: [
        {
          improvedSentence: "I want to change my flight time.",
          messageId: "user-1",
          reasons: ["want 다음에 to가 필요해요."],
          verdict: "improvable",
        },
      ],
      messages: [userMessage("user-1", "I want change my flight time.")],
      signal: new AbortController().signal,
    });

    expect(summary).toBe("총평 한 문단");
    expect(prompt).toContain("I want change my flight time.");
    expect(prompt).toContain("want 다음에 to가 필요해요.");
    // 개수를 세는 총평은 결과 화면이 이미 섹션 타이틀로 말한다.
    expect(prompt).toContain("문장 수도 턴 수도 세지 않는다");
  });

  it("빈 총평은 저장하지 않는다", () => {
    const model = summaryModel("   ");

    expect(
      model.summarize({
        episode: EPISODE,
        feedback: [],
        messages: turns(1),
        signal: new AbortController().signal,
      })
    ).rejects.toThrow();
  });
});
