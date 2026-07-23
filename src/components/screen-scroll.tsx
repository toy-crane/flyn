import type { ReactNode } from "react";

import { ScrollView } from "@/tw";

type ScreenScrollProps = {
  children: ReactNode;
  bottomInset?: number;
  /** Grouped for list/form screens (홈·프로필), background for canvas screens. */
  background?: "background" | "grouped";
};

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
  background = "background",
}: ScreenScrollProps) {
  return (
    <ScrollView
      className={`flex-1 px-3 ${
        background === "grouped" ? "bg-grouped" : "bg-background"
      }`}
      contentContainerStyle={{ paddingBottom: bottomInset }}
    >
      {children}
    </ScrollView>
  );
}
