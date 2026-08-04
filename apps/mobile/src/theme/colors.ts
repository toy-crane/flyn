import { Color } from "expo-router";
import { type ColorValue, Platform } from "react-native";
import { PRODUCT_STATE_COLORS } from "./product-colors";

export type AppColorScheme = "dark" | "light";

export interface ThemeColors {
  accent: ColorValue;
  background: ColorValue;
  border: ColorValue;
  danger: ColorValue;
  disabled: ColorValue;
  disabledText: ColorValue;
  link: ColorValue;
  onAccent: ColorValue;
  onPrimary: ColorValue;
  onUserBubble: ColorValue;
  overlay: ColorValue;
  placeholder: ColorValue;
  primary: ColorValue;
  secondaryBackground: ColorValue;
  secondaryText: ColorValue;
  separator: ColorValue;
  success: ColorValue;
  surface: ColorValue;
  text: ColorValue;
  userBubble: ColorValue;
}

function resolveIosColors(colorScheme: AppColorScheme): ThemeColors {
  const state = PRODUCT_STATE_COLORS[colorScheme];

  return {
    accent: Color.ios.link,
    background: Color.ios.systemGroupedBackground,
    border: Color.ios.opaqueSeparator,
    danger: state.danger,
    disabled: Color.ios.systemGray5,
    disabledText: Color.ios.tertiaryLabel,
    link: Color.ios.link,
    onAccent: "#FFFFFF",
    onPrimary: "#FFFFFF",
    onUserBubble: Color.ios.label,
    overlay: state.overlay,
    placeholder: Color.ios.placeholderText,
    primary: Color.ios.link,
    secondaryBackground: Color.ios.systemBackground,
    secondaryText: Color.ios.secondaryLabel,
    separator: Color.ios.separator,
    success: state.success,
    surface: Color.ios.secondarySystemGroupedBackground,
    text: Color.ios.label,
    userBubble: Color.ios.systemGray5,
  };
}

function androidColor(
  dynamic: ColorValue | null | undefined,
  material: ColorValue
) {
  return dynamic ?? material;
}

function resolveAndroidColors(colorScheme: AppColorScheme): ThemeColors {
  const { dynamic, material } = Color.android;
  const state = PRODUCT_STATE_COLORS[colorScheme];
  const primary = androidColor(dynamic.primary, material.primary);
  const onPrimary = androidColor(dynamic.onPrimary, material.onPrimary);

  return {
    accent: primary,
    background: androidColor(dynamic.background, material.background),
    border: androidColor(dynamic.outline, material.outline),
    danger: androidColor(dynamic.error, material.error),
    disabled: androidColor(
      dynamic.surfaceContainerHighest,
      material.surfaceContainerHighest
    ),
    disabledText: androidColor(
      dynamic.onSurfaceVariant,
      material.onSurfaceVariant
    ),
    link: primary,
    onAccent: onPrimary,
    onPrimary,
    onUserBubble: androidColor(
      dynamic.onSecondaryContainer,
      material.onSecondaryContainer
    ),
    overlay: state.overlay,
    placeholder: androidColor(
      dynamic.onSurfaceVariant,
      material.onSurfaceVariant
    ),
    primary,
    secondaryBackground: androidColor(
      dynamic.surfaceContainer,
      material.surfaceContainer
    ),
    secondaryText: androidColor(
      dynamic.onSurfaceVariant,
      material.onSurfaceVariant
    ),
    separator: androidColor(dynamic.outlineVariant, material.outlineVariant),
    success: state.success,
    surface: androidColor(
      dynamic.surfaceContainerHigh,
      material.surfaceContainerHigh
    ),
    text: androidColor(dynamic.onBackground, material.onBackground),
    userBubble: androidColor(
      dynamic.secondaryContainer,
      material.secondaryContainer
    ),
  };
}

export function resolveColors(colorScheme: AppColorScheme): ThemeColors {
  return Platform.OS === "android"
    ? resolveAndroidColors(colorScheme)
    : resolveIosColors(colorScheme);
}
