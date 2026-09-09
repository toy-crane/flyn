import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";

import type { StoryCard } from "@/features/story/api/story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryRow } from "@/features/story/ui/story-row";
import { StoryUnavailable } from "@/features/story/ui/story-status";

function BrowseRow({
  hasBorder,
  onOpenStory,
  story,
}: {
  hasBorder: boolean;
  onOpenStory: (storyId: string) => void;
  story: StoryCard;
}) {
  const open = useCallback(() => {
    onOpenStory(story.storyId);
  }, [onOpenStory, story.storyId]);

  return (
    <StoryRow
      coverBlurhash={story.coverBlurhash}
      coverImagePath={story.coverImagePath}
      hasBorder={hasBorder}
      hook={story.hook}
      onPress={open}
      testID={`browse-row-${story.storyId}`}
      title={story.title}
    />
  );
}

/**
 * 플레이할 스토리를 찾는 자리.
 *
 * 모든 공식 스토리가 콘텐츠가 정한 순서로 선다. 어느 스토리를 얼마나 진행했는지는
 * 여기에 없다. 그 이야기가 무엇인지만 보고 고르는 곳이다.
 */
export function BrowseScreen({
  isLoading,
  isRetrying,
  onOpenStory,
  onRetry,
  stories,
}: {
  isLoading: boolean;
  isRetrying: boolean;
  onOpenStory: (storyId: string) => void;
  onRetry: () => void;
  stories: StoryCard[] | undefined;
}) {
  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-3 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="browse-scroll"
    >
      {stories ? (
        <>
          <Text
            accessibilityRole="header"
            className="px-1 font-bold text-foreground text-sm"
          >
            {storyLabels.allStories}
          </Text>
          <View className="rounded-2xl bg-surface px-4">
            {stories.map((story, index) => (
              <BrowseRow
                hasBorder={index !== stories.length - 1}
                key={story.storyId}
                onOpenStory={onOpenStory}
                story={story}
              />
            ))}
          </View>
        </>
      ) : null}
      {stories || isLoading ? null : (
        <StoryUnavailable
          isRetrying={isRetrying}
          onRetry={onRetry}
          testID="browse-unavailable"
        />
      )}
    </ScrollView>
  );
}
