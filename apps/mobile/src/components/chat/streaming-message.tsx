import { useSyncExternalStore } from "react";
import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { useColors } from "../../theme/app-theme";
import { spacing, typography } from "../../theme/tokens";
import type { StreamingStore } from "./streaming-store";

const styles = StyleSheet.create({
  spinner: {
    alignSelf: "flex-start",
    marginLeft: spacing.xs,
  },
  text: typography.message,
});

export function StreamingMessage({ store }: { store: StreamingStore }) {
  const colors = useColors();
  const text = useSyncExternalStore(store.subscribe, store.get);

  if (!text) {
    return (
      <ActivityIndicator
        accessibilityLabel="응답 생성 중"
        color={colors.secondaryText}
        size="small"
        style={styles.spinner}
        testID="assistant-response-spinner"
      />
    );
  }

  return (
    <Text selectable style={[styles.text, { color: colors.text }]}>
      {text}
    </Text>
  );
}
