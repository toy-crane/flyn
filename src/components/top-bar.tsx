import type { ReactNode } from "react";
import { router } from "expo-router";

import { Pressable, Text, View } from "@/tw";

type TopBarProps = {
  title?: string;
  /** Defaults to going back; pass a handler to override. */
  onBack?: () => void;
  /** Omit the chevron on screens that are not pushed onto anything. */
  showBack?: boolean;
  /** Right-hand text action, e.g. 상황 만들기의 "직접 만들기". */
  action?: ReactNode;
};

export function TopBar({
  title,
  onBack,
  showBack = true,
  action,
}: TopBarProps) {
  return (
    <View className="flex-row items-center gap-2.5 bg-background pt-2 pb-3 mb-2">
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="뒤로"
          onPress={onBack ?? (() => router.back())}
          className="min-w-11 min-h-11 justify-center"
        >
          <Text className="text-[22px] leading-none text-foreground">‹</Text>
        </Pressable>
      ) : null}
      <Text
        numberOfLines={1}
        className="flex-1 text-base font-semibold text-foreground"
      >
        {title ?? ""}
      </Text>
      {action}
    </View>
  );
}
