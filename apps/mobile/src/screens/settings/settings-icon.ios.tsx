import { Icon } from "@expo/ui";
import { accessibilityHidden } from "@expo/ui/swift-ui/modifiers";

import type { SettingsIconProps } from "./settings-icon";

/**
 * iOS implementation of `SettingsIcon`.
 *
 * Hidden from the accessibility tree: the row's own name already says what the
 * row is, and a symbol read beside it would say it twice.
 */
export function SettingsIcon({ color, name, size }: SettingsIconProps) {
  return (
    <Icon
      color={color}
      modifiers={[accessibilityHidden()]}
      name={name}
      size={size}
    />
  );
}
