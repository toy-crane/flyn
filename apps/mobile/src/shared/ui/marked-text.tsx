import {
  Typography,
  type TypographyColor,
  type TypographyWeight,
} from "heroui-native/text";
import { Text } from "react-native";

/** 강조할 조각과 그대로 둘 조각. */
export interface MarkedText {
  /** 문장에서 이 조각이 시작하는 자리. 조각마다 다르므로 그리기의 key가 된다. */
  at: number;
  isMarked: boolean;
  text: string;
}

export type TextMark = string | { text: string; isMarked: boolean };

/**
 * 문장을 강조할 자리 기준으로 자른다.
 *
 * 한 줄과 카드가 같은 장치를 쓴다. 고친 문장에서는 달라진 낱말을, 원문에서는
 * 어긋난 자리를 짚는다. 조각을 찾지 못하면 그 자리는 강조 없이 흐르고 나머지
 * 문장은 그대로 보인다. 강조 하나를 놓치는 편이 문장을 못 보여 주는 것보다
 * 낫다.
 *
 * 같은 조각이 문장에 두 번 나오면 처음 자리만 짚고, 이미 짚은 자리와 겹치는
 * 조각은 겹치지 않는 다음 자리를 찾는다.
 */
export function markedParts(
  text: string,
  marks: readonly TextMark[]
): MarkedText[] {
  const ranges: { end: number; start: number; isMarked: boolean }[] = [];

  for (const item of marks) {
    const mark = typeof item === "string" ? item : item.text;
    const isMarked = typeof item === "string" || item.isMarked;
    if (!mark) {
      continue;
    }

    let from = 0;

    while (from <= text.length - mark.length) {
      const start = text.indexOf(mark, from);

      if (start < 0) {
        break;
      }

      const end = start + mark.length;
      const overlaps = ranges.some(
        (range) => start < range.end && end > range.start
      );

      if (!overlaps) {
        ranges.push({ end, isMarked, start });
        break;
      }

      from = start + 1;
    }
  }

  ranges.sort((left, right) => left.start - right.start);

  const parts: MarkedText[] = [];
  let at = 0;

  for (const range of ranges) {
    if (range.start > at) {
      parts.push({ at, isMarked: false, text: text.slice(at, range.start) });
    }

    parts.push({
      at: range.start,
      isMarked: range.isMarked,
      text: text.slice(range.start, range.end),
    });
    at = range.end;
  }

  if (at < text.length) {
    parts.push({ at, isMarked: false, text: text.slice(at) });
  }

  return parts;
}

/**
 * 강조할 자리를 짚은 문장.
 *
 * 문장은 한 줄로 이어지고 짚은 조각만 다른 모양을 입는다. 어떻게 짚을지는
 * 부르는 쪽이 정한다. 대화 곁에서는 색으로, 표현 노트에서는 형광펜으로 짚지만
 * 자르는 규칙은 하나다.
 *
 * 문장의 크기와 굵기는 타이포그래피 역할이 정한다. 짚은 조각은 그 안에 중첩된
 * 글이라 색과 배경 같은 모양만 입고 크기와 굵기는 바깥 문장을 따른다.
 */
export function MarkedSentence({
  className,
  color,
  marks,
  markClassName,
  testID,
  text,
  type = "body",
  weight,
}: {
  /** 색과 여백. 크기, 행간, 굵기는 `type`과 `weight`가 정한다. */
  className?: string;
  color?: TypographyColor;
  markClassName: string;
  marks: readonly TextMark[];
  testID?: string;
  text: string;
  /** 영어 문장은 `h6`, 그 밖의 문장은 본문 계열이다. */
  type?: "body" | "body-sm" | "body-xs" | "h6";
  weight?: TypographyWeight;
}) {
  const parts = markedParts(text, marks).map((part) =>
    part.isMarked ? (
      <Text className={markClassName} key={part.at}>
        {part.text}
      </Text>
    ) : (
      part.text
    )
  );

  if (type === "h6") {
    return (
      <Typography.Heading
        className={className}
        color={color}
        selectable={false}
        testID={testID}
        type="h6"
        weight={weight}
      >
        {parts}
      </Typography.Heading>
    );
  }

  return (
    <Typography.Paragraph
      className={className}
      color={color}
      selectable={false}
      testID={testID}
      type={type}
      weight={weight}
    >
      {parts}
    </Typography.Paragraph>
  );
}
