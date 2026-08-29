import { router } from "expo-router";
import { useCallback } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import { useStories } from "@/features/story/query/story";
import { StoriesScreen } from "@/screens/stories/stories-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";

export default function StoriesRoute() {
  const { session } = useAuthSession();
  const stories = useStories(session?.user.id, session?.access_token);
  const { isRetrying, retry } = useVisibleRetry(stories.refetch);
  const openStory = useCallback((storyId: string) => {
    router.push({ params: { storyId }, pathname: "/story/[storyId]" });
  }, []);

  return (
    <StoriesScreen
      isLoading={stories.isPending && !isRetrying}
      isRetrying={isRetrying}
      onOpenStory={openStory}
      onRetry={retry}
      stories={stories.data}
    />
  );
}
