import { Text, View } from "@/tw";

type EmptyStateProps = {
  message: string;
  /** cell (white/#1c1c1e) on a grouped screen; card (gray/#1c1c1e) on canvas. */
  surface?: "cell" | "card";
};

/** Quiet surface for "아직 서재가 비어 있어요", "교정할 문장이 없었어요". */
export function EmptyState({ message, surface = "cell" }: EmptyStateProps) {
  return (
    <View
      className={`rounded-card px-3.5 py-6 ${
        surface === "card" ? "bg-card" : "bg-cell"
      }`}
      style={{ borderCurve: "continuous" }}
    >
      <Text className="text-center text-[15px] leading-6 text-secondary">
        {message}
      </Text>
    </View>
  );
}
