import { Text } from "@expo/ui";
import {
  accessibilityAddTraits,
  accessibilityElement,
  accessibilityLabel,
  accessibilityValue,
} from "@expo/ui/swift-ui/modifiers";
import { useCallback } from "react";

import { SettingsIcon } from "./settings-icon";
import { SettingsRow } from "./settings-row";
import type { ThemeOptionRowProps } from "./theme-option-row";

/** The same checkmark size as the row's own text, unlike the smaller chevron. */
const CHECKMARK_SIZE = 18;

/**
 * iOS implementation of `ThemeOptionRow`.
 *
 * A checkmark in the system tint, which is what iOS Settings marks a chosen
 * value with. No symbol in front of the name: these three are candidates for
 * one value, and the only thing that tells them apart is what they are called.
 *
 * The row is combined into one accessibility element so VoiceOver reads the
 * name and the state together rather than stopping on each piece. The trait is
 * what makes the swipe-through say 선택됨 the way it does in Settings; the
 * value says it in words for the rows that are not chosen, which have no trait
 * to carry it.
 */
export function ThemeOptionRow({
  accent,
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
      modifiers={[
        accessibilityElement("combine"),
        accessibilityLabel(label),
        accessibilityValue(selected ? "선택됨" : "선택 안 됨"),
        ...(selected ? [accessibilityAddTraits(["isSelected"])] : []),
      ]}
      onPress={select}
      testID={testID}
      trailing={
        selected ? (
          <SettingsIcon color={accent} name="checkmark" size={CHECKMARK_SIZE} />
        ) : undefined
      }
    >
      <Text>{label}</Text>
    </SettingsRow>
  );
}
