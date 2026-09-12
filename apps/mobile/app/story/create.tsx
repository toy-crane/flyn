import { router } from "expo-router";
import { useCallback } from "react";
import { useAuthSession } from "@/features/auth/state/auth-session";
import type { MadeStory } from "@/features/story/api/create-story";
import { useStoryRefresh } from "@/features/story/query/story";
import { CreateStoryScreen } from "@/screens/story/create-story-screen";

export default function CreateStoryRoute() {
  const { session } = useAuthSession();
  const refresh = useStoryRefresh(session?.user.id);

  // 만들기 화면 자리에 상세를 연다. 뒤로 가면 원래 탐색 화면이 남는다.
  const openStory = useCallback(
    ({ storyId }: MadeStory) => {
      refresh();
      router.replace({
        params: { storyId },
        pathname: "/story/[storyId]",
      });
    },
    [refresh]
  );

  return <CreateStoryScreen onMade={openStory} />;
}
