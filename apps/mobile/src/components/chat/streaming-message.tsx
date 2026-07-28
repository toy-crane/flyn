import { useSyncExternalStore } from "react";
import { Text } from "react-native";
import type { StreamingStore } from "./streaming-store";

export function StreamingMessage({ store }: { store: StreamingStore }) {
  const text = useSyncExternalStore(store.subscribe, store.get);

  return (
    <Text className="text-base text-foreground leading-[23px]" selectable>
      {text || "…"}
      <Text className="text-muted-foreground">{"\u258C"}</Text>
    </Text>
  );
}
