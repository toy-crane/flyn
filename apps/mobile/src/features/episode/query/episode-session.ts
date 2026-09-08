import { queryOptions, useQuery } from "@tanstack/react-query";

import {
  type EpisodeSession,
  readEpisodeSession,
} from "@/features/episode/api/episode-session";

export function episodeSessionQueryKey(
  userId: string,
  runId: string,
  episodeId: string
) {
  return ["episode", userId, runId, episodeId] as const;
}

export function episodeSessionQueryOptions(
  userId: string,
  accessToken: string,
  runId: string,
  episodeId: string
) {
  return queryOptions<EpisodeSession>({
    gcTime: 0,
    queryFn: () => readEpisodeSession(accessToken, runId, episodeId),
    queryKey: episodeSessionQueryKey(userId, runId, episodeId),
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
  runId: string | undefined,
  episodeId: string | undefined
) {
  return useQuery({
    ...episodeSessionQueryOptions(
      userId ?? "",
      accessToken ?? "",
      runId ?? "",
      episodeId ?? ""
    ),
    enabled:
      userId !== undefined &&
      accessToken !== undefined &&
      runId !== undefined &&
      episodeId !== undefined,
  });
}
