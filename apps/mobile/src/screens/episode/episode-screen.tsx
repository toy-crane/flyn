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
 * 화를 어디까지 진행했는지를 소유한다. 둘을 잇는 자리가 이 화면이다. 진행하던
 * 장면은 이 화면이 살아 있는 동안만 있으므로 나가는 것도 경로가 소유하고,
 * 다음 화로 넘어가는 것도 이 화면을 새로 여는 일이라 경로가 소유한다.
 *
 * 어느 화인지는 화면이 정하지 않는다. 계정의 진행이 정한 화를 경로가 넘겨
 * 주고, 경로는 그 화를 알기 전에 이 화면을 그리지 않는다. 상황 줄이 뒤늦게
 * 생기면 장면 목록이 이미 잡아 둔 배치와 어긋나 첫 장면이 화면 밖에 남는다.
 *
 * Side chat으로 들어가는 길은 넘기지 않는다. 잠깐 물어보기는 다음 단위이고,
 * 템플릿의 Side chat이 그 자리를 미리 차지하지 않는다.
 */
export function EpisodeScreen({
  episode,
  onLeave,
  onStartNext,
  situation,
  situationEmoji,
}: {
  episode: number;
  onLeave: () => void;
  onStartNext: () => void;
  situation: string;
  situationEmoji: string;
}) {
  const { session } = useAuthSession();
  const accessToken = session?.access_token;
  const { chat, ending, nextUp, open } = useEpisodeRun(accessToken, episode);
  const drafts = useLocalChatDrafts();
  const conversation = useConversation(chat, drafts, accessToken);
  const headerHeight = useHeaderHeight();
  // 첫 장면을 받지 못했다면 다시 받을 것은 답변이 아니라 에피소드의 시작이다.
  // 되받을 답변이 없어 그냥 돌아서는 다시 시도는 눌러도 아무 일이 없다.
  const conversationRun = useMemo(
    () => ({
      ...conversation,
      retry: conversation.messages.length === 0 ? open : conversation.retry,
    }),
    [conversation, open]
  );

  return (
    <ChatPanel
      banner={
        <EpisodeSituationBanner emoji={situationEmoji} text={situation} />
      }
      chat={conversationRun}
      closing={
        ending === undefined ? undefined : (
          <EpisodeClosing
            ending={ending}
            nextUp={nextUp}
            onLeave={onLeave}
            onStartNext={onStartNext}
          />
        )
      }
      hasMessageActions={false}
      placeholder={episodeLabels.placeholder}
      topInset={Platform.OS === "ios" ? headerHeight : 0}
    />
  );
}
