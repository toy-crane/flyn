import { Pressable, Text, View } from "react-native";

import { StoryCover } from "@/features/story/ui/story-cover";
import { Icon } from "@/shared/ui/icon";

/**
 * 목록의 스토리 한 줄.
 *
 * 탐색과 스토리 탭이 같은 것을 쓴다. 두 목록이 보여 주는 것은 표지, 제목, 한 줄
 * 소개로 같고, 다른 것은 눌렀을 때 어디로 가느냐뿐이다.
 *
 * 진행 바가 없다. 같은 스토리를 여러 회차로 진행하므로 목록에 세울 대표 진행이
 * 없고, 회차별 진행은 대화 기록이 카드마다 따로 보여 준다.
 */
export function StoryRow({
  coverBlurhash,
  coverImagePath,
  hasBorder,
  hook,
  onPress,
  testID,
  title,
}: {
  coverBlurhash: string | null;
  coverImagePath: string | null;
  hasBorder: boolean;
  hook: string;
  onPress: () => void;
  testID?: string;
  title: string;
}) {
  return (
    <View
      className={`py-3.5 ${hasBorder ? "border-border border-b" : ""}`.trim()}
    >
      <Pressable
        accessibilityLabel={`${title}, ${hook}`}
        accessibilityRole="button"
        className="flex-row items-center gap-3.5"
        onPress={onPress}
        testID={testID}
      >
        <StoryCover blurhash={coverBlurhash} imagePath={coverImagePath} />
        <View className="flex-1 gap-1">
          <Text
            className="font-bold text-base text-foreground"
            numberOfLines={1}
          >
            {title}
          </Text>
          <Text className="text-muted text-sm" numberOfLines={2}>
            {hook}
          </Text>
        </View>
        <Icon name="forward" size="md" tone="muted" />
      </Pressable>
    </View>
  );
}
