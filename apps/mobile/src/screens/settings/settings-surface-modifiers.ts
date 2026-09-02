import type { ModifierConfig } from "@expo/ui/swift-ui/modifiers";

/**
 * What the settings form needs beyond its own content, per renderer.
 *
 * Android draws its rows as Material list items that already own their
 * surface, so it adds nothing and only the iOS file has an implementation.
 */
export function getSettingsSurfaceModifiers(): ModifierConfig[] {
  return [];
}

export function getSettingsSectionModifiers(
  _rowBackground: string
): ModifierConfig[] {
  return [];
}
