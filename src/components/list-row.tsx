import type { ReactNode } from "react";

import { Pressable, Text, View } from "@/tw";

type ListRowProps = {
  title: string;
  /** Secondary line — on correction rows this is the sentence as written. */
  meta?: string;
  /** Right-hand slot, e.g. a "대화 2" badge. */
  trailing?: ReactNode;
  onPress?: () => void;
};

/** Tappable surface row — the correction review list on result and book detail. */
export function ListRow({ title, meta, trailing, onPress }: ListRowProps) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      className="mb-2 min-h-11 flex-row items-center gap-2.5 rounded-control bg-surface px-4 py-3.5"
    >
      <View className="min-w-0 flex-1">
        <Text className="mb-1 text-[15px] font-semibold text-foreground">
          {title}
        </Text>
        {meta ? <Text className="text-[13px] text-muted">{meta}</Text> : null}
      </View>
      {trailing}
    </Pressable>
  );
}
