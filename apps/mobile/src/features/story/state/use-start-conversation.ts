import { useQueryClient } from "@tanstack/react-query";
import { router } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert } from "react-native";

import { storyDetailQueryOptions } from "@/features/story/query/story";
import { storyLabels } from "@/features/story/ui/story-labels";

/**
 * 새 대화를 여는 하나뿐인 길.
 *
 * 상세의 `대화 시작하기`와 대화 기록의 `새 대화`가 같은 것을 쓴다. 두 자리가
 * 하는 일이 같기 때문이다: 이 스토리의 1화를 회차 없이 연다.
 *
 * 회차는 여기서 만들지 않는다. 사용자가 1화에서 처음 말할 때 서버가 만든다.
 * 그래서 첫 장면만 보고 뒤로 가면 기록에 아무 줄도 생기지 않고, 실패하거나
 * 알림창을 닫는 것만으로도 새 회차가 생기지 않는다.
 *
 * 여는 화면이 필요로 하는 것은 1화의 id와 제목과 상황 설명이라, 상세를 먼저
 * 확보한다. 상세에서 눌렀으면 이미 읽어 둔 것이 그대로 쓰이고, 대화 기록에서
 * 눌렀으면 여기서 읽는다. 읽지 못하면 그 화면에 머문 채 알림창으로 알린다.
 */
export function useStartConversation(
  userId: string | undefined,
  accessToken: string | undefined,
  storyId: string | undefined
) {
  const queryClient = useQueryClient();
  const [isStarting, setIsStarting] = useState(false);
  // 두 번 눌러도 한 번만 연다. 렌더보다 먼저 잡아야 같은 프레임의 두 번째
  // 누름이 통과하지 않는다. 지금 여는 스토리를 담아 두는 것으로 그 자리를 잡는다.
  const opening = useRef<string | undefined>(undefined);
  const retry = useRef<() => void>(() => undefined);

  const start = useCallback(async () => {
    if (opening.current !== undefined || !(userId && accessToken && storyId)) {
      return;
    }

    opening.current = storyId;
    setIsStarting(true);

    try {
      const detail = await queryClient.fetchQuery(
        storyDetailQueryOptions(userId, accessToken, storyId)
      );
      const [first] = detail.episodes;

      if (!first) {
        throw new Error(`Story ${storyId} has no first episode.`);
      }

      router.push({
        params: { episodeId: first.episodeId, storyId },
        pathname: "/episode",
      });
    } catch {
      Alert.alert(storyLabels.startFailedTitle, undefined, [
        { style: "cancel", text: storyLabels.startFailedClose },
        {
          onPress: () => {
            retry.current();
          },
          text: storyLabels.startFailedRetry,
        },
      ]);
    } finally {
      opening.current = undefined;
      setIsStarting(false);
    }
  }, [accessToken, queryClient, storyId, userId]);

  retry.current = () => {
    start().catch(() => undefined);
  };

  const onStart = useCallback(() => {
    // 실패는 위에서 알림창으로 알린다. 여기서는 뜨는 거절만 막는다.
    start().catch(() => undefined);
  }, [start]);

  return { isStarting, onStart };
}
