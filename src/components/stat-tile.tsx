import { Text, View } from "@/tw";

/** One number and its caption — result stats and the profile's tile grid. */
export function StatTile({ value, label }: { value: number; label: string }) {
  return (
    <View
      className="flex-1 items-center rounded-card bg-cell px-2.5 py-3.5"
      style={{ borderCurve: "continuous" }}
    >
      <Text
        className="text-2xl font-bold text-label"
        style={{ fontVariant: ["tabular-nums"] }}
      >
        {value}
      </Text>
      <Text className="text-xs text-secondary">{label}</Text>
    </View>
  );
}
