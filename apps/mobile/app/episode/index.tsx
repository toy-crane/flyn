import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";

import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { useEpisodeSession } from "@/features/episode/query/episode-session";
import type { EpisodeNextUp } from "@/features/episode/state/episode-next-up";
import { useEpisodeReview } from "@/features/episode/state/episode-review";
import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { useStoryDetail, useStoryRefresh } from "@/features/story/query/story";
import { EpisodeLoadingScreen } from "@/screens/episode/episode-loading-screen";
import { EpisodeScreen } from "@/screens/episode/episode-screen";
import { EpisodeUnavailableScreen } from "@/screens/episode/episode-unavailable-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * 한 화의 대화.
 *
 * 회차를 들고 오면 저장된 대화를 읽어 그 자리부터 잇는다. 회차 없이 스토리만
 * 들고 오면 새 대화라, 읽을 것이 없으므로 상세에서 1화의 제목과 상황 설명만
 * 가져와 첫 장면을 요청한다. 회차는 사용자가 처음 말할 때 서버가 만들고, 그때
 * 이 화면이 회차를 받아 다음 화까지 들고 간다.
 */
export default function EpisodeRoute() {
  const { background } = useAppTheme();
  const { session } = useAuthSession();
  const params = useLocalSearchParams<{
    episodeId?: string | string[];
    storyPlayId?: string | string[];
    storyId?: string | string[];
  }>();
  const episodeId = firstParam(params.episodeId);
  const paramStoryPlayId = firstParam(params.storyPlayId);
  const paramStoryId = firstParam(params.storyId);
  // 서버가 방금 만든 회차. 다음 화로 넘어갈 때 이 값을 들고 간다.
  const [startedStoryPlayId, setStartedStoryPlayId] = useState<string>();
  const storyPlayId = paramStoryPlayId ?? startedStoryPlayId;

  const episode = useEpisodeSession(
    session?.user.id,
    session?.access_token,
    paramStoryPlayId,
    episodeId
  );
  // 새 대화는 저장된 것이 없다. 화면이 그릴 제목과 상황 설명은 상세에서 온다.
  const detail = useStoryDetail(
    session?.user.id,
    session?.access_token,
    paramStoryPlayId === undefined ? paramStoryId : undefined
  );
  const refreshStory = useStoryRefresh(session?.user.id);
  const { openReview } = useEpisodeReview();
  const { isRetrying, retry: retryEpisode } = useVisibleRetry(
    paramStoryPlayId === undefined ? detail.refetch : episode.refetch
  );

  /** 이 화면이 그리는 한 화. 이어가는 회차와 새 대화가 같은 모양으로 온다. */
  const playing = useMemo(() => {
    if (paramStoryPlayId !== undefined) {
      return episode.data;
    }

    const first = detail.data?.episodes[0];

    if (!(first && detail.data)) {
      return;
    }

    return {
      ending: undefined,
      episode: first,
      expressionResults: [],
      messages: [],
      nextUp: undefined,
      readOnly: false,
      saved: undefined,
      story: { id: detail.data.storyId, title: detail.data.title },
    };
  }, [detail.data, episode.data, paramStoryPlayId]);

  const storyId = paramStoryId ?? detail.data?.storyId;
  const isPending =
    paramStoryPlayId === undefined ? detail.isPending : episode.isPending;
  const isError =
    paramStoryPlayId === undefined ? detail.isError : episode.isError;

  const leaveEpisode = useCallback(() => router.back(), []);

  const reviewExpressions = useCallback(
    (nextUp: EpisodeNextUp | undefined) => {
      if (!(playing && storyPlayId)) {
        return;
      }
      openReview({
        episode: playing.episode,
        nextUp,
        story: playing.story,
        storyPlayId,
      });
      router.push({
        params: { episodeId: playing.episode.episodeId, storyPlayId },
        pathname: "/episode/review",
      });
    },
    [openReview, playing, storyPlayId]
  );

  const openAsk = useCallback((id: string) => {
    router.push({ params: { id }, pathname: "/episode/ask" });
  }, []);

  useEffect(
    () => () => {
      refreshStory();
    },
    [refreshStory]
  );

  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonMenuEnabled: false,
          headerLargeTitleEnabled: false,
          headerShown: true,
          title: playing?.episode.title ?? "",
          ...(Platform.OS === "ios"
            ? {
                headerShadowVisible: false,
                headerStyle: { backgroundColor: background },
                headerTransparent: false,
                scrollEdgeEffects: { top: "hidden" },
              }
            : {
                headerStyle: { backgroundColor: background },
              }),
        }}
      />
      {playing ? (
        <EpisodeScreen
          episodeId={playing.episode.episodeId}
          initialMessages={playing.messages}
          key={`${paramStoryPlayId ?? paramStoryId}:${playing.episode.episodeId}`}
          onOpenAsk={openAsk}
          onReview={reviewExpressions}
          onStoryPlayStarted={setStartedStoryPlayId}
          readOnly={playing.readOnly}
          recordedEnding={playing.ending}
          recordedNextUp={playing.nextUp}
          // 담아 둔 표현은 끝난 화에서도 그대로 돌아온다. 읽기 전용으로 다시 열어
          // 마음에 드는 대사를 담는 것이 이 기능이 하려는 일이다.
          savedExpressions={playing.saved}
          savedResults={playing.expressionResults}
          situation={playing.episode.situation}
          situationEmoji={playing.episode.situationEmoji}
          storyId={storyId}
          storyPlayId={storyPlayId}
        />
      ) : null}
      {!playing && isPending && !(isError || isRetrying) ? (
        <EpisodeLoadingScreen />
      ) : null}
      {!playing && (isError || isRetrying) ? (
        <EpisodeUnavailableScreen
          isRetrying={isRetrying}
          onRetry={retryEpisode}
        />
      ) : null}
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          accessibilityLabel={episodeLabels.back}
          icon={toolbarIcon("back")}
          onPress={leaveEpisode}
        />
      </Stack.Toolbar>
    </>
  );
}
