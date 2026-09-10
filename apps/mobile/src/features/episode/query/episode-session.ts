import { queryOptions, useQuery } from "@tanstack/react-query";

import {
  type EpisodeSession,
  readEpisodeSession,
} from "@/features/episode/api/episode-session";

export function episodeSessionQueryKey(
  userId: string,
  storyPlayId: string,
  episodeId: string
) {
  return ["episode", userId, storyPlayId, episodeId] as const;
}

export function episodeSessionQueryOptions(
  userId: string,
  accessToken: string,
  storyPlayId: string,
  episodeId: string
) {
  return queryOptions<EpisodeSession>({
    gcTime: 0,
    queryFn: ({ signal }) =>
      readEpisodeSession(accessToken, storyPlayId, episodeId, signal),
    queryKey: episodeSessionQueryKey(userId, storyPlayId, episodeId),
    retry: 1,
  });
}

/**
 * 저장된 한 화를 읽는다.
 *
 * 회차가 없으면 읽지 않는다. 새 대화의 첫 화는 아직 회차가 없어 서버에 저장된
 * 것도 없고, 화면은 첫 장면 요청으로 바로 시작한다.
 */
export function useEpisodeSession(
  userId: string | undefined,
  accessToken: string | undefined,
  storyPlayId: string | undefined,
  episodeId: string | undefined
) {
  return useQuery({
    ...episodeSessionQueryOptions(
      userId ?? "",
      accessToken ?? "",
      storyPlayId ?? "",
      episodeId ?? ""
    ),
    enabled:
      userId !== undefined &&
      accessToken !== undefined &&
      storyPlayId !== undefined &&
      episodeId !== undefined,
  });
}
