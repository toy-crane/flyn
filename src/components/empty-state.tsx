import { Text, View } from "@/tw";

/** Quiet surface for "아직 서재가 비어 있어요", "교정할 문장이 없었어요". */
export function EmptyState({ message }: { message: string }) {
  return (
    <View
      className="rounded-card bg-cell px-3.5 py-6"
      style={{ borderCurve: "continuous" }}
    >
      <Text className="text-center text-[15px] leading-6 text-secondary">
        {message}
      </Text>
    </View>
  );
}
