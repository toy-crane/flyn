import { useSyncExternalStore } from "react";
import { StyleSheet, Text } from "react-native";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";
import { LoadingIndicator } from "../feedback/loading-indicator";
import type { StreamingStore } from "./streaming-store";

const styles = StyleSheet.create({
  spinner: {
    alignSelf: "flex-start",
    marginLeft: spacing.xs,
  },
});

export function StreamingMessage({ store }: { store: StreamingStore }) {
  const { colors, typography } = useTheme();
  const text = useSyncExternalStore(store.subscribe, store.get);

  if (!text) {
    return (
      <LoadingIndicator
        accessibilityLabel="응답 생성 중"
        size="small"
        style={styles.spinner}
        testID="assistant-response-spinner"
      />
    );
  }

  return (
    <Text selectable style={[typography.message, { color: colors.text }]}>
      {text}
    </Text>
  );
}
