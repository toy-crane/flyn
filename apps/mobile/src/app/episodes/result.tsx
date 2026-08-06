import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  type PressableStateCallbackType,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MessageMarkView } from "../../components/chat/message-mark";
import {
  CenteredAction,
  CenteredState,
} from "../../components/feedback/centered-action";
import { LoadingIndicator } from "../../components/feedback/loading-indicator";
import { RNSymbol } from "../../components/symbols/rn-symbol";
import {
  type GoalResult,
  goalResults,
  type ReviewedUtterance,
  resultHeadline,
  reviewedUtterances,
} from "../../lib/episode-result";
import { type Episode, orderedGoals } from "../../lib/episodes";
import { useSaveEpisode } from "../../lib/use-episode-creation";
import { useRefillJudgment } from "../../lib/use-episode-judgment";
import {
  useEpisode,
  useEpisodeFeedback,
  useEpisodeMessages,
} from "../../lib/use-episodes";
import { useUserId } from "../../lib/user-id";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";

/** 총평을 만들지 못한 채 끝난 에피소드. 없는 것을 있는 척하지 않는다. */
const MISSING_SUMMARY = "이번 글쓰기 총평은 만들지 못했어요.";

const styles = StyleSheet.create({
  action: {
    alignItems: "center",
    borderRadius: 14,
    height: 50,
    justifyContent: "center",
  },
  actions: {
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.xs,
  },
  card: {
    borderRadius: 14,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  content: {
    padding: spacing.md,
  },
  goalLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingVertical: 5,
  },
  goalText: {
    flex: 1,
  },
  headline: {
    marginBottom: spacing.lg,
    marginHorizontal: spacing.xxs,
  },
  name: {
    marginBottom: 2,
    marginHorizontal: spacing.xxs,
    marginTop: spacing.xs,
  },
  pip: {
    alignItems: "center",
    borderRadius: 10,
    height: 20,
    justifyContent: "center",
    width: 20,
  },
  refill: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 60,
  },
  screen: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    marginHorizontal: spacing.xxs,
  },
  utteranceList: {
    borderRadius: 14,
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
  },
  utteranceRow: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.xs,
    minHeight: 44,
    paddingVertical: spacing.xs,
  },
  utteranceText: {
    flex: 1,
  },
});

function single(value: string | string[] | undefined) {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
}

function SectionTitle({ children }: { children: string }) {
  const { colors, typography } = useTheme();

  return (
    <Text
      style={[
        styles.sectionTitle,
        typography.caption,
        { color: colors.secondaryText },
      ]}
    >
      {children}
    </Text>
  );
}

/** 달성은 체크, 미달성은 빈 원이다. X 표시는 어디에도 쓰지 않는다. */
function GoalResultLine({ goal }: { goal: GoalResult }) {
  const { colors, typography } = useTheme();

  return (
    <View style={styles.goalLine}>
      {goal.achieved ? (
        <View
          style={[styles.pip, { backgroundColor: colors.success }]}
          testID={`goal-result-done-${goal.position}`}
        >
          <RNSymbol color={colors.onAccent} symbol="achieved" />
        </View>
      ) : (
        <View
          style={[styles.pip, { borderColor: colors.border, borderWidth: 1.5 }]}
          testID={`goal-result-missed-${goal.position}`}
        />
      )}
      <Text
        style={[
          styles.goalText,
          typography.supporting,
          { color: goal.achieved ? colors.text : colors.secondaryText },
        ]}
      >
        {goal.sentence}
      </Text>
    </View>
  );
}

/**
 * 문장 한 줄. 표시와 시트는 대화 화면의 것을 그대로 쓴다 — 같은 컴포넌트,
 * 같은 라우트다. 표시가 없는 줄만 `다시 확인`으로 드러난다.
 */
function UtteranceRow({
  onOpenFeedback,
  onRefill,
  refilling,
  utterance,
}: {
  onOpenFeedback: (messageId: string) => void;
  onRefill: () => void;
  refilling: boolean;
  utterance: ReviewedUtterance;
}) {
  const { colors, typography } = useTheme();
  const openable =
    utterance.mark === "improvable" || utterance.mark === "translated";
  const open = useCallback(() => {
    onOpenFeedback(utterance.id);
  }, [onOpenFeedback, utterance.id]);
  const rowStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.utteranceRow,
      { borderBottomColor: colors.separator, opacity: pressed ? 0.5 : 1 },
    ],
    [colors.separator]
  );
  const body = (
    <>
      <View testID={`utterance-mark-${utterance.id}`}>
        {utterance.mark ? (
          <MessageMarkView
            mark={utterance.mark}
            onPress={openable ? open : undefined}
          />
        ) : null}
      </View>
      <Text
        style={[
          styles.utteranceText,
          typography.supporting,
          { color: colors.text },
        ]}
      >
        {utterance.text}
      </Text>
      {openable ? <RNSymbol color={colors.border} symbol="disclosure" /> : null}
      {utterance.mark ? null : (
        <Pressable
          accessibilityLabel="다시 확인"
          accessibilityRole="button"
          disabled={refilling}
          onPress={onRefill}
          style={styles.refill}
          testID={`utterance-refill-${utterance.id}`}
        >
          {refilling ? (
            <ActivityIndicator accessible={false} color={colors.accent} />
          ) : (
            <Text style={[typography.label, { color: colors.accent }]}>
              다시 확인
            </Text>
          )}
        </Pressable>
      )}
    </>
  );

  if (!openable) {
    return (
      <View
        style={[styles.utteranceRow, { borderBottomColor: colors.separator }]}
      >
        {body}
      </View>
    );
  }

  return (
    <Pressable
      accessibilityLabel={utterance.text}
      accessibilityRole="button"
      onPress={open}
      style={rowStyle}
    >
      {body}
    </Pressable>
  );
}

function EpisodeResult({ episode }: { episode: Episode }) {
  const insets = useSafeAreaInsets();
  const { colors, typography } = useTheme();
  const router = useRouter();
  const userId = useUserId();
  const messages = useEpisodeMessages(episode.id);
  const feedback = useEpisodeFeedback(episode.id);
  const refill = useRefillJudgment(episode.id);
  const restart = useSaveEpisode(userId);
  const utterances = reviewedUtterances(
    messages.data ?? [],
    feedback.data ?? []
  );

  const openFeedback = useCallback(
    (messageId: string) => {
      router.push({
        params: { episodeId: episode.id, messageId },
        pathname: "/episodes/feedback",
      });
    },
    [episode.id, router]
  );
  const refillJudgment = useCallback(() => {
    refill.mutate(undefined, {
      onError: () => {
        Alert.alert("판정을 받지 못했어요", "잠시 후 다시 시도해 주세요.");
      },
    });
  }, [refill]);
  const openConversation = useCallback(() => {
    router.push(`/episodes/${episode.id}`);
  }, [episode.id, router]);
  const createEpisode = useCallback(() => {
    router.push("/episodes/new");
  }, [router]);
  /**
   * `다시 하기`는 같은 시나리오·역할·목표로 새 에피소드를 시작한다. 끝난
   * 에피소드는 그대로 남아 결과를 언제든 다시 볼 수 있다.
   */
  const retryEpisode = useCallback(() => {
    restart.mutate(
      {
        goals: orderedGoals(episode).map((goal) => goal.sentence),
        roles: {
          partnerRole: episode.partner_role,
          userRole: episode.user_role,
        },
        scenario: {
          description: episode.scenario_description,
          title: episode.scenario_title,
        },
      },
      {
        onError: () => {
          Alert.alert("다시 시작하지 못했어요", "잠시 후 다시 시도해 주세요.");
        },
        onSuccess: ({ id }) => {
          router.replace(`/episodes/${id}`);
        },
      }
    );
  }, [episode, restart, router]);

  const primaryStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
    ],
    [colors.primary]
  );
  const ghostStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      { opacity: pressed ? 0.5 : 1 },
    ],
    []
  );

  return (
    <>
      {/* 헤더는 뒤로 가기와 `다시 하기`만 갖는다. 시나리오 제목은 본문 첫 줄이다. */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="다시 하기"
          disabled={restart.isPending}
          onPress={retryEpisode}
        >
          다시 하기
        </Stack.Toolbar.Button>
      </Stack.Toolbar>

      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text
            style={[
              styles.name,
              typography.label,
              { color: colors.secondaryText },
            ]}
            testID="result-episode-name"
          >
            {episode.scenario_title}
          </Text>
          <Text
            style={[styles.headline, typography.title, { color: colors.text }]}
            testID="result-headline"
          >
            {resultHeadline(episode)}
          </Text>

          <SectionTitle>이번 대화의 목표</SectionTitle>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            {goalResults(episode).map((goal) => (
              <GoalResultLine goal={goal} key={goal.position} />
            ))}
          </View>

          <SectionTitle>이번 글쓰기</SectionTitle>
          <View style={[styles.card, { backgroundColor: colors.surface }]}>
            <Text
              style={[
                typography.supporting,
                {
                  color: episode.summary ? colors.text : colors.secondaryText,
                },
              ]}
              testID="result-summary"
            >
              {episode.summary ?? MISSING_SUMMARY}
            </Text>
          </View>

          <SectionTitle>{`내가 쓴 문장 ${utterances.length}개`}</SectionTitle>
          <View
            style={[styles.utteranceList, { backgroundColor: colors.surface }]}
            testID="result-utterances"
          >
            {utterances.map((utterance) => (
              <UtteranceRow
                key={utterance.id}
                onOpenFeedback={openFeedback}
                onRefill={refillJudgment}
                refilling={refill.isPending}
                utterance={utterance}
              />
            ))}
          </View>
        </ScrollView>

        {/* 하단은 결과와 무관하게 같다. */}
        <View
          style={[
            styles.actions,
            {
              borderTopColor: colors.separator,
              paddingBottom: Math.max(insets.bottom, spacing.lg),
            },
          ]}
        >
          <Pressable
            accessibilityLabel="새 에피소드 시작"
            accessibilityRole="button"
            onPress={createEpisode}
            style={primaryStyle}
          >
            <Text style={[typography.action, { color: colors.onPrimary }]}>
              새 에피소드 시작
            </Text>
          </Pressable>
          <Pressable
            accessibilityLabel="대화 보기"
            accessibilityRole="button"
            onPress={openConversation}
            style={ghostStyle}
          >
            <Text style={[typography.action, { color: colors.accent }]}>
              대화 보기
            </Text>
          </Pressable>
        </View>
      </View>
    </>
  );
}

/**
 * 끝난 에피소드의 결과. 대화 화면의 `결과 보기`와 홈 목록의 끝난 행이 여기로
 * 온다. 총평은 종료 시점에 저장된 것을 읽기만 하고 다시 만들지 않는다.
 */
export default function EpisodeResultScreen() {
  const params = useLocalSearchParams<{ episodeId?: string | string[] }>();
  const router = useRouter();
  const episodeId = single(params.episodeId);
  const episode = useEpisode(episodeId);

  const retry = useCallback(() => {
    episode.refetch();
  }, [episode]);
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  if (episode.isPending && episode.data === undefined) {
    return (
      <CenteredState>
        <LoadingIndicator accessibilityLabel="결과 불러오는 중" />
      </CenteredState>
    );
  }

  if (episode.isError && episode.data === undefined) {
    return (
      <CenteredAction
        actionLabel="다시 시도"
        message="결과를 불러오지 못했어요."
        onPress={retry}
      />
    );
  }

  if (!episode.data) {
    return (
      <CenteredAction
        actionLabel="에피소드 목록으로"
        message="에피소드를 찾을 수 없어요."
        onPress={goBack}
      />
    );
  }

  return <EpisodeResult episode={episode.data} />;
}
