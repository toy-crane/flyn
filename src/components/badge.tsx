import { Text, View } from "@/tw";

type BadgeProps = {
  label: string;
  tone?: "neutral" | "ok" | "bad";
};

export function Badge({ label, tone = "neutral" }: BadgeProps) {
  const fill =
    tone === "ok"
      ? "bg-tint-soft"
      : tone === "bad"
        ? "bg-danger-soft"
        : "bg-fill";
  const text =
    tone === "ok" ? "text-tint" : tone === "bad" ? "text-danger" : "text-secondary";

  return (
    <View className={`self-start rounded-full px-2.5 py-1 ${fill}`}>
      <Text className={`text-xs font-semibold ${text}`}>{label}</Text>
    </View>
  );
}
