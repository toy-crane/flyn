/**
 * 에피소드 목록이 홈이다. 어떤 에피소드가 카드에 오르고 어떤 것이 목록에
 * 남는지는 조회와 무관한 규칙이라 여기서 혼자 정한다.
 */

import type { EpisodeEndReason } from "@flyn/api";
import type { Tables } from "@flyn/supabase";

export type EpisodeStatus = "active" | "goals_met" | "turns_exhausted";
export type { EpisodeEndReason } from "@flyn/api";
export type EpisodeGoal = Pick<
  Tables<"episode_goals">,
  "achieved_at" | "achieved_message_id" | "position" | "sentence"
>;
export type Episode = Pick<
  Tables<"episodes">,
  | "created_at"
  | "id"
  | "partner_role"
  | "scenario_description"
  | "scenario_title"
  | "status"
  | "summary"
  | "turn_limit"
  | "updated_at"
  | "user_role"
> & { episode_goals: EpisodeGoal[] };

export function isEpisodeActive(episode: Episode) {
  return episode.status === "active";
}

/**
 * 끝났다면 왜 끝났는지. **저장된 상태가 곧 이유다** — 코드의 턴 상한을 바꿔도
 * 이미 끝난 에피소드가 다른 이유를 말하지 않는다.
 */
export function episodeEndReason(episode: Episode): EpisodeEndReason | null {
  if (episode.status === "goals_met" || episode.status === "turns_exhausted") {
    return episode.status;
  }

  return null;
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

/**
 * 문장 질문이 물고 온 문장. 인용 카드에 세우는 것은 말풍선에 남은 것과 같은
 * **전달된 문장**이고, 물어볼 수 있는 자리는 내가 쓴 발화뿐이다.
 */
export function questionedSentence(
  messages: EpisodeMessage[],
  messageId: string
): string | null {
  const message = messages.find((item) => item.id === messageId);

  return message?.role === "user" ? message.content : null;
}

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
 * 지금 할 목표. 달성하면 곧바로 다음 목표가 여기로 온다. 셋을 다 이루면 지금
 * 할 목표가 **없다** — 마지막 목표를 계속 세워 두면 다 된 표시 옆에 이미 끝난
 * 문장이 남는다.
 */
export function currentGoalPosition(goals: EpisodeGoal[]): number | null {
  const pending = goals.find((goal) => goal.achieved_at === null);

  return pending?.position ?? null;
}

/** 판정이 알려 온 목표 달성 하나. 스트림이 저장보다 먼저 도착한다. */
export interface GoalAchievement {
  achievedAt: string;
  messageId: string;
  position: number;
}

/**
 * 판정은 저장이 앱에 다시 읽히기 전에 스트림으로 먼저 온다. 목표 바가 달성
 * 즉시 다음 목표로 넘어가려면 도착한 판정을 저장된 목표에 얹어 봐야 한다.
 * 이미 달성한 목표는 건드리지 않아 완료 줄의 자리가 뒤로 밀리지 않는다.
 */
export function withAchievements(
  goals: EpisodeGoal[],
  achievements: Record<number, GoalAchievement>
): EpisodeGoal[] {
  return goals.map((goal) => {
    const achievement = achievements[goal.position];

    if (!achievement || goal.achieved_at !== null) {
      return goal;
    }

    return {
      ...goal,
      achieved_at: achievement.achievedAt,
      achieved_message_id: achievement.messageId,
    };
  });
}
