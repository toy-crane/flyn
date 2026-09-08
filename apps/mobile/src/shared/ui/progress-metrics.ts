import { useWindowDimensions } from "react-native";

export type ProgressRole = "supporting" | "control" | "screen";
const ROLES = {
  control: { gap: 8, indicator: 20, lineHeight: 24 },
  screen: { gap: 8, indicator: 20, lineHeight: 20 },
  supporting: { gap: 6, indicator: 14, lineHeight: 16 },
} as const;

/** 글자 옆 표시는 함께 확대하고, 컨트롤의 교체 아이콘은 원래 자리를 지킨다. */
export function useProgressMetrics(role: ProgressRole) {
  const { fontScale } = useWindowDimensions();
  const base = ROLES[role];
  const scale = role === "control" ? 1 : fontScale;
  return {
    fontScale,
    gap: base.gap,
    indicator: base.indicator * scale,
    lineHeight: base.lineHeight * fontScale,
  };
}
