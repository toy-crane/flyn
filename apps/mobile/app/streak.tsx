import { useCallback, useState } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import {
  deviceTimeZone,
  useLearningRecordRefresh,
  useSpokenDays,
  useStreakSummary,
} from "@/features/streak/query/learning-record";
import { useDeviceToday } from "@/features/streak/state/use-device-today";
import { dayKey, monthOf } from "@/features/streak/ui/calendar-days";
import { StreakScreen } from "@/screens/streak/streak-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";

export default function StreakRoute() {
  const { session } = useAuthSession();
  const userId = session?.user.id;
  const zone = deviceTimeZone();
  const { today } = useDeviceToday(useLearningRecordRefresh(userId));
  // 처음에는 이번 달을 연다. 이 화면을 여는 동안 자정을 넘겨도 보던 달은 그대로다.
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const { first, last } = monthOf(month);
  const summary = useStreakSummary(userId, zone, dayKey(today));
  const spokenDays = useSpokenDays(userId, zone, dayKey(first), dayKey(last));
  const { refetch: refetchSummary } = summary;
  const { refetch: refetchDays } = spokenDays;
  const refetch = useCallback(
    () => Promise.all([refetchSummary(), refetchDays()]),
    [refetchDays, refetchSummary]
  );
  const { isRetrying, retry } = useVisibleRetry(refetch);

  return (
    <StreakScreen
      isLoading={(summary.isPending || spokenDays.isPending) && !isRetrying}
      isRetrying={isRetrying}
      month={month}
      onRetry={retry}
      onShowMonth={setMonth}
      spokenDays={spokenDays.data}
      summary={summary.data}
      today={today}
    />
  );
}
