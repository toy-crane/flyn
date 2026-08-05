import { LegendList } from "@legendapp/list/react-native";
import { Stack, useIsFocused, useRouter } from "expo-router";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import {
  Alert,
  type ColorValue,
  Pressable,
  type PressableStateCallbackType,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { LoadingIndicator } from "../components/feedback/loading-indicator";
import { RNSymbol } from "../components/symbols/rn-symbol";
import {
  achievedGoalCount,
  type Episode,
  isEpisodeActive,
  listedEpisodes,
  resumeEpisode,
} from "../lib/episodes";
import { useDeleteEpisode, useEpisodes } from "../lib/use-episodes";
import { useUserId } from "../lib/user-id";
import { useTheme } from "../theme/app-theme";
import { spacing } from "../theme/tokens";

const styles = StyleSheet.create({
  action: {
    alignSelf: "center",
    borderRadius: 22,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  card: {
    borderRadius: 16,
    marginBottom: spacing.xl,
    padding: spacing.md,
  },
  cardAction: {
    alignItems: "center",
    borderRadius: 12,
    height: 44,
    justifyContent: "center",
    marginTop: spacing.sm,
  },
  centered: {
    alignItems: "center",
    flex: 1,
    gap: spacing.sm,
    justifyContent: "center",
    paddingHorizontal: spacing.xxl,
  },
  dot: {
    borderRadius: 4,
    height: 8,
    width: 8,
  },
  dotSlot: {
    width: 8,
  },
  emptyAction: {
    marginTop: spacing.xs,
  },
  emptyDescription: {
    textAlign: "center",
  },
  errorMessage: {
    textAlign: "center",
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
  },
  list: {
    paddingBottom: spacing.xxl,
  },
  loading: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  row: {
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    minHeight: 60,
    paddingVertical: spacing.sm,
  },
  rowContent: {
    flex: 1,
  },
  screen: {
    flex: 1,
  },
  sectionTitle: {
    marginBottom: spacing.xs,
    marginHorizontal: spacing.xxs,
  },
  supporting: {
    marginTop: 2,
  },
});

const DATE_FORMAT = new Intl.DateTimeFormat("ko-KR", {
  day: "numeric",
  month: "long",
});
const DAY_MS = 24 * 60 * 60 * 1000;

function startOfDay(value: Date) {
  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate()
  ).getTime();
}

/** 끝난 에피소드의 보조 줄 앞머리. 오늘·어제·n일 전, 그 뒤로는 날짜다. */
export function formatEpisodeDay(value: string, now = new Date()) {
  const date = new Date(value);
  const days = Math.round((startOfDay(now) - startOfDay(date)) / DAY_MS);

  if (days <= 0) {
    return "오늘";
  }

  if (days === 1) {
    return "어제";
  }

  if (days < 7) {
    return `${days}일 전`;
  }

  return DATE_FORMAT.format(date);
}

function goalProgress(episode: Episode) {
  return `목표 ${achievedGoalCount(episode)}/${episode.episode_goals.length}`;
}

function episodeKey(episode: Episode) {
  return episode.id;
}

/**
 * 가장 최근에 진행 중인 에피소드 하나. 카드에 오른 에피소드는 아래 목록에
 * 다시 나오지 않는다.
 */
function ResumeCard({
  episode,
  onOpen,
}: {
  episode: Episode;
  onOpen: (episode: Episode) => void;
}) {
  const { colors, typography } = useTheme();
  const handleOpen = useCallback(() => {
    onOpen(episode);
  }, [episode, onOpen]);
  const actionStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.cardAction,
      { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
    ],
    [colors.primary]
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <Text style={[typography.caption, { color: colors.accent }]}>
        이어서 하기
      </Text>
      <Text
        numberOfLines={2}
        style={[typography.body, { color: colors.text, fontWeight: "600" }]}
      >
        {episode.scenario_title}
      </Text>
      <Text
        style={[
          styles.supporting,
          typography.supporting,
          { color: colors.secondaryText },
        ]}
      >
        {goalProgress(episode)}
      </Text>
      <Pressable
        accessibilityLabel="대화 이어가기"
        accessibilityRole="button"
        onPress={handleOpen}
        style={actionStyle}
      >
        <Text style={[typography.action, { color: colors.onPrimary }]}>
          대화 이어가기
        </Text>
      </Pressable>
    </View>
  );
}

function EpisodeRow({
  disclosureColor,
  episode,
  onDelete,
  onOpen,
}: {
  disclosureColor: ColorValue;
  episode: Episode;
  onDelete: (episode: Episode) => void;
  onOpen: (episode: Episode) => void;
}) {
  const { colors, typography } = useTheme();
  const active = isEpisodeActive(episode);
  const handleDelete = useCallback(() => {
    onDelete(episode);
  }, [episode, onDelete]);
  const handleOpen = useCallback(() => {
    onOpen(episode);
  }, [episode, onOpen]);
  const rowStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.row,
      { borderColor: colors.separator },
      pressed && { backgroundColor: colors.surface },
    ],
    [colors.separator, colors.surface]
  );

  return (
    <Pressable
      accessibilityHint="길게 누르면 삭제할 수 있어요"
      accessibilityLabel={episode.scenario_title}
      accessibilityRole="button"
      onLongPress={handleDelete}
      onPress={handleOpen}
      style={rowStyle}
    >
      {active ? (
        <View
          style={[styles.dot, { backgroundColor: colors.accent }]}
          testID={`episode-active-dot-${episode.id}`}
        />
      ) : (
        <View style={styles.dotSlot} />
      )}
      <View style={styles.rowContent}>
        <Text
          numberOfLines={1}
          style={[
            typography.supporting,
            { color: colors.text, fontWeight: active ? "600" : "400" },
          ]}
        >
          {episode.scenario_title}
        </Text>
        <Text
          style={[
            styles.supporting,
            typography.caption,
            { color: colors.secondaryText },
          ]}
          testID={`episode-supporting-${episode.id}`}
        >
          {active
            ? goalProgress(episode)
            : `${formatEpisodeDay(episode.updated_at)} · ${goalProgress(episode)}`}
        </Text>
      </View>
      <RNSymbol color={disclosureColor} symbol="disclosure" />
    </Pressable>
  );
}

function EmptyEpisodes({ onCreate }: { onCreate: () => void }) {
  const { colors, typography } = useTheme();
  const actionStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      styles.emptyAction,
      { backgroundColor: colors.primary, opacity: pressed ? 0.7 : 1 },
    ],
    [colors.primary]
  );

  return (
    <View style={styles.centered}>
      <Text style={[typography.title, { color: colors.text }]}>
        아직 만든 에피소드가 없어요
      </Text>
      <Text
        style={[
          styles.emptyDescription,
          typography.supporting,
          { color: colors.secondaryText },
        ]}
      >
        취향과 영어 수준에 맞는 상황을 만들어 드릴게요.
      </Text>
      <Pressable
        accessibilityLabel="첫 에피소드 만들기"
        accessibilityRole="button"
        onPress={onCreate}
        style={actionStyle}
      >
        <Text style={[typography.action, { color: colors.onPrimary }]}>
          첫 에피소드 만들기
        </Text>
      </Pressable>
    </View>
  );
}

export default function HomeScreen() {
  const { colors, typography } = useTheme();
  const isFocused = useIsFocused();
  const router = useRouter();
  const userId = useUserId();
  const episodes = useEpisodes(userId);
  const deleteEpisode = useDeleteEpisode(userId);
  const [manualRefreshing, setManualRefreshing] = useState(false);

  useEffect(() => {
    if (!isFocused) {
      setManualRefreshing(false);
    }
  }, [isFocused]);

  const openSettings = useCallback(() => {
    router.push("/settings");
  }, [router]);

  const createEpisode = useCallback(() => {
    router.push("/episodes/new");
  }, [router]);

  const openEpisode = useCallback(
    (episode: Episode) => {
      router.push(`/episodes/${episode.id}`);
    },
    [router]
  );

  const confirmDelete = useCallback(
    (episode: Episode) => {
      Alert.alert(
        "에피소드를 지울까요?",
        `"${episode.scenario_title}"의 목표도 함께 사라져요.`,
        [
          { style: "cancel", text: "취소" },
          {
            onPress: () => {
              deleteEpisode.mutate(episode.id, {
                onError: () => {
                  Alert.alert(
                    "에피소드를 지우지 못했어요",
                    "잠시 후 다시 시도해 주세요."
                  );
                },
              });
            },
            style: "destructive",
            text: "삭제",
          },
        ]
      );
    },
    [deleteEpisode]
  );

  const renderEpisode = useCallback(
    ({ item }: { item: Episode }) => (
      <EpisodeRow
        disclosureColor={colors.secondaryText}
        episode={item}
        onDelete={confirmDelete}
        onOpen={openEpisode}
      />
    ),
    [colors.secondaryText, confirmDelete, openEpisode]
  );
  const retryEpisodes = useCallback(() => {
    episodes.refetch();
  }, [episodes.refetch]);
  const refreshEpisodes = useCallback(async () => {
    setManualRefreshing(true);

    try {
      await episodes.refetch();
    } finally {
      setManualRefreshing(false);
    }
  }, [episodes.refetch]);
  const retryStyle = useCallback(
    ({ pressed }: PressableStateCallbackType) => [
      styles.action,
      {
        backgroundColor: colors.primary,
        opacity: pressed || episodes.isFetching ? 0.7 : 1,
      },
    ],
    [colors.primary, episodes.isFetching]
  );

  const data = episodes.data ?? [];
  const resume = resumeEpisode(data);
  const rest = listedEpisodes(data);

  let content: ReactNode;
  if (episodes.isPending && !episodes.data) {
    content = (
      <View style={styles.loading}>
        <LoadingIndicator accessibilityLabel="에피소드 불러오는 중" />
      </View>
    );
  } else if (episodes.isError && !episodes.data) {
    content = (
      <View style={styles.centered}>
        <Text
          style={[styles.errorMessage, typography.body, { color: colors.text }]}
        >
          에피소드를 불러오지 못했어요.
        </Text>
        <Pressable
          accessibilityLabel="다시 시도"
          accessibilityRole="button"
          disabled={episodes.isFetching}
          onPress={retryEpisodes}
          style={retryStyle}
        >
          <Text style={[typography.action, { color: colors.onPrimary }]}>
            다시 시도
          </Text>
        </Pressable>
      </View>
    );
  } else if (data.length === 0) {
    content = <EmptyEpisodes onCreate={createEpisode} />;
  } else {
    content = (
      <LegendList
        contentContainerStyle={styles.list}
        contentInsetAdjustmentBehavior="automatic"
        data={rest}
        keyExtractor={episodeKey}
        ListHeaderComponent={
          <View style={styles.header}>
            {resume ? (
              <ResumeCard episode={resume} onOpen={openEpisode} />
            ) : null}
            <Text
              style={[
                styles.sectionTitle,
                typography.caption,
                { color: colors.secondaryText },
              ]}
            >
              모든 에피소드
            </Text>
          </View>
        }
        maintainVisibleContentPosition
        recycleItems
        refreshControl={
          <RefreshControl
            onRefresh={refreshEpisodes}
            refreshing={isFocused && manualRefreshing}
            testID="episode-list-refresh-control"
            tintColor={colors.loadingIndicator}
          />
        }
        renderItem={renderEpisode}
      />
    );
  }

  return (
    <>
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="설정"
          icon="gearshape"
          onPress={openSettings}
        />
        {data.length > 0 ? (
          <Stack.Toolbar.Button
            accessibilityLabel="새 에피소드"
            icon="square.and.pencil"
            onPress={createEpisode}
          />
        ) : null}
      </Stack.Toolbar>

      <View style={[styles.screen, { backgroundColor: colors.background }]}>
        {content}
      </View>
    </>
  );
}
