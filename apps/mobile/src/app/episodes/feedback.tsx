import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { StyleSheet, Text, View } from "react-native";
import { FeedbackSheet } from "../../components/episode/feedback-sheet";
import { findFeedback } from "../../lib/message-feedback";
import { useStoredFeedback } from "../../lib/use-episodes";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";

const styles = StyleSheet.create({
  empty: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
});

function single(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

/**
 * 표시를 눌러 여는 첨삭 시트. medium detent와 grabber는 라우트가 native sheet로
 * 세운다(`app/_layout.tsx`). 판정은 대화 화면이 이미 읽어 둔 것만 본다.
 */
export default function FeedbackSheetScreen() {
  const { colors, typography } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{
    episodeId?: string | string[];
    messageId?: string | string[];
  }>();
  const episodeId = single(params.episodeId);
  const messageId = single(params.messageId);
  const feedback = useStoredFeedback(episodeId);
  const judged = findFeedback(feedback ?? [], messageId);
  /**
   * `더 물어보기`는 시트 위에 시트를 쌓지 않는다. 시트를 닫고 그 아래 대화
   * 화면 위로 문장 질문을 push해, 뒤로 가면 시트가 아니라 대화로 돌아온다.
   */
  const askMore = useCallback(() => {
    router.back();
    router.push({
      params: { episodeId, messageId },
      pathname: "/episodes/question",
    });
  }, [episodeId, messageId, router]);

  if (!judged) {
    return (
      <View style={[styles.empty, { backgroundColor: colors.background }]}>
        <Text style={[typography.body, { color: colors.secondaryText }]}>
          대화 화면에서 다시 열어 주세요.
        </Text>
      </View>
    );
  }

  return <FeedbackSheet feedback={judged} onAskMore={askMore} />;
}
