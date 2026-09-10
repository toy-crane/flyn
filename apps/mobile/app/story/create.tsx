import { router } from "expo-router";
import { useCallback } from "react";
import { useAuthSession } from "@/features/auth/state/auth-session";
import type { MadeStory } from "@/features/story/api/create-story";
import { useStoryRefresh } from "@/features/story/query/story";
import { CreateStoryScreen } from "@/screens/story/create-story-screen";

export default function CreateStoryRoute() {
  const { session } = useAuthSession();
  const refresh = useStoryRefresh(session?.user.id);

  /*
    저장이 끝나면 1화를 열고 이 화면은 남기지 않는다. `replace`라 1화에서 뒤로
    가면 탐색으로 돌아가고, 만들던 대화가 그 사이에 끼지 않는다.

    목록을 먼저 무르게 만든다. 탐색으로 돌아왔을 때 방금 만든 스토리가 이미
    거기 있어야 한다.
  */
  const openFirstEpisode = useCallback(
    ({ episodeId, storyId }: MadeStory) => {
      refresh();
      router.replace({
        params: { episodeId, storyId },
        pathname: "/episode",
      });
    },
    [refresh]
  );

  return <CreateStoryScreen onMade={openFirstEpisode} />;
}
