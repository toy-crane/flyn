/**
 * 에피소드 목록이 홈이다. 어떤 에피소드가 카드에 오르고 어떤 것이 목록에
 * 남는지는 조회와 무관한 규칙이라 여기서 혼자 정한다.
 */

import type { Tables } from "@flyn/supabase";

export type EpisodeStatus = "active" | "goals_met" | "turns_exhausted";
export type EpisodeGoal = Pick<
  Tables<"episode_goals">,
  "achieved_at" | "position" | "sentence"
>;
export type Episode = Pick<
  Tables<"episodes">,
  | "created_at"
  | "id"
  | "partner_role"
  | "scenario_description"
  | "scenario_title"
  | "status"
  | "turn_limit"
  | "updated_at"
  | "user_role"
> & { episode_goals: EpisodeGoal[] };

export function isEpisodeActive(episode: Episode) {
  return episode.status === "active";
}

/**
 * 홈 상단 카드에 오를 에피소드. 목록이 최근순이므로 첫 진행 중 하나다.
 * 진행 중이 없으면 카드만 사라진다.
 */
export function resumeEpisode(episodes: Episode[]): Episode | null {
  return episodes.find(isEpisodeActive) ?? null;
}

/** `모든 에피소드`. 카드에 오른 에피소드는 여기 다시 나오지 않는다. */
export function listedEpisodes(episodes: Episode[]): Episode[] {
  const resume = resumeEpisode(episodes);

  return episodes.filter((episode) => episode.id !== resume?.id);
}

export function achievedGoalCount(episode: Episode): number {
  return episode.episode_goals.filter((goal) => goal.achieved_at !== null)
    .length;
}

/** 대화에 남은 메시지 하나. 사용자 쪽은 실제로 전달된 문장이다. */
export type EpisodeMessage = Pick<
  Tables<"episode_messages">,
  "content" | "created_at" | "id" | "role" | "status"
>;

export function orderedGoals(episode: Episode): EpisodeGoal[] {
  return [...episode.episode_goals].sort(
    (left, right) => left.position - right.position
  );
}

/**
 * 턴은 사용자 메시지 하나다. AI 발화는 세지 않는다. 상한은 에피소드가 생성
 * 시점의 값을 복사해 갖고 있으므로 코드 상수가 아니라 그 값을 본다.
 */
export function usedTurns(messages: EpisodeMessage[]): number {
  return messages.filter((message) => message.role === "user").length;
}

/**
 * 지금 할 목표. 아직 달성 표시가 없으므로 첫 목표가 현재 목표다. 목표 달성은
 * 판정이 붙는 태스크가 세운다.
 */
export function currentGoalPosition(episode: Episode): number {
  const goals = orderedGoals(episode);
  const pending = goals.find((goal) => goal.achieved_at === null);

  return pending?.position ?? goals.length;
}
