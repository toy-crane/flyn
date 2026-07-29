import { useSyncExternalStore } from "react";
import { ActivityIndicator, Text } from "react-native";
import { useAppTheme } from "../../theme/app-theme";
import type { StreamingStore } from "./streaming-store";

export function StreamingMessage({ store }: { store: StreamingStore }) {
  const theme = useAppTheme();
  const text = useSyncExternalStore(store.subscribe, store.get);

  if (!text) {
    return (
      <ActivityIndicator
        accessibilityLabel="응답 생성 중"
        color={theme.mutedForeground}
        size="small"
        style={{ alignSelf: "flex-start", marginLeft: 8 }}
        testID="assistant-response-spinner"
      />
    );
  }

  return (
    <Text className="text-base text-foreground leading-[23px]" selectable>
      {text}
    </Text>
  );
}
