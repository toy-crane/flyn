import { Button, Separator, Typography } from "heroui-native";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { EpisodeEndReason } from "../../lib/episodes";

/** safe area가 없는 기기에서도 바닥 action이 화면 끝에 붙지 않게 두는 최소 여백. */
const MIN_BOTTOM_INSET = 20;

/**
 * 끝난 이유 한 줄. 턴 상한은 **에피소드가 든 값**을 그대로 읽는다 — 코드 상수를
 * 읽으면 상수를 바꾼 뒤 이미 끝난 대화가 다른 숫자를 말한다.
 */
export function endingNote(reason: EpisodeEndReason, turnLimit: number) {
  return reason === "goals_met"
    ? "목표를 모두 달성해서 대화가 끝났어요"
    : `${turnLimit}턴을 다 써서 대화가 끝났어요`;
}

/**
 * 대화가 끝난 자리. composer가 있던 곳에 끝난 이유와 `결과 보기`가 대신 서고,
 * 위의 대화는 그대로 남는다.
 */
export function EpisodeEndAction({
  onOpenResult,
  reason,
  turnLimit,
}: {
  onOpenResult: () => void;
  reason: EpisodeEndReason;
  turnLimit: number;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background" testID="episode-end-action">
      <Separator />
      <View
        className="px-4 pt-2"
        // safe area는 런타임 값이라 토큰으로 접을 수 없는 자리다.
        style={{ paddingBottom: Math.max(insets.bottom, MIN_BOTTOM_INSET) }}
      >
        <Typography
          align="center"
          className="pt-3 pb-1"
          color="muted"
          testID="episode-end-note"
          type="body-xs"
        >
          {endingNote(reason, turnLimit)}
        </Typography>
        <Button className="w-full" onPress={onOpenResult} size="lg">
          <Button.Label>결과 보기</Button.Label>
        </Button>
      </View>
    </View>
  );
}
