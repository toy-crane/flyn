import { TagGroup } from "heroui-native/tag-group";
import { useCallback, useMemo, useState } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";

import type { StoryCard } from "@/features/story/api/story";
import { storyLabels } from "@/features/story/ui/story-labels";
import { StoryRow } from "@/features/story/ui/story-row";
import { Button } from "@/shared/ui/button";
import { ScreenEmpty, ScreenUnavailable } from "@/shared/ui/screen-status";
import { useScreenContentHeight } from "@/shared/ui/use-screen-content-height";

/** 목록을 거르는 칩. 탐색을 다시 열면 언제나 `전체`로 돌아온다. */
const ALL = "all";
const MINE = "mine";

/** 칩 이름의 글자 크기와 줄 높이 비율. HeroUI의 보통 크기 칩과 같다. */
const CHIP_TEXT_SIZE = 14;
const CHIP_LEADING = 1.5;

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
  const { fontScale } = useWindowDimensions();
  const contentHeight = useScreenContentHeight();
  /*
    칩의 글자는 기기의 글자 크기 설정을 따라 커지는데 줄 높이는 고정이라, 큰
    글자 크기에서 이름의 위아래가 잘린다. 줄 높이를 같은 배율로 함께 키운다.
  */
  const labelStyle = useMemo(
    () => ({
      lineHeight: Math.ceil(CHIP_TEXT_SIZE * fontScale * CHIP_LEADING),
    }),
    [fontScale]
  );
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
            {/*
              HeroUI의 칩을 그대로 쓰되 이 화면이 셋을 더 준다. 모두 그 컴포넌트가
              열어 둔 자리이고 HeroUI 원본은 손대지 않는다.

              `flex-nowrap`: 칩 줄이 접히지 않게 한다. HeroUI의 목록은 기본으로
              줄을 바꾸는데, 가로로 미는 자리 안에서 접히면 둘째 칩이 보이지 않는
              두 번째 줄로 내려간다. 넘치는 것은 옆으로 미는 것이 이 자리의 규칙이다.

              `role`: 칩을 누를 수 있는 자리로 읽히게 한다. HeroUI가 칩에
              `role="listitem"`을 먼저 붙이는데, 둘이 함께 있으면 React Native가
              `role`을 따르므로 여기서 덮는다. 고른 상태는 HeroUI가 이미 밝힌다.

              이름을 직접 그리는 것: 칩 이름의 줄 높이를 글자 배율에 맞춰 키우기
              위해서다. 글자로만 넘기면 HeroUI가 고정 줄 높이를 붙여 큰 글자
              크기에서 이름의 위아래가 잘린다.
            */}
            <TagGroup.List className="flex-nowrap gap-2">
              <TagGroup.Item id={ALL} role="button">
                {() => (
                  <Text
                    className="font-medium text-[14px] text-foreground"
                    style={labelStyle}
                  >
                    {storyLabels.allStories}
                  </Text>
                )}
              </TagGroup.Item>
              <TagGroup.Item id={MINE} role="button">
                {() => (
                  <Text
                    className="font-medium text-[14px] text-foreground"
                    style={labelStyle}
                  >
                    {storyLabels.myStories}
                  </Text>
                )}
              </TagGroup.Item>
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
