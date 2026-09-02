import type { IconName } from "@expo/ui";

export interface SettingsIconProps {
  color: string;
  name: IconName;
  size: number;
}

/**
 * The symbol in front of a settings row's name.
 *
 * iOS settings lists carry one, and it is what lets the eye find a row without
 * reading it. Android's Material settings rows do not, so this default draws
 * nothing and only the iOS file has an implementation. Copying the iOS column
 * of symbols onto Android would put a shape where that platform expects the
 * name to start.
 */
export function SettingsIcon(_props: SettingsIconProps) {
  return null;
}
