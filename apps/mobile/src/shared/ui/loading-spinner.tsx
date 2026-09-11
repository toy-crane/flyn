import { type ThemeColor, useThemeColor } from "heroui-native/hooks";
import { ActivityIndicator, Platform, View } from "react-native";

import { type ProgressRole, useProgressMetrics } from "./progress-metrics";

/** React Native `ActivityIndicator`가 그리는 시스템 크기. */
const NATIVE_SIZE = { large: 36, small: 20 } as const;

export interface LoadingSpinnerProps {
  /**
   * The contrast colour of the control the spinner sits inside. Leave it out
   * on screen content, where the platform default below is the right answer.
   */
  color?: ThemeColor;
  sizeRole?: ProgressRole;
  /** Identifier used to locate the indicator in tests. */
  testID?: string;
}

/** 시스템 표시는 역할별 표시 영역에 맞춘다. 접근성 이름은 바깥 요소가 소유한다. */
export function LoadingSpinner({
  color,
  sizeRole = "control",
  testID,
}: LoadingSpinnerProps) {
  const { indicator } = useProgressMetrics(sizeRole);
  const platformDefault: ThemeColor =
    Platform.OS === "ios" ? "muted" : "accent";
  // 홀로 서는 표시는 시스템 large를 그대로 쓴다. small을 키우면 iOS 스포크가 번진다.
  const nativeSize = sizeRole === "standalone" ? "large" : "small";
  const base = NATIVE_SIZE[nativeSize];

  return (
    <View
      pointerEvents="none"
      style={{
        alignItems: "center",
        height: indicator,
        justifyContent: "center",
        width: indicator,
      }}
    >
      <ActivityIndicator
        accessibilityElementsHidden
        accessible={false}
        color={useThemeColor(color ?? platformDefault)}
        importantForAccessibility="no-hide-descendants"
        size={nativeSize}
        style={{
          height: base,
          transform: [{ scale: indicator / base }],
          width: base,
        }}
        testID={testID}
      />
    </View>
  );
}
