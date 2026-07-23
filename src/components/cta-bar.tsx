import type { ReactNode } from "react";

import { View } from "@/tw";

/**
 * The full-width action strip pinned to the bottom of a screen. Screens keep
 * their own scroll area above it; this only owns the gap and the bottom inset.
 */
export function CtaBar({ children }: { children: ReactNode }) {
  return (
    <View className="bg-background gap-2 px-3 pt-2.5 pb-4">{children}</View>
  );
}
