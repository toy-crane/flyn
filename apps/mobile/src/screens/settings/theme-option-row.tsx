import type { ThemePreference } from "@/shared/theme/theme-preference";

export interface ThemeOptionRowProps {
  /** The system tint the iOS checkmark takes. Android's radio has its own. */
  accent: string;
  label: string;
  /** Takes the value rather than a bound handler, so the screen passes one. */
  onSelect: (preference: ThemePreference) => void;
  selected: boolean;
  testID: string;
  value: ThemePreference;
}

/**
 * One candidate on the 화면 모드 screen.
 *
 * Both platforms show the same three rows in the same order; only the mark for
 * the chosen one differs, because each platform's screen reader is told about a
 * selection in that platform's own terms. So the file splits rather than
 * branches and neither bundle carries the other's mark.
 */
export function ThemeOptionRow(_props: ThemeOptionRowProps) {
  return null;
}
