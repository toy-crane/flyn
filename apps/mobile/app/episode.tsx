import { router, Stack } from "expo-router";
import { useEffect, useState } from "react";
import { Platform } from "react-native";

import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import type { NextEpisode } from "@/features/episode/api/season";
import { useSeason, useSeasonRefresh } from "@/features/episode/query/season";
import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { EpisodeScreen } from "@/screens/episode/episode-screen";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function leaveEpisode() {
  router.back();
}

/**
 * 이 화면이 어떤 화를 여는지는 열리는 순간에 정해지고 그 뒤로 바뀌지 않는다.
 *
 * 시즌 진행은 화가 끝나면 달라진다. 그 값을 그대로 따라가면 마무리 화면을 보고
 * 있는 동안 헤더의 이름이 다음 화로 바뀐다. 처음 받은 화를 붙잡아 두면 지금
 * 보고 있는 화면과 이름이 어긋나지 않는다.
 */
function usePlayingEpisode(): NextEpisode | undefined {
  const { session } = useAuthSession();
  const season = useSeason(session?.user.id, session?.access_token);
  const [playing, setPlaying] = useState<NextEpisode | undefined>(undefined);
  const next = season.data?.next;

  useEffect(() => {
    if (playing === undefined && next) {
      setPlaying(next);
    }
  }, [next, playing]);

  return playing;
}

export default function EpisodeRoute() {
  const { background } = useAppTheme();
  const { session } = useAuthSession();
  const refreshSeason = useSeasonRefresh(session?.user.id);
  const playing = usePlayingEpisode();

  /**
   * 다음 화로 넘어가는 것은 이 화면을 새로 여는 일이다. 자리에서 상태만
   * 되돌리면 지난 화의 목록 위치가 남아 첫 장면이 화면 밖에 그려진다. 경로를
   * 갈아 끼우면 홈에서 처음 열 때와 똑같은 길을 지난다.
   *
   * 진행을 먼저 다시 읽는다. 새 화면은 그때 받은 화를 열므로, 방금 끝낸 화를
   * 한 번 더 열려다 거절당하는 일이 없다.
   */
  async function startNextEpisode() {
    await refreshSeason();
    router.replace("/episode");
  }

  // 끝낸 화는 홈이 곧 보여 줄 기록이다. 나가는 길에 진행을 다시 읽어 두면
  // 홈이 지난 상태로 잠깐 서 있지 않는다.
  function leaveWithFreshSeason() {
    refreshSeason();
    leaveEpisode();
  }

  return (
    <>
      <Stack.Screen
        // 헤더는 이름과 나가는 길이 전부다. 장면은 늘 끝에 있어서 접히는 큰
        // 제목이 펼쳐질 자리가 없다. iOS는 장면이 헤더 뒤로 지나가게 두고,
        // Android는 앱 바에 테마 배경을 유지한다.
        options={{
          headerLargeTitleEnabled: false,
          headerShown: true,
          title: playing ? playing.title : "",
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
      <EpisodeScreen
        episode={playing?.episode}
        onLeave={leaveWithFreshSeason}
        onStartNext={startNextEpisode}
        situation={playing?.situation}
        situationEmoji={playing?.situationEmoji}
      />
      {/*
        The toolbar replaces the stack's own back button, so this one carries
        the name a screen reader reads.
      */}
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
