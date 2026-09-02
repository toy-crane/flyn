import { router } from "expo-router";

import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { SettingsScreen } from "@/screens/settings/settings-screen";

function openProfile() {
  router.push("/settings/profile");
}

function openThemeMode() {
  router.push("/settings/theme");
}

export default function SettingsRoute() {
  const { background, danger, muted, surface, themePreference } = useAppTheme();

  return (
    <SettingsScreen
      background={background}
      danger={danger}
      muted={muted}
      onOpenProfile={openProfile}
      onOpenThemeMode={openThemeMode}
      surface={surface}
      themePreference={themePreference}
    />
  );
}
