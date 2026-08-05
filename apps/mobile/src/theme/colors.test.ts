jest.mock("expo-router", () => ({
  Color: {
    android: { dynamic: {}, material: {} },
    ios: {
      label: "ios-label",
      link: "ios-link",
      opaqueSeparator: "ios-opaque-separator",
      placeholderText: "ios-placeholder",
      secondaryLabel: "ios-secondary-label",
      secondarySystemBackground: "ios-plain-surface",
      separator: "ios-separator",
      systemBackground: "ios-system-background",
      systemGray5: "ios-system-gray-5",
      systemGroupedBackground: "ios-grouped-background",
      tertiaryLabel: "ios-tertiary-label",
      tertiarySystemFill: "ios-tertiary-system-fill",
    },
  },
}));

import { Color } from "expo-router";
import { type ColorValue, Platform } from "react-native";
import { resolveColors } from "./colors";

const COLOR_ROLES = [
  "accent",
  "background",
  "border",
  "danger",
  "disabled",
  "disabledText",
  "groupedBackground",
  "inputFill",
  "link",
  "onAccent",
  "onPrimary",
  "onUserBubble",
  "overlay",
  "placeholder",
  "primary",
  "secondaryText",
  "separator",
  "success",
  "surface",
  "text",
  "userBubble",
] as const;

describe("semantic color resolver", () => {
  it("iOS의 모든 색 역할을 native semantic source와 제품 상태값으로 해석한다", () => {
    const colors = resolveColors("light");

    expect(Object.keys(colors).sort()).toEqual([...COLOR_ROLES].sort());
    expect(colors).toMatchObject({
      accent: "ios-link",
      background: "ios-system-background",
      border: "ios-opaque-separator",
      disabled: "ios-system-gray-5",
      disabledText: "ios-tertiary-label",
      groupedBackground: "ios-grouped-background",
      inputFill: "ios-tertiary-system-fill",
      link: "ios-link",
      onPrimary: "#FFFFFF",
      placeholder: "ios-placeholder",
      primary: "ios-link",
      secondaryText: "ios-secondary-label",
      separator: "ios-separator",
      surface: "ios-plain-surface",
      text: "ios-label",
      userBubble: "ios-system-gray-5",
    });
    expect(colors.danger).toBe("#D70015");
    expect(colors.success).toBe("#1F7A35");
  });

  it("Android dynamic color가 없으면 같은 Material static 역할로 fallback한다", () => {
    const originalPlatform = Platform.OS;
    const dynamic = Color.android.dynamic as Record<string, ColorValue | null>;
    const material = Color.android.material as Record<string, ColorValue>;
    const roles = [
      "background",
      "error",
      "onBackground",
      "onPrimary",
      "onSecondaryContainer",
      "onSurfaceVariant",
      "outline",
      "outlineVariant",
      "primary",
      "secondaryContainer",
      "surfaceContainer",
      "surfaceContainerHigh",
      "surfaceContainerHighest",
    ];

    Object.defineProperty(Platform, "OS", {
      configurable: true,
      value: "android",
    });
    for (const role of roles) {
      dynamic[role] = `dynamic-${role}`;
      material[role] = `material-${role}`;
    }
    dynamic.primary = null;

    try {
      const colors = resolveColors("dark");

      expect(colors.background).toBe("dynamic-background");
      expect(colors.groupedBackground).toBe("dynamic-surfaceContainer");
      expect(colors.inputFill).toBe("dynamic-surfaceContainerHighest");
      expect(colors.primary).toBe("material-primary");
      expect(colors.accent).toBe("material-primary");
      expect(colors.onPrimary).toBe("dynamic-onPrimary");
      expect(colors.surface).toBe("dynamic-surfaceContainerHigh");
      expect(colors.success).toBe("#32D74B");
    } finally {
      Object.defineProperty(Platform, "OS", {
        configurable: true,
        value: originalPlatform,
      });
    }
  });
});
