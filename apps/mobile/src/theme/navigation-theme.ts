import { DarkTheme, DefaultTheme } from "expo-router/react-navigation";
import type { AppTheme } from "./app-theme";

export function getNavigationTheme(theme: AppTheme) {
  const base = theme.colorScheme === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      background: theme.colors.background,
      border: theme.colors.separator,
      card: theme.colors.secondaryBackground,
      notification: theme.colors.accent,
      primary: theme.colors.accent,
      text: theme.colors.text,
    },
  };
}
