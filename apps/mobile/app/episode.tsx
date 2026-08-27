import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect } from "react";
import { Platform } from "react-native";

import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { useEpisodeSession } from "@/features/episode/query/episode-session";
import { useStoryRefresh } from "@/features/episode/query/story";
import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { EpisodeScreen } from "@/screens/episode/episode-screen";
import { EpisodeUnavailableScreen } from "@/screens/episode/episode-unavailable-screen";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function leaveEpisode() {
  router.back();
}

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
  const { refetch } = episode;
  const retryEpisode = useCallback(() => {
    refetch();
  }, [refetch]);

  useEffect(
    () => () => {
      refreshStory();
    },
    [refreshStory]
  );

  async function startNextEpisode(nextEpisodeId: string) {
    await refreshStory();
    router.replace({
      params: { episodeId: nextEpisodeId },
      pathname: "/episode",
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
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
          key={playing.episode.episodeId}
          onLeave={leaveEpisode}
          onStartNext={startNextEpisode}
          readOnly={playing.readOnly}
          situation={playing.episode.situation}
          situationEmoji={playing.episode.situationEmoji}
        />
      ) : null}
      {!playing && episode.isError ? (
        <EpisodeUnavailableScreen
          isRetrying={episode.isFetching}
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
