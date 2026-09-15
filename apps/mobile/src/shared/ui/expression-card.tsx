import { Card } from "heroui-native/card";
import { Typography } from "heroui-native/text";
import type { ReactNode } from "react";
import { View } from "react-native";

import { ExpandableCard } from "@/shared/ui/expandable-card";
import { MarkedSentence, type TextMark } from "@/shared/ui/marked-text";

/** 펼쳤을 때 드러나는 두 섹션의 라벨. 카드가 서는 두 화면에서 같은 말을 쓴다. */
const detailLabels = {
  original: "내가 쓴 문장",
  why: "이렇게 쓰는 이유",
} as const;

/** 펼쳐야 보이는 내용. 없으면 쉐브론도 없고 카드는 눌리는 자리가 아니다. */
export interface ExpressionCardDetail {
  /** 사용자가 실제로 쓴 문장. 영어일 수도 한국어일 수도 있다. */
  original: string;
  /** 원문에서 어긋난 자리. 밑줄로만 짚는다. */
  originalMarks: readonly TextMark[];
  /** 왜 그렇게 쓰는지. 짚은 자리가 여럿이면 줄도 그만큼이다. */
  whys: readonly string[];
}

/** 카드 안 칸의 `testID`. 카드에 `testID`가 없으면 안의 칸에도 없다. */
function innerTestID(
  testID: string | undefined,
  suffix: string
): string | undefined {
  return testID === undefined ? undefined : `${testID}-${suffix}`;
}

/** 펼친 카드의 두 섹션. 구분선도 띠도 없이 라벨과 여백으로만 가른다. */
function DetailSections({
  detail,
  testID,
}: {
  detail: ExpressionCardDetail;
  testID?: string;
}) {
  return (
    <View className="gap-[14px]">
      <View className="gap-1">
        <Typography.Paragraph
          color="muted"
          selectable={false}
          type="body-xs"
          weight="medium"
        >
          {detailLabels.original}
        </Typography.Paragraph>
        <MarkedSentence
          markClassName="underline"
          marks={detail.originalMarks}
          testID={innerTestID(testID, "original")}
          text={detail.original}
          type="body-sm"
        />
      </View>
      <View className="gap-1">
        <Typography.Paragraph
          color="muted"
          selectable={false}
          type="body-xs"
          weight="medium"
        >
          {detailLabels.why}
        </Typography.Paragraph>
        {/*
          같은 이유가 두 번 올 수 있다. 서버는 짚은 자리와 고친 글로 항목을
          가리므로 이유가 겹치는 것을 막지 않는다. 줄 번호를 열쇠에 넣어야
          그때도 두 줄이 각자 남는다.
        */}
        {detail.whys.map((why, at) => (
          <Typography.Paragraph
            color="muted"
            // biome-ignore lint/suspicious/noArrayIndexKey: 한 카드 안에서 이유의 순서는 바뀌지 않고, 같은 이유가 두 번 올 수 있다
            key={`${at}:${why}`}
            selectable={false}
            type="body-sm"
          >
            {why}
          </Typography.Paragraph>
        ))}
      </View>
    </View>
  );
}

/**
 * 담아 둔 표현 하나를 보여 주는 카드.
 *
 * 출처 한 줄, 영어 문장, 한국어 뜻의 세 칸이다. 표현 노트와 표현 돌아보기가
 * 같이 쓰므로 여기서는 표현의 종류를 알지 못한다. 채널의 색도, 첫 줄에 무엇을
 * 쓸지도, 아이콘 줄에 무엇을 세울지도 부르는 쪽이 정해서 넘긴다.
 *
 * 펼칠 것이 있으면 펼침 카드(HeroUI `Accordion` 표면 변형)이고, 없으면 HeroUI
 * `Card`다. 아이콘 줄은 카드 아래에 서고 펼침 카드의 트리거와 내용 슬롯 밖이다.
 * 그래야 접힌 카드에도 보이고 복사나 휴지통을 눌렀을 때 카드가 함께 펼쳐지지
 * 않는다.
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
  const inner = (suffix: string) => innerTestID(testID, suffix);
  const cardLabel = [headerLabel, english, meaning]
    .filter((part) => part !== null && part !== "")
    .join(", ");
  const summary = (
    <View className="gap-2">
      <View className="min-h-5 flex-row items-start gap-2">{header}</View>
      <MarkedSentence
        markClassName={markClassName}
        marks={marks}
        testID={inner("english")}
        text={english}
        type="h6"
      />
      {meaning === null ? null : (
        <Typography.Paragraph
          color="muted"
          selectable={false}
          testID={inner("meaning")}
          type="body-sm"
        >
          {meaning}
        </Typography.Paragraph>
      )}
    </View>
  );

  if (detail === undefined) {
    return (
      <Card testID={testID}>
        <View testID={inner("body")}>{summary}</View>
        {actions}
      </Card>
    );
  }

  return (
    <ExpandableCard
      accessibilityLabel={cardLabel}
      contentTestID={inner("detail")}
      footer={
        // 트리거가 이미 아래 여백을 가지므로 아이콘 줄의 윗여백을 덜어 낸다. 둘이
        // 겹치면 뜻과 아이콘 사이가 카드 위쪽 여백의 두 배로 벌어진다. 덜어 낸
        // 만큼 이 줄이 트리거 아래 끝을 덮으므로, 빈 자리의 터치는 트리거로 흘린다.
        actions === undefined ? null : (
          <View className="-mt-1.5 px-5 pb-3.5" pointerEvents="box-none">
            {actions}
          </View>
        )
      }
      indicatorTestID={inner("chevron")}
      summary={summary}
      testID={testID}
      triggerTestID={inner("body")}
    >
      <DetailSections detail={detail} testID={testID} />
    </ExpandableCard>
  );
}
