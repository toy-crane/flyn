import { router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { useEpisodeSession } from "@/features/episode/query/episode-session";
import { useStoryRefresh } from "@/features/episode/query/story";
import { episodeLabels } from "@/features/episode/ui/episode-labels";
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
  const { isRetrying, retry: retryEpisode } = useVisibleRetry(episode.refetch);
  const leaveEpisode = useCallback(() => {
    if (!isSettling) {
      router.back();
    }
  }, [isSettling]);

  useEffect(
    () => () => {
      refreshStory();
    },
    [refreshStory]
  );

  async function startNextEpisode(nextEpisodeId: string) {
    if (isSettling) {
      return;
    }

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
          key={playing.episode.episodeId}
          onLeave={leaveEpisode}
          onSettlingChange={setIsSettling}
          onStartNext={startNextEpisode}
          readOnly={playing.readOnly}
          situation={playing.episode.situation}
          situationEmoji={playing.episode.situationEmoji}
        />
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
          disabled={isSettling}
          icon={toolbarIcon("back")}
          onPress={leaveEpisode}
        />
      </Stack.Toolbar>
    </>
  );
}
