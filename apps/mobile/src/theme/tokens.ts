import type { TextStyle } from "react-native";

export const spacing = {
  lg: 20,
  md: 16,
  sm: 12,
  xl: 24,
  xs: 8,
  xxl: 32,
  xxs: 4,
} as const;

export const typography = {
  action: { fontSize: 16, fontWeight: "600", lineHeight: 20 },
  body: { fontSize: 17, fontWeight: "400", lineHeight: 24 },
  caption: { fontSize: 13, fontWeight: "400", lineHeight: 18 },
  label: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
  message: { fontSize: 16, fontWeight: "400", lineHeight: 23 },
  supporting: { fontSize: 15, fontWeight: "400", lineHeight: 24 },
  title: { fontSize: 22, fontWeight: "600", lineHeight: 28 },
} as const satisfies Record<string, TextStyle>;
