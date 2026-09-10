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
    저장이 끝나면 이 화면을 먼저 닫고 그 위에 1화를 연다. 그러면 1화 아래에 남는
    것이 탐색뿐이라, 뒤로 가면 탐색으로 돌아가고 만들던 대화가 그 사이에 끼지
    않는다.

    `replace` 한 번으로 바꾸지 않는다. 만들기 화면은 탐색 위에 있고 1화는 다른
    Stack이라, 그 자리를 그대로 갈아 끼우면 라우터가 스토리 상세를 사이에
    끼워 넣는다.

    목록을 먼저 무르게 만든다. 탐색으로 돌아왔을 때 방금 만든 스토리가 이미
    거기 있어야 한다.
  */
  const openFirstEpisode = useCallback(
    ({ episodeId, storyId }: MadeStory) => {
      refresh();
      router.back();
      router.push({
        params: { episodeId, storyId },
        pathname: "/episode",
      });
    },
    [refresh]
  );

  return <CreateStoryScreen onMade={openFirstEpisode} />;
}
