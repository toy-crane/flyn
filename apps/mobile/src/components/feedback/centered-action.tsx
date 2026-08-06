import { type ReactNode, useCallback } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";

const styles = StyleSheet.create({
  action: {
    borderRadius: 22,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  message: {
    textAlign: "center",
  },
});

/** 화면이 설 수 없을 때 무엇을 할 수 있는지 한 줄과 버튼 하나로 말한다. */
export function CenteredAction({
  actionLabel,
  message,
  onPress,
}: {
  actionLabel: string;
  message: string;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  const actionStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
    ],
    [colors.primary]
  );

  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <Text style={[styles.message, typography.body, { color: colors.text }]}>
        {message}
      </Text>
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={actionStyle}
      >
        <Text style={[typography.action, { color: colors.onPrimary }]}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

/** 불러오는 동안 서는 자리. 위 상태와 같은 프레임을 쓴다. */
export function CenteredState({ children }: { children: ReactNode }) {
  const { colors } = useTheme();

  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      {children}
    </View>
  );
}
