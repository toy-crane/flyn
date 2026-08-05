import {
  accessibilityLabel,
  background,
  frame,
  shapes,
  strokeBorder,
  textFieldStyle,
} from "@expo/ui/swift-ui/modifiers";
import type { ColorValue } from "react-native";

export function getFormInputModifiers({
  danger,
  fill,
  invalid,
  label,
}: {
  danger: ColorValue;
  fill: ColorValue;
  invalid: boolean;
  label: string;
}) {
  return {
    input: [
      textFieldStyle("plain"),
      frame({ height: 52, maxWidth: Number.POSITIVE_INFINITY }),
      accessibilityLabel(label),
    ],
    surface: [
      frame({ height: 52, maxWidth: Number.POSITIVE_INFINITY }),
      background(fill, shapes.capsule()),
      ...(invalid
        ? [
            strokeBorder({
              color: danger,
              shape: "capsule",
              style: { lineWidth: 1 },
            }),
          ]
        : []),
    ],
  };
}
