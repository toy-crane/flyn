import { useHeaderHeight } from "expo-router/react-navigation";
import { useMemo } from "react";
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
import { EpisodeSituationBanner } from "@/features/episode/ui/episode-situation-banner";

/**
 * 에피소드 하나를 사건 시작부터 결말까지 진행하는 화면.
 *
 * 대화를 굴리는 부분은 채팅 기능의 것을 그대로 쓰고, 에피소드 기능은 어떤
 * 경로로 무엇을 열고 언제 끝났는지를 소유한다. 둘을 잇는 자리가 이 화면이다.
 * 에피소드는 이 화면이 살아 있는 동안만 있으므로, 나가는 것도 다시 시작하는
 * 것도 화면을 여닫는 일이다. 그래서 둘 다 경로가 소유한다.
 *
 * Side chat으로 들어가는 길은 넘기지 않는다. 잠깐 물어보기는 다음 단위이고,
 * 템플릿의 Side chat이 그 자리를 미리 차지하지 않는다.
 */
export function EpisodeScreen({
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
      banner={
        <EpisodeSituationBanner
          emoji={episodeLabels.situationEmoji}
          text={episodeLabels.situation}
        />
      }
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
      placeholder={episodeLabels.placeholder}
      topInset={Platform.OS === "ios" ? headerHeight : 0}
    />
  );
}
