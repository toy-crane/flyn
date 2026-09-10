import { Stack } from "expo-router";

import { getAskSheetOptions } from "@/core/navigation/ask-sheet";
import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { EpisodeAsksProvider } from "@/features/episode/state/episode-asks";
import { EpisodeReviewProvider } from "@/features/episode/state/episode-review";
import { EpisodeSavedExpressionsProvider } from "@/features/episode/state/saved-expressions";
import { correctionLabels } from "@/features/episode/ui/episode-labels";

/**
 * 한 화와 그 화에서 연 물어보기.
 *
 * 스택을 루트가 아니라 여기에 두면 물어보는 자리가 이 에피소드 안의 화면이
 * 된다. 물어본 말이 얼마나 사는지도 그것으로 정해진다: 에피소드를 나가거나
 * 로그아웃하면 이 층이 통째로 내려가고 열어 둔 대화도 함께 사라진다.
 *
 * 담아 둔 표현도 같은 이유로 여기 있다. 대화와 표현 돌아보기가 나란한 화면이라
 * 서로의 상태를 볼 수 없어서, 한쪽에서 담은 것이 다른 쪽에 보이려면 저장소가
 * 둘 위에 있어야 한다.
 */
export default function EpisodeLayout() {
  const { background } = useAppTheme();
  const { session } = useAuthSession();

  return (
    <EpisodeAsksProvider accessToken={session?.access_token}>
      <EpisodeSavedExpressionsProvider accessToken={session?.access_token}>
        <EpisodeReviewProvider>
          <Stack
            screenOptions={{
              contentStyle: { backgroundColor: background },
              headerBackButtonDisplayMode: "minimal",
              headerBackTitle: "뒤로 가기",
            }}
          >
            <Stack.Screen name="index" />
            <Stack.Screen name="review" />
            <Stack.Screen
              name="ask"
              options={getAskSheetOptions(
                background,
                correctionLabels.askTitle
              )}
            />
          </Stack>
        </EpisodeReviewProvider>
      </EpisodeSavedExpressionsProvider>
    </EpisodeAsksProvider>
  );
}
