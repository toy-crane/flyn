import { useCallback } from "react";
import { ScrollView, Text, View } from "react-native";

import type { StoryCard as StoryCardData } from "@/features/story/api/story";
import { StoryCard } from "@/features/story/ui/story-card";
import { storyLabels } from "@/features/story/ui/story-labels";
import { Button } from "@/shared/ui/button";

function StoryRow({
  hasBorder,
  onOpenStory,
  story,
}: {
  hasBorder: boolean;
  onOpenStory: (storyId: string) => void;
  story: StoryCardData;
}) {
  const open = useCallback(() => {
    onOpenStory(story.storyId);
  }, [onOpenStory, story.storyId]);

  return (
    <View
      className={`py-3.5 ${hasBorder ? "border-border border-b" : ""}`.trim()}
    >
      <StoryCard
        layout="row"
        onPress={open}
        story={story}
        sub={story.hook}
        testID={`story-row-${story.storyId}`}
      />
    </View>
  );
}

function StoriesUnavailable({
  isRetrying,
  onRetry,
}: {
  isRetrying: boolean;
  onRetry: () => void;
}) {
  return (
    <View
      className="gap-3 rounded-2xl bg-surface px-5 py-6"
      testID="stories-empty"
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
 * 고르고 되돌아보는 자리.
 *
 * 모든 공식 스토리가 콘텐츠가 정한 순서로 선다. 이어 하기 카드는 여기에 두지
 * 않는다. 잇는 일은 홈의 몫이라 같은 카드를 두 탭에 겹쳐 두지 않는다.
 */
export function StoriesScreen({
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
  stories: StoryCardData[] | undefined;
}) {
  return (
    <ScrollView
      className="bg-background"
      contentContainerClassName="gap-3 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="stories-scroll"
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
              <StoryRow
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
        <StoriesUnavailable isRetrying={isRetrying} onRetry={onRetry} />
      )}
    </ScrollView>
  );
}
