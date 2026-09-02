import { Text } from "@expo/ui";
import { RadioButton } from "@expo/ui/jetpack-compose";
import { selectable } from "@expo/ui/jetpack-compose/modifiers";
import { useCallback } from "react";

import { SettingsRow } from "./settings-row";
import type { ThemeOptionRowProps } from "./theme-option-row";

/**
 * Android implementation of `ThemeOptionRow`.
 *
 * A radio button, which is what Material marks one-of-many with. `selectable`
 * carries both halves: it takes the press across the whole row and tells
 * TalkBack this is a radio button and whether it is the chosen one. Without it
 * the radio is a shape beside a name and every row reads the same.
 *
 * The press belongs to the modifier rather than to the row, so `SettingsRow`
 * gets no `onPress` — two press handlers on one row would both answer.
 */
export function ThemeOptionRow({
  label,
  onSelect,
  selected,
  testID,
  value,
}: ThemeOptionRowProps) {
  const select = useCallback(() => {
    onSelect(value);
  }, [onSelect, value]);

  return (
    <SettingsRow
      modifiers={[selectable(selected, select, "radioButton")]}
      testID={testID}
      trailing={<RadioButton selected={selected} />}
    >
      <Text>{label}</Text>
    </SettingsRow>
  );
}
