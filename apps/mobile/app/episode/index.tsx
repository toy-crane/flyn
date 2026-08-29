import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";

import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { useEpisodeSession } from "@/features/episode/query/episode-session";
import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { useStoryRefresh } from "@/features/story/query/story";
import { EpisodeLoadingScreen } from "@/screens/episode/episode-loading-screen";
import { EpisodeScreen } from "@/screens/episode/episode-screen";
import { EpisodeUnavailableScreen } from "@/screens/episode/episode-unavailable-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default function EpisodeRoute() {
  const { background } = useAppTheme();
  const { session } = useAuthSession();
  const params = useLocalSearchParams<{
    episodeId?: string | string[];
  }>();
  const episodeId = firstParam(params.episodeId);
  const episode = useEpisodeSession(
    session?.user.id,
    session?.access_token,
    episodeId
  );
  const refreshStory = useStoryRefresh(session?.user.id);
  const playing = episode.data;
  const [isSettling, setIsSettling] = useState(false);
  const [startingNextEpisodeId, setStartingNextEpisodeId] = useState<string>();
  const startingNextEpisode = useRef<string | undefined>(undefined);
  const isStartingNext =
    startingNextEpisodeId !== undefined && startingNextEpisodeId !== episodeId;
  const isRoutePending = isSettling || isStartingNext;
  const { isRetrying, retry: retryEpisode } = useVisibleRetry(episode.refetch);

  useEffect(
    () => () => {
      startingNextEpisode.current = undefined;
    },
    []
  );

  const leaveEpisode = useCallback(() => {
    if (!isRoutePending) {
      router.back();
    }
  }, [isRoutePending]);

  const openAsk = useCallback((id: string) => {
    router.push({ params: { id }, pathname: "/episode/ask" });
  }, []);

  useEffect(
    () => () => {
      refreshStory();
    },
    [refreshStory]
  );

  const startNextEpisode = useCallback(
    async (nextEpisodeId: string) => {
      const claimedEpisodeId = startingNextEpisode.current;
      if (
        isSettling ||
        (claimedEpisodeId !== undefined && claimedEpisodeId !== episodeId)
      ) {
        return;
      }

      // The ref claims the action before React renders the pending state, so
      // two presses in one frame still start only one refresh.
      startingNextEpisode.current = nextEpisodeId;
      setStartingNextEpisodeId(nextEpisodeId);

      try {
        await refreshStory();
        if (startingNextEpisode.current !== nextEpisodeId) {
          return;
        }

        router.replace({
          params: { episodeId: nextEpisodeId },
          pathname: "/episode",
        });
      } catch {
        if (startingNextEpisode.current === nextEpisodeId) {
          startingNextEpisode.current = undefined;
          setStartingNextEpisodeId(undefined);
        }
      }
    },
    [episodeId, isSettling, refreshStory]
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
                headerTransparent: true,
                scrollEdgeEffects: { top: "soft" },
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
          isStartingNext={isStartingNext}
          key={playing.episode.episodeId}
          onLeave={leaveEpisode}
          onOpenAsk={openAsk}
          onSettlingChange={setIsSettling}
          onStartNext={startNextEpisode}
          readOnly={playing.readOnly}
          situation={playing.episode.situation}
          situationEmoji={playing.episode.situationEmoji}
        />
      ) : null}
      {!playing && episode.isPending && !(episode.isError || isRetrying) ? (
        <EpisodeLoadingScreen />
      ) : null}
      {!playing && (episode.isError || isRetrying) ? (
        <EpisodeUnavailableScreen
          isRetrying={isRetrying}
          onRetry={retryEpisode}
        />
      ) : null}
      <Stack.Toolbar placement="left">
        <Stack.Toolbar.Button
          accessibilityLabel={episodeLabels.back}
          disabled={isRoutePending}
          icon={toolbarIcon("back")}
          onPress={leaveEpisode}
        />
      </Stack.Toolbar>
    </>
  );
}
