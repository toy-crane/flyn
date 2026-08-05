import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Episode, EpisodeMessage } from "./episodes";
import { queryKeys } from "./query-keys";
import { supabase } from "./supabase";

const EPISODE_COLUMNS =
  "id, scenario_title, scenario_description, partner_role, user_role, status, turn_limit, created_at, updated_at, episode_goals(position, sentence, achieved_at, achieved_message_id)";
const MESSAGE_COLUMNS = "id, role, content, status, created_at";

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
