import { SymbolView } from "expo-symbols";

import { Pressable, Text, View, useCSSVariable } from "@/tw";

type ChoiceCardProps = {
  title: string;
  detail: string;
  selected?: boolean;
  onPress?: () => void;
};

/**
 * Single-select row used for onboarding's English level question — one
 * choice per row, with the line of explanation underneath. Selection reads
 * through a checkmark, not a tinted fill.
 */
export function ChoiceCard({
  title,
  detail,
  selected = false,
  onPress,
}: ChoiceCardProps) {
  const tint = useCSSVariable("--color-tint");

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      className="mb-2 flex-row items-center gap-3 rounded-card bg-cell p-4 active:bg-fill"
      style={{ borderCurve: "continuous" }}
    >
      <View className="flex-1">
        <Text className="mb-1 text-[17px] font-semibold text-label">
          {title}
        </Text>
        <Text className="text-[13px] text-secondary">{detail}</Text>
      </View>
      {selected ? (
        <SymbolView
          name={{ ios: "checkmark", android: "check", web: "check" }}
          size={20}
          weight="semibold"
          tintColor={tint}
        />
      ) : null}
    </Pressable>
  );
}
