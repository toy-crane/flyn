import type { ReactNode } from "react";

import { ScrollView } from "@/tw";

/**
 * A screen's scroll area.
 *
 * NativeTabs supplies the safe-area and tab-bar insets itself, but only when
 * the scroll view is the screen's first child — which is why this must not be
 * wrapped in a SafeAreaView, and why screens hand their whole body to it.
 */
export function ScreenScroll({
  children,
  bottomInset = 32,
}: {
  children: ReactNode;
  bottomInset?: number;
}) {
  return (
    <ScrollView
      className="flex-1 bg-background px-3"
      contentContainerStyle={{ paddingBottom: bottomInset }}
    >
      {children}
    </ScrollView>
  );
}
