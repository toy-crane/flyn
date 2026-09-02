import OpenInNew from "@expo/material-symbols/open_in_new.xml";
import { Icon } from "@expo/ui";

import type { ExternalDestinationIconProps } from "./external-destination-icon";

/**
 * Android implementation of `ExternalDestinationIcon`.
 *
 * `@expo/ui`'s `Icon` takes an XML vector drawable on Android, and
 * `@expo/material-symbols` is the source Expo's own documentation points to.
 * The row's name says where it goes, so the glyph carries no label of its own.
 */
export function ExternalDestinationIcon({
  color,
  size,
}: ExternalDestinationIconProps) {
  return <Icon color={color} name={OpenInNew} size={size} />;
}
