import type { ReactNode } from "react";

import { View } from "@/tw";

type CtaBarProps = {
  children: ReactNode;
  /** Matches the host screen's background so the bar doesn't seam against it. */
  background?: "background" | "grouped";
};

/**
 * The full-width action strip pinned to the bottom of a screen. Screens keep
 * their own scroll area above it; this only owns the gap and the bottom inset.
 */
export function CtaBar({ children, background = "background" }: CtaBarProps) {
  return (
    <View
      className={`gap-2 px-3 pt-2.5 pb-4 ${
        background === "grouped" ? "bg-grouped" : "bg-background"
      }`}
    >
      {children}
    </View>
  );
}
