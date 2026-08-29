import { Spinner } from "heroui-native/spinner";
import { useCallback, useEffect, useState } from "react";
import { Text, View } from "react-native";

import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import type { EpisodeNextUp } from "@/features/episode/state/episode-next-up";
import { Button } from "@/shared/ui/button";
import { EpisodeEndingMark } from "./episode-ending-mark";
import { episodeLabels } from "./episode-labels";

const SAVE_PROGRESS_DELAY_MS = 1000;

/** 짧은 보정 저장에는 깜빡이지 않고, 오래 걸릴 때만 마무리 안에서 알린다. */
function EpisodeSavingProgress() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, SAVE_PROGRESS_DELAY_MS);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <View
      accessibilityLabel={episodeLabels.saving}
      accessibilityRole="progressbar"
      accessibilityState={{ busy: true }}
      accessible
      className="flex-row items-center gap-2"
      testID="episode-closing-saving"
    >
      <Spinner
        accessibilityElementsHidden
        accessibilityRole={undefined}
        accessibilityState={undefined}
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        size="sm"
      />
      <Text className="text-muted text-sm">{episodeLabels.saving}</Text>
    </View>
  );
}

/**
 * 끝난 에피소드가 남기는 것: 사건의 결과, 다음 이야기, 그리고 갈 수 있는 곳.
 *
 * 입력창이 있던 자리에 그대로 들어선다. 사건이 끝났으므로 더 쓸 말이 없고,
 * 자리를 대신하는 것이 입력이 닫혔다는 가장 분명한 표시다. 장면은 위에 그대로
 * 남아 있어 결말이 어디서 나왔는지 다시 읽을 수 있다.
 *
 * 성공·타협·실패는 쓰지 않는다. 남는 결론은 몇 개를 틀렸느냐가 아니라 그
 * 자리에서 무엇을 얻어냈느냐이고, 결말 낱말은 점수판처럼 읽힌다.
 *
 * 다시 하기는 없다. 한 번 난 결말은 그 스토리의 사실로 남고, 실패도 다음 화의
 * 이야기가 된다. 마지막 화 뒤에는 예고 대신 완주 안내가 같은 자리에 오고
 * 갈 곳도 홈 하나뿐이다.
 *
 * 다시 열어 읽는 기록에는 이 카드 대신 끝 표시만 남는다. 그 자리에서 할 수
 * 있는 일이 없으므로 버튼도 안내 문구도 두지 않는다.
 */
export function EpisodeClosing({
  ending,
  isSettling = false,
  isStartingNext = false,
  nextUp,
  onLeave,
  onStartNext,
  readOnly = false,
}: {
  ending: EpisodeEnding;
  isSettling?: boolean;
  isStartingNext?: boolean;
  nextUp: EpisodeNextUp | undefined;
  onLeave: () => void;
  onStartNext: (episodeId: string) => void;
  readOnly?: boolean;
}) {
  const nextEpisodeId = nextUp?.episodeId ?? undefined;
  const nextEpisodeNumber = nextUp?.number ?? undefined;
  const startNext = useCallback(() => {
    if (!(isSettling || isStartingNext) && nextEpisodeId !== undefined) {
      onStartNext(nextEpisodeId);
    }
  }, [isSettling, isStartingNext, nextEpisodeId, onStartNext]);
  const isActionPending = isSettling || isStartingNext;

  if (readOnly) {
    return <EpisodeEndingMark outcome={ending.outcome} />;
  }

  return (
    <View
      accessibilityLiveRegion="polite"
      className="gap-3 rounded-2xl bg-surface px-5 py-4"
      testID="episode-closing"
    >
      <Text
        accessibilityRole="header"
        className="font-bold text-foreground text-lg leading-7"
        testID="episode-closing-outcome"
      >
        {ending.outcome}
      </Text>

      {nextUp ? (
        <View className="gap-1 pt-1" testID="episode-closing-next">
          {nextEpisodeNumber === undefined ? null : (
            <Text className="font-semibold text-accent text-sm">
              {episodeLabels.nextEyebrow}
            </Text>
          )}
          <Text className="font-bold text-base text-foreground leading-6">
            {nextEpisodeNumber === undefined
              ? nextUp.title
              : episodeLabels.title(nextEpisodeNumber, nextUp.title)}
          </Text>
          <Text className="text-base text-muted leading-6">{nextUp.copy}</Text>
        </View>
      ) : null}

      {isSettling ? <EpisodeSavingProgress /> : null}

      <View className="flex-row gap-2">
        <Button
          accessibilityLabel={episodeLabels.leave}
          className="flex-1"
          isDisabled={isActionPending}
          onPress={onLeave}
          variant={nextEpisodeId === undefined ? "primary" : "tertiary"}
        >
          {episodeLabels.leave}
        </Button>
        {nextEpisodeId === undefined ||
        nextEpisodeNumber === undefined ? null : (
          <Button
            accessibilityLabel={episodeLabels.start(nextEpisodeNumber)}
            className="flex-1"
            isDisabled={isSettling}
            isPending={isStartingNext}
            onPress={startNext}
          >
            {episodeLabels.start(nextEpisodeNumber)}
          </Button>
        )}
      </View>
    </View>
  );
}
