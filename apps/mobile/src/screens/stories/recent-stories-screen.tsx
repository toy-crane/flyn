import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";

import type { RecentStory } from "@/features/story/api/story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryRow } from "@/features/story/ui/story-row";
import { StoryEmpty, StoryUnavailable } from "@/features/story/ui/story-status";
import { useStoryContentHeight } from "@/features/story/ui/use-story-content-height";
import { Button } from "@/shared/ui/button";

function RecentRow({
  hasBorder,
  onOpenRecords,
  story,
}: {
  hasBorder: boolean;
  onOpenRecords: (storyId: string) => void;
  story: RecentStory;
}) {
  const open = useCallback(() => {
    onOpenRecords(story.storyId);
  }, [onOpenRecords, story.storyId]);

  return (
    <StoryRow
      coverBlurhash={story.coverBlurhash}
      coverImagePath={story.coverImagePath}
      hasBorder={hasBorder}
      hook={story.hook}
      onPress={open}
      testID={`recent-row-${story.storyId}`}
      title={story.title}
    />
  );
}

/**
 * 대화한 스토리로 돌아가는 자리.
 *
 * 스토리마다 한 줄이고, 누르면 그 스토리의 대화 기록이 열린다. 어느 회차를
 * 이어갈지는 거기서 사용자가 고른다. 미완료 회차가 여럿일 수 있어 이 목록이
 * 하나를 대표로 고르지 않는다.
 *
 * 순서는 스토리마다 마지막으로 말한 시각이 정한다. 기록을 열어 보거나 첫 장면만
 * 열어 보는 것으로는 바뀌지 않는다.
 */
export function RecentStoriesScreen({
  isLoading,
  isRetrying,
  onBrowse,
  onOpenRecords,
  onRetry,
  stories,
}: {
  isLoading: boolean;
  isRetrying: boolean;
  onBrowse: () => void;
  onOpenRecords: (storyId: string) => void;
  onRetry: () => void;
  stories: RecentStory[] | undefined;
}) {
  const hasStories = stories !== undefined && stories.length > 0;
  const contentHeight = useStoryContentHeight();

  return (
    <ScrollView
      {...contentHeight}
      className="flex-1 bg-background"
      contentContainerClassName="gap-3 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="recent-scroll"
    >
      {hasStories ? (
        <>
          <Text
            accessibilityRole="header"
            className="px-1 font-bold text-foreground text-sm"
          >
            {storyLabels.recentHeading}
          </Text>
          <View className="rounded-2xl bg-surface px-4">
            {stories.map((story, index) => (
              <RecentRow
                hasBorder={index !== stories.length - 1}
                key={story.storyId}
                onOpenRecords={onOpenRecords}
                story={story}
              />
            ))}
          </View>
        </>
      ) : null}
      {stories && !hasStories ? (
        <StoryEmpty
          action={
            <Button
              accessibilityLabel={storyLabels.recentEmptyAction}
              onPress={onBrowse}
              variant="primary"
            >
              {storyLabels.recentEmptyAction}
            </Button>
          }
          testID="recent-empty"
          title={storyLabels.recentEmptyTitle}
        />
      ) : null}
      {stories || isLoading ? null : (
        <StoryUnavailable
          isRetrying={isRetrying}
          onRetry={onRetry}
          testID="recent-unavailable"
        />
      )}
    </ScrollView>
  );
}
