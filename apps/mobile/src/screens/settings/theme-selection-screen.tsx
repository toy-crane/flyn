import { FieldGroup, Host } from "@expo/ui";

import type { ThemePreference } from "@/shared/theme/theme-preference";
import {
  getSettingsSectionModifiers,
  getSettingsSurfaceModifiers,
} from "./settings-surface-modifiers";
import { ThemeOptionRow } from "./theme-option-row";
import { themeOptions } from "./theme-options";

/**
 * Choosing 화면 모드.
 *
 * Its own screen rather than a menu or a dialog: all three values, the one in
 * force and what each looks like are readable at once, and the screen stays
 * open after a press so the new mode can be seen on the surface that changed.
 *
 * One unnamed group. A title would have to name what these three are options
 * of, which the screen title already says.
 */
export function ThemeSelectionScreen({
  accent,
  background,
  onSelect,
  surface,
  themePreference,
}: {
  accent: string;
  background: string;
  onSelect: (preference: ThemePreference) => void;
  surface: string;
  themePreference: ThemePreference;
}) {
  const sectionModifiers = getSettingsSectionModifiers(surface);

  return (
    <Host
      /*
        Uniwind's variables do not cross into the native tree, so without the
        chosen mode named here this screen keeps drawing in the operating
        system's — the one surface where the choice has to be visible the
        instant it is made. `system` is left off so the platform decides.
      */
      colorScheme={themePreference === "system" ? undefined : themePreference}
      style={{ backgroundColor: background, flex: 1 }}
      testID="theme-selection-host"
      useViewportSizeMeasurement
    >
      <FieldGroup
        modifiers={getSettingsSurfaceModifiers()}
        style={{ backgroundColor: background }}
        testID="theme-selection-field-group"
      >
        <FieldGroup.Section
          modifiers={sectionModifiers}
          testID="theme-options-section"
        >
          {themeOptions.map((option) => (
            <ThemeOptionRow
              accent={accent}
              key={option.value}
              label={option.label}
              onSelect={onSelect}
              selected={themePreference === option.value}
              testID={`theme-option-${option.value}`}
              value={option.value}
            />
          ))}
        </FieldGroup.Section>
      </FieldGroup>
    </Host>
  );
}
