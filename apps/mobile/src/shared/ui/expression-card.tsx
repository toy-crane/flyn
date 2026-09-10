import { type ReactNode, useCallback, useRef, useState } from "react";
import {
  type GestureResponderEvent,
  Pressable,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

import { Icon } from "@/shared/ui/icon";
import { MarkedSentence } from "@/shared/ui/marked-text";

/** 펼쳤을 때 드러나는 두 섹션의 라벨. 카드가 서는 두 화면에서 같은 말을 쓴다. */
const detailLabels = {
  original: "내가 쓴 문장",
  why: "이렇게 쓰는 이유",
} as const;

/**
 * 누른 자리에서 이만큼 넘게 움직이면 민 것으로 본다.
 *
 * 카드가 넓어서 옆으로 밀어도 손가락이 카드 안에 머문다. 그대로 두면 밀었다
 * 떼는 동작이 카드를 펼쳤다. 밀어서 지우던 습관이 남은 사람이 뜻하지 않은
 * 화면을 만난다. 손떨림은 이 안에 들어온다.
 */
const MOVE_TOLERANCE = 12;

/** 누른 자리와 뗀 자리로 판정한다. 민 것이면 카드는 아무 일도 하지 않는다. */
export function isTap(
  from: { x: number; y: number },
  to: { x: number; y: number }
): boolean {
  return Math.hypot(to.x - from.x, to.y - from.y) <= MOVE_TOLERANCE;
}

/** 펼쳐야 보이는 내용. 없으면 쉐브론도 없고 카드는 눌리는 자리가 아니다. */
export interface ExpressionCardDetail {
  /** 사용자가 실제로 쓴 문장. 영어일 수도 한국어일 수도 있다. */
  original: string;
  /** 원문에서 어긋난 자리. 밑줄로만 짚는다. */
  originalMarks: readonly string[];
  /** 왜 그렇게 쓰는지. 짚은 자리가 여럿이면 줄도 그만큼이다. */
  whys: readonly string[];
}

/**
 * 담아 둔 표현 하나를 보여 주는 카드.
 *
 * 출처 한 줄, 영어 문장, 한국어 뜻의 세 칸이다. 표현 노트와 표현 돌아보기가
 * 같이 쓰므로 여기서는 표현의 종류를 알지 못한다. 채널의 색도, 첫 줄에 무엇을
 * 쓸지도, 아이콘 줄에 무엇을 세울지도 부르는 쪽이 정해서 넘긴다.
 *
 * 아이콘 줄은 누르는 몸통 바깥에 선다. 그래야 복사나 휴지통을 눌렀을 때 카드가
 * 함께 펼쳐지지 않는다.
 */
export function ExpressionCard({
  actions,
  detail,
  english,
  header,
  headerLabel,
  markClassName,
  marks,
  meaning,
  testID,
}: {
  /** 카드 아래 오른쪽에 서는 아이콘 줄. 부르는 쪽이 통째로 넘긴다. */
  actions?: ReactNode;
  detail?: ExpressionCardDetail;
  english: string;
  /** 첫 줄에 들어가는 것. 쉐브론 왼쪽을 채우고 남는 자리를 가져간다. */
  header: ReactNode;
  /** 첫 줄을 소리로 읽을 때의 글. 화면 읽기가 카드를 한 번에 읽는 데 쓴다. */
  headerLabel: string;
  /** 영어 문장에서 짚은 자리에 입힐 형광펜. 채널의 색이다. */
  markClassName: string;
  marks: readonly string[];
  /** 한국어 뜻. 뜻 없이 담긴 옛 항목은 이 줄이 통째로 빈다. */
  meaning: string | null;
  testID?: string;
}) {
  // 글자 크기가 바뀌면 카드 안의 이전 측정값을 버리고 다시 배치한다.
  const { fontScale } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const touchedAt = useRef({ x: 0, y: 0 });
  const rememberTouch = useCallback((event: GestureResponderEvent) => {
    touchedAt.current = {
      x: event.nativeEvent.pageX,
      y: event.nativeEvent.pageY,
    };
  }, []);
  const toggle = useCallback((event: GestureResponderEvent) => {
    const { pageX, pageY } = event.nativeEvent;

    if (!isTap(touchedAt.current, { x: pageX, y: pageY })) {
      return;
    }

    setIsExpanded((value) => !value);
  }, []);
  const inner = (suffix: string) =>
    testID === undefined ? undefined : `${testID}-${suffix}`;
  const cardLabel = [headerLabel, english, meaning]
    .filter((part) => part !== null && part !== "")
    .join(", ");

  const body = (
    <>
      <View className="gap-2">
        {/*
          아이콘과 쉐브론은 첫 줄에 맞춘다. 큰 접근성 글자에서 첫 줄이 두세 줄로
          늘어나는데, 가운데 맞춤이면 둘이 글의 한가운데로 떠올라 무엇에 붙은
          표시인지 읽히지 않는다.
        */}
        <View className="min-h-5 flex-row items-start gap-2">
          {header}
          {detail === undefined ? null : (
            <Icon
              name={isExpanded ? "collapse" : "expand"}
              size="sm"
              testID={inner("chevron")}
              tone="muted"
            />
          )}
        </View>
        <MarkedSentence
          className="font-semibold text-[17px] text-foreground leading-[25px]"
          markClassName={markClassName}
          marks={marks}
          testID={inner("english")}
          text={english}
        />
        {meaning === null ? null : (
          <Text
            className="text-[15px] text-muted leading-[22px]"
            selectable={false}
            testID={inner("meaning")}
          >
            {meaning}
          </Text>
        )}
      </View>
      {detail !== undefined && isExpanded ? (
        // 구분선도 띠도 없다. 라벨과 여백만으로 두 섹션을 가른다. 위쪽 여백이
        // 세 칸과 펼친 내용을 떼어 놓는 유일한 표시다.
        <View className="gap-[14px] pt-4" testID={inner("detail")}>
          <View className="gap-1">
            <Text
              className="font-medium text-muted text-xs leading-[18px]"
              selectable={false}
            >
              {detailLabels.original}
            </Text>
            <MarkedSentence
              className="text-[15px] text-foreground leading-[22px]"
              markClassName="underline"
              marks={detail.originalMarks}
              testID={inner("original")}
              text={detail.original}
            />
          </View>
          <View className="gap-1">
            <Text
              className="font-medium text-muted text-xs leading-[18px]"
              selectable={false}
            >
              {detailLabels.why}
            </Text>
            {detail.whys.map((why) => (
              <Text
                className="text-[15px] text-muted leading-[22px]"
                key={why}
                selectable={false}
              >
                {why}
              </Text>
            ))}
          </View>
        </View>
      ) : null}
    </>
  );

  return (
    <View
      className="rounded-[18px] bg-surface px-4 pt-4 pb-3.5"
      key={fontScale}
      testID={testID}
    >
      {detail === undefined ? (
        <View testID={inner("body")}>{body}</View>
      ) : (
        // 아이콘 줄만 빼고 카드 어디를 눌러도 펼쳐진다. 그래서 아이콘 줄은 이
        // 자리 바깥에 서고, 복사나 휴지통을 눌러도 카드가 함께 열리지 않는다.
        //
        // 읽을 이름을 손으로 적는다. iOS가 안의 글에서 이름을 짓게 두면 카드마다
        // 다르게 묶어서, 어떤 카드는 세 칸을 이어 읽고 어떤 카드는 이름을 찾지
        // 못해 `testID`를 대신 읽는다. 기기에서 그렇게 갈리는 것을 봤다.
        <Pressable
          accessibilityLabel={cardLabel}
          accessibilityRole="button"
          accessibilityState={{ expanded: isExpanded }}
          accessible
          onPress={toggle}
          onPressIn={rememberTouch}
          testID={inner("body")}
        >
          {body}
        </Pressable>
      )}
      {actions}
    </View>
  );
}
