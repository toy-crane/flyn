import { Stack } from "expo-router";

import { getAskSheetOptions } from "@/core/navigation/ask-sheet";
import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { EpisodeAsksProvider } from "@/features/episode/state/episode-asks";
import { correctionLabels } from "@/features/episode/ui/episode-labels";

/**
 * 한 화와 그 화에서 연 물어보기.
 *
 * 스택을 루트가 아니라 여기에 두면 물어보는 자리가 이 에피소드 안의 화면이
 * 된다. 물어본 말이 얼마나 사는지도 그것으로 정해진다: 에피소드를 나가거나
 * 로그아웃하면 이 층이 통째로 내려가고 열어 둔 대화도 함께 사라진다.
 */
export default function EpisodeLayout() {
  const { background } = useAppTheme();
  const { session } = useAuthSession();

  return (
    <EpisodeAsksProvider accessToken={session?.access_token}>
      <Stack screenOptions={{ contentStyle: { backgroundColor: background } }}>
        <Stack.Screen name="index" />
        <Stack.Screen
          name="ask"
          options={getAskSheetOptions(background, correctionLabels.askTitle)}
        />
      </Stack>
    </EpisodeAsksProvider>
  );
}
