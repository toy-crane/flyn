import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

import type { StoryCard as StoryCardData } from "@/features/story/api/story";
import { StoryCover } from "@/features/story/ui/story-cover";
import { StoryProgress } from "@/features/story/ui/story-progress";
import { Icon } from "@/shared/ui/icon";

/**
 * 스토리 하나를 알아보게 하는 한 덩어리.
 *
 * 홈의 이어 하기 카드와 스토리 탭의 목록 행이 같은 것을 쓴다. 두 자리가 쓰는
 * 재료는 같고, 다른 것은 얼마나 펼치느냐뿐이다. 홈은 아래에 전체 폭 버튼을
 * 달아 가장 강한 자리로 세우고, 목록은 쉐브론 하나로 접는다.
 */
export function StoryCard({
  action,
  episodeLine,
  layout,
  onPress,
  story,
  sub,
  testID,
}: {
  /** 카드 아래 전체 폭 버튼. 목록 행은 두지 않는다. */
  action?: ReactNode;
  /** "3화 · 자리를 맡아 둔 사이에". 어느 화를 여는지 말한다. */
  episodeLine?: string;
  layout: "card" | "row";
  onPress: () => void;
  story: StoryCardData;
  /** 보조 한 줄. 예고, 이어간다는 안내, 또는 스토리의 한 줄 소개. */
  sub?: string;
  testID?: string;
}) {
  const isCard = layout === "card";

  return (
    <Pressable
      accessibilityLabel={`${story.title}${sub ? `, ${sub}` : ""}`}
      accessibilityRole="button"
      className={
        isCard ? "gap-4 rounded-2xl bg-surface p-4" : "flex-row items-center"
      }
      onPress={onPress}
      testID={testID}
    >
      <View className="flex-row items-center gap-3.5">
        <StoryCover emoji={story.coverEmoji} imageUrl={story.coverImageUrl} />
        <View className="flex-1 gap-1">
          <Text
            className={`font-bold text-foreground ${
              isCard ? "text-[17px]" : "text-base"
            }`}
            numberOfLines={1}
          >
            {story.title}
          </Text>
          {episodeLine ? (
            <Text className="text-muted text-sm" numberOfLines={1}>
              {episodeLine}
            </Text>
          ) : null}
          {sub ? (
            <Text className="text-muted text-sm" numberOfLines={1}>
              {sub}
            </Text>
          ) : null}
          <View className="pt-1">
            <StoryProgress finished={story.finished} total={story.total} />
          </View>
        </View>
        {isCard ? null : <Icon name="forward" size="md" tone="muted" />}
      </View>
      {action}
    </Pressable>
  );
}
