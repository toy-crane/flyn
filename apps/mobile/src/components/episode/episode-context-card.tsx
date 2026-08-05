import { useCallback, useState } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";
import { RNSymbol } from "../symbols/rn-symbol";

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  description: {
    marginTop: spacing.xs,
  },
  head: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
  },
  label: {
    flex: 1,
  },
});

/**
 * 상황 카드는 대화 목록의 첫 요소이며 **제자리에서** 펼쳐진다. 목록 스크롤과
 * 키보드가 같은 프레임을 쥐고 있어 레이아웃 애니메이션을 얹지 않는다 — 탭이
 * 곧 변화의 설명이다(docs/decisions/native-motion.md).
 */
export function EpisodeContextCard({ description }: { description: string }) {
  const { colors, typography } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const toggle = useCallback(() => {
    setExpanded((current) => !current);
  }, []);
  const cardStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.card,
      { backgroundColor: colors.surface, opacity: pressed ? 0.7 : 1 },
    ],
    [colors.surface]
  );

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded }}
      onPress={toggle}
      style={cardStyle}
      testID="episode-context-card"
    >
      <View style={styles.head}>
        <Text
          numberOfLines={1}
          style={[styles.label, typography.label, { color: colors.text }]}
        >
          {expanded ? "상황" : "상황 자세히 보기"}
        </Text>
        <RNSymbol
          color={colors.secondaryText}
          symbol={expanded ? "chevronUp" : "chevronDown"}
        />
      </View>
      {expanded ? (
        <Text
          style={[
            styles.description,
            typography.supporting,
            { color: colors.text },
          ]}
          testID="episode-context-description"
        >
          {description}
        </Text>
      ) : null}
    </Pressable>
  );
}
