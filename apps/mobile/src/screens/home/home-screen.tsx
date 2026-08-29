import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";

import { episodeLabels } from "@/features/episode/ui/episode-labels";
import type { ContinueCard, Home } from "@/features/story/api/story";
import { StoryCard } from "@/features/story/ui/story-card";
import { storyLabels } from "@/features/story/ui/story-labels";
import { Button } from "@/shared/ui/button";

function SectionHeading({ children }: { children: string }) {
  return (
    <Text
      accessibilityRole="header"
      className="px-1 font-bold text-foreground text-sm"
    >
      {children}
    </Text>
  );
}

/** 이어 하기 카드. 화면에서 가장 강한 자리라 버튼이 카드 안에 들어온다. */
function ContinueStoryCard({
  card,
  onOpenEpisode,
}: {
  card: ContinueCard;
  onOpenEpisode: (episodeId: string) => void;
}) {
  const open = useCallback(() => {
    onOpenEpisode(card.episodeId);
  }, [card.episodeId, onOpenEpisode]);
  const action = card.resuming
    ? storyLabels.resume
    : episodeLabels.start(card.episodeNumber);

  return (
    <StoryCard
      action={
        <Button accessibilityLabel={action} onPress={open}>
          {action}
        </Button>
      }
      episodeLine={episodeLabels.title(card.episodeNumber, card.episodeTitle)}
      layout="card"
      onPress={open}
      story={card}
      sub={card.resuming ? storyLabels.resumeCopy : card.preview}
      testID="home-continue-card"
    />
  );
}

function OtherStoryRow({
  hasBorder,
  onOpenEpisode,
  story,
}: {
  hasBorder: boolean;
  onOpenEpisode: (episodeId: string) => void;
  story: ContinueCard;
}) {
  const open = useCallback(() => {
    onOpenEpisode(story.episodeId);
  }, [onOpenEpisode, story.episodeId]);

  return (
    <View
      className={`py-3.5 ${hasBorder ? "border-border border-b" : ""}`.trim()}
    >
      <StoryCard
        episodeLine={episodeLabels.title(
          story.episodeNumber,
          story.episodeTitle
        )}
        layout="row"
        onPress={open}
        story={story}
      />
    </View>
  );
}

/** 이어 하기 카드 말고 더 진행 중인 스토리. 최근 것부터 한 줄씩. */
function OtherStories({
  onOpenEpisode,
  stories,
}: {
  onOpenEpisode: (episodeId: string) => void;
  stories: ContinueCard[];
}) {
  return (
    <View className="gap-3" testID="home-other-stories">
      <SectionHeading>{storyLabels.inProgressHeading}</SectionHeading>
      <View className="rounded-2xl bg-surface px-4">
        {stories.map((story, index) => (
          <OtherStoryRow
            hasBorder={index !== stories.length - 1}
            key={story.storyId}
            onOpenEpisode={onOpenEpisode}
            story={story}
          />
        ))}
      </View>
    </View>
  );
}

/** 남은 스토리가 없는 홈. 잇는 자리 대신 되돌아보는 자리로 안내한다. */
function EveryStoryDone({ onOpenStories }: { onOpenStories: () => void }) {
  return (
    <View className="gap-3 rounded-2xl bg-surface px-5 py-6" testID="home-done">
      <Text
        accessibilityRole="header"
        className="font-bold text-foreground text-xl leading-7"
      >
        {storyLabels.allDoneTitle}
      </Text>
      <Text className="text-base text-muted leading-6">
        {storyLabels.allDoneCopy}
      </Text>
      <Button
        accessibilityLabel={storyLabels.allDoneAction}
        onPress={onOpenStories}
      >
        {storyLabels.allDoneAction}
      </Button>
    </View>
  );
}

function HomeUnavailable({
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

/**
 * 진행을 잇는 자리.
 *
 * 카드 하나가 다음에 할 일을 말한다. 고르는 일은 스토리 탭이 맡으므로 여기에
 * 같은 카드를 두 번 두지 않고, 끝낸 화의 목록도 두지 않는다.
 */
export function HomeScreen({
  home,
  isLoading,
  isRetrying,
  onOpenEpisode,
  onOpenStories,
  onRetry,
}: {
  home: Home | undefined;
  isLoading: boolean;
  isRetrying: boolean;
  onOpenEpisode: (episodeId: string) => void;
  onOpenStories: () => void;
  onRetry: () => void;
}) {
  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-6 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="home-scroll"
    >
      {home?.continueCard ? (
        <View className="gap-3">
          <SectionHeading>
            {home.firstTime
              ? storyLabels.firstHeading
              : storyLabels.continueHeading}
          </SectionHeading>
          <ContinueStoryCard
            card={home.continueCard}
            onOpenEpisode={onOpenEpisode}
          />
        </View>
      ) : null}
      {home && home.others.length > 0 ? (
        <OtherStories onOpenEpisode={onOpenEpisode} stories={home.others} />
      ) : null}
      {home && !home.continueCard ? (
        <EveryStoryDone onOpenStories={onOpenStories} />
      ) : null}
      {home || isLoading ? null : (
        <HomeUnavailable isRetrying={isRetrying} onRetry={onRetry} />
      )}
    </ScrollView>
  );
}
