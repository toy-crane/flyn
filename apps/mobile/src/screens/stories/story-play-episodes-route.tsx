import { router, useLocalSearchParams } from "expo-router";
import { ListGroup } from "heroui-native/list-group";
import { Separator } from "heroui-native/separator";
import { Typography } from "heroui-native/text";
import { Fragment, useCallback, useEffect } from "react";
import { ScrollView, View } from "react-native";

import { useAuthSession } from "@/features/auth/state/auth-session";
import type { StoryPlay, StoryPlayEpisode } from "@/features/story/api/story";
import { useStoryPlays } from "@/features/story/query/story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { formatStoryPlayStart } from "@/features/story/ui/story-play-time";
import { DelayedLoading } from "@/shared/ui/delayed-loading";
import { Icon } from "@/shared/ui/icon";
import { IconButton } from "@/shared/ui/icon-button";
import { PressableListRow, StaticListRow } from "@/shared/ui/list-row";
import { ScreenUnavailable } from "@/shared/ui/screen-status";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function EpisodeNumber({ number }: { number: number }) {
  return (
    <ListGroup.ItemPrefix>
      <Typography.Paragraph
        className="min-w-9"
        color="muted"
        type="body-sm"
        weight="semibold"
      >
        {storyLabels.episodeNumber(number)}
      </Typography.Paragraph>
    </ListGroup.ItemPrefix>
  );
}

function FinishedEpisodeRow({
  episode,
  onOpen,
}: {
  episode: StoryPlayEpisode;
  onOpen: (episodeId: string) => void;
}) {
  const open = useCallback(
    () => onOpen(episode.episodeId),
    [episode.episodeId, onOpen]
  );
  const body = (
    <>
      <EpisodeNumber number={episode.number} />
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{episode.title}</ListGroup.ItemTitle>
        <ListGroup.ItemDescription>{episode.outcome}</ListGroup.ItemDescription>
      </ListGroup.ItemContent>
    </>
  );

  return episode.hasTranscript ? (
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
  ) : (
    <StaticListRow testID={`story-play-episode-${episode.number}`}>
      {body}
    </StaticListRow>
  );
}

function CurrentEpisodeRow({
  next,
  onOpen,
}: {
  next: NonNullable<StoryPlay["next"]>;
  onOpen: (episodeId: string) => void;
}) {
  const open = useCallback(
    () => onOpen(next.episodeId),
    [next.episodeId, onOpen]
  );
  const action = next.hasTranscript
    ? storyLabels.resume
    : storyLabels.startEpisode;

  return (
    <PressableListRow
      accessibilityLabel={`${next.number}화 ${next.title}, ${action}`}
      className="bg-accent/10"
      onPress={open}
      testID="story-play-current-episode"
    >
      <EpisodeNumber number={next.number} />
      <ListGroup.ItemContent>
        <ListGroup.ItemTitle>{next.title}</ListGroup.ItemTitle>
        <ListGroup.ItemDescription className="font-semibold text-accent">
          {action}
        </ListGroup.ItemDescription>
      </ListGroup.ItemContent>
      <ListGroup.ItemSuffix />
    </PressableListRow>
  );
}

/** 회차의 화 목록은 독립된 네이티브 Sheet로 연다. */
export function StoryPlayEpisodesRoute() {
  const params = useLocalSearchParams<{
    storyId?: string | string[];
    storyPlayId?: string | string[];
  }>();
  const storyId = firstParam(params.storyId);
  const storyPlayId = firstParam(params.storyPlayId);
  const { session } = useAuthSession();
  const plays = useStoryPlays(session?.user.id, session?.access_token, storyId);
  const play = plays.data?.plays.find(
    (item) => item.storyPlayId === storyPlayId
  );
  const openEpisode = useCallback(
    (episodeId: string) => {
      if (!storyPlayId) {
        return;
      }
      router.replace({
        params: { episodeId, storyPlayId },
        pathname: "/episode",
      });
    },
    [storyPlayId]
  );

  useEffect(() => {
    if (plays.data && !play) {
      router.back();
    }
  }, [play, plays.data]);

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="px-5 pt-8 pb-8"
      testID="story-play-episodes-sheet"
    >
      {play && plays.data ? (
        <>
          <View className="mb-5 flex-row items-start gap-3">
            <View className="flex-1 gap-1">
              <Typography.Heading type="h5">
                {plays.data.title}
              </Typography.Heading>
              <Typography.Paragraph color="muted" type="body-sm">
                {formatStoryPlayStart(play.startedAt)}
              </Typography.Paragraph>
            </View>
            <IconButton
              accessibilityLabel="닫기"
              className="rounded-full bg-surface"
              onPress={router.back}
              size="lg"
              testID="story-play-episodes-close"
            >
              <Icon name="close" size="md" tone="muted" />
            </IconButton>
          </View>
          <ListGroup testID="story-play-episodes">
            {play.episodes.map((episode, index) => (
              <Fragment key={episode.episodeId}>
                {index === 0 ? null : <Separator className="mx-4" />}
                <FinishedEpisodeRow episode={episode} onOpen={openEpisode} />
              </Fragment>
            ))}
            {play.next ? (
              <>
                {play.episodes.length > 0 ? (
                  <Separator className="mx-4" />
                ) : null}
                <CurrentEpisodeRow next={play.next} onOpen={openEpisode} />
              </>
            ) : null}
          </ListGroup>
        </>
      ) : null}
      {!play && plays.isPending ? (
        <DelayedLoading testID="story-play-episodes-loading" />
      ) : null}
      {!play && plays.isError ? (
        <ScreenUnavailable
          isRetrying={plays.isFetching}
          onRetry={plays.refetch}
          testID="story-play-episodes-unavailable"
          title={storyLabels.unavailable}
        />
      ) : null}
    </ScrollView>
  );
}
