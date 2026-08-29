import { Image, Text, View } from "react-native";

/**
 * 스토리의 표지 타일.
 *
 * 대표 캐릭터 일러스트가 있으면 그것을 깔고, 아직 그리지 않은 스토리는
 * 이모지 하나로 대신한다. 표지는 스토리를 알아보는 표시일 뿐 읽을 내용이
 * 아니므로 보조 기술에는 드러내지 않는다.
 */
export function StoryCover({
  emoji,
  imageUrl,
}: {
  emoji: string;
  imageUrl: string | null;
}) {
  return (
    <View
      accessibilityElementsHidden
      className="size-[72px] items-center justify-center overflow-hidden rounded-[14px] bg-accent-soft"
      importantForAccessibility="no-hide-descendants"
      testID="story-cover"
    >
      {imageUrl ? (
        <Image className="size-full" source={{ uri: imageUrl }} />
      ) : (
        <Text className="text-3xl">{emoji}</Text>
      )}
    </View>
  );
}
