import { DarkTheme, DefaultTheme } from "expo-router/react-navigation";
import type { AppTheme } from "./app-theme";
import { getNavigationTheme } from "./navigation-theme";
import { spacing, typography } from "./tokens";

const colors = {
  accent: "accent",
  background: "background",
  border: "border",
  danger: "danger",
  disabled: "disabled",
  disabledText: "disabled-text",
  groupedBackground: "grouped-background",
  link: "link",
  onAccent: "on-accent",
  onPrimary: "on-primary",
  onUserBubble: "on-user-bubble",
  overlay: "overlay",
  placeholder: "placeholder",
  primary: "primary",
  secondaryText: "secondary-text",
  separator: "separator",
  success: "success",
  surface: "surface",
  text: "text",
  userBubble: "user-bubble",
} as const;

describe("React Navigation theme bridge", () => {
  for (const [colorScheme, base] of [
    ["light", DefaultTheme],
    ["dark", DarkTheme],
  ] as const) {
    it(`${colorScheme} base의 chrome 계약을 semantic color에 연결한다`, () => {
      const theme: AppTheme = {
        colorScheme,
        colors,
        spacing,
        typography,
      };

      expect(getNavigationTheme(theme)).toEqual({
        ...base,
        colors: {
          ...base.colors,
          background: "background",
          border: "separator",
          card: "background",
          notification: "accent",
          primary: "accent",
          text: "text",
        },
      });
    });
  }
});
