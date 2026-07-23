import type { ReactNode } from "react";

import { Pressable, Text, View } from "@/tw";

/** Small gray header above a grouped list section. */
export function GroupedListHeader({ label }: { label: string }) {
  return <Text className="mx-4 mt-5 mb-2 text-[13px] text-muted">{label}</Text>;
}

/** iOS inset grouped list — rows share one rounded surface, hairline between. */
export function GroupedList({ children }: { children: ReactNode }) {
  return (
    <View className="mb-1 overflow-hidden rounded-control bg-surface">
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
  /** Rows after the first draw a hairline on top. */
  first?: boolean;
};

export function GroupedListRow({
  label,
  value,
  onPress,
  showChevron = true,
  first = false,
}: GroupedListRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className={`min-h-11 flex-row items-center gap-2 px-4 py-3 ${
        first ? "" : "border-t border-hairline"
      }`}
    >
      <Text className="text-[15px] text-foreground">{label}</Text>
      <Text
        numberOfLines={1}
        className="flex-1 text-right text-[15px] text-muted"
      >
        {value ?? ""}
      </Text>
      {showChevron ? (
        <Text className="text-[17px] text-muted">›</Text>
      ) : null}
    </Pressable>
  );
}

/** Standalone destructive row — 로그아웃 sits in its own group, centered. */
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
      className="min-h-11 items-center justify-center px-4 py-3"
    >
      <Text className="text-[15px] text-danger">{label}</Text>
    </Pressable>
  );
}
