import { setStringAsync } from "expo-clipboard";
import { ImpactFeedbackStyle, impactAsync } from "expo-haptics";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import {
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { View } from "react-native";
import Animated, {
  Easing,
  FadeInUp,
  ReduceMotion,
  useReducedMotion,
} from "react-native-reanimated";

import { Icon } from "@/shared/ui/icon";

/**
 * 버튼 하나의 누르는 범위와 그 안의 그림 사이.
 *
 * 그려진 아이콘은 16pt이고 버튼은 28pt이므로 버튼끼리 붙이면 그림 사이가
 * 12pt가 된다. 스펙이 정한 값은 8pt이므로 버튼을 4pt 겹친다. 겹치는 띠에서는
 * 나중에 그려진 오른쪽 버튼이 손가락을 받는다. 겹친 형제 중 위에 놓인 쪽이
 * 받는 것이고, 2026-09-10 iOS 시뮬레이터에서 그대로 확인했다.
 *
 * 세로는 40pt다. 그려진 상자가 28pt이므로 위아래로 6pt씩 넓힌다. 가로로는
 * 넓히지 않는다. 옆 버튼에게서 손가락을 더 빼앗는다.
 *
 * 겹침은 클래스가 아니라 `style`에 이름을 가진 값으로 둔다. 8pt는 아이콘 폭과
 * 버튼 폭에서 나오는 계산이고, 그 계산을 `icon-row.test.tsx`가 이 값으로
 * 확인한다. 클래스 문자열로 옮기면 검사가 그 관계를 잃는다.
 */
const BUTTON_OVERLAP = -2;
const VERTICAL_HIT_SLOP = 6;

/** 복사한 아이콘이 체크로 서 있는 시간. */
const COPIED_MS = 1500;

// 줄이 떠오르는 움직임. 시안 icon-row-entrance.html의 값이다. 불투명도 0에서
// 1, 4pt 위에서 제자리로, 180ms이고 대사 사이는 40ms다.
const RISE_MS = 180;
const RISE_STAGGER_MS = 40;
const RISE_FROM = 4;

/**
 * 이 줄이 장면 안에서 몇 번째인지에 따라 얼마나 늦게 떠오르는지.
 *
 * 대사마다 40ms씩 밀린다. 위에서부터 차례로 떠오르는 것이 한꺼번에 뜨는 것보다
 * 장면이 끝났다는 것을 분명히 알린다.
 */
export function riseDelayMs(index: number): number {
  return Math.max(index, 0) * RISE_STAGGER_MS;
}

function riseAfter(index: number) {
  return FadeInUp.duration(RISE_MS)
    .delay(riseDelayMs(index))
    .easing(Easing.out(Easing.ease))
    .reduceMotion(ReduceMotion.Never)
    .withInitialValues({ opacity: 0, transform: [{ translateY: RISE_FROM }] });
}

/** 클립보드에 넣는다. 성공도 알리지 않으므로 실패도 화면을 바꾸지 않는다. */
export function copyToClipboard(text: string) {
  setStringAsync(text).catch(() => {
    // Nothing is announced on success either, so a refused clipboard leaves
    // the same screen behind and the person can try again.
  });
}

/**
 * 아이콘 줄의 버튼을 누를 때마다 오는 가벼운 햅틱.
 *
 * 지원하지 않는 기기에서도 나머지 동작은 같다. 토스트가 뜰 때 주던 햅틱은
 * 없앴다. 그대로 두면 책갈피 한 번에 두 번 울린다.
 */
function tapFeedback() {
  impactAsync(ImpactFeedbackStyle.Light).catch(() => undefined);
}

/**
 * 아이콘 줄에 서는 버튼 하나.
 *
 * 안에 담는 표시는 16px 아이콘이나 같은 자리의 진행 표시다. 버튼의 크기는 그
 * 표시와 상관없이 28px로 붙박여 있어서, 아이콘이 바뀌어도 줄이 움직이지 않는다.
 *
 * 누르는 동안 버튼 뒤에 배경을 그리지 않는다. iOS의 하이라이트 원도 Android의
 * 물결도 두지 않고, 눌렀다는 답은 아이콘 자신이 한다. 복사는 체크로 바뀌고,
 * 책갈피는 채워지거나 비고, 다시 받기는 진행 표시가 된다. 살짝 작아지는 동작만
 * 남는다.
 */
export function IconRowButton({
  children,
  isBusy = false,
  isDisabled = false,
  isSelected,
  label,
  onPress,
  testID,
}: {
  children: ReactNode;
  /** 이 버튼이 시작한 일이 아직 끝나지 않았다. 흐리게 하지 않고 다시 눌리지만 막는다. */
  isBusy?: boolean;
  isDisabled?: boolean;
  /** 켜고 끄는 동작이라면 지금 켜져 있는지. 화면 읽기가 그대로 읽는다. */
  isSelected?: boolean;
  label: string;
  onPress: () => void;
  testID?: string;
}) {
  const blocked = isBusy || isDisabled;
  const press = useCallback(() => {
    tapFeedback();
    onPress();
  }, [onPress]);

  return (
    // The library's own pressable: it answers a touch with a scale. The
    // highlight and the ripple it can also draw are left out on purpose.
    <PressableFeedback
      accessibilityLabel={label}
      accessibilityRole="button"
      accessibilityState={{
        busy: isBusy,
        disabled: blocked,
        selected: isSelected,
      }}
      className={
        // 진행 표시는 흐리게 두지 않는다. 회색 표시를 40%까지 낮추면 도는지조차
        // 보이지 않아서, 기다리는 중임을 알리려던 표시가 사라진다.
        isDisabled && !isBusy
          ? "size-7 items-center justify-center opacity-40"
          : "size-7 items-center justify-center"
      }
      hitSlop={{
        bottom: VERTICAL_HIT_SLOP,
        top: VERTICAL_HIT_SLOP,
      }}
      isDisabled={blocked}
      onPress={press}
      style={{ marginHorizontal: BUTTON_OVERLAP }}
      testID={testID}
    >
      {children}
    </PressableFeedback>
  );
}

/**
 * 아이콘 줄의 복사 버튼.
 *
 * 누르면 글을 클립보드에 넣고 아이콘이 1.5초 동안 체크로 바뀐다. 토스트 같은
 * 알림은 두지 않는다. 붙여 넣기로 바로 확인되는 동작이라 화면을 하나 더 띄울
 * 이유가 없고, 눌렀다는 답은 버튼 자신이 한다.
 */
export function IconRowCopyButton({
  isDisabled = false,
  label,
  text,
  testID,
}: {
  isDisabled?: boolean;
  label: string;
  text: string;
  testID?: string;
}) {
  const [isCopied, setIsCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const press = useCallback(() => {
    copyToClipboard(text);
    setIsCopied(true);

    if (timer.current !== undefined) {
      clearTimeout(timer.current);
    }

    timer.current = setTimeout(() => {
      timer.current = undefined;
      setIsCopied(false);
    }, COPIED_MS);
  }, [text]);

  // 화면을 떠날 때 타이머가 남으면 사라진 버튼의 상태를 건드린다.
  useEffect(
    () => () => {
      if (timer.current !== undefined) {
        clearTimeout(timer.current);
      }
    },
    []
  );

  return (
    <IconRowButton
      isDisabled={isDisabled}
      label={label}
      onPress={press}
      testID={testID}
    >
      {isCopied ? (
        <Icon name="check" size="sm" testID="icon-check" tone="muted" />
      ) : (
        <Icon name="copy" size="sm" testID="icon-copy" tone="muted" />
      )}
    </IconRowButton>
  );
}

/**
 * 메시지나 카드 아래에 붙는 아이콘 줄.
 *
 * 어느 쪽에 붙는지는 매달린 것의 정렬을 따른다. 음수 여백이 바깥쪽 아이콘의
 * 그려진 모양을, 그 아이콘을 감싼 여백이 아니라, 위 메시지의 가장자리에 맞춘다.
 * 버튼이 서로 2pt씩 겹치므로 그만큼 덜 당긴다.
 *
 * 줄은 그 메시지가 다 도착한 뒤에 나타난다. 흐르는 동안에도 자리는 지키므로
 * 줄이 나타날 때 말풍선이 밀리지 않는다. 장면이 끝나면 대사마다 위에서부터
 * 차례로 떠오르고, 이미 끝난 대화를 열거나 다른 화면에서 돌아왔을 때는 처음부터
 * 서 있다. 동작 줄이기를 켜면 같은 때에 애니메이션 없이 나타난다.
 */
export function IconRow({
  align = "start",
  children,
  isVisible = true,
  riseIndex = 0,
  testID,
}: {
  align?: "start" | "end";
  children: ReactNode;
  isVisible?: boolean;
  /** 이 줄이 장면 안에서 몇 번째로 떠오르는지. 대사 자리와 같다. */
  riseIndex?: number;
  testID?: string;
}) {
  const isReduced = useReducedMotion();
  /*
    처음부터 보이는 줄은 떠오르지 않는다. 흐름이 끝나 보이게 된 줄만 떠오르므로,
    앞 프레임에 가려져 있었는지를 기억한다. 대화 기록을 열거나 다른 화면에서
    돌아온 줄은 첫 프레임부터 보이는 쪽이라 그대로 서 있다.
  */
  const wasHidden = useRef(!isVisible);
  const shouldRise = isVisible && wasHidden.current && !isReduced;

  useEffect(() => {
    wasHidden.current = !isVisible;
  }, [isVisible]);

  return (
    <View
      accessibilityElementsHidden={!isVisible}
      className={
        align === "end"
          ? "mt-1.5 -mr-1 flex-row self-end"
          : "mt-1.5 -ml-1 flex-row self-start"
      }
      importantForAccessibility={isVisible ? "auto" : "no-hide-descendants"}
      pointerEvents={isVisible ? "auto" : "none"}
      // 자리는 지키되 아무것도 그리지 않는다는 이 상태를 검사가 값으로 잰다.
      style={{ opacity: isVisible ? 1 : 0 }}
      testID={testID}
    >
      {/*
        `key`가 보임에 따라 바뀌므로 흐름이 끝나는 순간 이 층이 새로 마운트되고
        `entering`이 그때부터 돈다. CSS 애니메이션이 아니라 entering을 쓰는
        이유는 결말 축하와 같다. Android는 CSS 애니메이션이 붙은 뷰의 스타일을
        두세 프레임 늦게 적용해서, 기다리던 줄이 그동안 그대로 비친다.
      */}
      <Animated.View
        className="flex-row"
        entering={shouldRise ? riseAfter(riseIndex) : undefined}
        key={isVisible ? "shown" : "hidden"}
        testID={testID === undefined ? undefined : `${testID}-content`}
      >
        {children}
      </Animated.View>
    </View>
  );
}

/**
 * 이미 서 있는 줄에 뒤늦게 합류하는 아이콘 하나.
 *
 * 줄 전체가 떠오를 때는 줄이 그 움직임을 맡으므로 여기서는 아무것도 하지 않는다.
 * 처음부터 있던 아이콘도 마찬가지다. 없다가 생긴 아이콘만 같은 떠오름으로
 * 자리를 잡는다. 새 스토리 1화에서 첫 메시지를 보내 회차가 생기고 책갈피가
 * 복사 옆에 합류하는 순간이 이 자리다.
 */
export function IconRowJoin({
  children,
  isPresent,
  riseIndex = 0,
  testID,
}: {
  children: ReactNode;
  /** 이 아이콘이 지금 줄에 서는지. 거짓이면 아무것도 그리지 않는다. */
  isPresent: boolean;
  /** 몇 번째로 떠오르는지. 한 장면의 대사가 여럿이면 그 자리를 그대로 쓴다. */
  riseIndex?: number;
  testID?: string;
}) {
  const isReduced = useReducedMotion();
  const wasAbsent = useRef(!isPresent);
  const shouldRise = isPresent && wasAbsent.current && !isReduced;

  useEffect(() => {
    wasAbsent.current = !isPresent;
  }, [isPresent]);

  if (!isPresent) {
    return null;
  }

  return (
    <Animated.View
      entering={shouldRise ? riseAfter(riseIndex) : undefined}
      testID={testID}
    >
      {children}
    </Animated.View>
  );
}
