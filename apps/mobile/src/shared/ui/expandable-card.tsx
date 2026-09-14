import { Accordion } from "heroui-native/accordion";
import { PressableFeedback } from "heroui-native/pressable-feedback";
import { type ReactNode, useCallback, useRef, useState } from "react";
import { type GestureResponderEvent, View } from "react-native";

import { useReduceMotion } from "@/shared/ui/use-reduce-motion";

/**
 * 누른 자리에서 이만큼 넘게 움직이면 민 것으로 본다.
 *
 * 카드가 넓어서 옆으로 밀어도 손가락이 카드 안에 머문다. 그대로 두면 밀었다
 * 떼는 동작이 카드를 펼쳤다. 밀어서 지우던 습관이 남은 사람이 뜻하지 않은
 * 화면을 만난다. 손떨림은 이 안에 들어온다.
 */
const MOVE_TOLERANCE = 12;

interface Point {
  x: number;
  y: number;
}

/** 누른 자리와 뗀 자리로 판정한다. 민 것이면 카드는 아무 일도 하지 않는다. */
export function isTap(from: Point, to: Point): boolean {
  return Math.hypot(to.x - from.x, to.y - from.y) <= MOVE_TOLERANCE;
}

/** 손가락이 닿은 화면 위치. 화면 읽기의 두 번 탭처럼 위치 없이 오면 `null`이다. */
function pointOf(event: GestureResponderEvent | undefined): Point | null {
  const pageX = event?.nativeEvent?.pageX;
  const pageY = event?.nativeEvent?.pageY;

  return typeof pageX === "number" && typeof pageY === "number"
    ? { x: pageX, y: pageY }
    : null;
}

/** 카드 하나에 항목도 하나다. 펼친 카드가 `Accordion`에 넘기는 값이다. */
const CARD_VALUE = "card";

/**
 * 접힌 카드가 넘기는 값.
 *
 * HeroUI `Accordion`은 `value`가 `undefined`이면 비제어로 바뀌어 누를 때마다
 * 스스로 펼친다. 그러면 옆으로 민 판정이 끼어들 틈이 없으므로, 접힌 상태도
 * 어느 항목과도 같지 않은 값으로 넘겨 늘 이 카드가 정한다.
 */
const COLLAPSED_VALUE = "";

/**
 * 제목 줄을 눌러 그 자리에서 펼치는 카드.
 *
 * 카드마다 하나인 HeroUI `Accordion` 표면 변형이다. 제목 줄이 트리거이고 누르면
 * 펼쳐지며 다시 누르면 접힌다. 펼친 내용과 카드 아래 줄은 트리거 밖이라 눌러도
 * 접히거나 펼쳐지지 않는다. 카드 아래 줄(아이콘 줄, 이어서 하기)은 내용 슬롯이
 * 아니라서 접힌 카드에도 보인다.
 *
 * HeroUI가 주지 않는 것 세 가지를 이 카드가 더한다. 옆으로 밀다 뗀 손가락을
 * 누름으로 치지 않는 판정, 손으로 적는 읽을 이름, 앱을 연 뒤 켠 동작 줄이기다.
 */
export function ExpandableCard({
  accessibilityLabel,
  children,
  contentTestID,
  expandedAccessibilityLabel = accessibilityLabel,
  footer,
  indicatorTestID,
  summary,
  testID,
  triggerTestID,
}: {
  /** 제목 줄을 읽을 이름. */
  accessibilityLabel: string;
  /** 펼쳤을 때만 보이는 내용. */
  children: ReactNode;
  contentTestID?: string;
  /** 펼쳤을 때 읽을 이름. 펼침 상태에 따라 말이 바뀌는 카드만 넘긴다. */
  expandedAccessibilityLabel?: string;
  /** 카드 아래 줄. 트리거와 내용 슬롯 밖이라 접힌 카드에도 보인다. */
  footer?: ReactNode;
  indicatorTestID?: string;
  /** 제목 줄. 쉐브론 왼쪽을 채운다. */
  summary: ReactNode;
  testID?: string;
  triggerTestID?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const isReduceMotion = useReduceMotion();
  const pressedAt = useRef<Point | null>(null);
  const releasedAt = useRef<Point | null>(null);
  const rememberPress = useCallback((event: GestureResponderEvent) => {
    pressedAt.current = pointOf(event);
    releasedAt.current = null;
  }, []);
  // 뗀 자리는 누름 이벤트에서 읽는다. React Native는 130ms보다 짧은 누름의
  // `onPressOut`을 타이머로 미루고 누름을 먼저 보내므로, 빠르게 밀고 뗀 손가락은
  // `onPressOut`을 기다리면 판정 없이 카드를 연다.
  const rememberRelease = useCallback((event: GestureResponderEvent) => {
    releasedAt.current = pointOf(event);
  }, []);
  // 누름을 받은 HeroUI 트리거가 부른다. 트리거 자식의 `onPress`가 먼저 불려 뗀
  // 자리를 적어 두므로 여기서 두 자리를 비교할 수 있다.
  const change = useCallback((next: string | undefined) => {
    const from = pressedAt.current;
    const to = releasedAt.current;

    pressedAt.current = null;
    releasedAt.current = null;

    if (from !== null && to !== null && !isTap(from, to)) {
      return;
    }

    setIsExpanded(next === CARD_VALUE);
  }, []);

  return (
    <Accordion
      animation={isReduceMotion ? "disable-all" : undefined}
      hideSeparator
      isCollapsible
      onValueChange={change}
      selectionMode="single"
      testID={testID}
      value={isExpanded ? CARD_VALUE : COLLAPSED_VALUE}
      variant="surface"
    >
      <Accordion.Item value={CARD_VALUE}>
        {/*
          읽을 이름을 손으로 적는다. iOS가 안의 글에서 이름을 짓게 두면 카드마다
          다르게 묶어서, 어떤 카드는 세 칸을 이어 읽고 어떤 카드는 이름을 찾지
          못해 `testID`를 대신 읽는다. 기기에서 그렇게 갈리는 것을 봤다.

          `accessibilityState`는 넘기지 않는다. HeroUI 트리거가 펼침 상태를 적은
          뒤에 받은 속성을 덮어쓰므로, 넘기면 `expanded`가 사라진다.

          누르기 속성은 자식에 둔다. HeroUI `Slot`은 양쪽의 같은 핸들러를 자식 먼저
          부르도록 묶으므로, 뗀 자리가 트리거의 펼침 처리보다 먼저 적힌다.
        */}
        <Accordion.Trigger
          accessibilityLabel={
            isExpanded ? expandedAccessibilityLabel : accessibilityLabel
          }
          asChild
          testID={triggerTestID}
        >
          <PressableFeedback
            onPress={rememberRelease}
            onPressIn={rememberPress}
          >
            <View className="flex-1">{summary}</View>
            <Accordion.Indicator testID={indicatorTestID} />
          </PressableFeedback>
        </Accordion.Trigger>
        <Accordion.Content testID={contentTestID}>{children}</Accordion.Content>
      </Accordion.Item>
      {footer}
    </Accordion>
  );
}
