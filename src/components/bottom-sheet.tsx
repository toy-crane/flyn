import type { ReactNode } from "react";

import { Text, View } from "@/tw";

/**
 * The sheet body used for 직접 만들기 and field edits. Presentation (how it
 * rises, dimming, detents) belongs to the route; this is only the content.
 */
export function BottomSheet({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="rounded-t-sheet bg-background px-4 pb-4 pt-2">
      <View className="mx-auto mb-3 h-1 w-9 rounded-full bg-hairline" />
      <Text className="mb-2.5 text-base font-bold text-foreground">
        {title}
      </Text>
      {children}
    </View>
  );
}

/** Side-by-side actions at the foot of a sheet. */
export function SheetButtonRow({ children }: { children: ReactNode }) {
  return <View className="mt-3 flex-row gap-2">{children}</View>;
}
