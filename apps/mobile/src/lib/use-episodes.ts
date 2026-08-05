import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Episode, EpisodeMessage } from "./episodes";
import type { MessageFeedback } from "./message-feedback";
import { queryKeys } from "./query-keys";
import { supabase } from "./supabase";

// 총평은 종료 시점에 한 번 만들어 저장된다. 결과 화면은 그것을 읽기만 한다.
const EPISODE_COLUMNS =
  "id, scenario_title, scenario_description, partner_role, user_role, status, summary, turn_limit, created_at, updated_at, episode_goals(position, sentence, achieved_at, achieved_message_id)";
const MESSAGE_COLUMNS = "id, role, content, status, created_at";
// 판정과 그때 전달된 문장을 함께 읽는다. 시트가 둘을 나란히 놓기 때문이다.
const FEEDBACK_COLUMNS =
  "message_id, source_text, verdict, improved_sentence, reasons, episode_messages(content)";

export async function fetchEpisodes(userId: string): Promise<Episode[]> {
  const { data } = await supabase
    .from("episodes")
    .select(EPISODE_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .throwOnError();

  return data;
}

export async function fetchEpisode(episodeId: string): Promise<Episode | null> {
  const { data } = await supabase
    .from("episodes")
    .select(EPISODE_COLUMNS)
    .eq("id", episodeId)
    .maybeSingle()
    .throwOnError();

  return data;
}

/** 나갔다 돌아와도 이어서 하려면 지난 대화를 저장소에서 그대로 읽는다. */
export async function fetchEpisodeMessages(
  episodeId: string
): Promise<EpisodeMessage[]> {
  const { data } = await supabase
    .from("episode_messages")
    .select(MESSAGE_COLUMNS)
    .eq("episode_id", episodeId)
    .order("created_at", { ascending: true })
    .order("id", { ascending: true })
    .throwOnError();

  return data;
}

/**
 * 저장된 판정. 대화 화면이 들어올 때 한 번 읽어 두면, 표시도 시트도 여기서
 * 나온다 — 시트를 열 때 다시 부르지 않는다.
 */
export async function fetchEpisodeFeedback(
  episodeId: string
): Promise<MessageFeedback[]> {
  const { data } = await supabase
    .from("message_feedback")
    .select(FEEDBACK_COLUMNS)
    .eq("episode_id", episodeId)
    .throwOnError();

  return data.map((row) => ({
    delivered: row.episode_messages.content,
    improvedSentence: row.improved_sentence,
    messageId: row.message_id,
    reasons: row.reasons,
    sourceText: row.source_text,
    verdict: row.verdict === "improvable" ? "improvable" : "clear",
  }));
}

/**
 * 앱이 가진 유일한 에피소드 쓰기다. 목표는 DB의 cascade가 함께 지운다 —
 * 앱에는 목표를 지울 권한이 없다.
 */
export async function deleteEpisode(episodeId: string): Promise<void> {
  await supabase.from("episodes").delete().eq("id", episodeId).throwOnError();
}

export function useEpisodes(userId: string) {
  return useQuery({
    queryFn: () => fetchEpisodes(userId),
    queryKey: queryKeys.episodes(userId),
  });
}

export function useEpisode(episodeId: string) {
  return useQuery({
    queryFn: () => fetchEpisode(episodeId),
    queryKey: queryKeys.episode(episodeId),
  });
}

export function useEpisodeMessages(episodeId: string) {
  return useQuery({
    queryFn: () => fetchEpisodeMessages(episodeId),
    queryKey: queryKeys.episodeMessages(episodeId),
  });
}

export function useEpisodeFeedback(episodeId: string) {
  return useQuery({
    queryFn: () => fetchEpisodeFeedback(episodeId),
    queryKey: queryKeys.episodeFeedback(episodeId),
  });
}

/**
 * 첨삭 시트가 보는 판정. **이미 읽어 둔 것만** 본다 — 조회를 켜지 않으므로
 * 시트를 열어도 네트워크를 타지 않고, 대화 중에 판정이 도착하면 같은 캐시가
 * 갱신돼 그대로 따라온다.
 */
export function useStoredFeedback(episodeId: string) {
  return useQuery({
    enabled: false,
    queryFn: () => fetchEpisodeFeedback(episodeId),
    queryKey: queryKeys.episodeFeedback(episodeId),
  }).data;
}

export function useDeleteEpisode(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEpisode,
    onSuccess: (_result, episodeId) => {
      queryClient.setQueryData<Episode[]>(
        queryKeys.episodes(userId),
        (episodes = []) =>
          episodes.filter((episode) => episode.id !== episodeId)
      );
    },
  });
}
