import type { ThemePreference } from "@/shared/theme/theme-preference";

/**
 * The three screen modes, in the order the selection screen lists them.
 *
 * The two the person sets come first and the one that hands the choice back to
 * the operating system comes last, which is also the order iOS Settings uses.
 *
 * One table for both places these names appear: the value on the settings row
 * and the rows of the selection screen. Written twice they could drift, and a
 * row whose value never matches any option below it reads as a fourth mode.
 */
export const themeOptions = [
  { label: "라이트", value: "light" },
  { label: "다크", value: "dark" },
  { label: "시스템 설정", value: "system" },
] as const satisfies readonly { label: string; value: ThemePreference }[];

/** What the settings row shows on the right for the current choice. */
export function getThemePreferenceLabel(preference: ThemePreference): string {
  const option = themeOptions.find((entry) => entry.value === preference);

  return option?.label ?? "";
}
