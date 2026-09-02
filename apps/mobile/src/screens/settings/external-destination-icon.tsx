export interface ExternalDestinationIconProps {
  color: string;
  size: number;
}

/**
 * What marks a row that leaves the app.
 *
 * A chevron would promise the app's own next screen and a way back to this one.
 * Both platforms draw the glyph, each in its own shape, so the file splits
 * rather than branches and neither bundle carries the other's asset.
 */
export function ExternalDestinationIcon(_props: ExternalDestinationIconProps) {
  return null;
}
