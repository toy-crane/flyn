import type { ReactNode } from "react";
import { ScrollView } from "react-native";

import type {
  SpokenDays,
  StreakSummary,
} from "@/features/streak/api/learning-record";
import { useDaySelection } from "@/features/streak/ui/day-selection";
import { streakLabels } from "@/features/streak/ui/streak-labels";
import { StreakLine } from "@/features/streak/ui/streak-line";
import { WeekCard } from "@/features/streak/ui/week-card";
import { DelayedLoading } from "@/shared/ui/delayed-loading";
import { ScreenUnavailable } from "@/shared/ui/screen-status";

/**
 * 영어 학습 공간.
 *
 * 네이티브 큰 제목과 프로필 버튼 아래에 연속 기록 한 줄과 이번 주 카드를 둔다.
 * 홈은 "오늘 했나"에 답하고, 지난 기록은 연속 기록 화면의 월 달력이 맡는다.
 * 카드 아래 자리는 아직 정하지 않았다.
 *
 * 기록을 다 읽기 전에는 한 줄도 카드도 그리지 않는다. 먼저 그리면 `0일 연속`이
 * 잠깐 보였다가 바뀐다.
 *
 * 이어 하기 카드는 여기 없다. 진행을 잇는 일은 대화 기록이 회차마다 맡는다.
 */
export function HomeScreen({
  isFocused = true,
  isLoading,
  isRetrying,
  onOpenStreak,
  onRetry,
  spokenDays,
  summary,
  today,
}: {
  /** 홈 탭이 보이는 중인지. 떠나면 열린 툴팁을 닫는다. */
  isFocused?: boolean;
  isLoading: boolean;
  isRetrying: boolean;
  onOpenStreak: () => void;
  onRetry: () => void;
  spokenDays: SpokenDays | undefined;
  summary: StreakSummary | undefined;
  today: Date;
}) {
  const { selectDay, selectedDay, touchHandlers } = useDaySelection(isFocused);
  let body: ReactNode;

  if (summary && spokenDays) {
    body = (
      <>
        <StreakLine days={summary.streak} />
        <WeekCard
          onOpenStreak={onOpenStreak}
          onSelectDay={selectDay}
          selectedDay={selectedDay}
          spokenDays={spokenDays}
          today={today}
        />
      </>
    );
  } else if (isLoading) {
    body = <DelayedLoading testID="home-loading" />;
  } else {
    body = (
      <ScreenUnavailable
        isRetrying={isRetrying}
        onRetry={onRetry}
        testID="home-unavailable"
        title={streakLabels.unavailable}
      />
    );
  }

  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-4 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="home-scroll"
      {...touchHandlers}
    >
      {body}
    </ScrollView>
  );
}
