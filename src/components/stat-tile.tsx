import { Text, View } from "@/tw";

/** One number and its caption — result stats and the profile's tile grid. */
export function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View className="flex-1 items-center rounded-control bg-surface px-2.5 py-3.5">
      <Text className="text-2xl font-bold text-foreground">{value}</Text>
      <Text className="text-xs text-muted">{label}</Text>
    </View>
  );
}
