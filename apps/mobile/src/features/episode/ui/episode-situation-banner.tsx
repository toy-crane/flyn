import { Platform, Text, useWindowDimensions, View } from "react-native";

/**
 * 헤더 아래 상시로 보이는 사건과 목표.
 *
 * 대화 스크롤이나 결말 여부와 무관하게 화면에 고정된다. 문구와 이모지는
 * 에피소드 각본이 정하고, 이 컴포넌트는 누르는 동작을 두지 않는다. 문구는
 * 화면 너비와 시스템 글자 크기에 따라 자연스럽게 줄바꿈한다.
 *
 * iOS의 배경은 헤더와 이어지는 공통 흐림 영역이 맡는다.
 * Android는 기존의 불투명한 강조색 표면을 유지한다.
 */
export function EpisodeSituationBanner({
  emoji,
  text,
}: {
  emoji: string;
  text: string;
}) {
  const { fontScale } = useWindowDimensions();
  return (
    <View
      className={
        Platform.OS === "ios"
          ? undefined
          : "border-border border-b bg-background"
      }
      key={fontScale}
      testID="episode-situation-banner"
    >
      <View
        className={`flex-row items-start gap-1.5 px-5 py-2 ${Platform.OS === "ios" ? "" : "bg-accent-soft"}`}
      >
        {/*
          장면을 가리키는 장식이라 낭독에서는 뺀다. 남겨 두면 문장 앞에서
          이모지 이름이 따로 한 번 읽힌다.
        */}
        <Text
          accessibilityElementsHidden
          className="text-sm leading-5"
          importantForAccessibility="no-hide-descendants"
        >
          {emoji}
        </Text>
        <Text className="flex-1 text-foreground text-sm leading-5">{text}</Text>
      </View>
    </View>
  );
}
