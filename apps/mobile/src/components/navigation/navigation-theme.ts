import { DarkTheme, DefaultTheme } from "expo-router/react-navigation";
import { useThemeColor } from "heroui-native";
import { useMemo } from "react";
import { useUniwind } from "uniwind";

/**
 * navigation chrome이 색을 받아 가는 bridge.
 *
 * 셸은 시스템이 소유하지만 색만은 앱 토큰과 같은 의미를 써야 한다. 값의 원본은
 * 언제나 `global.css`의 CSS `@theme`이고 여기는 이름만 잇는다 — bridge가 자체
 * 팔레트를 갖지 않는다(docs/decisions/uniwind-css-theme.md).
 */
const BRIDGED_COLORS = [
  "background",
  "separator",
  "accent",
  "foreground",
] as const;

export interface NavigationChromeColors {
  accent: string;
  background: string;
  foreground: string;
  separator: string;
}

/** 의미 이름을 React Navigation의 chrome 이름에 붙인다. */
export function toNavigationTheme(
  themeName: string,
  colors: NavigationChromeColors
) {
  const base = themeName === "dark" ? DarkTheme : DefaultTheme;

  return {
    ...base,
    colors: {
      ...base.colors,
      background: colors.background,
      border: colors.separator,
      card: colors.background,
      notification: colors.accent,
      primary: colors.accent,
      text: colors.foreground,
    },
  };
}

export function useNavigationTheme() {
  const { theme } = useUniwind();
  const [background, separator, accent, foreground] =
    useThemeColor(BRIDGED_COLORS);

  return useMemo(
    () =>
      toNavigationTheme(theme, { accent, background, foreground, separator }),
    [theme, accent, background, foreground, separator]
  );
}
