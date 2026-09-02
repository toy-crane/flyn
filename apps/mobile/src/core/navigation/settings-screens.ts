import { Platform } from "react-native";

import { profileLabels } from "@/features/auth/ui/profile-labels";

/** What a screen reader calls the chevron, per the back-button decision. */
const BACK_LABEL = "뒤로 가기";

/**
 * The three screens of the settings hierarchy, in the order they stack.
 *
 * They are siblings in the root stack rather than a nested one. A nested stack
 * makes 설정 its own first screen, and a first screen has no native back
 * button — the app would have to draw a chevron itself, which the back-button
 * decision leaves to the native shell.
 */
export const settingsScreens = [
  { name: "settings", title: profileLabels.settings },
  { name: "settings/profile", title: profileLabels.profile },
  { name: "settings/theme", title: profileLabels.themeMode },
] as const;

/**
 * What every screen in the hierarchy shares, so they read as one surface.
 *
 * The root stack draws no headers, so these screens turn theirs on. The header
 * itself follows the conversation screen: iOS leaves it transparent and hands
 * the scroll edge to the system, Android paints the Material app bar with the
 * app's own background. Nothing here paints an iOS header background — that is
 * the system's to draw.
 *
 * The back control is the chevron alone. A title beside it repeats the screen a
 * person just came from and takes the width the current title needs.
 *
 * `minimal` hides that title but not the name a screen reader reads, and iOS
 * takes that name from the screen behind — which is the tab group, so it
 * announced "(tabs)". The back title names the control instead; hidden, it
 * costs no width.
 */
export function getSettingsScreenOptions(background: string) {
  return {
    headerBackButtonDisplayMode: "minimal" as const,
    headerBackTitle: BACK_LABEL,
    headerShadowVisible: false,
    headerShown: true,
    ...(Platform.OS === "ios"
      ? {
          headerTransparent: true,
          scrollEdgeEffects: { top: "soft" as const },
        }
      : {
          headerStyle: { backgroundColor: background },
        }),
  };
}
