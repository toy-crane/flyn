import { useEffect, useState } from "react";
import { AccessibilityInfo } from "react-native";

/**
 * 운영체제의 동작 줄이기가 지금 켜져 있는지.
 *
 * Reanimated의 `useReducedMotion`은 앱을 연 때의 값에 머문다. 앱을 연 채 설정을
 * 바꾸는 사람도 있으므로 화면을 열 때 현재 값을 읽고 바뀌면 따라간다. 읽기 전과
 * 읽지 못했을 때는 꺼진 것으로 둔다.
 */
export function useReduceMotion(): boolean {
  const [isReduced, setIsReduced] = useState(false);

  useEffect(() => {
    let isActive = true;
    const listener = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      (enabled) => {
        setIsReduced(enabled);
      }
    );

    AccessibilityInfo.isReduceMotionEnabled().then(
      (enabled) => {
        if (isActive) {
          setIsReduced(enabled);
        }
      },
      () => {
        // 설정을 읽지 못하면 HeroUI 기본 애니메이션을 그대로 둔다.
      }
    );

    return () => {
      isActive = false;
      listener.remove();
    };
  }, []);

  return isReduced;
}
