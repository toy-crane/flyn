import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  useEraseSavedExpression,
  useExpressionNote,
} from "@/features/note/query/expression-note";
import { ExpressionNoteScreen } from "@/screens/note/expression-note-screen";
import { useRefetchOnFocus } from "@/shared/query/use-refetch-on-focus";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";

export default function NotesRoute() {
  const { session } = useAuthSession();
  const note = useExpressionNote(session?.user.id, session?.access_token);
  const { isRetrying, retry } = useVisibleRetry(note.refetch);
  const erase = useEraseSavedExpression(
    session?.user.id,
    session?.access_token
  );

  // 담고 취소하는 일은 모두 대화에서 일어난다. 탭으로 돌아올 때마다 다시 묻지
  // 않으면 방금 담은 것이 노트에 없다.
  useRefetchOnFocus(note.refetch);

  return (
    <ExpressionNoteScreen
      expressions={note.data}
      isLoading={note.isPending && !isRetrying}
      isRetrying={isRetrying}
      onErase={erase}
      onRetry={retry}
    />
  );
}
