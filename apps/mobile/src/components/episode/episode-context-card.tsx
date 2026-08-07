import Ionicons from "@expo/vector-icons/Ionicons";
import {
  PressableFeedback,
  Surface,
  Typography,
  useThemeColor,
} from "heroui-native";
import { useCallback, useState } from "react";
import { View } from "react-native";

/**
 * 상황 카드는 대화 목록의 첫 요소이며 **제자리에서** 펼쳐진다. 목록 스크롤과
 * 키보드가 같은 프레임을 쥐고 있어 레이아웃 애니메이션을 얹지 않는다 — 탭이
 * 곧 변화의 설명이다(docs/decisions/native-motion.md). 누름 피드백은
 * 라이브러리가 소유한다.
 */
export function EpisodeContextCard({ description }: { description: string }) {
  const muted = useThemeColor("muted");
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => {
    setExpanded((current) => !current);
  }, []);

  return (
    <PressableFeedback
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={toggle}
      testID="episode-context-card"
    >
      {/* 반지름은 HeroUI 스케일에서 고른다 — `--radius-xl`이 곧 12pt다. */}
      <Surface
        className="min-h-11 justify-center rounded-xl px-4 py-3"
        testID="episode-context-surface"
      >
        <View className="flex-row items-center gap-2">
          <Typography className="flex-1" numberOfLines={1} type="body-sm">
            {expanded ? "상황" : "상황 자세히 보기"}
          </Typography>
          {/* 카드 전체가 이미 접근성 이름과 펼침 상태를 가지므로 셰브론은
              트리에서 숨긴다(docs/decisions/apple-hig-with-app-theme.md). */}
          <Ionicons
            accessibilityElementsHidden
            color={muted}
            name={expanded ? "chevron-up" : "chevron-down"}
            size={14}
          />
        </View>
        {expanded ? (
          <Typography
            className="mt-2"
            testID="episode-context-description"
            type="body-sm"
          >
            {description}
          </Typography>
        ) : null}
      </Surface>
    </PressableFeedback>
  );
}
