import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Episode } from "./episodes";
import { queryKeys } from "./query-keys";
import { supabase } from "./supabase";

const EPISODE_COLUMNS =
  "id, scenario_title, scenario_description, partner_role, user_role, status, turn_limit, created_at, updated_at, episode_goals(position, sentence, achieved_at)";

export async function fetchEpisodes(userId: string): Promise<Episode[]> {
  const { data } = await supabase
    .from("episodes")
    .select(EPISODE_COLUMNS)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
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
