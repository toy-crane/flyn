import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  useEraseSavedExpression,
  useExpressionNote,
} from "@/features/note/query/expression-note";
import { ExpressionNoteScreen } from "@/screens/note/expression-note-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";

export default function NotesRoute() {
  const { session } = useAuthSession();
  const note = useExpressionNote(session?.user.id, session?.access_token);
  const { isRetrying, retry } = useVisibleRetry(note.refetch);
  const erase = useEraseSavedExpression(
    session?.user.id,
    session?.access_token
  );

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
