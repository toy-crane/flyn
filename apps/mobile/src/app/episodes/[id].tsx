import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { type ReactNode, useCallback } from "react";
import {
  Pressable,
  type PressableStateCallbackType,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { ChatConversation } from "../../components/chat/chat-conversation";
import { EpisodeContextCard } from "../../components/episode/episode-context-card";
import { GoalDock } from "../../components/episode/goal-dock";
import { LoadingIndicator } from "../../components/feedback/loading-indicator";
import { HeaderTitles } from "../../components/navigation/header-titles";
import {
  currentGoalPosition,
  type Episode,
  type EpisodeMessage,
  usedTurns,
} from "../../lib/episodes";
import type { MessageFeedback } from "../../lib/message-feedback";
import { useEpisodeConversation } from "../../lib/use-episode-conversation";
import {
  useEpisode,
  useEpisodeFeedback,
  useEpisodeMessages,
} from "../../lib/use-episodes";
import { useUserId } from "../../lib/user-id";
import { useTheme } from "../../theme/app-theme";
import { spacing } from "../../theme/tokens";

const styles = StyleSheet.create({
  action: {
    borderRadius: 22,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  message: {
    textAlign: "center",
  },
});

/** 헤더가 시나리오와 역할을 나른다. 상황 설명은 상황 카드 하나만 말한다. */
function roleSubtitle(episode: Episode) {
  return `${episode.partner_role} · ${episode.user_role}`;
}

function RoleplaySession({
  episode,
  feedback,
  messages,
  userId,
}: {
  episode: Episode;
  feedback: MessageFeedback[];
  messages: EpisodeMessage[];
  userId: string;
}) {
  const router = useRouter();
  // 목표는 판정이 스트림으로 알려 오는 대로 바뀐다. 저장이 다시 읽히기를
  // 기다리지 않아야 달성 즉시 다음 목표로 넘어간다.
  const { chat, goals } = useEpisodeConversation(
    episode,
    userId,
    messages,
    feedback
  );
  // 표시를 누르면 첨삭 시트 하나가 열린다. 시트가 읽을 판정은 이미 캐시에 있다.
  const openFeedback = useCallback(
    (messageId: string) => {
      router.push({
        params: { episodeId: episode.id, messageId },
        pathname: "/episodes/feedback",
      });
    },
    [episode.id, router]
  );

  return (
    <ChatConversation
      chat={chat}
      dock={
        <GoalDock
          currentPosition={currentGoalPosition(goals)}
          goals={goals}
          turnLimit={episode.turn_limit}
          usedTurns={usedTurns(messages)}
        />
      }
      listHeader={
        <EpisodeContextCard description={episode.scenario_description} />
      }
      onMarkPress={openFeedback}
      // 한글 입력은 막힐 때 쓰는 비상구다. 문구가 앞세우지 않는다.
      placeholder="영어로 써 보세요"
    />
  );
}

function CenteredAction({
  actionLabel,
  message,
  onPress,
}: {
  actionLabel: string;
  message: string;
  onPress: () => void;
}) {
  const { colors, typography } = useTheme();
  const actionStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
    ],
    [colors.primary]
  );

  return (
    <View style={[styles.centered, { backgroundColor: colors.background }]}>
      <Text style={[styles.message, typography.body, { color: colors.text }]}>
        {message}
      </Text>
      <Pressable
        accessibilityLabel={actionLabel}
        accessibilityRole="button"
        onPress={onPress}
        style={actionStyle}
      >
        <Text style={[typography.action, { color: colors.onPrimary }]}>
          {actionLabel}
        </Text>
      </Pressable>
    </View>
  );
}

export default function EpisodeConversationScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const router = useRouter();
  const userId = useUserId();
  const episodeId = Array.isArray(params.id)
    ? (params.id[0] ?? "")
    : (params.id ?? "");
  const episode = useEpisode(episodeId);
  const messages = useEpisodeMessages(episodeId);
  // 판정은 대화를 막지 않는다. 늦게 와도 표시만 나중에 채워진다.
  const feedback = useEpisodeFeedback(episodeId);

  const retry = useCallback(() => {
    episode.refetch();
    messages.refetch();
  }, [episode, messages]);
  const goBack = useCallback(() => {
    router.back();
  }, [router]);

  let content: ReactNode;
  if (
    (episode.isPending && episode.data === undefined) ||
    (messages.isPending && messages.data === undefined)
  ) {
    content = (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <LoadingIndicator accessibilityLabel="대화 불러오는 중" />
      </View>
    );
  } else if (
    (episode.isError && episode.data === undefined) ||
    (messages.isError && messages.data === undefined)
  ) {
    content = (
      <CenteredAction
        actionLabel="다시 시도"
        message="대화를 불러오지 못했어요."
        onPress={retry}
      />
    );
  } else if (episodeId && episode.data) {
    content = (
      <RoleplaySession
        episode={episode.data}
        feedback={feedback.data ?? []}
        messages={messages.data ?? []}
        userId={userId}
      />
    );
  } else {
    content = (
      <CenteredAction
        actionLabel="에피소드 목록으로"
        message="에피소드를 찾을 수 없어요."
        onPress={goBack}
      />
    );
  }

  return (
    <>
      <Stack.Title asChild>
        <HeaderTitles
          subtitle={episode.data ? roleSubtitle(episode.data) : null}
          title={episode.data?.scenario_title ?? "대화"}
        />
      </Stack.Title>
      {content}
    </>
  );
}
