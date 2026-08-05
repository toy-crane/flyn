import {
  background,
  border,
  clip,
  fillMaxWidth,
  height,
  Shapes,
  weight,
} from "@expo/ui/jetpack-compose/modifiers";
import type { ColorValue } from "react-native";

export function getFormInputModifiers({
  danger,
  fill,
  invalid,
}: {
  danger: ColorValue;
  fill: ColorValue;
  invalid: boolean;
  label: string;
}) {
  return {
    input: [weight(1)],
    surface: [
      fillMaxWidth(),
      height(52),
      clip(Shapes.RoundedCorner(26)),
      background(fill),
      ...(invalid ? [border(1, danger)] : []),
    ],
  };
}
