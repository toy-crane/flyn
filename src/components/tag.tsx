import { Text, View } from "@/tw";

/** The genre pill on a scenario card. */
export function Tag({ label }: { label: string }) {
  return (
    <View className="self-start rounded-full bg-accent-soft px-2.5 py-1">
      <Text className="text-xs font-semibold text-accent">{label}</Text>
    </View>
  );
}
