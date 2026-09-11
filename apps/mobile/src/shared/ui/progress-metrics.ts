import { useWindowDimensions } from "react-native";

export type ProgressRole =
  | "supporting"
  | "compactControl"
  | "control"
  | "screen"
  | "standalone";
/**
 * `fixed`인 자리는 컨트롤이 크기를 붙박아 두므로 표시도 자라지 않는다. 나머지는
 * 곁의 글자를 따라 함께 커진다.
 */
const ROLES = {
  /** 메시지 아래 아이콘 줄처럼 28px 버튼 안. 그 자리의 아이콘과 같은 크기다. */
  compactControl: { fixed: true, gap: 6, indicator: 16, lineHeight: 16 },
  control: { fixed: true, gap: 8, indicator: 20, lineHeight: 24 },
  screen: { fixed: false, gap: 8, indicator: 20, lineHeight: 20 },
  /** 문구 없이 화면 가운데 홀로 서는 표시. 곁에 따라 자랄 글자가 없다. */
  standalone: { fixed: true, gap: 0, indicator: 36, lineHeight: 36 },
  supporting: { fixed: false, gap: 6, indicator: 14, lineHeight: 16 },
} as const;

/** 글자 옆 표시는 함께 확대하고, 컨트롤의 교체 아이콘은 원래 자리를 지킨다. */
export function useProgressMetrics(role: ProgressRole) {
  const { fontScale } = useWindowDimensions();
  const base = ROLES[role];
  const scale = base.fixed ? 1 : fontScale;
  return {
    fontScale,
    gap: base.gap,
    indicator: base.indicator * scale,
    lineHeight: base.lineHeight * fontScale,
  };
}
