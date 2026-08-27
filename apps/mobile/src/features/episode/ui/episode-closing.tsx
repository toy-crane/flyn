import { Text, View } from "react-native";

import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import { Button } from "@/shared/ui/button";
import { episodeLabels } from "./episode-labels";

/**
 * 끝난 에피소드가 남기는 것: 결말과 여기서 갈 수 있는 두 곳.
 *
 * 입력창이 있던 자리에 그대로 들어선다. 사건이 끝났으므로 더 쓸 말이 없고,
 * 자리를 대신하는 것이 입력이 닫혔다는 가장 분명한 표시다. 장면은 위에 그대로
 * 남아 있어 결말이 어디서 나왔는지 다시 읽을 수 있다.
 */
export function EpisodeClosing({
  ending,
  onLeave,
  onRestart,
}: {
  ending: EpisodeEnding;
  onLeave: () => void;
  onRestart: () => void;
}) {
  return (
    <View
      accessibilityLiveRegion="polite"
      className="gap-3 rounded-2xl bg-surface px-5 py-4"
      testID="episode-closing"
    >
      <Text
        accessibilityRole="header"
        className="font-bold text-foreground text-xl"
        testID="episode-closing-kind"
      >
        {ending.kind}
      </Text>
      <Text
        className="text-base text-muted leading-6"
        testID="episode-closing-outcome"
      >
        {ending.outcome}
      </Text>
      <View className="flex-row gap-2">
        <Button
          accessibilityLabel={episodeLabels.leave}
          className="flex-1"
          onPress={onLeave}
          variant="tertiary"
        >
          {episodeLabels.leave}
        </Button>
        <Button
          accessibilityLabel={episodeLabels.restart}
          className="flex-1"
          onPress={onRestart}
        >
          {episodeLabels.restart}
        </Button>
      </View>
    </View>
  );
}
