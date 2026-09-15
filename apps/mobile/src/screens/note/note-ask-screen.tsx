import { useChat } from "@ai-sdk/react";
import { useHeaderHeight } from "expo-router/react-navigation";
import { useEffect } from "react";
import { Platform, type TextInput } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  STREAM_UPDATE_INTERVAL_MS,
  useConversation,
} from "@/features/chat/state/use-conversation";
import { ChatPanel } from "@/features/chat/ui/chat-panel";
import { CorrectionSource } from "@/features/episode/ui/correction-source";
import { UtteranceMeaningSource } from "@/features/episode/ui/utterance-meaning";
import type { SavedExpression } from "@/features/note/api/expression-note";
import {
  type NoteAsk,
  useNoteAskDrafts,
  useNoteAsks,
} from "@/features/note/state/note-asks";
import { noteLabels } from "@/features/note/ui/note-labels";
import { useFocusOnArrival } from "@/shared/navigation/use-screen-arrival";

/**
 * 질문창 맨 위의 출처. 대화에서 연 질문창과 같은 카드라 어느 길로 열어도 같은 모양이다.
 *
 * 저장소가 인물 대사에는 화자를, 교정과 안내에는 내가 쓴 원문을 늘 함께 담는다. 뜻을
 * 찾지 못한 옛 항목은 노트 카드처럼 한국어 줄만 빈다.
 */
function NoteAskSource({ expression }: { expression: SavedExpression }) {
  if (expression.kind === "dialogue") {
    return (
      <UtteranceMeaningSource
        source={{
          meaning: expression.meaning ?? "",
          speaker: expression.speaker ?? "",
          text: expression.english,
        }}
      />
    );
  }

  return (
    <CorrectionSource
      correction={{
        fixed: expression.english,
        original: expression.original ?? "",
      }}
    />
  );
}

function NoteAskConversation({ ask }: { ask: NoteAsk }) {
  const { session } = useAuthSession();
  const chat = useChat({ chat: ask.chat, throttle: STREAM_UPDATE_INTERVAL_MS });
  const drafts = useNoteAskDrafts(ask.id);
  const conversation = useConversation(chat, drafts, session?.access_token);
  const headerHeight = useHeaderHeight();
  const inputRef = useFocusOnArrival<TextInput>();

  return (
    <ChatPanel
      chat={conversation}
      inputRef={inputRef}
      placeholder={noteLabels.askPlaceholder}
      source={<NoteAskSource expression={ask.expression} />}
      topInset={Platform.OS === "ios" ? headerHeight : 0}
    />
  );
}

/**
 * 표현 노트에 담아 둔 표현 하나를 두고 한국어로 묻는 자리.
 *
 * 대화에서 연 질문창과 같은 대화 화면이다. 다른 점은 대화의 주인이다. 여기서 연
 * 대화는 노트의 것이라 시트를 닫거나 다른 탭이나 원래 대화에 다녀와도 남는다. 이
 * 화면이 소유하는 것은 들어오는 길과 나가는 길뿐이라, 열려던 대화가 없으면
 * 시트가 스스로 닫힌다.
 */
export function NoteAskScreen({
  id,
  onMissing,
}: {
  id: string;
  onMissing: () => void;
}) {
  const { askOf } = useNoteAsks();
  const ask = askOf(id);
  const isMissing = ask === undefined;

  useEffect(() => {
    if (isMissing) {
      onMissing();
    }
  }, [isMissing, onMissing]);

  return ask ? <NoteAskConversation ask={ask} /> : null;
}
