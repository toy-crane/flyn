import type { ReactNode } from "react";
import { SymbolView } from "expo-symbols";

import { Pressable, Text, View, useCSSVariable } from "@/tw";

/** Small section label above a grouped list. */
export function GroupedListHeader({ label }: { label: string }) {
  return (
    <Text className="mx-4 mt-5 mb-2 text-[13px] font-semibold text-secondary">
      {label}
    </Text>
  );
}

/** iOS inset grouped list — rows share one rounded surface, hairline between. */
export function GroupedList({ children }: { children: ReactNode }) {
  return (
    <View
      className="mb-1 overflow-hidden rounded-card bg-cell"
      style={{ borderCurve: "continuous" }}
    >
      {children}
    </View>
  );
}

type GroupedListRowProps = {
  label: string;
  /** Right-aligned summary of the current value. */
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  /** Rows after the first draw a hairline on top, inset from the label. */
  first?: boolean;
};

export function GroupedListRow({
  label,
  value,
  onPress,
  showChevron = true,
  first = false,
}: GroupedListRowProps) {
  const chevronColor = useCSSVariable("--color-tertiary");

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-11 flex-row items-center gap-2 px-4 py-3 active:bg-fill"
    >
      {first ? null : (
        <View className="absolute left-4 right-0 top-0 h-px bg-separator" />
      )}
      <Text className="text-[17px] text-label">{label}</Text>
      <Text
        numberOfLines={1}
        className="flex-1 text-right text-[17px] text-secondary"
      >
        {value ?? ""}
      </Text>
      {showChevron ? (
        <SymbolView name="chevron.right" size={14} tintColor={chevronColor} />
      ) : null}
    </Pressable>
  );
}

/** Standalone destructive row — 로그아웃 sits in its own group, left-aligned. */
export function GroupedListDangerRow({
  label,
  onPress,
}: {
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="min-h-11 justify-center px-4 py-3 active:bg-fill"
    >
      <Text className="text-[17px] text-danger">{label}</Text>
    </Pressable>
  );
}
