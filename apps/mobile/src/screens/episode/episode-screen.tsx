import { useHeaderHeight } from "expo-router/react-navigation";
import { useCallback, useMemo, useState } from "react";
import { Platform } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  useConversation,
  useLocalChatDrafts,
} from "@/features/chat/state/use-chat-session";
import { ChatPanel } from "@/features/chat/ui/chat-panel";
import { useEpisodeRun } from "@/features/episode/state/use-episode-run";
import { EpisodeClosing } from "@/features/episode/ui/episode-closing";
import { episodeLabels } from "@/features/episode/ui/episode-labels";

/**
 * 에피소드 하나를 사건 시작부터 결말까지 진행하는 화면.
 *
 * 화면이 두 겹인 이유는 다시 시작 때문이다. 안쪽을 새 `key`로 다시 그리면
 * 장면, 입력, 오류가 한꺼번에 사라지고 첫 장면부터 다시 열린다. 상태를 하나씩
 * 되돌리는 방법으로는 "처음부터"를 매번 똑같이 지키기 어렵다.
 */
export function EpisodeScreen({ onLeave }: { onLeave: () => void }) {
  const [attempt, setAttempt] = useState(0);
  const restart = useCallback(() => {
    setAttempt((count) => count + 1);
  }, []);

  return <CurrentEpisode key={attempt} onLeave={onLeave} onRestart={restart} />;
}

/**
 * 진행 중인 에피소드 하나.
 *
 * 대화를 굴리는 부분은 채팅 기능의 것을 그대로 쓰고, 에피소드 기능은 어떤
 * 경로로 무엇을 열고 언제 끝났는지를 소유한다. 둘을 잇는 자리가 이 화면이다.
 *
 * Side chat으로 들어가는 길은 넘기지 않는다. 잠깐 물어보기는 다음 단위이고,
 * 템플릿의 Side chat이 그 자리를 미리 차지하지 않는다.
 */
function CurrentEpisode({
  onLeave,
  onRestart,
}: {
  onLeave: () => void;
  onRestart: () => void;
}) {
  const { session } = useAuthSession();
  const accessToken = session?.access_token;
  const { chat, ending, open } = useEpisodeRun(accessToken);
  const drafts = useLocalChatDrafts();
  const conversation = useConversation(chat, drafts, accessToken);
  const headerHeight = useHeaderHeight();
  // 첫 장면을 받지 못했다면 다시 받을 것은 답변이 아니라 에피소드의 시작이다.
  // 되받을 답변이 없어 그냥 돌아서는 다시 시도는 눌러도 아무 일이 없다.
  const episode = useMemo(
    () => ({
      ...conversation,
      retry: conversation.messages.length === 0 ? open : conversation.retry,
    }),
    [conversation, open]
  );

  return (
    <ChatPanel
      chat={episode}
      closing={
        ending === undefined ? undefined : (
          <EpisodeClosing
            ending={ending}
            onLeave={onLeave}
            onRestart={onRestart}
          />
        )
      }
      hasMessageActions={false}
      placeholder={episodeLabels.input}
      topInset={Platform.OS === "ios" ? headerHeight : 0}
    />
  );
}
