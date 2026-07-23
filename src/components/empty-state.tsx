import { Text, View } from "@/tw";

/** Quiet surface for "아직 서재가 비어 있어요", "교정할 문장이 없었어요". */
export function EmptyState({ message }: { message: string }) {
  return (
    <View className="rounded-control bg-surface px-3.5 py-6">
      <Text className="text-center text-sm leading-6 text-muted">
        {message}
      </Text>
    </View>
  );
}
