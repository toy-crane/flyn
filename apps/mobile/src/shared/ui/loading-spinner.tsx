import { type ThemeColor, useThemeColor } from "heroui-native/hooks";
import { ActivityIndicator, Platform } from "react-native";

export interface LoadingSpinnerProps {
  /**
   * The contrast colour of the control the spinner sits inside. Leave it out
   * on screen content, where the platform default below is the right answer.
   */
  color?: ThemeColor;
  /** Identifier used to locate the indicator in tests. */
  testID?: string;
}

/**
 * The spinning progress indicator for React Native UI.
 *
 * `ActivityIndicator` draws each platform's own indicator — a Material arc on
 * Android, spokes on iOS — which is the whole reason it is here rather than a
 * component drawing one SVG on both.
 *
 * The colour rule lives here because there is no safe default to fall back on:
 * without a value Android reads its tint from the theme's `colorAccent`, which
 * an Expo app never sets and AppCompat answers with its own teal, and iOS gets
 * a fixed `#999999` that ignores the colour scheme. So the platform default is
 * named, and it is named per platform: iOS system indicators are grey, while a
 * Material app spins its progress in the app's own colour.
 *
 * Only the size stays closed. `small` and `large` are the two it offers, and
 * every progress indicator in this app stands on a single line, where `large`
 * would outweigh the word beside it.
 *
 * The indicator carries no name. Whatever wraps it owns the name, the
 * `progressbar` role and the `busy` state, so this one stays out of the
 * accessibility tree instead of being read a second time without a name.
 */
export function LoadingSpinner({ color, testID }: LoadingSpinnerProps) {
  const platformDefault: ThemeColor =
    Platform.OS === "ios" ? "muted" : "accent";

  return (
    <ActivityIndicator
      accessibilityElementsHidden
      accessible={false}
      color={useThemeColor(color ?? platformDefault)}
      importantForAccessibility="no-hide-descendants"
      size="small"
      testID={testID}
    />
  );
}
