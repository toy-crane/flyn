/**
 * 결과 화면이 읽는 값. 조회와 무관한 규칙이라 여기서 혼자 정한다.
 */

import type { Episode, EpisodeGoal, EpisodeMessage } from "./episodes";
import { achievedGoalCount, orderedGoals } from "./episodes";
import {
  findFeedback,
  type MessageFeedback,
  type MessageMark,
  messageMark,
} from "./message-feedback";

/**
 * 결과 헤드라인. 턴 수도 문장 수도 말하지 않는다 — 개수를 말하는 자리는 섹션
 * 타이틀이고, 여기는 목표를 몇 개 해냈는지 하나만 말한다.
 */
export function resultHeadline(episode: Episode) {
  const total = episode.episode_goals.length;
  const achieved = achievedGoalCount(episode);

  return achieved === total
    ? `목표 ${total}개를 모두 해냈어요`
    : `목표 ${total}개 중 ${achieved}개를 해냈어요`;
}

/** 목표 결과. 달성과 미달성만 가른다 — X 표시는 쓰지 않는다. */
export interface GoalResult {
  achieved: boolean;
  position: number;
  sentence: string;
}

export function goalResults(episode: Episode): GoalResult[] {
  return orderedGoals(episode).map((goal: EpisodeGoal) => ({
    achieved: goal.achieved_at !== null,
    position: goal.position,
    sentence: goal.sentence,
  }));
}

/**
 * 결과의 문장 한 줄. 표시가 비어 있으면 **끝내 판정을 받지 못한 문장**이고,
 * 대화 중에는 다음 판정이 메워 주던 자리를 여기서 `다시 확인`이 건진다.
 */
export interface ReviewedUtterance {
  id: string;
  mark: MessageMark | null;
  text: string;
}

/**
 * 내가 쓴 문장은 **발화 전체**다. 첨삭이 있는 것만 추리면 잘 통한 문장이
 * 목록에서 사라져, 이번 대화에서 무엇을 말했는지 되짚을 수 없다.
 */
export function reviewedUtterances(
  messages: EpisodeMessage[],
  feedback: MessageFeedback[]
): ReviewedUtterance[] {
  return messages
    .filter((message) => message.role === "user")
    .map((message) => {
      const judged = findFeedback(feedback, message.id);

      return {
        id: message.id,
        mark: judged ? messageMark(judged) : null,
        text: message.content,
      };
    });
}
