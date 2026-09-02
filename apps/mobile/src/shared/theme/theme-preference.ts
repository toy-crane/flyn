import Storage from "expo-sqlite/kv-store";

/**
 * The screen mode a person chose, as it is stored.
 *
 * `system` is Uniwind's own name for following the operating system, so the
 * stored value goes straight to `setTheme` without a translation table.
 */
export type ThemePreference = "dark" | "light" | "system";

/**
 * Kept in the SQLite key-value store the encrypted session already uses rather
 * than in a second storage library. This one reads synchronously, which is what
 * lets the first frame already carry the stored mode.
 */
const STORAGE_KEY = "theme-preference";

/** What a device with nothing stored starts on, and the answer to a bad read. */
export const DEFAULT_THEME_PREFERENCE: ThemePreference = "system";

export function isThemePreference(
  value: string | null
): value is ThemePreference {
  return value === "dark" || value === "light" || value === "system";
}

/**
 * The stored mode, or `system` when there is nothing usable to read.
 *
 * A value written by an older build, a half-written row or a store that cannot
 * open all end the same way: the app follows the operating system, which is
 * what a fresh install does too.
 */
export function readThemePreference(): ThemePreference {
  try {
    const stored = Storage.getItemSync(STORAGE_KEY);

    return isThemePreference(stored) ? stored : DEFAULT_THEME_PREFERENCE;
  } catch {
    return DEFAULT_THEME_PREFERENCE;
  }
}

/**
 * Writes synchronously for the same reason the read does: one short row, and
 * the value is durable before the screen that changed it draws again. A failed
 * write leaves the choice applied for this run and the app back on the stored
 * value next time, which is a smaller surprise than an error a person cannot
 * act on.
 */
export function writeThemePreference(preference: ThemePreference): void {
  try {
    Storage.setItemSync(STORAGE_KEY, preference);
  } catch {
    // Nothing here can fix a store that will not write.
  }
}
