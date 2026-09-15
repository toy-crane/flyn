import { type ReactNode, useCallback } from "react";
import { ScrollView } from "react-native";

import type {
  SpokenDays,
  StreakSummary,
} from "@/features/streak/api/learning-record";
import { monthSteps } from "@/features/streak/ui/calendar-days";
import { useDaySelection } from "@/features/streak/ui/day-selection";
import { MonthCalendar } from "@/features/streak/ui/month-calendar";
import { streakLabels } from "@/features/streak/ui/streak-labels";
import { StreakLine } from "@/features/streak/ui/streak-line";
import { DelayedLoading } from "@/shared/ui/delayed-loading";
import { ScreenUnavailable } from "@/shared/ui/screen-status";

/**
 * 연속 기록 화면. 홈의 `연속 기록 ›`이 탭 바깥에서 연다.
 *
 * 위에 홈과 같은 `12일 연속` 한 줄, 아래에 월 달력을 둔다. 홈이 "오늘 했나"에
 * 답한다면 이 화면은 "꾸준했나"에 답한다. 최장 기록과 세는 규칙은 두지 않는다.
 *
 * 보여 줄 달은 경로가 가진다. 그달의 기록을 읽는 것이 경로의 일이기 때문이다.
 */
export function StreakScreen({
  isLoading,
  isRetrying,
  month,
  onRetry,
  onShowMonth,
  spokenDays,
  summary,
  today,
}: {
  isLoading: boolean;
  isRetrying: boolean;
  /** 보여 줄 달의 첫날. */
  month: Date;
  onRetry: () => void;
  onShowMonth: (month: Date) => void;
  /** 보여 줄 달의 기록. 읽는 중이거나 읽지 못했으면 undefined다. */
  spokenDays: SpokenDays | undefined;
  summary: StreakSummary | undefined;
  today: Date;
}) {
  const { clearDay, selectDay, selectedDay, touchHandlers } = useDaySelection();
  const steps = monthSteps(month, today, summary?.firstDay ?? null);
  const { next, previous } = steps;
  const showNext = useCallback(() => {
    clearDay();
    onShowMonth(next);
  }, [clearDay, next, onShowMonth]);
  const showPrevious = useCallback(() => {
    clearDay();
    onShowMonth(previous);
  }, [clearDay, onShowMonth, previous]);

  let body: ReactNode;
  if (summary && (spokenDays || isLoading)) {
    body = (
      <>
        <StreakLine days={summary.streak} />
        <MonthCalendar
          canShowNext={steps.canShowNext}
          canShowPrevious={steps.canShowPrevious}
          month={month}
          onNext={showNext}
          onPrevious={showPrevious}
          onSelectDay={selectDay}
          selectedDay={selectedDay}
          spokenDays={spokenDays}
          today={today}
        />
      </>
    );
  } else if (isLoading) {
    body = <DelayedLoading testID="streak-loading" />;
  } else {
    body = (
      <ScreenUnavailable
        isRetrying={isRetrying}
        onRetry={onRetry}
        testID="streak-unavailable"
        title={streakLabels.unavailable}
      />
    );
  }

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="gap-4 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="streak-scroll"
      {...touchHandlers}
    >
      {body}
    </ScrollView>
  );
}
