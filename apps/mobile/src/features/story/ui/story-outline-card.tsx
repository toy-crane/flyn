import { Text, View } from "react-native";

import { storyLabels } from "@/features/story/ui/story-labels";
import { Button } from "@/shared/ui/button";

/** 카드에 적힌 인물 한 명. 순서가 곧 이름표 색의 번호다. */
export interface OutlineCharacter {
  name: string;
  position: number;
  role: string;
}

/** 카드에 적힌 화 한 줄. */
export interface OutlineEpisode {
  cast: string[];
  number: number;
  preview: string;
  title: string;
}

/** 플린이 내놓은 스토리 개요. 각본은 여기 없다. */
export interface StoryOutline {
  characters: OutlineCharacter[];
  episodes: OutlineEpisode[];
  hook: string;
  title: string;
}

/**
 * 플린이 내놓은 스토리 카드.
 *
 * 대화 흐름 안에 놓이고 입력창은 그대로 열려 있다. 사용자가 고칠 것을 말하면
 * 플린이 새 카드를 내놓고, 지난 카드는 대화에 남되 `대화 시작하기`는 붙지
 * 않는다. 그 버튼이 카드마다 있으면 어느 카드로 만드는지가 흐려진다.
 *
 * 표지 자리는 아직 빈 색 상자다. 그림은 `대화 시작하기` 때 만든다.
 */
export function StoryOutlineCard({
  isStarting,
  onStart,
  outline,
}: {
  /** 만드는 중인지. 진행을 보여 주는 동안 같은 요청을 다시 시작하지 못한다. */
  isStarting?: boolean;
  /** 가장 최근 카드에만 온다. 없으면 버튼을 그리지 않는다. */
  onStart?: () => void;
  outline: StoryOutline;
}) {
  return (
    <View
      className="w-full gap-3.5 rounded-2xl bg-surface p-4"
      testID="story-outline-card"
    >
      <View className="flex-row items-center gap-3">
        {/* 표지가 없는 동안의 자리. 만든 표지가 들어오면 이 상자가 그림이 된다. */}
        <View
          accessibilityElementsHidden
          className="size-16 shrink-0 rounded-[14px] bg-accent-soft"
          importantForAccessibility="no-hide-descendants"
          testID="story-outline-cover"
        />
        <View className="flex-1">
          <Text
            accessibilityRole="header"
            className="font-semibold text-[17px] text-foreground leading-6"
            dynamicTypeRamp="headline"
          >
            {outline.title}
          </Text>
          <Text
            className="mt-[3px] text-[13px] text-muted leading-[19px]"
            dynamicTypeRamp="footnote"
          >
            {outline.hook}
          </Text>
        </View>
      </View>

      <View className="gap-1 border-border border-t pt-3">
        <Text
          className="font-medium text-[12px] text-muted leading-[18px]"
          dynamicTypeRamp="caption1"
        >
          {storyLabels.outlineCast}
        </Text>
        {outline.characters.map((person) => (
          <Text
            className="text-[14px] text-foreground leading-5"
            dynamicTypeRamp="subheadline"
            key={person.name}
          >
            {`${person.name} · ${person.role}`}
          </Text>
        ))}
      </View>

      <View className="gap-2.5 border-border border-t pt-3">
        {outline.episodes.map((episode) => (
          <View className="flex-row gap-1.5" key={episode.number}>
            <Text
              className="w-8 font-semibold text-[12px] text-muted leading-[18px]"
              dynamicTypeRamp="caption1"
            >
              {storyLabels.episodeNumber(episode.number)}
            </Text>
            <View className="flex-1">
              <Text
                className="font-semibold text-[15px] text-foreground leading-[21px]"
                dynamicTypeRamp="subheadline"
              >
                {episode.title}
              </Text>
              <Text
                className="mt-px text-[13px] text-muted leading-[19px]"
                dynamicTypeRamp="footnote"
              >
                {episode.preview}
              </Text>
            </View>
          </View>
        ))}
      </View>

      {onStart ? (
        <Button
          accessibilityLabel={storyLabels.start}
          isPending={isStarting}
          onPress={onStart}
          testID="story-outline-start"
          variant="primary"
        >
          {isStarting ? storyLabels.creating : storyLabels.start}
        </Button>
      ) : null}
    </View>
  );
}

/**
 * 카드와 그 뒤에 플린이 덧붙이는 말.
 *
 * 문구가 늘 같아서 모델이 쓰지 않는다. 모델에게 맡기면 조각 하나로 끝날 턴에
 * 한 번 더 다녀와야 하고, 그 사이 카드만 놓인 화면이 잠시 보인다.
 */
export function StoryOutlineTurn({
  isStarting,
  onStart,
  outline,
}: {
  isStarting?: boolean;
  onStart?: () => void;
  outline: StoryOutline;
}) {
  return (
    <View className="w-full gap-3">
      <StoryOutlineCard
        isStarting={isStarting}
        onStart={onStart}
        outline={outline}
      />
      <Text
        className="px-1 text-[16px] text-foreground leading-6"
        dynamicTypeRamp="body"
      >
        {storyLabels.afterCard}
      </Text>
    </View>
  );
}
