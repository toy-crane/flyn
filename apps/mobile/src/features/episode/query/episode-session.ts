import { queryOptions, useQuery } from "@tanstack/react-query";

import {
  type EpisodeSession,
  readEpisodeSession,
} from "@/features/episode/api/episode-session";

export function episodeSessionQueryKey(userId: string, episodeId: string) {
  return ["episode", userId, episodeId] as const;
}

export function episodeSessionQueryOptions(
  userId: string,
  accessToken: string,
  episodeId: string
) {
  return queryOptions<EpisodeSession>({
    gcTime: 0,
    queryFn: () => readEpisodeSession(accessToken, episodeId),
    queryKey: episodeSessionQueryKey(userId, episodeId),
    retry: 1,
  });
}

export function useEpisodeSession(
  userId: string | undefined,
  accessToken: string | undefined,
  episodeId: string | undefined
) {
  return useQuery({
    ...episodeSessionQueryOptions(
      userId ?? "",
      accessToken ?? "",
      episodeId ?? ""
    ),
    enabled:
      userId !== undefined &&
      accessToken !== undefined &&
      episodeId !== undefined,
  });
}
