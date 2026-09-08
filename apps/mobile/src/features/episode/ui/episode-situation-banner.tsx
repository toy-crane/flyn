import { Text, useWindowDimensions, View } from "react-native";

/**
 * 헤더 아래 상시로 보이는 사건과 목표.
 *
 * 대화 스크롤이나 결말 여부와 무관하게 화면에 고정된다. 문구와 이모지는
 * 에피소드 각본이 정하고, 이 컴포넌트는 누르는 동작을 두지 않는다. 문구는
 * 화면 너비와 시스템 글자 크기에 따라 자연스럽게 줄바꿈한다.
 *
 * 색이 두 겹인 이유가 있다. `accent-soft`는 강조색을 투명과 섞은 색이라 한
 * 겹만 쓰면 아래로 지나가는 말풍선이 그대로 비쳐 글씨가 겹쳐 읽힌다. 화면
 * 배경을 깔고 그 위에 틴트를 얹으면 같은 색이 불투명해진다.
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
      className="border-border border-b bg-background"
      key={fontScale}
      testID="episode-situation-banner"
    >
      <View className="flex-row items-start gap-1.5 bg-accent-soft px-5 py-2">
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
