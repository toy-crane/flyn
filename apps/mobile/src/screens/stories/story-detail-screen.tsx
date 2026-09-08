import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import type { StoryDetail, StoryEpisode } from "@/features/story/api/story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryUnavailable } from "@/features/story/ui/story-status";
import { Button } from "@/shared/ui/button";

/** [모바일 하단 CTA](docs/decisions/mobile-bottom-cta.md)가 정한 여백. */
const BOTTOM_PADDING = 12;

/**
 * 상세의 에피소드 한 줄.
 *
 * 모든 화가 같은 모양이다. 진행 상태, 잠금 표시와 결과 문구는 여기 없고 누를 수도
 * 없다. 상세는 콘텐츠 소개이므로 어느 회차로 보든 같은 목록이어야 한다.
 */
function EpisodeRow({
  episode,
  hasBorder,
}: {
  episode: StoryEpisode;
  hasBorder: boolean;
}) {
  return (
    <View
      className={`flex-row gap-3 py-3.5 ${
        hasBorder ? "border-border border-b" : ""
      }`.trim()}
      testID={`story-episode-${episode.number}`}
    >
      <Text className="w-9 font-bold text-muted text-sm leading-6">
        {storyLabels.episodeNumber(episode.number)}
      </Text>
      <View className="flex-1 gap-0.5">
        <Text className="text-base text-foreground leading-6">
          {episode.title}
        </Text>
        <Text className="text-muted text-sm leading-5">
          {episode.situation}
        </Text>
      </View>
    </View>
  );
}

function StoryDetailBody({ story }: { story: StoryDetail }) {
  return (
    <>
      <View className="gap-2.5 px-1">
        <Text
          accessibilityRole="header"
          className="font-extrabold text-3xl text-foreground leading-9"
        >
          {story.title}
        </Text>
        <Text className="text-base text-muted leading-6">{story.intro}</Text>
        <Text className="text-muted text-sm">
          {storyLabels.episodeCount(story.total)}
        </Text>
      </View>

      <View className="gap-3">
        <Text
          accessibilityRole="header"
          className="px-1 font-bold text-foreground text-sm"
        >
          {storyLabels.episodeList}
        </Text>
        <View className="rounded-2xl bg-surface px-5">
          {story.episodes.map((episode, index) => (
            <EpisodeRow
              episode={episode}
              hasBorder={index !== story.episodes.length - 1}
              key={episode.episodeId}
            />
          ))}
        </View>
      </View>
    </>
  );
}

/**
 * 스토리 하나를 소개하는 자리.
 *
 * 표지와 소개, 모든 화의 제목과 상황 설명이 있다. 회차별 진행과 결과는 여기 없다.
 * 그것은 대화 기록의 몫이고, 우측 상단의 History 버튼이 그리로 간다.
 *
 * 하단에는 기록 유무와 상관없이 `대화 시작하기` 하나만 고정한다. 이어갈 회차를
 * 상세가 대신 고르면 미완료 회차가 여럿일 때 어느 대화를 여는지 모호해진다.
 */
export function StoryDetailScreen({
  isLoading,
  isRetrying,
  isStarting,
  onRetry,
  onStart,
  story,
}: {
  isLoading: boolean;
  isRetrying: boolean;
  isStarting: boolean;
  onRetry: () => void;
  onStart: () => void;
  story: StoryDetail | undefined;
}) {
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, BOTTOM_PADDING);

  return (
    <View className="flex-1 bg-background">
      <ScrollView
        className="flex-1"
        contentContainerClassName="gap-6 px-5 pt-5"
        // 마지막 화가 하단 CTA 뒤로 숨지 않도록 그만큼의 자리를 남긴다.
        contentContainerStyle={{ paddingBottom: bottom + 76 }}
        contentInsetAdjustmentBehavior="automatic"
        testID="story-detail-scroll"
      >
        {story ? <StoryDetailBody story={story} /> : null}
        {story || isLoading ? null : (
          <StoryUnavailable
            isRetrying={isRetrying}
            onRetry={onRetry}
            testID="story-detail-unavailable"
          />
        )}
      </ScrollView>

      {story ? (
        <View className="px-6 pt-3" style={{ paddingBottom: bottom }}>
          <Button
            accessibilityLabel={storyLabels.start}
            isPending={isStarting}
            onPress={onStart}
            testID="story-start"
          >
            {storyLabels.start}
          </Button>
        </View>
      ) : null}
    </View>
  );
}
