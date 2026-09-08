import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  readRecentStories,
  readStories,
  readStoryDetail,
  readStoryRuns,
  type StoryDetail,
  type StoryRuns,
} from "@/features/story/api/story";

/**
 * 계정을 바꿨을 때 앞 계정의 진행을 읽지 않도록 사용자 ID를 키에 넣는다.
 *
 * 탐색, 상세, 최근 대화와 대화 기록이 한 뿌리를 나눠 쓴다. 한 화가 끝나면 넷이
 * 함께 낡으므로 무효로 만드는 자리도 하나면 된다.
 */
export function storyQueryKey(userId: string) {
  return ["story", userId] as const;
}

export function useStories(
  userId: string | undefined,
  accessToken: string | undefined
) {
  return useQuery({
    enabled: userId !== undefined && accessToken !== undefined,
    queryFn: () => readStories(accessToken ?? ""),
    queryKey: [...storyQueryKey(userId ?? ""), "list"],
    retry: 1,
  });
}

export function storyDetailQueryOptions(
  userId: string,
  accessToken: string,
  storyId: string
) {
  return queryOptions<StoryDetail>({
    queryFn: () => readStoryDetail(accessToken, storyId),
    queryKey: [...storyQueryKey(userId), "detail", storyId],
    retry: 1,
  });
}

export function useStoryDetail(
  userId: string | undefined,
  accessToken: string | undefined,
  storyId: string | undefined
) {
  return useQuery({
    ...storyDetailQueryOptions(userId ?? "", accessToken ?? "", storyId ?? ""),
    enabled:
      userId !== undefined &&
      accessToken !== undefined &&
      storyId !== undefined,
  });
}

/** 스토리 탭의 최근 대화. 대화한 스토리가 하나씩 최근순으로 온다. */
export function useRecentStories(
  userId: string | undefined,
  accessToken: string | undefined
) {
  return useQuery({
    enabled: userId !== undefined && accessToken !== undefined,
    queryFn: () => readRecentStories(accessToken ?? ""),
    queryKey: [...storyQueryKey(userId ?? ""), "recent"],
    retry: 1,
  });
}

/** 스토리 하나의 대화 기록. 회차 카드가 여기서 온다. */
export function useStoryRuns(
  userId: string | undefined,
  accessToken: string | undefined,
  storyId: string | undefined
) {
  return useQuery<StoryRuns>({
    enabled:
      userId !== undefined &&
      accessToken !== undefined &&
      storyId !== undefined,
    queryFn: () => readStoryRuns(accessToken ?? "", storyId ?? ""),
    queryKey: [...storyQueryKey(userId ?? ""), "runs", storyId ?? ""],
    retry: 1,
  });
}

/** 결말이 난 뒤 목록과 기록을 서버에서 다시 읽게 한다. */
export function useStoryRefresh(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useCallback(
    () =>
      queryClient.invalidateQueries({
        queryKey: storyQueryKey(userId ?? ""),
      }),
    [queryClient, userId]
  );
}
