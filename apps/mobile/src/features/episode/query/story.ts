import { queryOptions, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { readStory, type Story } from "@/features/episode/api/story";

/** 계정을 바꿨을 때 앞 계정의 진행을 읽지 않도록 사용자 ID를 키에 넣는다. */
export function storyQueryKey(userId: string) {
  return ["story", userId] as const;
}

export function storyQueryOptions(userId: string, accessToken: string) {
  return queryOptions<Story>({
    queryFn: () => readStory(accessToken),
    queryKey: storyQueryKey(userId),
    retry: 1,
  });
}

export function useStory(
  userId: string | undefined,
  accessToken: string | undefined
) {
  return useQuery({
    ...storyQueryOptions(userId ?? "", accessToken ?? ""),
    enabled: userId !== undefined && accessToken !== undefined,
  });
}

/** 결말이 난 뒤 홈의 끝낸 목록과 다음 에피소드를 서버에서 다시 읽게 한다. */
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
