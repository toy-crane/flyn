import { useCallback, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import type {
  StoryPlay,
  StoryPlayEpisode,
  StoryPlays,
} from "@/features/story/api/story";
import { StoryCover } from "@/features/story/ui/story-cover";
import { storyLabels } from "@/features/story/ui/story-labels";
import { formatStoryPlayStart } from "@/features/story/ui/story-play-time";
import { StoryProgress } from "@/features/story/ui/story-progress";
import { StoryEmpty, StoryUnavailable } from "@/features/story/ui/story-status";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";

/** 펼친 카드 안의 끝낸 화 한 줄. */
function StoryPlayEpisodeRow({
  episode,
  onOpenEpisode,
  storyPlayId,
}: {
  episode: StoryPlayEpisode;
  onOpenEpisode: (storyPlayId: string, episodeId: string) => void;
  storyPlayId: string;
}) {
  const open = useCallback(() => {
    onOpenEpisode(storyPlayId, episode.episodeId);
  }, [episode.episodeId, onOpenEpisode, storyPlayId]);
  const body = (
    <>
      <Text className="w-9 font-bold text-muted text-sm leading-6">
        {storyLabels.episodeNumber(episode.number)}
      </Text>
      <View className="flex-1 gap-0.5">
        <Text className="text-base text-foreground leading-6">
          {episode.title}
        </Text>
        <Text className="text-muted text-sm leading-5">{episode.outcome}</Text>
      </View>
      {episode.hasTranscript ? (
        <Icon name="forward" size="md" tone="muted" />
      ) : null}
    </>
  );

  // 결말만 남고 대화가 없는 화는 열어도 볼 것이 없다. 결과 한 줄은 남기고 여는
  // 것만 막는다.
  if (!episode.hasTranscript) {
    return <View className="flex-row gap-3 py-3">{body}</View>;
  }

  return (
    <Pressable
      accessibilityLabel={storyLabels.reviewEpisode(
        episode.number,
        episode.title
      )}
      accessibilityRole="button"
      className="flex-row gap-3 py-3"
      onPress={open}
      testID={`story-play-episode-${episode.number}`}
    >
      {body}
    </Pressable>
  );
}

/**
 * 회차 카드 하나.
 *
 * 제목은 이 회차를 시작한 날짜와 시간이다. 회차 번호를 붙이지 않고, `현재 플레이`
 * 같은 대표 표시도 두지 않는다. 미완료 회차가 여럿이어도 각각 이어갈 수 있으므로
 * 하나를 앞세울 이유가 없다.
 */
function StoryPlayCard({
  onOpenEpisode,
  onResume,
  storyPlay,
  total,
}: {
  onOpenEpisode: (storyPlayId: string, episodeId: string) => void;
  onResume: (storyPlayId: string, episodeId: string) => void;
  storyPlay: StoryPlay;
  total: number;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const startedAt = formatStoryPlayStart(storyPlay.startedAt);
  const { next } = storyPlay;
  const toggle = useCallback(() => {
    setIsOpen((open) => !open);
  }, []);
  const resume = useCallback(() => {
    if (next) {
      onResume(storyPlay.storyPlayId, next.episodeId);
    }
  }, [next, onResume, storyPlay.storyPlayId]);
  const canExpand = storyPlay.episodes.length > 0 || next !== null;
  const progress = storyLabels.runProgress(storyPlay.finished, total, next);

  return (
    <View
      className="gap-3 rounded-2xl bg-surface p-4"
      testID={`story-play-card-${storyPlay.storyPlayId}`}
    >
      {canExpand ? (
        <Pressable
          accessibilityLabel={storyLabels.runCard(startedAt, progress, isOpen)}
          accessibilityRole="button"
          accessibilityState={{ expanded: isOpen }}
          className="flex-row items-center gap-3"
          onPress={toggle}
          testID={`story-play-toggle-${storyPlay.storyPlayId}`}
        >
          <View className="flex-1 gap-2">
            <Text className="font-bold text-base text-foreground">
              {startedAt}
            </Text>
            <StoryProgress
              current={next?.number}
              finished={storyPlay.finished}
              total={total}
            />
            <Text className="text-muted text-sm leading-5">{progress}</Text>
          </View>
          <Icon name={isOpen ? "collapse" : "expand"} size="md" tone="muted" />
        </Pressable>
      ) : (
        <View className="gap-2">
          <Text className="font-bold text-base text-foreground">
            {startedAt}
          </Text>
          <StoryProgress finished={storyPlay.finished} total={total} />
          <Text className="text-muted text-sm leading-5">{progress}</Text>
        </View>
      )}

      {isOpen && storyPlay.episodes.length > 0 ? (
        <View
          className="border-border border-t pt-1"
          testID={`story-play-episodes-${storyPlay.storyPlayId}`}
        >
          {storyPlay.episodes.map((episode) => (
            <StoryPlayEpisodeRow
              episode={episode}
              key={episode.episodeId}
              onOpenEpisode={onOpenEpisode}
              storyPlayId={storyPlay.storyPlayId}
            />
          ))}
        </View>
      ) : null}

      {isOpen && next ? (
        <Button
          accessibilityLabel={storyLabels.resumeRun(startedAt)}
          onPress={resume}
          testID={`story-play-resume-${storyPlay.storyPlayId}`}
          variant="outline"
        >
          {storyLabels.resume}
        </Button>
      ) : null}
    </View>
  );
}

function StoryHeader({ storyPlays }: { storyPlays: StoryPlays }) {
  return (
    <View className="flex-row items-center gap-3.5 px-1">
      <StoryCover
        emoji={storyPlays.coverEmoji}
        imagePath={storyPlays.coverImagePath}
      />
      <View className="flex-1 gap-1">
        <Text
          accessibilityRole="header"
          className="font-extrabold text-foreground text-xl leading-7"
        >
          {storyPlays.title}
        </Text>
        <Text className="text-muted text-sm leading-5">{storyPlays.intro}</Text>
      </View>
    </View>
  );
}

/**
 * 한 스토리의 회차를 모아 보는 자리.
 *
 * 위에 스토리 소개가 있고 아래에 회차 카드가 시작한 순서의 역순으로 선다. 새
 * 대화는 헤더 오른쪽의 텍스트 버튼이 열고, 하단 CTA는 두지 않는다.
 */
export function StoryRecordsScreen({
  isLoading,
  isRetrying,
  onOpenEpisode,
  onResume,
  onRetry,
  storyPlays,
}: {
  isLoading: boolean;
  isRetrying: boolean;
  onOpenEpisode: (storyPlayId: string, episodeId: string) => void;
  onResume: (storyPlayId: string, episodeId: string) => void;
  onRetry: () => void;
  storyPlays: StoryPlays | undefined;
}) {
  const hasStoryPlays = storyPlays !== undefined && storyPlays.plays.length > 0;

  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-4 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="story-records-scroll"
    >
      {storyPlays ? <StoryHeader storyPlays={storyPlays} /> : null}
      {hasStoryPlays
        ? storyPlays.plays.map((storyPlay) => (
            <StoryPlayCard
              key={storyPlay.storyPlayId}
              onOpenEpisode={onOpenEpisode}
              onResume={onResume}
              storyPlay={storyPlay}
              total={storyPlays.total}
            />
          ))
        : null}
      {storyPlays && !hasStoryPlays ? (
        <StoryEmpty
          testID="story-records-empty"
          title={storyLabels.recordsEmptyTitle}
        />
      ) : null}
      {storyPlays || isLoading ? null : (
        <StoryUnavailable
          isRetrying={isRetrying}
          onRetry={onRetry}
          testID="story-records-unavailable"
        />
      )}
    </ScrollView>
  );
}
