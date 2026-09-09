import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import { useStoryDetail } from "@/features/story/query/story";
import { useStartConversation } from "@/features/story/state/use-start-conversation";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryDetailScreen } from "@/screens/stories/story-detail-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function StoryDetailRoute() {
  const { session } = useAuthSession();
  const params = useLocalSearchParams<{ storyId?: string | string[] }>();
  const storyId = firstParam(params.storyId);
  const story = useStoryDetail(
    session?.user.id,
    session?.access_token,
    storyId
  );
  const { isRetrying, retry } = useVisibleRetry(story.refetch);
  const { isStarting, onStart } = useStartConversation(
    session?.user.id,
    session?.access_token,
    storyId
  );
  const openRecords = useCallback(() => {
    if (storyId) {
      router.push({
        params: { storyId },
        pathname: "/story/[storyId]/records",
      });
    }
  }, [storyId]);

  return (
    <>
      <StoryDetailScreen
        isLoading={story.isPending && !isRetrying}
        isRetrying={isRetrying}
        isStarting={isStarting}
        onRetry={retry}
        onStart={onStart}
        story={story.data}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={storyLabels.records}
          icon={toolbarIcon("records")}
          onPress={openRecords}
        />
      </Stack.Toolbar>
    </>
  );
}
