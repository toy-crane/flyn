import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo } from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  ReduceMotion,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";
import { scheduleOnRN } from "react-native-worklets";

const RING_WIDTH = 2;

/**
 * 테두리가 서 있는 시간과 사라지는 시간. 시안의 2.8초 재생에서 65%까지 그대로
 * 있다가 나머지 동안 ease-out으로 사라진다.
 */
const HOLD_MS = 1820;
const FADE_MS = 980;
/** 동작 줄이기에서는 전환 없이 이만큼 서 있다가 사라진다. */
const REDUCED_HOLD_MS = 2000;
const EASE_OUT = Easing.bezier(0, 0, 0.58, 1);

/**
 * 표현 노트에서 들어온 사람에게 저장한 표현의 자리를 잠깐 짚는 파란 테두리.
 *
 * 짚을 말풍선이나 카드 안에 넣으면 그 가장자리 안쪽에 겹쳐 그린다. 배치에 끼어들지
 * 않아 주변이 움직이지 않고, 손가락과 화면 읽기는 아래의 말풍선이 그대로 받는다.
 * 잠깐 서 있다 사라지면 `onEnd`를 한 번 부른다. 부르는 쪽이 테두리를 걷는다.
 *
 * 둘레 밖에 그리지 않는다. 사용자 말풍선과 교정 카드처럼 4pt 간격으로 붙은 이웃이
 * 있어서, 밖으로 나간 테두리는 이웃 말풍선 위에 겹친다. 안쪽 테두리는 말풍선의
 * 안쪽 여백 위에 서므로 글을 가리지 않는다.
 */
export function FocusRing({
  className,
  onEnd,
}: {
  /** 모서리 모양. 짚는 말풍선이나 카드의 모서리와 같은 값을 넘긴다. */
  className: string;
  onEnd: () => void;
}) {
  /*
    동작 줄이기를 읽기 전에는 시작하지 않는다. 꺼진 것으로 먼저 시작했다가 켜진
    것을 알면 한 번 서 있던 시간을 다시 세게 된다. 읽기는 몇 ms면 끝나고, 읽지
    못하면 꺼진 것으로 본다. 테두리는 3초 안에 걷히므로 그사이 설정을 바꾸는 것은
    따라가지 않는다.
  */
  const [motion, setMotion] = useState<"full" | "reduced" | undefined>();
  const opacity = useSharedValue(1);
  const endRef = useRef(onEnd);

  endRef.current = onEnd;

  useEffect(() => {
    let isActive = true;

    AccessibilityInfo.isReduceMotionEnabled().then(
      (enabled) => {
        if (isActive) {
          setMotion(enabled ? "reduced" : "full");
        }
      },
      () => {
        if (isActive) {
          setMotion("full");
        }
      }
    );

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    const finish = () => endRef.current();

    if (motion === undefined) {
      return;
    }

    if (motion === "reduced") {
      const timer = setTimeout(finish, REDUCED_HOLD_MS);

      return () => clearTimeout(timer);
    }

    opacity.set(
      withDelay(
        HOLD_MS,
        withTiming(
          0,
          {
            duration: FADE_MS,
            easing: EASE_OUT,
            reduceMotion: ReduceMotion.Never,
          },
          (finished) => {
            if (finished) {
              scheduleOnRN(finish);
            }
          }
        ),
        ReduceMotion.Never
      )
    );

    return () => cancelAnimation(opacity);
  }, [motion, opacity]);

  const fade = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return (
    <Animated.View
      accessibilityElementsHidden
      className={`border-accent ${className}`}
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
      style={[
        {
          borderWidth: RING_WIDTH,
          bottom: 0,
          left: 0,
          position: "absolute",
          right: 0,
          top: 0,
        },
        fade,
      ]}
      testID="focus-ring"
    />
  );
}
