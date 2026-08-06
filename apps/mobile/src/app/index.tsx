import Ionicons from "@expo/vector-icons/Ionicons";
import { LegendList } from "@legendapp/list/react-native";
import { Stack, useIsFocused, useRouter } from "expo-router";
import {
  Button,
  Card,
  PressableFeedback,
  Separator,
  Spinner,
  Typography,
  useThemeColor,
} from "heroui-native";
import { type ReactNode, useCallback, useEffect, useState } from "react";
import { Alert, RefreshControl, View } from "react-native";
import {
  achievedGoalCount,
  type Episode,
  isEpisodeActive,
  listedEpisodes,
  resumeEpisode,
} from "../lib/episodes";
import { useDeleteEpisode, useEpisodes } from "../lib/use-episodes";
import { useUserId } from "../lib/user-id";

/**
 * 홈은 HeroUI가 그리는 브랜드 층이다
 * (docs/decisions/self-contained-native-ui-boundaries.md의 배정표). 헤더 타이틀,
 * 설정·새 에피소드 toolbar는 계속 셸이 소유한다.
 *
 * 가상 목록만 `@legendapp/list`로 남는다 — HeroUI에 대응물이 없는 능력이다.
 * 그때도 간격은 Uniwind 토큰이 준다(docs/decisions/uniwind-css-theme.md).
 */

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

/** 화면이 설 수 없거나 아직 아무것도 없을 때 쓰는 한 프레임. */
function CenteredState({ children }: { children: ReactNode }) {
  return (
    <View className="flex-1 items-center justify-center gap-3 px-8">
      {children}
    </View>
  );
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
  const handleOpen = useCallback(() => {
    onOpen(episode);
  }, [episode, onOpen]);

  return (
    <Card className="mb-6 gap-3">
      <Card.Body className="gap-1">
        <Typography className="text-accent" type="body-xs" weight="semibold">
          이어서 하기
        </Typography>
        <Card.Title numberOfLines={2}>{episode.scenario_title}</Card.Title>
        <Typography color="muted" type="body-sm">
          {goalProgress(episode)}
        </Typography>
      </Card.Body>
      {/* CTA는 부모 정렬에 기대지 않고 스스로 가로를 채운다. */}
      <Card.Footer>
        <Button className="w-full" onPress={handleOpen}>
          <Button.Label>대화 이어가기</Button.Label>
        </Button>
      </Card.Footer>
    </Card>
  );
}

/**
 * 행은 `Card`가 아니라 전체 폭 목록 행이다 — 감싸는 surface 없이 구분선으로만
 * 나뉜다. press 피드백은 HeroUI가 소유하므로 `PressableFeedback`을 그대로 쓰고
 * 화면이 자체 모션을 겹치지 않는다(docs/decisions/native-motion.md).
 */
function EpisodeRow({
  disclosureColor,
  episode,
  onDelete,
  onOpen,
}: {
  disclosureColor: string;
  episode: Episode;
  onDelete: (episode: Episode) => void;
  onOpen: (episode: Episode) => void;
}) {
  const active = isEpisodeActive(episode);
  const handleDelete = useCallback(() => {
    onDelete(episode);
  }, [episode, onDelete]);
  const handleOpen = useCallback(() => {
    onOpen(episode);
  }, [episode, onOpen]);

  return (
    <View>
      <PressableFeedback
        accessibilityHint="길게 누르면 삭제할 수 있어요"
        accessibilityLabel={episode.scenario_title}
        accessibilityRole="button"
        className="min-h-15 flex-row items-center gap-3 px-4 py-3"
        onLongPress={handleDelete}
        onPress={handleOpen}
      >
        {/* 진행 중 표시. 점이 없어도 자리는 남아 제목이 흔들리지 않는다. */}
        <View className="w-2">
          {active ? (
            <View
              className="size-2 rounded-full bg-accent"
              testID={`episode-active-dot-${episode.id}`}
            />
          ) : null}
        </View>
        <View className="flex-1">
          <Typography.Paragraph
            truncate
            type="body-sm"
            weight={active ? "semibold" : "normal"}
          >
            {episode.scenario_title}
          </Typography.Paragraph>
          <Typography.Paragraph
            color="muted"
            testID={`episode-supporting-${episode.id}`}
            type="body-xs"
          >
            {active
              ? goalProgress(episode)
              : `${formatEpisodeDay(episode.updated_at)} · ${goalProgress(episode)}`}
          </Typography.Paragraph>
        </View>
        {/* 브랜드 층의 아이콘은 Ionicons를 의미 토큰으로 칠한다
            (docs/decisions/apple-hig-with-app-theme.md). 행 전체가 이미 접근성
            이름을 가지므로 셰브론은 트리에서 숨긴다. */}
        <Ionicons
          accessibilityElementsHidden
          color={disclosureColor}
          name="chevron-forward"
          size={16}
        />
      </PressableFeedback>
      <Separator className="mx-4" />
    </View>
  );
}

function EmptyEpisodes({ onCreate }: { onCreate: () => void }) {
  return (
    <CenteredState>
      <Typography.Heading align="center" type="h4">
        아직 만든 에피소드가 없어요
      </Typography.Heading>
      <Typography.Paragraph align="center" color="muted" type="body-sm">
        취향과 영어 수준에 맞는 상황을 만들어 드릴게요.
      </Typography.Paragraph>
      <Button className="mt-2" onPress={onCreate}>
        <Button.Label>첫 에피소드 만들기</Button.Label>
      </Button>
    </CenteredState>
  );
}

export default function HomeScreen() {
  const isFocused = useIsFocused();
  const router = useRouter();
  const userId = useUserId();
  const episodes = useEpisodes(userId);
  const deleteEpisode = useDeleteEpisode(userId);
  const [manualRefreshing, setManualRefreshing] = useState(false);
  /*
   * 최초 조회와 당겨서 새로고침은 둘 다 스스로 나타나는 수동형 진행이라 중립
   * 회색이다(docs/specs/neutral-loading-indicators/spec.md). 셰브론은 보조
   * 정보라 같은 약한 전경을 쓴다.
   */
  const neutral = useThemeColor("muted");

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

  // 끝난 에피소드는 이어서 할 것이 없다. 목록에서 열면 결과로 간다.
  const openEpisode = useCallback(
    (episode: Episode) => {
      if (isEpisodeActive(episode)) {
        router.push(`/episodes/${episode.id}`);
        return;
      }

      router.push({
        params: { episodeId: episode.id },
        pathname: "/episodes/result",
      });
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
        disclosureColor={neutral}
        episode={item}
        onDelete={confirmDelete}
        onOpen={openEpisode}
      />
    ),
    [confirmDelete, neutral, openEpisode]
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

  const data = episodes.data ?? [];
  const resume = resumeEpisode(data);
  const rest = listedEpisodes(data);

  let content: ReactNode;
  if (episodes.isPending && !episodes.data) {
    content = (
      <View className="flex-1 items-center justify-center">
        <Spinner accessibilityLabel="에피소드 불러오는 중" color={neutral} />
      </View>
    );
  } else if (episodes.isError && !episodes.data) {
    content = (
      <CenteredState>
        <Typography.Paragraph align="center">
          에피소드를 불러오지 못했어요.
        </Typography.Paragraph>
        <Button isDisabled={episodes.isFetching} onPress={retryEpisodes}>
          <Button.Label>다시 시도</Button.Label>
        </Button>
      </CenteredState>
    );
  } else if (data.length === 0) {
    content = <EmptyEpisodes onCreate={createEpisode} />;
  } else {
    content = (
      <LegendList
        contentInsetAdjustmentBehavior="automatic"
        data={rest}
        keyExtractor={episodeKey}
        // 마지막 행이 화면 바닥에 붙지 않게 띄운다. 목록 자체는 제네릭이라
        // 래핑하면 item 타입을 잃는다 — 여백은 RN View의 className이 준다.
        ListFooterComponent={<View className="h-8" />}
        ListHeaderComponent={
          <View className="px-4 pt-4">
            {resume ? (
              <ResumeCard episode={resume} onOpen={openEpisode} />
            ) : null}
            <Typography className="mx-1 mb-2" color="muted" type="body-xs">
              모든 에피소드
            </Typography>
          </View>
        }
        maintainVisibleContentPosition
        recycleItems
        refreshControl={
          <RefreshControl
            onRefresh={refreshEpisodes}
            refreshing={isFocused && manualRefreshing}
            testID="episode-list-refresh-control"
            tintColor={neutral}
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

      <View className="flex-1 bg-background">{content}</View>
    </>
  );
}
