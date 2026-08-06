import { type ReactNode, useCallback } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { type MessageFeedback, messageMark } from "../../lib/message-feedback";
import { improvedSegments } from "../../lib/sentence-diff";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";
import { RNSymbol } from "../symbols/rn-symbol";

const styles = StyleSheet.create({
  askMore: {
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 44,
  },
  content: {
    gap: spacing.md,
    paddingBottom: spacing.xl,
    paddingHorizontal: spacing.lg,
    // grabber가 시트 맨 위에 서므로 첫 줄이 그 아래에서 시작한다.
    paddingTop: spacing.lg,
  },
  improved: {
    fontSize: 17,
    fontWeight: "600",
    lineHeight: 25,
  },
  label: {
    marginBottom: spacing.xxs,
  },
  reason: {
    marginBottom: spacing.xs,
  },
  rule: {
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  screen: {
    flex: 1,
  },
});

function Rule() {
  const { colors } = useTheme();

  return <View style={[styles.rule, { borderTopColor: colors.separator }]} />;
}

/** 한 덩어리는 무엇인지 말하는 라벨과 그 내용으로 이루어진다. */
function Block({ children, label }: { children: ReactNode; label: string }) {
  const { colors, typography } = useTheme();

  return (
    <View>
      <Text
        style={[
          styles.label,
          typography.caption,
          { color: colors.secondaryText },
        ]}
      >
        {label}
      </Text>
      {children}
    </View>
  );
}

function Sentence({ children }: { children: string }) {
  const { colors, typography } = useTheme();

  return (
    <Text style={[typography.message, { color: colors.text }]}>{children}</Text>
  );
}

/**
 * 개선 문장. 밑줄은 **이미 적용된 변경**을 뜻하므로 바뀐 자리에만 긋는다.
 * 말풍선 본문에는 넣지 않는다 — 교정 전 문장에 밑줄을 그으면 뜻이 반대가 된다.
 */
function ImprovedSentence({
  delivered,
  improved,
}: {
  delivered: string;
  improved: string;
}) {
  const { colors } = useTheme();
  let offset = 0;
  const segments = improvedSegments(delivered, improved).map((segment) => {
    const key = `${offset}:${segment.text}`;

    offset += segment.text.length;

    return { ...segment, key };
  });

  return (
    <Text
      style={[styles.improved, { color: colors.text }]}
      testID="feedback-improved"
    >
      {segments.map((segment) =>
        segment.changed ? (
          <Text
            key={segment.key}
            style={{
              textDecorationColor: colors.accent,
              textDecorationLine: "underline",
            }}
            testID="feedback-improved-edit"
          >
            {segment.text}
          </Text>
        ) : (
          segment.text
        )
      )}
    </Text>
  );
}

/** 항목별 이유. 번역 시트에서는 같은 자리가 표현 노트가 된다. */
function Reasons({ reasons }: { reasons: string[] }) {
  const { colors, typography } = useTheme();

  return (
    <View testID="feedback-reasons">
      {reasons.map((reason) => (
        <Text
          key={reason}
          style={[styles.reason, typography.supporting, { color: colors.text }]}
        >
          {reason}
        </Text>
      ))}
    </View>
  );
}

/**
 * 시트 하단의 `더 물어보기`. 여기서 열리는 문장 질문은 시트 위에 쌓이지 않고
 * 대화 위로 push되므로, 이 자리는 목적지를 여는 일만 한다.
 */
function AskMoreAction({ onPress }: { onPress: () => void }) {
  const { colors, typography } = useTheme();
  const actionStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.askMore,
      { opacity: pressed ? 0.5 : 1 },
    ],
    []
  );

  return (
    <Pressable
      accessibilityLabel="더 물어보기"
      accessibilityRole="button"
      onPress={onPress}
      style={actionStyle}
      testID="feedback-ask-more"
    >
      <RNSymbol color={colors.accent} symbol="askMore" />
      <Text style={[typography.action, { color: colors.accent }]}>
        더 물어보기
      </Text>
    </Pressable>
  );
}

/**
 * 첨삭 시트. 번역이든 교정이든 **같은 시트**이며 내용만 다르다. 이미 저장된
 * 판정만 읽으므로 열 때 아무것도 다시 부르지 않는다.
 */
export function FeedbackSheet({
  feedback,
  onAskMore,
}: {
  feedback: MessageFeedback;
  onAskMore: () => void;
}) {
  const { colors } = useTheme();
  // 원문이 있을 때만 한글 블록이 선다. `messageMark`가 번역 표시를 고르는 조건과
  // 같은 값을 본다 — 표시와 시트가 어긋날 수 없다.
  const sourceText =
    messageMark(feedback) === "translated" ? feedback.sourceText : null;
  /**
   * 첨삭은 **학습자가 영어로 직접 쓴 문장에만** 붙는다. 번역된 문장은 학습자가
   * 쓴 것이 아니라 "더 자연스럽게 쓸 수 있다"는 말이 성립하지 않고, 판정도
   * 그런 문장에는 개선문을 남기지 않는다. 그 자리는 `reasons`가 표현 노트로
   * 채운다.
   */
  const alternative =
    feedback.improvedSentence === null ? null : (
      <Block label="이렇게 쓰면 더 자연스러워요">
        <ImprovedSentence
          delivered={feedback.delivered}
          improved={feedback.improvedSentence}
        />
      </Block>
    );

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      style={[styles.screen, { backgroundColor: colors.background }]}
      testID="feedback-sheet"
    >
      {sourceText === null ? (
        alternative
      ) : (
        <>
          <Block label="내가 쓴 한글">
            <Sentence>{sourceText}</Sentence>
          </Block>
          <Rule />
          <Block label="이렇게 전달됐어요">
            <Sentence>{feedback.delivered}</Sentence>
          </Block>
        </>
      )}
      {feedback.reasons.length > 0 ? (
        <>
          <Rule />
          <Reasons reasons={feedback.reasons} />
        </>
      ) : null}
      <Rule />
      <AskMoreAction onPress={onAskMore} />
    </ScrollView>
  );
}
