import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { ThemeSelectionScreen } from "@/screens/settings/theme-selection-screen";

export default function ThemeSelectionRoute() {
  const { accent, background, setThemePreference, surface, themePreference } =
    useAppTheme();

  return (
    <ThemeSelectionScreen
      accent={accent}
      background={background}
      onSelect={setThemePreference}
      surface={surface}
      themePreference={themePreference}
    />
  );
}
