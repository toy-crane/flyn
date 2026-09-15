import { Typography } from "heroui-native/text";

import { streakLabels } from "./streak-labels";

/**
 * `12일 연속` 한 줄.
 *
 * 세는 규칙, 최장 기록, 범례를 붙이지 않는다. 앱은 기록을 비춰 주기만 한다.
 */
export function StreakLine({ days }: { days: number }) {
  return (
    <Typography.Heading testID="streak-line" type="h2">
      {streakLabels.days(days)}
    </Typography.Heading>
  );
}
