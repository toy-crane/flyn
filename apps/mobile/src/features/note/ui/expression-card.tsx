import { useCallback } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

import type { SavedExpression } from "@/features/note/api/expression-note";
import { MarkedSentence } from "@/shared/ui/marked-text";
import { noteLabels } from "./note-labels";

/** 밀면 드러나는 자리의 너비. 프로토타입의 88pt를 그대로 쓴다. */
const ERASE_WIDTH = 88;

/**
 * 카드의 색. 영어 교정은 보라, 한국어 안내는 초록으로, 대화 곁의 표현과 같은
 * 채널을 쓴다. 종류는 담을 때 서버가 정했으므로 여기서 다시 판정하지 않는다.
 */
function markClassName(kind: SavedExpression["kind"]): string {
  return kind === "guidance"
    ? "bg-expression-surface text-expression"
    : "bg-learn-surface text-learn";
}

/** 카드 맨 위 한 줄. 누구의 말인지와 어느 화에서 담았는지. */
function ExpressionSource({ expression }: { expression: SavedExpression }) {
  const isUtterance = expression.kind === "utterance";

  return (
    <View className="flex-row items-center gap-2">
      <Text
        className={`shrink-0 overflow-hidden rounded-[10px] px-2 py-0.5 font-semibold text-xs ${
          isUtterance
            ? "bg-background text-muted"
            : "bg-accent-soft text-accent"
        }`}
        selectable={false}
      >
        {isUtterance ? expression.speaker : noteLabels.mine}
      </Text>
      <Text
        className="shrink text-[13px] text-muted leading-[18px]"
        selectable={false}
      >
        {noteLabels.source(expression.storyTitle, expression.episodeNumber)}
      </Text>
    </View>
  );
}

/**
 * 인물의 대사. 영어 문장과 한국어 뜻 두 줄이다.
 *
 * 띠가 없다. 내가 쓴 말에서 온 표현과 이 카드를 가르는 것이 그 띠 하나여서,
 * 세 카드를 나란히 놓아도 모양으로 구분된다.
 */
function UtteranceBody({ expression }: { expression: SavedExpression }) {
  return (
    <>
      <Text
        className="font-semibold text-[17px] text-foreground leading-[25px]"
        selectable={false}
        testID="expression-card-english"
      >
        {expression.english}
      </Text>
      <Text
        className="text-[15px] text-muted leading-[22px]"
        selectable={false}
        testID="expression-card-meaning"
      >
        {expression.meaning}
      </Text>
    </>
  );
}

/**
 * 내가 쓴 말에서 온 표현. 띠 안의 원문, 고친 문장, 이유 세 덩어리다.
 *
 * 원문의 어긋난 자리는 밑줄로, 고친 문장의 달라진 자리는 형광펜으로 짚는다.
 * 표현이 여럿이면 이유도 그만큼 이어 놓는다. 라벨과 구분선은 두지 않는다.
 */
function LearningBody({ expression }: { expression: SavedExpression }) {
  const entries = expression.entries ?? [];

  return (
    <>
      <View className="my-px rounded-[11px] bg-background px-[11px] py-2">
        <MarkedSentence
          className="text-[15px] text-muted leading-[22px]"
          markClassName="underline"
          marks={entries.map((entry) => entry.original)}
          testID="expression-card-original"
          text={expression.original ?? ""}
        />
      </View>
      <MarkedSentence
        className="font-semibold text-[17px] text-foreground leading-[25px]"
        markClassName={markClassName(expression.kind)}
        marks={entries.map((entry) => entry.fixed)}
        testID="expression-card-english"
        text={expression.english}
      />
      <View>
        {entries.map((entry) => (
          <Text
            className="text-muted text-sm leading-[21px]"
            key={`${entry.original}:${entry.fixed}`}
            selectable={false}
          >
            {entry.why}
          </Text>
        ))}
      </View>
    </>
  );
}

/**
 * 담아 둔 표현 하나.
 *
 * 왼쪽으로 밀면 `삭제`가 드러나고, 누르면 확인 없이 사라진다. 되돌리기를 두지
 * 않는 것은 대화로 돌아가 다시 담을 수 있기 때문이다.
 */
export function ExpressionCard({
  expression,
  onErase,
}: {
  expression: SavedExpression;
  onErase: (id: string) => void;
}) {
  // 글자 크기가 바뀌면 카드 안의 이전 측정값을 버리고 다시 배치한다.
  const { fontScale } = useWindowDimensions();
  const erase = useCallback(() => {
    onErase(expression.id);
  }, [expression.id, onErase]);
  const eraseAction = useCallback(
    () => (
      <Pressable
        accessibilityLabel={noteLabels.erase}
        accessibilityRole="button"
        className="items-center justify-center bg-danger"
        onPress={erase}
        style={{ width: ERASE_WIDTH }}
        testID={`expression-erase-${expression.id}`}
      >
        <Text className="font-medium text-base text-danger-foreground">
          {noteLabels.erase}
        </Text>
      </Pressable>
    ),
    [erase, expression.id]
  );

  return (
    <Swipeable
      containerStyle={{ borderRadius: 18, overflow: "hidden" }}
      renderRightActions={eraseAction}
      rightThreshold={ERASE_WIDTH / 2}
      testID={`expression-card-${expression.id}`}
    >
      <View
        className="gap-1.5 rounded-[18px] bg-surface px-4 py-3.5"
        key={fontScale}
      >
        <ExpressionSource expression={expression} />
        {expression.kind === "utterance" ? (
          <UtteranceBody expression={expression} />
        ) : (
          <LearningBody expression={expression} />
        )}
      </View>
    </Swipeable>
  );
}
