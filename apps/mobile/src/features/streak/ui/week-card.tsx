import { Card } from "heroui-native/card";
import { LinkButton } from "heroui-native/link-button";
import { Typography } from "heroui-native/text";
import { View } from "react-native";

import type { SpokenDays } from "@/features/streak/api/learning-record";
import { Icon } from "@/shared/ui/icon";
import { weekOf } from "./calendar-days";
import { DayGrid } from "./day-grid";
import { streakLabels } from "./streak-labels";

/**
 * 홈의 이번 주 카드. 월요일부터 일요일까지 7칸이다.
 *
 * 툴팁이 카드 아래로 나올 수 있어서 카드가 내용을 자르지 않게 둔다.
 */
export function WeekCard({
  onOpenStreak,
  onSelectDay,
  selectedDay,
  spokenDays,
  today,
}: {
  onOpenStreak: () => void;
  onSelectDay: (day: string) => void;
  selectedDay: string | null;
  spokenDays: SpokenDays;
  today: Date;
}) {
  const week = weekOf(today);

  return (
    <Card className="gap-3 overflow-visible" testID="week-card">
      {/* 큰 글자에서 제목과 링크가 한 줄에 들어가지 않으면 링크가 다음 줄로 내려간다. */}
      <View className="flex-row flex-wrap items-center justify-between gap-x-3">
        <Typography.Heading type="h6">{week.title}</Typography.Heading>
        <LinkButton
          accessibilityLabel={streakLabels.streak}
          className="ml-auto min-h-11 gap-0.5"
          onPress={onOpenStreak}
          size="sm"
        >
          <LinkButton.Label className="text-muted">
            {streakLabels.streak}
          </LinkButton.Label>
          <Icon name="forward" size="xs" tone="muted" />
        </LinkButton>
      </View>
      <DayGrid
        days={week.days}
        onSelectDay={onSelectDay}
        selectedDay={selectedDay}
        spokenDays={spokenDays}
        testID="week-days"
        today={today}
      />
    </Card>
  );
}
