import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import { useStoryRuns } from "@/features/story/query/story";
import { useStartConversation } from "@/features/story/state/use-start-conversation";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryRecordsScreen } from "@/screens/stories/story-records-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * 대화 기록 화면의 라우트 본체.
 *
 * 탐색 탭과 스토리 탭이 각자의 스택에 같은 화면을 둔다. 뒤로 가기가 들어온
 * 화면으로 돌아가야 해서 경로는 둘이지만, 하는 일은 같으므로 여기 한 번만 적고
 * 두 경로 파일이 이것을 그린다.
 */
export function StoryRecordsRoute() {
  const { session } = useAuthSession();
  const params = useLocalSearchParams<{ storyId?: string | string[] }>();
  const storyId = firstParam(params.storyId);
  const runs = useStoryRuns(session?.user.id, session?.access_token, storyId);
  const { isRetrying, retry } = useVisibleRetry(runs.refetch);
  const { onStart } = useStartConversation(
    session?.user.id,
    session?.access_token,
    storyId
  );
  const openEpisode = useCallback((runId: string, episodeId: string) => {
    router.push({
      params: { episodeId, runId },
      pathname: "/episode",
    });
  }, []);

  return (
    <>
      <StoryRecordsScreen
        isLoading={runs.isPending && !isRetrying}
        isRetrying={isRetrying}
        onOpenEpisode={openEpisode}
        onResume={openEpisode}
        onRetry={retry}
        runs={runs.data}
      />
      <Stack.Toolbar placement="right">
        {/*
          시스템 표현 그대로의 텍스트 버튼. 강조색이나 테두리를 따로 그리지
          않고, iOS 26의 시스템 캡슐 배경도 숨기지 않는다.
        */}
        <Stack.Toolbar.Button
          accessibilityLabel={storyLabels.newConversation}
          onPress={onStart}
        >
          {storyLabels.newConversation}
        </Stack.Toolbar.Button>
      </Stack.Toolbar>
    </>
  );
}
