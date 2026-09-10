import { TagGroup } from "heroui-native/tag-group";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

import type { StoryCard } from "@/features/story/api/story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryRow } from "@/features/story/ui/story-row";
import { Button } from "@/shared/ui/button";
import { ScreenEmpty, ScreenUnavailable } from "@/shared/ui/screen-status";
import { useScreenContentHeight } from "@/shared/ui/use-screen-content-height";

/** 목록을 거르는 칩. 탐색을 다시 열면 언제나 `전체`로 돌아온다. */
const ALL = "all";
const MINE = "mine";

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
 * 내가 만든 스토리가 위에, 공식 스토리가 아래에 선다. 그 순서는 서버가 정하고
 * 여기서는 칩이 고른 것만 걸러 낸다. 어느 스토리를 얼마나 진행했는지는 여기에
 * 없다. 그 이야기가 무엇인지만 보고 고르는 곳이다.
 *
 * 칩은 만든 스토리가 없어도 늘 보인다. 만들 수 있다는 사실을 그 칩이 알려 준다.
 */
export function BrowseScreen({
  isLoading,
  isRetrying,
  onCreateStory,
  onOpenStory,
  onRetry,
  stories,
}: {
  isLoading: boolean;
  isRetrying: boolean;
  onCreateStory: () => void;
  onOpenStory: (storyId: string) => void;
  onRetry: () => void;
  stories: StoryCard[] | undefined;
}) {
  const [filter, setFilter] = useState<string>(ALL);
  const contentHeight = useScreenContentHeight();
  const shown = useMemo(
    () =>
      filter === MINE ? (stories ?? []).filter((story) => story.mine) : stories,
    [filter, stories]
  );

  // 고른 칩을 다시 눌러도 선택이 풀리지 않는다. 목록을 거르지 않는 상태는 없다.
  const choose = useCallback((keys: Set<string | number>) => {
    const [chosen] = [...keys];

    if (chosen !== undefined) {
      setFilter(String(chosen));
    }
  }, []);

  return (
    <ScrollView
      {...contentHeight}
      className="flex-1 bg-background"
      contentContainerClassName="gap-3 px-5 pt-5 pb-12"
      contentInsetAdjustmentBehavior="automatic"
      testID="browse-scroll"
    >
      {stories ? (
        <TagGroup
          onSelectionChange={choose}
          selectedKeys={[filter]}
          selectionMode="single"
        >
          {/* 칩이 늘거나 글자가 커져 줄이 화면보다 길어지면 옆으로 민다. */}
          <ScrollView
            contentContainerClassName="gap-2 px-1"
            horizontal
            showsHorizontalScrollIndicator={false}
            testID="browse-filters"
          >
            <TagGroup.List className="gap-2">
              <TagGroup.Item id={ALL}>{storyLabels.allStories}</TagGroup.Item>
              <TagGroup.Item id={MINE}>{storyLabels.myStories}</TagGroup.Item>
            </TagGroup.List>
          </ScrollView>
        </TagGroup>
      ) : null}
      {shown && shown.length > 0 ? (
        <View className="rounded-2xl bg-surface px-4">
          {shown.map((story, index) => (
            <BrowseRow
              hasBorder={index !== shown.length - 1}
              key={story.storyId}
              onOpenStory={onOpenStory}
              story={story}
            />
          ))}
        </View>
      ) : null}
      {stories && shown?.length === 0 ? (
        <ScreenEmpty
          action={
            <Button
              accessibilityLabel={storyLabels.createStory}
              onPress={onCreateStory}
              variant="primary"
            >
              {storyLabels.createStory}
            </Button>
          }
          icon="learn"
          testID="browse-mine-empty"
          title={storyLabels.mineEmptyTitle}
        />
      ) : null}
      {stories || isLoading ? null : (
        <ScreenUnavailable
          isRetrying={isRetrying}
          onRetry={onRetry}
          testID="browse-unavailable"
          title={storyLabels.unavailable}
        />
      )}
    </ScrollView>
  );
}
