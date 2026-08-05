import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  holder: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  label: {
    marginBottom: spacing.xxs,
  },
});

/**
 * 창 상단에 **고정되는** 인용 카드. 목록 머리에 두면 스크롤과 함께 사라져,
 * 지난 질문을 되짚는 동안 어느 문장을 두고 묻는지 잃는다. 그래서 대화 목록
 * 바깥에 서고 스크롤을 타지 않는다.
 */
export function QuotedSentenceCard({ sentence }: { sentence: string }) {
  const { colors, typography } = useTheme();

  return (
    <View
      style={[styles.holder, { backgroundColor: colors.background }]}
      testID="quoted-sentence-card"
    >
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <Text
          style={[
            styles.label,
            typography.caption,
            { color: colors.secondaryText },
          ]}
        >
          이 문장에 대해
        </Text>
        <Text
          selectable
          style={[typography.supporting, { color: colors.text }]}
          testID="quoted-sentence"
        >
          {sentence}
        </Text>
      </View>
    </View>
  );
}
