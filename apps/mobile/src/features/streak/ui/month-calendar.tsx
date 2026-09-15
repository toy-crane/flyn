import { Card } from "heroui-native/card";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { View } from "react-native";

import type { SpokenDays } from "@/features/streak/api/learning-record";
import { Icon } from "@/shared/ui/icon";
import { IconButton } from "@/shared/ui/icon-button";
import { monthOf } from "./calendar-days";
import { DayGrid } from "./day-grid";
import { streakLabels } from "./streak-labels";

function MonthStep({
  direction,
  isDisabled,
  onPress,
}: {
  direction: "next" | "previous";
  isDisabled: boolean;
  onPress: () => void;
}) {
  return (
    // 누르는 영역은 44pt로 두고 눈에 보이는 원만 작게 그린다.
    <IconButton
      accessibilityLabel={
        direction === "next"
          ? streakLabels.nextMonth
          : streakLabels.previousMonth
      }
      className="rounded-full"
      isDisabled={isDisabled}
      onPress={onPress}
      size="lg"
    >
      <View className="size-8 items-center justify-center rounded-full bg-surface-secondary">
        <Icon name={direction === "next" ? "forward" : "backward"} size="sm" />
      </View>
    </IconButton>
  );
}

/**
 * 연속 기록 화면의 월 달력 카드.
 *
 * 머리에 달과 이전·다음 달 버튼, 가운데 날짜 칸, 구분선 아래에 그달의 영어로
 * 말한 횟수 합계를 둔다. 칸의 색, 오늘 표시, 아직 오지 않은 날과 툴팁은 이번 주
 * 카드와 같다. 툴팁이 합계 줄을 덮을 수 있어서 카드가 내용을 자르지 않게 둔다.
 */
export function MonthCalendar({
  canShowNext,
  canShowPrevious,
  month,
  onNext,
  onPrevious,
  onSelectDay,
  selectedDay,
  spokenDays,
  today,
}: {
  canShowNext: boolean;
  canShowPrevious: boolean;
  month: Date;
  onNext: () => void;
  onPrevious: () => void;
  onSelectDay: (day: string) => void;
  selectedDay: string | null;
  /** 그달의 기록. 읽는 중이면 undefined다. */
  spokenDays: SpokenDays | undefined;
  today: Date;
}) {
  const calendar = monthOf(month);
  const total = spokenDays
    ? Object.values(spokenDays).reduce((sum, count) => sum + count, 0)
    : undefined;

  return (
    <Card className="gap-3 overflow-visible" testID="month-calendar">
      {/* 큰 글자에서 한 줄에 들어가지 않으면 버튼과 합계가 다음 줄의 오른쪽으로 간다. */}
      <View className="flex-row flex-wrap items-center justify-between gap-x-3">
        <Typography.Heading type="h6">{calendar.title}</Typography.Heading>
        <View className="ml-auto flex-row">
          <MonthStep
            direction="previous"
            isDisabled={!canShowPrevious}
            onPress={onPrevious}
          />
          <MonthStep
            direction="next"
            isDisabled={!canShowNext}
            onPress={onNext}
          />
        </View>
      </View>
      <DayGrid
        days={calendar.days}
        onSelectDay={onSelectDay}
        selectedDay={selectedDay}
        spokenDays={spokenDays}
        testID="month-days"
        today={today}
      />
      <Separator />
      <View className="flex-row flex-wrap items-baseline justify-between gap-x-3">
        <Typography.Paragraph color="muted">
          {streakLabels.monthTotal}
        </Typography.Paragraph>
        {total === undefined ? null : (
          <Typography.Paragraph className="ml-auto" weight="semibold">
            {streakLabels.monthTotalValue(total)}
          </Typography.Paragraph>
        )}
      </View>
    </Card>
  );
}
