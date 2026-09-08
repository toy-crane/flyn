import { type ThemeColor, useThemeColor } from "heroui-native/hooks";
import { ActivityIndicator, Platform, View } from "react-native";

import { type ProgressRole, useProgressMetrics } from "./progress-metrics";

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
        size="small"
        style={{
          height: 20,
          transform: [{ scale: indicator / 20 }],
          width: 20,
        }}
        testID={testID}
      />
    </View>
  );
}
