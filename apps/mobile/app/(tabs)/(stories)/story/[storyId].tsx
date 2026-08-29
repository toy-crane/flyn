import { router, useLocalSearchParams } from "expo-router";
import { useCallback } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import { useStoryDetail } from "@/features/story/query/story";
import { StoryDetailScreen } from "@/screens/stories/story-detail-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";

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
  const openEpisode = useCallback((episodeId: string) => {
    router.push({ params: { episodeId }, pathname: "/episode" });
  }, []);

  return (
    <StoryDetailScreen
      isLoading={story.isPending && !isRetrying}
      isRetrying={isRetrying}
      onOpenEpisode={openEpisode}
      onRetry={retry}
      story={story.data}
    />
  );
}
