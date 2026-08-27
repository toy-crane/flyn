import { router, Stack } from "expo-router";
import { Platform } from "react-native";

import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { episodeLabels } from "@/features/episode/ui/episode-labels";
import { EpisodeScreen } from "@/screens/episode/episode-screen";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function leaveEpisode() {
  router.back();
}

/**
 * 다시 시작은 이 화면을 새로 여는 일이다. 자리에서 상태만 되돌리면 지난
 * 에피소드의 목록 위치가 남아 첫 장면이 화면 밖에 그려진다. 경로를 갈아 끼우면
 * 홈에서 처음 열 때와 똑같은 길을 지난다.
 */
function restartEpisode() {
  router.replace("/episode");
}

export default function EpisodeRoute() {
  const { background } = useAppTheme();

  return (
    <>
      <Stack.Screen
        // 헤더는 이름과 나가는 길이 전부다. 장면은 늘 끝에 있어서 접히는 큰
        // 제목이 펼쳐질 자리가 없다. iOS는 장면이 헤더 뒤로 지나가게 두고,
        // Android는 앱 바에 테마 배경을 유지한다.
        options={{
          headerLargeTitleEnabled: false,
          headerShown: true,
          title: episodeLabels.name,
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
      <EpisodeScreen onLeave={leaveEpisode} onRestart={restartEpisode} />
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
