import { Pressable, Text } from "@/tw";

type ChoiceCardProps = {
  title: string;
  detail: string;
  selected?: boolean;
  onPress?: () => void;
};

/**
 * Single-select block used for onboarding's English level question — one
 * choice per row, with the line of explanation underneath.
 */
export function ChoiceCard({
  title,
  detail,
  selected = false,
  onPress,
}: ChoiceCardProps) {
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`mb-2 rounded-control p-4 ${
        selected ? "bg-accent-soft" : "bg-surface"
      }`}
    >
      <Text
        className={`mb-1 text-[15px] font-bold ${
          selected ? "text-accent" : "text-foreground"
        }`}
      >
        {title}
      </Text>
      <Text className={`text-[13px] ${selected ? "text-sub2" : "text-muted"}`}>
        {detail}
      </Text>
    </Pressable>
  );
}
