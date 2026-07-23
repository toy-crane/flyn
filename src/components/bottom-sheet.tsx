import type { ReactNode } from "react";

import { Text, View } from "@/tw";

/**
 * The sheet body used for 직접 만들기 and field edits. Presentation belongs
 * to the route — a native formSheet with `sheetGrabberVisible` supplies the
 * rounded top corners and the grab handle, so this is only the content.
 */
export function BottomSheet({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <View className="bg-background px-4 pb-4 pt-2">
      <Text className="mb-2.5 text-[17px] font-semibold text-label">
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
