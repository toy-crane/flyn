import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import {
  type Home,
  readHome,
  readStories,
  readStoryDetail,
  type StoryDetail,
} from "@/features/story/api/story";

/**
 * 계정을 바꿨을 때 앞 계정의 진행을 읽지 않도록 사용자 ID를 키에 넣는다.
 *
 * 홈, 목록, 상세가 한 뿌리를 나눠 쓴다. 한 화가 끝나면 셋이 함께 낡으므로
 * 무효로 만드는 자리도 하나면 된다.
 */
export function storyQueryKey(userId: string) {
  return ["story", userId] as const;
}

export function homeQueryOptions(userId: string, accessToken: string) {
  return queryOptions<Home>({
    queryFn: () => readHome(accessToken),
    queryKey: [...storyQueryKey(userId), "home"],
    retry: 1,
  });
}

export function useHome(
  userId: string | undefined,
  accessToken: string | undefined
) {
  return useQuery({
    ...homeQueryOptions(userId ?? "", accessToken ?? ""),
    enabled: userId !== undefined && accessToken !== undefined,
  });
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

export function useStoryDetail(
  userId: string | undefined,
  accessToken: string | undefined,
  storyId: string | undefined
) {
  return useQuery<StoryDetail>({
    enabled:
      userId !== undefined &&
      accessToken !== undefined &&
      storyId !== undefined,
    queryFn: () => readStoryDetail(accessToken ?? "", storyId ?? ""),
    queryKey: [...storyQueryKey(userId ?? ""), "detail", storyId ?? ""],
    retry: 1,
  });
}

/** 결말이 난 뒤 홈, 목록, 상세를 서버에서 다시 읽게 한다. */
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
