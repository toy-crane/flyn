import { ThemeProvider } from "expo-router";
import { setBackgroundColorAsync } from "expo-system-ui";
import { useThemeColor } from "heroui-native/hooks";
import {
  createContext,
  type PropsWithChildren,
  use,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Uniwind, useUniwind } from "uniwind";

import {
  readThemePreference,
  type ThemePreference,
  writeThemePreference,
} from "@/shared/theme/theme-preference";
import { getNavigationTheme } from "./navigation-theme";

export interface AppThemeValue {
  /** The system tint: what a chosen value is marked with. */
  accent: string;
  background: string;
  /** For the one settings row that removes something, which iOS draws in red. */
  danger: string;
  foreground: string;
  /** Secondary ink, for the chevron and anything else that must recede. */
  muted: string;
  /** What the app is actually drawing, after `system` has been resolved. */
  scheme: "dark" | "light";
  setThemePreference: (preference: ThemePreference) => void;
  surface: string;
  /** What the person chose, which is not the same as what is drawn. */
  themePreference: ThemePreference;
}

const AppThemeContext = createContext<AppThemeValue | null>(null);

/**
 * Whether the stored mode has been handed to Uniwind yet.
 *
 * Module scope rather than a ref: this has to happen once for the app, and a
 * ref would let a remount hand Uniwind a value the person has since changed.
 */
let hasRestoredStoredTheme = false;

export function AppThemeBridge({ children }: PropsWithChildren) {
  const [themePreference, setStoredPreference] =
    useState<ThemePreference>(readThemePreference);

  /*
    Applied while this component renders rather than from an effect, so the
    first frame already carries the stored mode instead of showing the system
    one and correcting itself. Uniwind keeps the theme outside React, so this is
    not a state update during render; the hook below re-reads the store and this
    pass draws the restored mode.
  */
  if (!hasRestoredStoredTheme) {
    hasRestoredStoredTheme = true;
    Uniwind.setTheme(themePreference);
  }

  const [accent, background, danger, foreground, muted, surface] =
    useThemeColor([
      "accent",
      "background",
      "danger",
      "foreground",
      "muted",
      "surface",
    ]);
  const { theme } = useUniwind();
  const scheme = theme === "dark" ? "dark" : "light";
  const navigationTheme = useMemo(
    () => getNavigationTheme(scheme, { background, foreground }),
    [background, foreground, scheme]
  );

  /*
    Uniwind owns following the operating system, so `system` is handed to it as
    itself rather than resolved here. Storing the choice is what makes the next
    launch open in it.
  */
  const setThemePreference = useCallback((preference: ThemePreference) => {
    setStoredPreference(preference);
    Uniwind.setTheme(preference);
    writeThemePreference(preference);
  }, []);

  const value = useMemo<AppThemeValue>(
    () => ({
      accent,
      background,
      danger,
      foreground,
      muted,
      scheme,
      setThemePreference,
      surface,
      themePreference,
    }),
    [
      accent,
      background,
      danger,
      foreground,
      muted,
      scheme,
      setThemePreference,
      surface,
      themePreference,
    ]
  );

  useEffect(() => {
    setBackgroundColorAsync(background).catch(() => undefined);
  }, [background]);

  return (
    <AppThemeContext value={value}>
      <ThemeProvider value={navigationTheme}>{children}</ThemeProvider>
    </AppThemeContext>
  );
}

export function useAppTheme() {
  const theme = use(AppThemeContext);

  if (!theme) {
    throw new Error("useAppTheme must be used within AppThemeBridge");
  }

  return theme;
}
