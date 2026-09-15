import { router } from "expo-router";
import { useCallback } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import type {
  SavedExpression,
  SavedExpressionConversation,
} from "@/features/note/api/expression-note";
import {
  useEraseSavedExpression,
  useExpressionNote,
  useExpressionNoteRefresh,
} from "@/features/note/query/expression-note";
import { useNoteAsks } from "@/features/note/state/note-asks";
import { useNoteConversationOpener } from "@/features/note/state/note-conversation-opener";
import { noteLabels } from "@/features/note/ui/note-labels";
import { ExpressionNoteScreen } from "@/screens/note/expression-note-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";
import { useScreenToast } from "@/shared/ui/screen-toast";

/**
 * 표현이 나온 대화를 연다. 노트는 탭 안에 있고 대화는 탭 위에서 열리므로, 뒤로
 * 가면 읽던 자리와 펼친 카드가 그대로인 노트로 돌아온다.
 *
 * 저장한 표현의 자리를 함께 넘긴다. 대화 화면은 그 자리에서 읽기를 시작하고
 * 그 표현을 잠깐 짚는다.
 */
function openConversation(conversation: SavedExpressionConversation) {
  router.push({
    params: {
      episodeId: conversation.episodeId,
      focusMessageId: conversation.messageId,
      ...(conversation.dialogueIndex === null
        ? {}
        : { focusDialogueIndex: String(conversation.dialogueIndex) }),
      storyPlayId: conversation.storyPlayId,
    },
    pathname: "/episode",
  });
}

export default function NotesRoute() {
  const { session } = useAuthSession();
  const note = useExpressionNote(session?.user.id, session?.access_token);
  const { isRetrying, retry } = useVisibleRetry(note.refetch);
  const erase = useEraseSavedExpression(
    session?.user.id,
    session?.access_token
  );
  const refreshNote = useExpressionNoteRefresh();
  const { openAsk } = useNoteAsks();
  const { show, toast } = useScreenToast();
  const ask = useCallback(
    (expression: SavedExpression) => {
      router.push({
        params: { id: openAsk(expression) },
        pathname: "/note-ask",
      });
    },
    [openAsk]
  );
  const showMissing = useCallback(() => {
    show({ text: noteLabels.conversationMissing });
    // 서버도 이제 원본을 잃은 항목으로 답한다. 다시 읽어 목록을 맞춘다.
    refreshNote();
  }, [refreshNote, show]);
  const opener = useNoteConversationOpener({
    accessToken: session?.access_token,
    onFound: openConversation,
    onMissing: showMissing,
  });

  return (
    <ExpressionNoteScreen
      expressions={note.data}
      isLoading={note.isPending && !isRetrying}
      isRetrying={isRetrying}
      missingConversationIds={opener.missingIds}
      onAsk={ask}
      onErase={erase}
      onOpenConversation={opener.open}
      onRetry={retry}
      openingConversationId={opener.openingId}
      toast={toast}
    />
  );
}
