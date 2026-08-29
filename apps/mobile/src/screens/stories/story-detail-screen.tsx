import { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { episodeLabels } from "@/features/episode/ui/episode-labels";
import type { StoryDetail, StoryEpisode } from "@/features/story/api/story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryProgress } from "@/features/story/ui/story-progress";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

function EpisodeRowBody({ episode }: { episode: StoryEpisode }) {
  const isNext = episode.state === "next";
  const isLocked = episode.state === "locked";
  const detail = episode.outcome ?? episode.preview;

  return (
    <>
      <Text
        className={`w-9 font-bold text-sm ${
          isNext ? "text-accent" : "text-muted"
        } ${isLocked ? "opacity-55" : ""}`.trim()}
      >
        {storyLabels.episodeNumber(episode.number)}
      </Text>
      <View className="flex-1 gap-0.5">
        <Text
          className={`text-base text-foreground leading-6 ${
            isNext ? "font-semibold" : ""
          } ${isLocked ? "text-muted opacity-55" : ""}`.trim()}
        >
          {episode.title}
        </Text>
        {detail ? (
          <Text className="text-muted text-sm leading-5">{detail}</Text>
        ) : null}
      </View>
      {isLocked ? (
        <Icon name="locked" size="sm" tone="muted" />
      ) : (
        <Icon name="forward" size="md" tone="muted" />
      )}
    </>
  );
}

/**
 * 상세의 에피소드 한 줄.
 *
 * 끝낸 화는 그 화에서 얻어낸 결과를 달고 대화 기록으로 열린다. 다음 화는
 * 예고를 보여 주고 그 화를 시작한다. 아직 열리지 않은 화는 제목만 남기고
 * 누를 수 없다.
 */
function EpisodeRow({
  episode,
  hasBorder,
  onOpenEpisode,
}: {
  episode: StoryEpisode;
  hasBorder: boolean;
  onOpenEpisode: (episodeId: string) => void;
}) {
  const open = useCallback(() => {
    onOpenEpisode(episode.episodeId);
  }, [episode.episodeId, onOpenEpisode]);
  const className = `flex-row items-center gap-3 py-3.5 ${
    hasBorder ? "border-border border-b" : ""
  }`.trim();
  const canOpen =
    episode.state === "next" ||
    (episode.state === "finished" && episode.hasTranscript);

  if (!canOpen) {
    return (
      <View
        accessibilityLabel={
          episode.state === "locked"
            ? storyLabels.lockedEpisode(episode.number, episode.title)
            : undefined
        }
        className={className}
      >
        <EpisodeRowBody episode={episode} />
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={
        episode.state === "next"
          ? storyLabels.nextEpisode(episode.number, episode.title)
          : episodeLabels.review(episode.number, episode.title)
      }
      accessibilityRole="button"
      className={className}
      onPress={open}
      testID={`story-episode-${episode.number}`}
    >
      <EpisodeRowBody episode={episode} />
    </Pressable>
  );
}

function StoryDetailUnavailable({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <View
      className="gap-3 rounded-2xl bg-surface px-5 py-6"
      testID="story-detail-empty"
    >
      <Text className="text-base text-muted leading-6">
        {storyLabels.unavailable}
      </Text>
      <Button
        accessibilityLabel={storyLabels.retry}
        isPending={isRetrying}
        onPress={onRetry}
      >
        {storyLabels.retry}
      </Button>
    </View>
  );
}

function StoryDetailBody({
  onOpenEpisode,
  story,
}: {
  onOpenEpisode: (episodeId: string) => void;
  story: StoryDetail;
}) {
  const { next } = story;
  const nextEpisodeId = next?.episodeId;
  const openNext = useCallback(() => {
    if (nextEpisodeId) {
      onOpenEpisode(nextEpisodeId);
    }
  }, [nextEpisodeId, onOpenEpisode]);
  const action = next?.resuming
    ? storyLabels.resume
    : next && episodeLabels.start(next.number);

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
        {story.finished > 0 ? (
          <View className="pt-1">
            <StoryProgress finished={story.finished} total={story.total} />
          </View>
        ) : (
          <Text className="text-muted text-sm">
            {storyLabels.episodeCount(story.total)}
          </Text>
        )}
      </View>

      {action ? (
        <Button accessibilityLabel={action} onPress={openNext}>
          {action}
        </Button>
      ) : null}

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
              onOpenEpisode={onOpenEpisode}
            />
          ))}
        </View>
      </View>
    </>
  );
}

/**
 * 스토리 하나를 펼쳐 보는 자리.
 *
 * 무엇을 끝냈고 무엇이 남았는지가 한 화면에 있다. 완주한 스토리에는 완주 안내
 * 카드를 두지 않는다. 그 말은 마지막 화를 끝내는 순간의 몫이다.
 */
export function StoryDetailScreen({
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
  story: StoryDetail | undefined;
}) {
  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-6 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="story-detail-scroll"
    >
      {story ? (
        <StoryDetailBody onOpenEpisode={onOpenEpisode} story={story} />
      ) : null}
      {story || isLoading ? null : (
        <StoryDetailUnavailable isRetrying={isRetrying} onRetry={onRetry} />
      )}
    </ScrollView>
  );
}
