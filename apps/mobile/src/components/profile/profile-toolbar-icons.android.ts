import checkIcon from "@expo/material-symbols/check.xml";
import closeIcon from "@expo/material-symbols/close.xml";
import type { ImageSourcePropType } from "react-native";

export const profileToolbarIcons = {
  close: closeIcon,
  save: checkIcon,
} as const satisfies Record<"close" | "save", ImageSourcePropType>;
