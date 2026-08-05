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
