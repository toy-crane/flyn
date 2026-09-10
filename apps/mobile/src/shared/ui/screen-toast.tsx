import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  type LayoutChangeEvent,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeOut,
  FadeOutUp,
  Keyframe,
  ReduceMotion,
  useReducedMotion,
} from "react-native-reanimated";

/** 읽고 사라지기에 충분한 시간. 본문을 오래 가리지 않는다. */
const TOAST_MS = 2500;

/**
 * 알약이 띠 밑에 숨어 있다 내려온다.
 *
 * 알약 높이보다 넉넉히 위로 올려 두어 높이를 재지 않고도 띠 뒤에 완전히 숨긴다.
 * 시안 toast.html의 `translateY(-140%)`와 같은 뜻이다.
 */
const HIDDEN_ABOVE = -72;

/** 띠와 알약 사이. 시안 toast.html의 `.toast-layer` 위쪽 여백과 같다. */
const LAYER_TOP_GAP = 10;

/**
 * 알약을 재기 전에 층이 잡아 두는 높이.
 *
 * 기본 글자 크기의 알약 하나가 들어가는 값이다. 큰 접근성 글자에서는 알약이
 * 이보다 높아지므로, 한 번 그린 뒤 실제 높이로 갈아 끼운다. 재기 전에 0으로
 * 두면 첫 프레임의 알약이 통째로 잘린다.
 */
const LAYER_MIN_HEIGHT = 62;

/** 기본 글자 크기에서 문구 한 줄의 높이. 실제 줄높이는 여기에 배율을 곱한다. */
const LINE_HEIGHT = 20;

/**
 * 문구가 커지는 한도.
 *
 * 토스트는 띠와 본문 사이의 좁은 자리에 잠시 떴다 사라지는 크롬이다. 배율을
 * 끝까지 따라가면 알약이 대화의 절반을 덮고 두세 줄로 늘어져, 방금 무엇을 했는지
 * 알리려던 한 줄이 오히려 읽기 어려워진다. 공간이 제한된 크롬에만 확대 제한을
 * 둘 수 있다는 [모바일 타이포그래피](docs/decisions/mobile-typography.md)의
 * 예외를 따른다. 본문인 말풍선과 카드에는 제한이 없다.
 */
const MAX_FONT_SCALE = 1.6;

// 시안 toast.html의 값. 나올 때는 살짝 지나쳤다 앉는 곡선으로 420ms, 들어갈
// 때는 가속 곡선으로 160ms이고, 불투명도는 앞쪽 120ms에서 다 찬다.
//
// CSS 애니메이션이 아니라 entering과 exiting을 쓰는 이유는 결말 축하와 같다.
// Android는 CSS 애니메이션이 붙은 뷰의 스타일을 두세 프레임 늦게 적용해서,
// 내려올 알약이 그동안 제자리에 그대로 비친다.
const SLIDE_IN_MS = 420;
const SLIDE_OUT_MS = 160;
const FADE_MS = 120;
const OVERSHOOT = Easing.bezier(0.18, 0.9, 0.28, 1.18);
const ACCELERATE = Easing.bezier(0.4, 0, 1, 1);
const slideDown = new Keyframe({
  0: { opacity: 0, transform: [{ translateY: HIDDEN_ABOVE }] },
  29: {
    easing: OVERSHOOT,
    opacity: 1,
    transform: [{ translateY: HIDDEN_ABOVE * 0.42 }],
  },
  100: { easing: OVERSHOOT, opacity: 1, transform: [{ translateY: 0 }] },
})
  .duration(SLIDE_IN_MS)
  .reduceMotion(ReduceMotion.Never);
const slideUpOut = FadeOutUp.duration(SLIDE_OUT_MS)
  .easing(ACCELERATE)
  .reduceMotion(ReduceMotion.Never);

/** 동작 줄이기를 켜면 자리를 옮기지 않고 문구만 뜨고 진다. */
const fadeIn = FadeIn.duration(FADE_MS).reduceMotion(ReduceMotion.Never);
const fadeOut = FadeOut.duration(FADE_MS).reduceMotion(ReduceMotion.Never);

/** 한 번에 서는 문구 하나. 앞에 붙는 아이콘은 부르는 쪽이 정한다. */
export interface ScreenToastContent {
  icon?: ReactNode;
  text: string;
}

/**
 * 그 화면의 고정된 위쪽 띠 바로 밑에서 미끄러져 나오는 문구 하나.
 *
 * 자리와 겹침 규칙은 `docs/decisions/mobile-toast-placement.md`가 소유한다.
 * 부르는 화면은 띠 아래 자리에 `toast`를 놓기만 하면 된다. 알약은 본문 위에
 * 떠서 목록이나 대화를 밀지 않고, 헤더와 상황 줄도 덮지 않는다.
 *
 * 같은 자리를 나눠 쓰므로 연달아 알리면 앞의 문구를 갈아치우고 서 있던 시간을
 * 새로 센다. 같은 줄이 여러 개 쌓이면 방금 무엇을 했는지가 오히려 흐려진다.
 */
export function useScreenToast(): {
  show: (content: ScreenToastContent) => void;
  toast: ReactNode;
} {
  const [content, setContent] = useState<ScreenToastContent | undefined>();
  /** 갈아치울 때 앞의 문구가 자기 시간에 사라지지 않도록 타이머를 하나만 둔다. */
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const isReduced = useReducedMotion();

  const show = useCallback((next: ScreenToastContent) => {
    if (timer.current !== undefined) {
      clearTimeout(timer.current);
    }

    setContent(next);
    timer.current = setTimeout(() => {
      timer.current = undefined;
      setContent(undefined);
    }, TOAST_MS);
  }, []);

  // 화면을 떠날 때 타이머가 남으면 사라진 화면의 상태를 건드린다.
  useEffect(
    () => () => {
      if (timer.current !== undefined) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  return {
    show,
    toast:
      content === undefined ? undefined : (
        <ScreenToast content={content} isReduced={isReduced} />
      ),
  };
}

function ScreenToast({
  content,
  isReduced,
}: {
  content: ScreenToastContent;
  isReduced: boolean;
}) {
  /*
    층은 알약이 든 만큼만 높다. 큰 접근성 글자에서는 알약이 두 줄이 되고 훨씬
    높아지므로 상수로 둘 수 없다. 그려진 알약을 재서 그 높이로 갈아 끼운다.
  */
  const [pillHeight, setPillHeight] = useState(0);
  const measurePill = useCallback((event: LayoutChangeEvent) => {
    setPillHeight(event.nativeEvent.layout.height);
  }, []);
  const { fontScale } = useWindowDimensions();

  return (
    /*
      알약이 사는 층. 부르는 화면이 띠 아래에 놓아 준 자리의 맨 위에 뜬다.
      누를 동작이 없으므로 손가락을 받지 않는다. 받으면 알약이 덮은 말풍선을
      그동안 누르지 못한다.

      층을 잘라 내는 이유는 알약이 띠 뒤로 들어가 사라지게 하기 위해서다.
      자르지 않으면 올라간 알약이 상황 줄과 헤더 위에 그대로 비친다.
    */
    <View
      className="absolute top-0 right-0 left-0 z-10 items-center overflow-hidden px-5"
      pointerEvents="none"
      style={{
        height: LAYER_TOP_GAP + Math.max(pillHeight, LAYER_MIN_HEIGHT),
        paddingTop: LAYER_TOP_GAP,
      }}
      testID="screen-toast"
    >
      {/*
        알약은 층의 좌우 여백 안에서만 넓어진다. 대화와 같은 여백이라 화면 끝에
        닿지 않고, 긴 문구는 그 안에서 줄을 바꾼다.
      */}
      <Animated.View
        accessibilityLiveRegion="polite"
        className="flex-row items-center gap-2 rounded-full border border-border bg-surface px-4 py-2.5"
        entering={isReduced ? fadeIn : slideDown}
        exiting={isReduced ? fadeOut : slideUpOut}
        onLayout={measurePill}
        style={{ maxWidth: "100%" }}
      >
        {content.icon}
        {/*
          줄높이를 클래스에 못 박지 않고 배율을 곱한다. 클래스의 줄높이는
          고정값이라 글자만 커지고 줄은 그대로여서 문구의 위아래가 잘린다.
        */}
        <Text
          className="text-base text-foreground"
          maxFontSizeMultiplier={MAX_FONT_SCALE}
          style={{
            flexShrink: 1,
            lineHeight: LINE_HEIGHT * Math.min(fontScale, MAX_FONT_SCALE),
          }}
        >
          {content.text}
        </Text>
      </Animated.View>
    </View>
  );
}
