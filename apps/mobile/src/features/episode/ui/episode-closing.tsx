import { Text, View } from "react-native";

import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import type { EpisodeNextUp } from "@/features/episode/state/episode-next-up";
import { Button } from "@/shared/ui/button";
import { episodeLabels } from "./episode-labels";

/**
 * 끝난 에피소드가 남기는 것: 결말, 다음 이야기, 그리고 갈 수 있는 곳.
 *
 * 입력창이 있던 자리에 그대로 들어선다. 사건이 끝났으므로 더 쓸 말이 없고,
 * 자리를 대신하는 것이 입력이 닫혔다는 가장 분명한 표시다. 장면은 위에 그대로
 * 남아 있어 결말이 어디서 나왔는지 다시 읽을 수 있다.
 *
 * 다시 하기는 없다. 한 번 난 결말은 그 시즌의 사실로 남고, 실패도 다음 화의
 * 이야기가 된다. 마지막 화 뒤에는 예고 대신 시즌 완주 안내가 같은 자리에 오고
 * 갈 곳도 홈 하나뿐이다.
 */
export function EpisodeClosing({
  ending,
  nextUp,
  onLeave,
  onStartNext,
}: {
  ending: EpisodeEnding;
  nextUp: EpisodeNextUp | undefined;
  onLeave: () => void;
  onStartNext: () => void;
}) {
  const nextEpisode = nextUp?.episode ?? undefined;

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

      {nextUp ? (
        <View className="gap-1 pt-1" testID="episode-closing-next">
          {nextEpisode === undefined ? null : (
            <Text className="font-semibold text-accent text-sm">
              {episodeLabels.nextEyebrow}
            </Text>
          )}
          <Text className="font-bold text-base text-foreground leading-6">
            {nextEpisode === undefined
              ? nextUp.title
              : episodeLabels.title(nextEpisode, nextUp.title)}
          </Text>
          <Text className="text-base text-muted leading-6">{nextUp.copy}</Text>
        </View>
      ) : null}

      <View className="flex-row gap-2">
        <Button
          accessibilityLabel={episodeLabels.leave}
          className="flex-1"
          onPress={onLeave}
          variant={nextEpisode === undefined ? "primary" : "tertiary"}
        >
          {episodeLabels.leave}
        </Button>
        {nextEpisode === undefined ? null : (
          <Button
            accessibilityLabel={episodeLabels.start(nextEpisode)}
            className="flex-1"
            onPress={onStartNext}
          >
            {episodeLabels.start(nextEpisode)}
          </Button>
        )}
      </View>
    </View>
  );
}
