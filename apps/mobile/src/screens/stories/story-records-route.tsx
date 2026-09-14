import { useQueryClient } from "@tanstack/react-query";
import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useRef, useState } from "react";
import { Alert, Platform } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  deleteStoryPlay,
  type StoryDetail,
  type StoryPlay,
  type StoryPlays,
} from "@/features/story/api/story";
import { storyQueryKey, useStoryPlays } from "@/features/story/query/story";
import { useStartConversation } from "@/features/story/state/use-start-conversation";
import { storyLabels } from "@/features/story/ui/story-labels";
import { NewConversationAction } from "@/screens/stories/new-conversation-action";
import { StoryRecordsScreen } from "@/screens/stories/story-records-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/** 상세와 스토리 목록에서 여는 기록. 복귀 경로는 상위 Stack의 이력이 정한다. */
export function StoryRecordsRoute() {
  const { session } = useAuthSession();
  const params = useLocalSearchParams<{ storyId?: string | string[] }>();
  const storyId = firstParam(params.storyId);
  const queryClient = useQueryClient();
  const knownIntro =
    session?.user.id && storyId
      ? queryClient.getQueryData<StoryDetail>([
          ...storyQueryKey(session.user.id),
          "detail",
          storyId,
        ])
      : undefined;
  const deleting = useRef<{ storyPlayId?: string }>({});
  const [deletingStoryPlayId, setDeletingStoryPlayId] = useState<string>();
  const storyPlays = useStoryPlays(
    session?.user.id,
    session?.access_token,
    storyId
  );
  const { isRetrying, retry } = useVisibleRetry(storyPlays.refetch);
  const { onStart } = useStartConversation(
    session?.user.id,
    session?.access_token,
    storyId
  );
  const openEpisodes = useCallback(
    (storyPlay: StoryPlay) => {
      const rows = storyPlay.episodes.length + (storyPlay.next ? 1 : 0);
      router.push({
        params: {
          storyId: storyId ?? "",
          storyPlayId: storyPlay.storyPlayId,
        },
        pathname: rows <= 2 ? "/record-episodes-short" : "/record-episodes",
      });
    },
    [storyId]
  );
  const confirmDelete = useCallback(
    (storyPlayId: string) => {
      if (deleting.current.storyPlayId) {
        return;
      }
      const showConfirmation = (failed: boolean) => {
        Alert.alert(
          storyLabels.deleteRunTitle,
          failed
            ? `${storyLabels.deleteRunDescription}\n\n${storyLabels.deleteRunFailed}`
            : storyLabels.deleteRunDescription,
          [
            { style: "cancel", text: storyLabels.cancel },
            {
              onPress: async () => {
                if (
                  deleting.current.storyPlayId ||
                  !session?.access_token ||
                  !session.user.id ||
                  !storyId
                ) {
                  return;
                }
                deleting.current.storyPlayId = storyPlayId;
                setDeletingStoryPlayId(storyPlayId);
                try {
                  await deleteStoryPlay(
                    session.access_token,
                    storyId,
                    storyPlayId
                  );
                  const key = [
                    ...storyQueryKey(session.user.id),
                    "plays",
                    storyId,
                  ];
                  await queryClient.cancelQueries({ queryKey: key });
                  queryClient.setQueryData<StoryPlays>(key, (current) =>
                    current
                      ? {
                          ...current,
                          plays: current.plays.filter(
                            (play) => play.storyPlayId !== storyPlayId
                          ),
                        }
                      : current
                  );
                  await queryClient.invalidateQueries({
                    queryKey: storyQueryKey(session.user.id),
                  });
                } catch {
                  showConfirmation(true);
                } finally {
                  deleting.current.storyPlayId = undefined;
                  setDeletingStoryPlayId(undefined);
                }
              },
              style: "destructive",
              text: storyLabels.deleteRun,
            },
          ]
        );
      };
      showConfirmation(false);
    },
    [queryClient, session?.access_token, session?.user.id, storyId]
  );

  return (
    <>
      <StoryRecordsScreen
        deletingStoryPlayId={deletingStoryPlayId}
        isLoading={storyPlays.isPending && !isRetrying}
        isRetrying={isRetrying}
        onDelete={confirmDelete}
        onOpen={openEpisodes}
        onRetry={retry}
        storyIntro={knownIntro}
        storyPlays={storyPlays.data}
      />
      <Stack.Toolbar placement="right">
        {Platform.OS === "ios" ? (
          /*
            시스템 표현 그대로의 텍스트 버튼. 강조색이나 테두리를 따로 그리지
            않고, iOS 26의 시스템 캡슐 배경도 숨기지 않는다.
          */
          <Stack.Toolbar.Button
            accessibilityLabel={storyLabels.newConversation}
            onPress={onStart}
          >
            {storyLabels.newConversation}
          </Stack.Toolbar.Button>
        ) : (
          /*
            Android의 툴바 버튼은 아이콘만 그린다. 같은 자리에 텍스트를 넘기면
            헤더에 아무것도 나오지 않아 Android에서 새 대화를 시작할 길이 없어진다
            (2026-09-09 에뮬레이터에서 확인). 계약이 정한 대로 커스텀 뷰에
            플랫폼에 맞는 텍스트 컨트롤을 둔다.
          */
          <Stack.Toolbar.View>
            <NewConversationAction onPress={onStart} />
          </Stack.Toolbar.View>
        )}
      </Stack.Toolbar>
    </>
  );
}
