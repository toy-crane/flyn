import { createContext, type ReactNode, useContext, useMemo } from "react";
import { useColorScheme } from "react-native";
import { type AppColorScheme, resolveColors, type ThemeColors } from "./colors";
import { spacing, typography } from "./tokens";

export interface AppTheme {
  colorScheme: AppColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  typography: typeof typography;
}

const AppThemeContext = createContext<AppTheme | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const colorScheme: AppColorScheme =
    systemColorScheme === "dark" ? "dark" : "light";
  const value = useMemo<AppTheme>(
    () => ({
      colorScheme,
      colors: resolveColors(colorScheme),
      spacing,
      typography,
    }),
    [colorScheme]
  );

  return (
    <AppThemeContext.Provider value={value}>
      {children}
    </AppThemeContext.Provider>
  );
}

export function useTheme() {
  const theme = useContext(AppThemeContext);

  if (!theme) {
    throw new Error("useTheme must be used within AppThemeProvider.");
  }

  return theme;
}

export function useColors() {
  return useTheme().colors;
}
