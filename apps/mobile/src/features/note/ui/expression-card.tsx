import { useCallback } from "react";
import { Alert, Text } from "react-native";

import type { SavedExpression } from "@/features/note/api/expression-note";
import {
  ExpressionCard,
  type ExpressionCardDetail,
} from "@/shared/ui/expression-card";
import { Icon } from "@/shared/ui/icon";
import {
  IconRow,
  IconRowButton,
  IconRowCopyButton,
} from "@/shared/ui/icon-row";
import { noteLabels } from "./note-labels";

/**
 * 카드의 색. 영어 교정은 보라, 한국어 안내는 초록으로, 대화 곁의 표현과 같은
 * 채널을 쓴다. 종류는 담을 때 서버가 정했으므로 여기서 다시 판정하지 않는다.
 *
 * 인물 대사에는 형광펜이 없다. 짚을 자리가 없는 것이 곧 그 카드의 표시다.
 */
function markClassName(kind: SavedExpression["kind"]): string {
  if (kind === "utterance") {
    return "";
  }

  return kind === "guidance"
    ? "bg-expression-surface text-expression"
    : "bg-learn-surface text-learn";
}

/**
 * 펼쳐서 보여 줄 것. 인물 대사에는 없다.
 *
 * 내가 쓴 문장이 없으면 펼칠 것도 없다. 담을 때 함께 저장하므로 교정과 안내는
 * 언제나 가지고 있지만, 옛 항목이 비어 있어도 카드가 깨지지 않게 둔다.
 */
function cardDetail(
  expression: SavedExpression
): ExpressionCardDetail | undefined {
  const entries = expression.entries ?? [];

  if (expression.kind === "utterance" || expression.original === null) {
    return;
  }

  return {
    original: expression.original,
    originalMarks: entries.map((entry) => entry.original),
    whys: entries.map((entry) => entry.why),
  };
}

/**
 * 담아 둔 표현 하나.
 *
 * 밀어서 지우지 않는다. 카드를 누르는 것은 펼치는 동작이고, 지우는 것은 아래
 * 줄의 휴지통이 확인창을 거쳐 맡는다. 미는 동작과 누르는 동작이 한 카드에
 * 겹치면 펼치려다 지우는 자리가 드러난다.
 */
export function NoteExpressionCard({
  expression,
  onErase,
}: {
  expression: SavedExpression;
  onErase: (id: string) => void;
}) {
  const confirmErase = useCallback(() => {
    Alert.alert(noteLabels.eraseConfirmTitle, undefined, [
      { style: "cancel", text: noteLabels.cancel },
      {
        onPress: () => onErase(expression.id),
        style: "destructive",
        text: noteLabels.erase,
      },
    ]);
  }, [expression.id, onErase]);
  const source = noteLabels.source(
    expression.storyTitle,
    expression.episodeNumber
  );

  return (
    <ExpressionCard
      actions={
        <IconRow align="end">
          <IconRowCopyButton
            label={noteLabels.copy}
            text={expression.english}
          />
          <IconRowButton
            label={noteLabels.erase}
            onPress={confirmErase}
            testID={`expression-erase-${expression.id}`}
          >
            <Icon name="trash" size="sm" tone="muted" />
          </IconRowButton>
        </IconRow>
      }
      detail={cardDetail(expression)}
      english={expression.english}
      header={
        <Text
          className="flex-1 text-muted text-xs leading-[18px]"
          selectable={false}
        >
          {source}
        </Text>
      }
      headerLabel={source}
      markClassName={markClassName(expression.kind)}
      marks={(expression.entries ?? []).map((entry) => entry.fixed)}
      meaning={expression.meaning}
      testID={`expression-card-${expression.id}`}
    />
  );
}
