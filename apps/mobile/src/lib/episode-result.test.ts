import {
  goalResults,
  resultHeadline,
  reviewedUtterances,
} from "./episode-result";
import type { Episode, EpisodeMessage } from "./episodes";
import type { MessageFeedback } from "./message-feedback";

/** 헤드라인이 개수를 세는 말로 새지 않는지 보는 자리다. */
const COUNTING_WORDS = /턴|문장/;

function episode(achieved: number[]): Episode {
  return {
    created_at: "2026-08-05T00:00:00.000Z",
    episode_goals: [3, 1, 2].map((position) => ({
      achieved_at: achieved.includes(position)
        ? "2026-08-05T00:01:00.000Z"
        : null,
      achieved_message_id: achieved.includes(position) ? "user-1" : null,
      position,
      sentence: `목표 ${position}`,
    })),
    id: "episode-1",
    partner_role: "수하물 담당 David",
    scenario_description: "짐이 나오지 않은 공항이에요.",
    scenario_title: "공항에서 짐이 안 나왔을 때 항의하기",
    status: "turns_exhausted",
    summary: null,
    turn_limit: 20,
    updated_at: "2026-08-05T00:03:00.000Z",
    user_role: "짐을 잃은 여행객",
  };
}

const MESSAGES: EpisodeMessage[] = [
  {
    content: "My suitcase didn't come out.",
    created_at: "2026-08-05T00:00:01.000Z",
    id: "user-1",
    role: "user",
    status: "complete",
  },
  {
    content: "I'm sorry to hear that.",
    created_at: "2026-08-05T00:00:02.000Z",
    id: "assistant-1",
    role: "assistant",
    status: "complete",
  },
  {
    content: "There's a red tag on the handle.",
    created_at: "2026-08-05T00:00:03.000Z",
    id: "user-2",
    role: "user",
    status: "complete",
  },
  {
    content: "Is the office open tomorrow morning?",
    created_at: "2026-08-05T00:00:04.000Z",
    id: "user-3",
    role: "user",
    status: "complete",
  },
];

const FEEDBACK: MessageFeedback[] = [
  {
    delivered: "My suitcase didn't come out.",
    improvedSentence: null,
    messageId: "user-1",
    reasons: [],
    sourceText: "제 가방이 안 나왔어요.",
    verdict: "clear",
  },
  {
    delivered: "There's a red tag on the handle.",
    improvedSentence: null,
    messageId: "user-2",
    reasons: [],
    sourceText: "There's a red tag on the handle.",
    verdict: "clear",
  },
];

describe("결과 헤드라인", () => {
  it("모두 해내면 그렇게 말한다", () => {
    expect(resultHeadline(episode([1, 2, 3]))).toBe("목표 3개를 모두 해냈어요");
  });

  it("일부만 해내면 몇 개인지 말한다", () => {
    expect(resultHeadline(episode([1, 2]))).toBe("목표 3개 중 2개를 해냈어요");
  });

  it("턴 수나 문장 수는 말하지 않는다", () => {
    expect(resultHeadline(episode([1]))).not.toMatch(COUNTING_WORDS);
  });
});

describe("목표 결과", () => {
  it("저장 순서와 무관하게 목표 순서대로 서고 달성만 가른다", () => {
    expect(goalResults(episode([2]))).toEqual([
      { achieved: false, position: 1, sentence: "목표 1" },
      { achieved: true, position: 2, sentence: "목표 2" },
      { achieved: false, position: 3, sentence: "목표 3" },
    ]);
  });
});

describe("내가 쓴 문장", () => {
  it("발화 전체를 나열하고 판정이 있는 것만 표시를 갖는다", () => {
    expect(reviewedUtterances(MESSAGES, FEEDBACK)).toEqual([
      {
        id: "user-1",
        // 내가 쓴 말과 전달된 문장이 다르면 번역 표시가 먼저다.
        mark: "translated",
        text: "My suitcase didn't come out.",
      },
      {
        id: "user-2",
        mark: "clear",
        text: "There's a red tag on the handle.",
      },
      // 끝내 판정이 오지 않은 문장. 표시가 없는 것이 곧 `다시 확인` 자리다.
      {
        id: "user-3",
        mark: null,
        text: "Is the office open tomorrow morning?",
      },
    ]);
  });

  it("상대의 말은 목록에 없다", () => {
    expect(
      reviewedUtterances(MESSAGES, FEEDBACK).map((item) => item.id)
    ).not.toContain("assistant-1");
  });
});
