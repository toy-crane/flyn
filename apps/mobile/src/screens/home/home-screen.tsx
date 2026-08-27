import { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type { FinishedEpisode, Story } from "@/features/episode/api/story";
import {
  episodeLabels,
  storyLabels,
} from "@/features/episode/ui/episode-labels";
import { Button } from "@/shared/ui/button";

function FinishedEpisodeItem({
  finished,
  hasBorder,
  onOpenEpisode,
}: {
  finished: FinishedEpisode;
  hasBorder: boolean;
  onOpenEpisode: (episodeId: string) => void;
}) {
  const openEpisode = useCallback(() => {
    onOpenEpisode(finished.episodeId);
  }, [finished.episodeId, onOpenEpisode]);
  const className = `flex-row items-center gap-3 py-3.5 ${
    hasBorder ? "border-border border-b" : ""
  }`;
  const content = (
    <>
      <Text className="w-8 font-bold text-muted text-sm">
        {storyLabels.episodeNumber(finished.number)}
      </Text>
      <Text className="flex-1 text-base text-foreground leading-6">
        {finished.title}
      </Text>
      <Text className="rounded-full border border-border px-2.5 py-0.5 font-semibold text-muted text-xs">
        {finished.kind}
      </Text>
    </>
  );

  return finished.hasTranscript ? (
    <Pressable
      accessibilityLabel={episodeLabels.review(
        finished.number,
        finished.title,
        finished.kind
      )}
      accessibilityRole="button"
      className={className}
      onPress={openEpisode}
    >
      {content}
    </Pressable>
  ) : (
    <View className={className}>{content}</View>
  );
}

/** 끝낸 에피소드와 각 결말. 대화가 남은 줄만 다시 열 수 있다. */
function StoryRecord({
  episodes,
  heading,
  onOpenEpisode,
  progress,
  total,
}: {
  episodes: FinishedEpisode[];
  heading: string;
  onOpenEpisode: (episodeId: string) => void;
  progress: string;
  /** 에피소드가 남아 있을 때만 진행 점을 보여 준다. */
  total: number | undefined;
}) {
  return (
    <View className="gap-3" testID="home-story-record">
      <View className="flex-row items-baseline justify-between px-1">
        <Text accessibilityRole="header" className="font-bold text-foreground">
          {heading}
        </Text>
        <Text className="text-muted text-sm">{progress}</Text>
      </View>
      {total === undefined ? null : (
        <StoryProgress finished={episodes.length} total={total} />
      )}
      <View className="rounded-2xl bg-surface px-5">
        {episodes.map((finished, index) => (
          <FinishedEpisodeItem
            finished={finished}
            hasBorder={index !== episodes.length - 1}
            key={finished.episodeId}
            onOpenEpisode={onOpenEpisode}
          />
        ))}
      </View>
    </View>
  );
}

/** 전체 에피소드 중 끝낸 만큼이 채워지는 진행 표시. */
function StoryProgress({
  finished,
  total,
}: {
  finished: number;
  total: number;
}) {
  return (
    <View className="flex-row gap-1.5 px-1" testID="home-story-progress">
      {Array.from({ length: total }, (_, index) => index + 1).map((episode) => (
        <View
          className={`size-2 rounded-full ${
            episode <= finished ? "bg-accent" : "bg-border"
          }`}
          key={episode}
        />
      ))}
    </View>
  );
}

export function HomeScreen({
  isLoading,
  isRetrying,
  onOpenEpisode,
  onRetry,
  story,
}: {
  isLoading: boolean;
  isRetrying: boolean;
  onOpenEpisode: (episodeId: string) => void;
  onRetry: () => void;
  story: Story | undefined;
}) {
  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-6 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="home-scroll"
    >
      {story ? <StoryBody onOpenEpisode={onOpenEpisode} story={story} /> : null}
      {story || isLoading ? null : (
        <StoryUnavailable isRetrying={isRetrying} onRetry={onRetry} />
      )}
    </ScrollView>
  );
}

function StoryUnavailable({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <View
      className="gap-3 rounded-2xl bg-surface px-5 py-6"
      testID="home-empty"
    >
      <Text className="text-base text-muted leading-6">
        {episodeLabels.unavailable}
      </Text>
      <Button
        accessibilityLabel={episodeLabels.retry}
        isPending={isRetrying}
        onPress={onRetry}
      >
        {episodeLabels.retry}
      </Button>
    </View>
  );
}

function StoryBody({
  onOpenEpisode,
  story,
}: {
  onOpenEpisode: (episodeId: string) => void;
  story: Story;
}) {
  const { completion, finished, next, title, total } = story;
  const hasFinished = finished.length > 0;
  const nextEpisodeId = next?.episodeId;
  const openNextEpisode = useCallback(() => {
    if (nextEpisodeId) {
      onOpenEpisode(nextEpisodeId);
    }
  }, [nextEpisodeId, onOpenEpisode]);

  return (
    <>
      {next ? (
        <View
          className="gap-3 rounded-2xl bg-surface px-5 py-6"
          testID="home-next-episode"
        >
          <Text className="font-semibold text-accent text-sm">
            {hasFinished
              ? episodeLabels.nextEyebrow
              : episodeLabels.firstEyebrow}
          </Text>
          <Text
            accessibilityRole="header"
            className="font-bold text-foreground text-xl leading-7"
          >
            {episodeLabels.title(next.number, next.title)}
          </Text>
          <Text className="text-base text-muted leading-6">{next.preview}</Text>
          <Button
            accessibilityLabel={episodeLabels.start(next.number)}
            onPress={openNextEpisode}
          >
            {episodeLabels.start(next.number)}
          </Button>
        </View>
      ) : (
        <View
          className="gap-3 rounded-2xl bg-surface px-5 py-6"
          testID="home-story-done"
        >
          <Text className="font-semibold text-accent text-sm">{title}</Text>
          <Text
            accessibilityRole="header"
            className="font-bold text-foreground text-xl leading-7"
          >
            {completion.title}
          </Text>
          <Text className="text-base text-muted leading-6">
            {completion.copy}
          </Text>
        </View>
      )}

      {hasFinished ? (
        <StoryRecord
          episodes={finished}
          heading={title}
          onOpenEpisode={onOpenEpisode}
          progress={
            next
              ? storyLabels.progress(finished.length, total)
              : storyLabels.wholeStory(total)
          }
          total={next ? total : undefined}
        />
      ) : null}
    </>
  );
}
