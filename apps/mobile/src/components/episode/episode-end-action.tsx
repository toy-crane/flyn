import { useCallback } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EpisodeEndReason } from "../../lib/episodes";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
  },
  note: {
    paddingBottom: spacing.xxs,
    paddingTop: spacing.sm,
    textAlign: "center",
  },
  surface: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
});

/**
 * 끝난 이유 한 줄. 턴 상한은 **에피소드가 든 값**을 그대로 읽는다 — 코드 상수를
 * 읽으면 상수를 바꾼 뒤 이미 끝난 대화가 다른 숫자를 말한다.
 */
export function endingNote(reason: EpisodeEndReason, turnLimit: number) {
  return reason === "goals_met"
    ? "목표를 모두 달성해서 대화가 끝났어요"
    : `${turnLimit}턴을 다 써서 대화가 끝났어요`;
}

/**
 * 대화가 끝난 자리. composer가 있던 곳에 끝난 이유와 `결과 보기`가 대신 서고,
 * 위의 대화는 그대로 남는다.
 */
export function EpisodeEndAction({
  onOpenResult,
  reason,
  turnLimit,
}: {
  onOpenResult: () => void;
  reason: EpisodeEndReason;
  turnLimit: number;
}) {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const actionStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
    ],
    [colors.primary]
  );

  return (
    <View
      style={[
        styles.surface,
        {
          backgroundColor: colors.background,
          borderTopColor: colors.separator,
          paddingBottom: Math.max(insets.bottom, spacing.lg),
        },
      ]}
      testID="episode-end-action"
    >
      <Text
        style={[
          styles.note,
          typography.caption,
          { color: colors.secondaryText },
        ]}
        testID="episode-end-note"
      >
        {endingNote(reason, turnLimit)}
      </Text>
      <Pressable
        accessibilityLabel="결과 보기"
        accessibilityRole="button"
        onPress={onOpenResult}
        style={actionStyle}
      >
        <Text style={[typography.action, { color: colors.onPrimary }]}>
          결과 보기
        </Text>
      </Pressable>
    </View>
  );
}
