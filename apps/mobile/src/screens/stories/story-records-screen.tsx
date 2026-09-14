import { Card } from "heroui-native/card";
import { ListGroup } from "heroui-native/list-group";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { Fragment, useCallback } from "react";
import { ScrollView, View } from "react-native";

import type {
  StoryPlay,
  StoryPlayEpisode,
  StoryPlays,
} from "@/features/story/api/story";
import { StoryCover } from "@/features/story/ui/story-cover";
import { storyLabels } from "@/features/story/ui/story-labels";
import { formatStoryPlayStart } from "@/features/story/ui/story-play-time";
import { StoryProgress } from "@/features/story/ui/story-progress";
import { Button } from "@/shared/ui/button";
import { ExpandableCard } from "@/shared/ui/expandable-card";
import { PressableListRow, StaticListRow } from "@/shared/ui/list-row";
import { ScreenEmpty, ScreenUnavailable } from "@/shared/ui/screen-status";
import { useScreenContentHeight } from "@/shared/ui/use-screen-content-height";

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
      <ListGroup.ItemPrefix>
        <Typography.Paragraph
          className="w-9"
          color="muted"
          type="body-sm"
          weight="semibold"
        >
          {storyLabels.episodeNumber(episode.number)}
        </Typography.Paragraph>
      </ListGroup.ItemPrefix>
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{episode.title}</ListGroup.ItemTitle>
        <ListGroup.ItemDescription>{episode.outcome}</ListGroup.ItemDescription>
      </ListGroup.ItemContent>
    </>
  );

  // 결말만 남고 대화가 없는 화는 열어도 볼 것이 없다. 결과 한 줄은 남기고 여는
  // 것만 막는다.
  if (!episode.hasTranscript) {
    return <StaticListRow>{body}</StaticListRow>;
  }

  return (
    <PressableListRow
      accessibilityLabel={storyLabels.reviewEpisode(
        episode.number,
        episode.title,
        episode.outcome
      )}
      onPress={open}
      testID={`story-play-episode-${episode.number}`}
    >
      {body}
      <ListGroup.ItemSuffix />
    </PressableListRow>
  );
}

/** 카드 제목 줄: 시작한 날짜와 시간, 진행 바, 현재 위치. */
function StoryPlaySummary({
  next,
  progress,
  startedAt,
  storyPlay,
  total,
}: {
  next: StoryPlay["next"];
  progress: string;
  startedAt: string;
  storyPlay: StoryPlay;
  total: number;
}) {
  return (
    <View className="gap-2">
      <Typography.Heading type="h6">{startedAt}</Typography.Heading>
      <StoryProgress
        current={next?.number}
        finished={storyPlay.finished}
        total={total}
      />
      <Typography.Paragraph color="muted" type="body-sm">
        {progress}
      </Typography.Paragraph>
    </View>
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
  const startedAt = formatStoryPlayStart(storyPlay.startedAt);
  const { next, storyPlayId } = storyPlay;
  const resume = useCallback(() => {
    if (next) {
      onResume(storyPlayId, next.episodeId);
    }
  }, [next, onResume, storyPlayId]);
  const progress = storyLabels.runProgress(storyPlay.finished, total, next);
  const summary = (
    <StoryPlaySummary
      next={next}
      progress={progress}
      startedAt={startedAt}
      storyPlay={storyPlay}
      total={total}
    />
  );
  const resumeButton = next ? (
    <Button
      accessibilityLabel={storyLabels.resumeRun(startedAt)}
      onPress={resume}
      testID={`story-play-resume-${storyPlayId}`}
      variant="outline"
    >
      {storyLabels.resume}
    </Button>
  ) : null;

  // 끝낸 화가 없으면 펼칠 것이 없다. 사용자 메시지만 보낸 첫 화의 회차가
  // 그렇다. 펼치지 않는 카드로 두고 이어서 하기만 붙인다.
  if (storyPlay.episodes.length === 0) {
    return (
      <Card className="gap-3" testID={`story-play-card-${storyPlayId}`}>
        {summary}
        {resumeButton}
      </Card>
    );
  }

  return (
    <ExpandableCard
      accessibilityLabel={storyLabels.runCard(startedAt, progress, false)}
      expandedAccessibilityLabel={storyLabels.runCard(
        startedAt,
        progress,
        true
      )}
      footer={
        resumeButton === null ? null : (
          <View className="px-5 pb-4">{resumeButton}</View>
        )
      }
      summary={summary}
      testID={`story-play-card-${storyPlayId}`}
      triggerTestID={`story-play-toggle-${storyPlayId}`}
    >
      <Separator className="mx-4" />
      <ListGroup
        testID={`story-play-episodes-${storyPlayId}`}
        variant="transparent"
      >
        {storyPlay.episodes.map((episode, index) => (
          <Fragment key={episode.episodeId}>
            {index === 0 ? null : <Separator className="mx-4" />}
            <StoryPlayEpisodeRow
              episode={episode}
              onOpenEpisode={onOpenEpisode}
              storyPlayId={storyPlayId}
            />
          </Fragment>
        ))}
      </ListGroup>
    </ExpandableCard>
  );
}

function StoryHeader({ storyPlays }: { storyPlays: StoryPlays }) {
  return (
    <View className="flex-row items-center gap-3.5 px-1">
      <StoryCover
        blurhash={storyPlays.coverBlurhash}
        imagePath={storyPlays.coverImagePath}
      />
      <View className="flex-1 gap-1">
        <Typography.Heading type="h5">{storyPlays.title}</Typography.Heading>
        <Typography.Paragraph color="muted" type="body-sm">
          {storyPlays.intro}
        </Typography.Paragraph>
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
  const contentHeight = useScreenContentHeight();

  return (
    <ScrollView
      {...contentHeight}
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="story-records-scroll"
    >
      {storyPlays ? (
        <>
          <View className="pb-6">
            <StoryHeader storyPlays={storyPlays} />
          </View>
          <Separator testID="story-records-divider" />
          <View className="grow pt-6">
            <Typography.Paragraph
              accessibilityRole="header"
              className="mb-3 px-1"
              color="muted"
              type="body-sm"
              weight="medium"
            >
              {storyLabels.recentHeading}
            </Typography.Paragraph>
            {hasStoryPlays ? (
              <View className="gap-4">
                {storyPlays.plays.map((storyPlay) => (
                  <StoryPlayCard
                    key={storyPlay.storyPlayId}
                    onOpenEpisode={onOpenEpisode}
                    onResume={onResume}
                    storyPlay={storyPlay}
                    total={storyPlays.total}
                  />
                ))}
              </View>
            ) : (
              <ScreenEmpty
                testID="story-records-empty"
                title={storyLabels.recordsEmptyTitle}
              />
            )}
          </View>
        </>
      ) : null}
      {storyPlays || isLoading ? null : (
        <ScreenUnavailable
          isRetrying={isRetrying}
          onRetry={onRetry}
          testID="story-records-unavailable"
          title={storyLabels.unavailable}
        />
      )}
    </ScrollView>
  );
}
