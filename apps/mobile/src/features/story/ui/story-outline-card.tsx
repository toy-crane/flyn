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
  details: string;
  number: number;
  preview: string;
  title: string;
}

/** 플린이 내놓은 스토리 개요. 대본은 여기 없다. */
export interface StoryOutline {
  characters: OutlineCharacter[];
  cover: string;
  episodes: OutlineEpisode[];
  hook: string;
  /** 이야기가 벌어지는 곳 한 줄. 카드에 그리지 않고 표지 그림이 쓴다. */
  setting?: string;
  title: string;
}

/**
 * 플린이 내놓은 스토리 카드.
 *
 * 대화 흐름 안에 놓이고 입력창은 그대로 열려 있다. 사용자가 고칠 것을 말하면
 * 플린이 새 카드를 내놓고, 지난 카드는 대화에 남되 행동 버튼은 붙지
 * 않는다. 그 버튼이 카드마다 있으면 어느 카드로 만드는지가 흐려진다.
 *
 * 아직 표지가 없으므로 빈 이미지 자리도 두지 않는다.
 */
export function StoryOutlineCard({
  isDisabled,
  isStarting,
  onAdd,
  onStart,
  outline,
  progress,
}: {
  isDisabled?: boolean;
  /** 만드는 중인지. 진행을 보여 주는 동안 같은 요청을 다시 시작하지 못한다. */
  isStarting?: boolean;
  onAdd?: () => void;
  /** 가장 최근 카드에만 온다. 없으면 버튼을 그리지 않는다. */
  onStart?: () => void;
  outline: StoryOutline;
  progress?: string;
}) {
  const startLabel = isStarting
    ? (progress ?? storyLabels.creationProgress.script)
    : storyLabels.createStory;
  return (
    <View
      className="w-full gap-3.5 rounded-2xl bg-surface p-4"
      testID="story-outline-card"
    >
      <View>
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

      {onAdd ? (
        <Button
          accessibilityLabel={storyLabels.addEpisode}
          isDisabled={isDisabled || isStarting || outline.episodes.length >= 5}
          onPress={onAdd}
          startContent={<Text className="text-[20px] text-foreground">＋</Text>}
          variant="outline"
        >
          {storyLabels.addEpisode}
        </Button>
      ) : null}
      {onAdd && outline.episodes.length >= 5 ? (
        <Text
          className="text-center text-[12px] text-muted leading-[18px]"
          dynamicTypeRamp="caption1"
        >
          {storyLabels.episodeLimit}
        </Text>
      ) : null}
      {onStart ? (
        <Button
          accessibilityLabel={startLabel}
          isDisabled={isDisabled}
          isPending={isStarting}
          onPress={onStart}
          testID="story-outline-start"
          variant="primary"
        >
          {startLabel}
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
  isDisabled,
  isStarting,
  onAdd,
  onStart,
  outline,
  progress,
}: {
  isDisabled?: boolean;
  isStarting?: boolean;
  onAdd?: () => void;
  onStart?: () => void;
  outline: StoryOutline;
  progress?: string;
}) {
  return (
    <View className="w-full gap-3">
      <StoryOutlineCard
        isDisabled={isDisabled}
        isStarting={isStarting}
        onAdd={onAdd}
        onStart={onStart}
        outline={outline}
        progress={progress}
      />
      {isStarting && onStart ? null : (
        <Text
          className="px-1 text-[16px] text-foreground leading-6"
          dynamicTypeRamp="body"
        >
          {storyLabels.afterCard}
        </Text>
      )}
    </View>
  );
}
