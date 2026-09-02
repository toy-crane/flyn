import {
  listRowBackground,
  scrollContentBackground,
} from "@expo/ui/swift-ui/modifiers";

/**
 * Takes the SwiftUI form's own grouped background away.
 *
 * The system's grouped background is not the app's `background`: it is
 * `#F2F2F7` in light and pure black in dark, against `#F4F4F6` and `#0B0B0D`
 * here. Left alone, the seam shows during a push transition and under the
 * transparent header, where the screen behind is painted from the app's token.
 */
const settingsSurfaceModifiers = [scrollContentBackground("hidden")];

export function getSettingsSurfaceModifiers() {
  return settingsSurfaceModifiers;
}

/**
 * What fills the rows inside a group.
 *
 * Hiding the form's background leaves the rows on the system's
 * `secondarySystemGroupedBackground`, which is pure white in light — the same
 * value as this app's `surface` by luck, and a different one the moment the
 * palette moves. Naming it makes the raised surface the app's own.
 *
 * `listRowBackground` applies per row, so it goes on each `FieldGroup.Section`
 * rather than on the form: set on the form it never reaches the rows inside.
 */
export function getSettingsSectionModifiers(rowBackground: string) {
  return [listRowBackground(rowBackground)];
}
