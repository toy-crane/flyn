import { LinkButton } from "heroui-native/link-button";
import { Typography } from "heroui-native/text";
import { useCallback } from "react";
import { Alert, View } from "react-native";

import type { SavedExpression } from "@/features/note/api/expression-note";
import {
  ExpressionCard,
  type ExpressionCardDetail,
} from "@/shared/ui/expression-card";
import { originalErrorMarks } from "@/shared/ui/expression-marks";
import { Icon } from "@/shared/ui/icon";
import { IconRow, IconRowButton } from "@/shared/ui/icon-row";
import { LoadingSpinner } from "@/shared/ui/loading-spinner";
import { expressionMarkClassName } from "./expression-marks";
import { noteLabels } from "./note-labels";

/**
 * `AI에게 물어보기`가 그려진 높이 36pt 위아래로 더하는 누르는 범위. 둘을 합쳐
 * 44pt가 된다. 아래 아이콘 줄과 붙어 서므로 그려진 높이를 줄이고 누르는 범위로 채운다.
 */
const LINK_HIT_SLOP = { bottom: 4, top: 4 } as const;

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

  if (expression.kind === "dialogue" || expression.original === null) {
    return;
  }

  return {
    original: expression.original,
    originalMarks: originalErrorMarks(
      entries,
      expression.original,
      expression.english
    ),
    whys: entries.map((entry) => entry.why),
  };
}

/**
 * 그 표현이 나온 대화로 가는 아이콘 버튼.
 *
 * 카드 아래 오른쪽 아이콘 줄에서 휴지통 앞에 선다. 대화가 아직 있는지 확인하는
 * 동안에는 말풍선 자리에 같은 16pt의 진행 표시를 두고 다시 눌리지 않는다.
 */
function OpenConversationButton({
  isOpening,
  onPress,
  testID,
}: {
  isOpening: boolean;
  onPress: () => void;
  testID: string;
}) {
  return (
    <IconRowButton
      isBusy={isOpening}
      label={noteLabels.openConversation}
      onPress={onPress}
      testID={testID}
    >
      {isOpening ? (
        <LoadingSpinner sizeRole="compactControl" />
      ) : (
        <Icon name="conversation" size="sm" tone="muted" />
      )}
    </IconRowButton>
  );
}

/**
 * 담아 둔 표현 하나.
 *
 * 밀어서 지우지 않는다. 카드를 누르는 것은 펼치는 동작이고, 지우는 것은 아래
 * 줄의 휴지통이 확인창을 거쳐 맡는다. 미는 동작과 누르는 동작이 한 카드에
 * 겹치면 펼치려다 지우는 자리가 드러난다.
 *
 * 카드 아래에는 두 줄이 선다. 첫 줄은 `AI에게 물어보기`이고, 둘째 줄은 오른쪽의
 * 아이콘 줄로 `대화에서 보기`와 휴지통이다. 복사는 두지 않는다. 둘 다 펼침 카드의
 * 트리거 밖이라 눌러도 카드가 접히거나 펼쳐지지 않는다. 돌아갈 대화가 없는 표현은
 * `대화에서 보기`만 빠진다. 비활성 버튼이나 삭제 안내로 바꾸지 않는다.
 */
export function NoteExpressionCard({
  expression,
  isOpeningConversation,
  onAsk,
  onErase,
  onOpenConversation,
}: {
  expression: SavedExpression;
  /** 이 카드의 대화가 아직 있는지 확인하는 중인지. */
  isOpeningConversation: boolean;
  onAsk: (expression: SavedExpression) => void;
  onErase: (id: string) => void;
  /** 돌아갈 대화가 없으면 넘기지 않는다. 그러면 `대화에서 보기`가 서지 않는다. */
  onOpenConversation: ((expression: SavedExpression) => void) | undefined;
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
  const ask = useCallback(() => onAsk(expression), [expression, onAsk]);
  const openConversation = useCallback(
    () => onOpenConversation?.(expression),
    [expression, onOpenConversation]
  );
  const source = noteLabels.source(
    expression.storyTitle,
    expression.episodeNumber
  );

  return (
    <ExpressionCard
      actions={
        <View className="mt-1" pointerEvents="box-none">
          <LinkButton
            accessibilityLabel={noteLabels.ask}
            className="min-h-9 gap-0.5 self-start"
            hitSlop={LINK_HIT_SLOP}
            onPress={ask}
            size="sm"
            testID={`expression-ask-${expression.id}`}
          >
            <LinkButton.Label className="text-accent">
              {noteLabels.ask}
            </LinkButton.Label>
            <Icon name="forward" size="xs" tone="accent" />
          </LinkButton>
          <View
            className="min-h-9 flex-row items-center justify-end"
            pointerEvents="box-none"
          >
            {/* 아이콘 줄이 가진 윗여백을 덜어 36pt 줄의 가운데에 선다. */}
            <View className="-mt-1.5" pointerEvents="box-none">
              <IconRow align="end" testID={`expression-icons-${expression.id}`}>
                {onOpenConversation === undefined ? null : (
                  <OpenConversationButton
                    isOpening={isOpeningConversation}
                    onPress={openConversation}
                    testID={`expression-open-conversation-${expression.id}`}
                  />
                )}
                <IconRowButton
                  label={noteLabels.erase}
                  onPress={confirmErase}
                  testID={`expression-erase-${expression.id}`}
                >
                  <Icon name="trash" size="sm" tone="muted" />
                </IconRowButton>
              </IconRow>
            </View>
          </View>
        </View>
      }
      detail={cardDetail(expression)}
      english={expression.english}
      header={
        <Typography.Paragraph
          className="flex-1"
          color="muted"
          selectable={false}
          type="body-xs"
        >
          {source}
        </Typography.Paragraph>
      }
      headerLabel={source}
      markClassName={expressionMarkClassName(expression.kind)}
      marks={(expression.entries ?? []).map((entry) => entry.fixed)}
      meaning={expression.meaning}
      testID={`expression-card-${expression.id}`}
    />
  );
}
