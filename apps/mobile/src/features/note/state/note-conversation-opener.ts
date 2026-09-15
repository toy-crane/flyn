import { useCallback, useRef, useState } from "react";

import type {
  SavedExpression,
  SavedExpressionConversation,
} from "@/features/note/api/expression-note";
import { readNoteConversation } from "@/features/note/api/note-conversation";

const NO_MISSING: ReadonlySet<string> = new Set();

/**
 * 카드의 `대화에서 보기`가 그 대화로 가기 전에 대화가 아직 있는지 확인한다.
 *
 * 노트는 목록을 읽은 뒤에도 그대로 붙어 있다. 그사이 다른 기기에서 회차를 지우거나
 * 다시 받기로 메시지가 사라지면, 버튼은 보이는데 갈 대화가 없다. 그래서 누를 때
 * 확인하고, 없으면 대화 화면으로 가지 않고 노트에 머물며 알린다. 그 표현은 이
 * 화면에 머무는 동안 없는 대화로 두어 버튼을 다시 세우지 않는다.
 *
 * 연결이 끊겨 확인하지 못한 것은 없는 대화가 아니다. 멀쩡한 입구를 숨기지 않고
 * 대화 화면으로 보내, 그 화면이 자기 실패와 다시 시도를 보여 주게 한다.
 *
 * 한 번에 하나만 확인한다. 확인하는 동안 누른 것은 모두 버린다. 두 대화를 차례로
 * 여는 것은 사람이 뜻한 일이 아니다.
 */
export function useNoteConversationOpener({
  accessToken,
  onFound,
  onMissing,
}: {
  accessToken: string | undefined;
  onFound: (conversation: SavedExpressionConversation) => void;
  onMissing: (expression: SavedExpression) => void;
}): {
  missingIds: ReadonlySet<string>;
  open: (expression: SavedExpression) => Promise<void>;
  openingId: string | undefined;
} {
  const [openingId, setOpeningId] = useState<string>();
  const [missingIds, setMissingIds] = useState<ReadonlySet<string>>(NO_MISSING);
  const isChecking = useRef(false);

  const open = useCallback(
    async (expression: SavedExpression) => {
      const { conversation } = expression;

      if (!(conversation && accessToken) || isChecking.current) {
        return;
      }

      isChecking.current = true;
      setOpeningId(expression.id);

      let found: boolean;

      try {
        found =
          (await readNoteConversation(accessToken, conversation)) !== null;
      } catch {
        found = true;
      } finally {
        isChecking.current = false;
        setOpeningId(undefined);
      }

      if (found) {
        onFound(conversation);
        return;
      }

      setMissingIds((current) => new Set([...current, expression.id]));
      onMissing(expression);
    },
    [accessToken, onFound, onMissing]
  );

  return { missingIds, open, openingId };
}
