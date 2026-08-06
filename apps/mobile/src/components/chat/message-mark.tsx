import Ionicons from "@expo/vector-icons/Ionicons";
import { PressableFeedback, useThemeColor } from "heroui-native";
import { View } from "react-native";
import type { MessageMark } from "../../lib/message-feedback";

const LABELS: Record<MessageMark, string> = {
  clear: "그대로 잘 통했어요",
  improvable: "더 자연스러운 표현 보기",
  translated: "한글로 쓴 문장 보기",
};

/**
 * 말풍선 곁의 표시. 누를 수 있는 둘은 원형 버튼으로, 상태인 체크는 배경 없는
 * 플랫 아이콘으로 그려 무엇이 눌리는지 모양이 먼저 말하게 한다. 터치 영역은
 * 열 전체인 44×44pt다.
 *
 * 브랜드 층의 아이콘은 Ionicons를 의미 토큰으로 칠하고, 뜻은 감싼 자리의
 * 접근성 이름이 나른다(docs/decisions/apple-hig-with-app-theme.md). 글리프
 * 자체는 매핑되지 않은 글자를 읽히게 하므로 트리에서 숨긴다.
 */
export function MessageMarkView({
  mark,
  onPress,
}: {
  mark: MessageMark;
  onPress?: () => void;
}) {
  const [muted, success] = useThemeColor(["muted", "success"]);

  if (mark === "clear") {
    return (
      <View
        accessibilityLabel={LABELS.clear}
        accessibilityRole="image"
        className="size-11 items-center justify-center"
        testID="message-mark-clear"
      >
        <Ionicons
          accessibilityElementsHidden
          color={success}
          name="checkmark"
          size={17}
        />
      </View>
    );
  }

  return (
    <PressableFeedback
      accessibilityLabel={LABELS[mark]}
      accessibilityRole="button"
      className="size-11 items-center justify-center"
      onPress={onPress}
      testID={`message-mark-${mark}`}
    >
      <View className="size-6.5 items-center justify-center rounded-full bg-surface">
        <Ionicons
          accessibilityElementsHidden
          color={muted}
          name={
            mark === "translated" ? "language" : "information-circle-outline"
          }
          size={mark === "translated" ? 15 : 17}
        />
      </View>
    </PressableFeedback>
  );
}
