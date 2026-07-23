import type { ReactNode } from "react";

import { Pressable, Text, View } from "@/tw";

type ChipProps = {
  label: string;
  selected?: boolean;
  onPress?: () => void;
};

/** Multi-select pill used across onboarding and the correction thread. */
export function Chip({ label, selected = false, onPress }: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      className={`min-h-11 justify-center rounded-full px-4 py-2.5 ${
        selected ? "bg-accent-soft" : "bg-fill"
      }`}
    >
      <Text
        className={`text-[15px] ${
          selected ? "font-bold text-accent" : "text-sub2"
        }`}
      >
        {label}
      </Text>
    </Pressable>
  );
}

/** Wraps a row of chips with the prototype's spacing. */
export function ChipGroup({ children }: { children: ReactNode }) {
  return <View className="my-3.5 flex-row flex-wrap gap-2">{children}</View>;
}
