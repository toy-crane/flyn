import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { Text, View } from "react-native";

import { savedExpressionLabels } from "./episode-labels";

/** 읽고 사라지기에 충분한 시간. 대화를 오래 가리지 않는다. */
const TOAST_MS = 2500;

/**
 * 담았다는 것을 알리는 짧은 문구.
 *
 * 결과가 다른 탭에 생겨 그 자리에서는 보이지 않으므로 알린다. 누를 동작은 두지
 * 않는다. 표현 노트로 보내면 대화 흐름이 끊기고, 취소는 방금 누른 책갈피를 다시
 * 누르는 것과 역할이 겹친다.
 */
export function ExpressionToast() {
  return (
    <View
      accessibilityLiveRegion="polite"
      className="mb-2 rounded-3xl bg-foreground px-4 py-2.5"
      testID="expression-toast"
    >
      <Text className="text-background text-base leading-5" selectable={false}>
        {savedExpressionLabels.saved}
      </Text>
    </View>
  );
}

/**
 * 담을 때마다 문구를 잠시 띄우고 가벼운 햅틱을 함께 준다.
 *
 * 연달아 담으면 앞의 문구가 서 있던 시간을 새로 센다. 취소에는 아무것도 하지
 * 않는다. 되돌리는 일까지 알리면 대화보다 알림이 잦아진다.
 */
export function useExpressionToast() {
  const [isVisible, setIsVisible] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const announce = useCallback(() => {
    // 햅틱을 지원하지 않는 기기에서도 알림은 그대로 뜬다.
    impactAsync(ImpactFeedbackStyle.Light).catch(() => undefined);
    setIsVisible(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setIsVisible(false), TOAST_MS);
  }, []);

  useEffect(() => () => clearTimeout(timer.current), []);

  return { announce, isVisible };
}
