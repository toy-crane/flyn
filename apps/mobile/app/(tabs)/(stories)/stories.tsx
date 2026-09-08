import { router } from "expo-router";
import { useCallback } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import { useRecentStories } from "@/features/story/query/story";
import { RecentStoriesScreen } from "@/screens/stories/recent-stories-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";

export default function StoriesRoute() {
  const { session } = useAuthSession();
  const stories = useRecentStories(session?.user.id, session?.access_token);
  const { isRetrying, retry } = useVisibleRetry(stories.refetch);
  const openRecords = useCallback((storyId: string) => {
    router.push({ params: { storyId }, pathname: "/records/[storyId]" });
  }, []);
  const browse = useCallback(() => {
    router.push("/browse");
  }, []);

  return (
    <RecentStoriesScreen
      isLoading={stories.isPending && !isRetrying}
      isRetrying={isRetrying}
      onBrowse={browse}
      onOpenRecords={openRecords}
      onRetry={retry}
      stories={stories.data}
    />
  );
}
