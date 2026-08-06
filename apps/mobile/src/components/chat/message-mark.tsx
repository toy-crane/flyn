import { useCallback } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  View,
} from "react-native";
import type { MessageMark } from "../../lib/message-feedback";
import { useTheme } from "../../theme/app-theme";
import { RNSymbol } from "../symbols/rn-symbol";

/** 표시 자리는 44pt 고정 열이다. 비었다가 채워지는 것이 기본 동작이다. */
export const MARK_COLUMN_SIZE = 44;

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    borderRadius: 13,
    height: 26,
    justifyContent: "center",
    width: 26,
  },
  column: {
    alignItems: "center",
    height: MARK_COLUMN_SIZE,
    justifyContent: "center",
    width: MARK_COLUMN_SIZE,
  },
});

const LABELS: Record<MessageMark, string> = {
  clear: "그대로 잘 통했어요",
  improvable: "더 자연스러운 표현 보기",
  translated: "한글로 쓴 문장 보기",
};

/**
 * 말풍선 곁의 표시. 누를 수 있는 둘은 원형 버튼으로, 상태인 체크는 배경 없는
 * 플랫 아이콘으로 그려 무엇이 눌리는지 모양이 먼저 말하게 한다. 터치 영역은
 * 열 전체인 44×44pt다.
 */
export function MessageMarkView({
  mark,
  onPress,
}: {
  mark: MessageMark;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const columnStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.column,
      { opacity: pressed ? 0.5 : 1 },
    ],
    []
  );

  if (mark === "clear") {
    return (
      <View
        accessibilityLabel={LABELS.clear}
        accessibilityRole="image"
        style={styles.column}
        testID="message-mark-clear"
      >
        <RNSymbol color={colors.success} symbol="passed" />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={LABELS[mark]}
      accessibilityRole="button"
      onPress={onPress}
      style={columnStyle}
      testID={`message-mark-${mark}`}
    >
      <View style={[styles.circle, { backgroundColor: colors.surface }]}>
        <RNSymbol
          color={colors.secondaryText}
          symbol={mark === "translated" ? "translated" : "improvable"}
        />
      </View>
    </Pressable>
  );
}
