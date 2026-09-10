import { router, Stack } from "expo-router";
import { useCallback } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import { useStories } from "@/features/story/query/story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { BrowseScreen } from "@/screens/browse/browse-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

/** 탭 바깥의 상세 계층으로 민다. 뒤로 가면 탐색으로 돌아온다. */
function createStory() {
  router.push("/story/create");
}

export default function BrowseRoute() {
  const { session } = useAuthSession();
  const stories = useStories(session?.user.id, session?.access_token);
  const { isRetrying, retry } = useVisibleRetry(stories.refetch);
  const openStory = useCallback((storyId: string) => {
    router.push({ params: { storyId }, pathname: "/story/[storyId]" });
  }, []);

  return (
    <>
      <BrowseScreen
        isLoading={stories.isPending && !isRetrying}
        isRetrying={isRetrying}
        onCreateStory={createStory}
        onOpenStory={openStory}
        onRetry={retry}
        stories={stories.data}
      />
      {/* 아이콘만 그리므로 무엇을 하는 자리인지는 접근성 이름이 말한다. */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel={storyLabels.createStory}
          icon={toolbarIcon("add")}
          onPress={createStory}
        />
      </Stack.Toolbar>
    </>
  );
}
