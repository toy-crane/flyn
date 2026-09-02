import type { ExternalDestinationIconProps } from "./external-destination-icon";
import { SettingsIcon } from "./settings-icon";

/**
 * iOS implementation of `ExternalDestinationIcon`.
 *
 * The bare arrow, not the boxed one. A glyph drawn inside a square spends the
 * same height on the box, so its strokes come out thinner than the chevron on
 * the row above and the pair reads as two weights. iOS Settings uses the bare
 * arrow for the same reason.
 */
export function ExternalDestinationIcon({
  color,
  size,
}: ExternalDestinationIconProps) {
  return <SettingsIcon color={color} name="arrow.up.right" size={size} />;
}
