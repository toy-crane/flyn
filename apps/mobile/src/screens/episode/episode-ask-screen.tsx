import { useChat } from "@ai-sdk/react";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect } from "react";
import type { TextInput } from "react-native";
import { Platform } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  STREAM_UPDATE_INTERVAL_MS,
  useConversation,
} from "@/features/chat/state/use-chat-session";
import { ChatPanel } from "@/features/chat/ui/chat-panel";
import {
  type EpisodeAsk,
  useEpisodeAskDrafts,
  useEpisodeAsks,
} from "@/features/episode/state/episode-asks";
import { CorrectionSource } from "@/features/episode/ui/correction-source";
import { correctionLabels } from "@/features/episode/ui/episode-labels";
import { useFocusOnArrival } from "@/shared/navigation/use-screen-arrival";

function AskConversation({ ask }: { ask: EpisodeAsk }) {
  const { session } = useAuthSession();
  const chat = useChat({ chat: ask.chat, throttle: STREAM_UPDATE_INTERVAL_MS });
  const drafts = useEpisodeAskDrafts(ask.id);
  const conversation = useConversation(chat, drafts, session?.access_token);
  const headerHeight = useHeaderHeight();
  const inputRef = useFocusOnArrival<TextInput>();

  return (
    <ChatPanel
      chat={conversation}
      inputRef={inputRef}
      placeholder={correctionLabels.askPlaceholder}
      // 본 채팅으로 무언가를 보내는 장치는 두지 않는다. 이 시트는 이해 전용이고,
      // 반영은 시트를 닫은 뒤 그대로 열려 있는 카드의 다시 보내기가 맡는다.
      source={<CorrectionSource correction={ask.correction} />}
      topInset={Platform.OS === "ios" ? headerHeight : 0}
    />
  );
}

/**
 * 배울 표현 하나를 두고 한국어로 묻는 자리.
 *
 * 대화 자체는 이 화면의 것이 아니라 에피소드의 것이고, 시트를 닫아도 그대로
 * 남는다. 이 화면이 소유하는 것은 들어오는 길과 나가는 길뿐이라, 열려던 대화가
 * 없으면 시트가 스스로 닫힌다.
 */
export function EpisodeAskScreen({
  id,
  onMissing,
}: {
  id: string;
  onMissing: () => void;
}) {
  const { askOf } = useEpisodeAsks();
  const ask = askOf(id);
  const isMissing = ask === undefined;

  useEffect(() => {
    if (isMissing) {
      onMissing();
    }
  }, [isMissing, onMissing]);

  return ask ? <AskConversation ask={ask} /> : null;
}
