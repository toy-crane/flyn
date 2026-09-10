import { useQuery } from "@tanstack/react-query";
import { Redirect, router, Stack, useLocalSearchParams } from "expo-router";
import { useCallback, useRef } from "react";
import { useAppTheme } from "@/core/theme/app-theme-bridge";
import { useAuthSession } from "@/features/auth/state/auth-session";
import { readEpisodeSession } from "@/features/episode/api/episode-session";
import { useEpisodeReview } from "@/features/episode/state/episode-review";
import { EpisodeReviewScreen } from "@/screens/episode/episode-review-screen";
import { useVisibleRetry } from "@/shared/query/use-visible-retry";
import { toolbarIcon } from "@/shared/ui/toolbar-icons";

function claimExit(lock: { current: boolean }) {
  if (lock.current) {
    return false;
  }
  lock.current = true;
  return true;
}

/** 대화 위로 push하므로 뒤로 가기는 같은 대화와 같은 표현 확인 상태로 돌아간다. */
export default function EpisodeReviewRoute() {
  const { background } = useAppTheme();
  const { session } = useAuthSession();
  const { episodeId, storyPlayId } = useLocalSearchParams<{
    episodeId: string;
    storyPlayId: string;
  }>();
  const { current } = useEpisodeReview();
  const context =
    current?.episode.episodeId === episodeId &&
    current.storyPlayId === storyPlayId
      ? current
      : undefined;
  const query = useQuery({
    enabled: !!context && !!session,
    gcTime: 0,
    queryFn: ({ signal }) =>
      readEpisodeSession(
        session?.access_token ?? "",
        storyPlayId,
        episodeId,
        signal
      ),
    queryKey: ["expression-review", session?.user.id, storyPlayId, episodeId],
    retry: 1,
    staleTime: 0,
  });
  const { isRetrying, retry } = useVisibleRetry(query.refetch);
  const leaving = useRef<boolean>(false);
  const home = useCallback(() => {
    if (!claimExit(leaving)) {
      return;
    }
    router.dismissTo("/(tabs)/(home)");
  }, []);
  const continueStory = useCallback(() => {
    if (!(context && claimExit(leaving))) {
      return;
    }
    if (context.nextUp?.episodeId) {
      // dismissTo는 같은 index의 검색 매개변수를 바꾸고 review를 제거한다.
      // 다음 화에서 뒤로 가면 원래 상세나 기록으로 돌아간다.
      router.dismissTo({
        params: {
          episodeId: context.nextUp.episodeId,
          storyPlayId: context.storyPlayId,
        },
        pathname: "/episode",
      });
    } else {
      router.dismissTo({
        params: { storyId: context.story.id },
        pathname: "/records/[storyId]",
      });
    }
  }, [context]);
  if (!context) {
    return (
      <Redirect
        href={{ params: { episodeId, storyPlayId }, pathname: "/episode" }}
      />
    );
  }
  return (
    <>
      <Stack.Screen
        options={{
          headerBackButtonMenuEnabled: false,
          headerLargeTitleEnabled: false,
          headerShadowVisible: false,
          headerShown: true,
          headerStyle: { backgroundColor: background },
          headerTransparent: false,
          title: "표현 돌아보기",
        }}
      />
      <EpisodeReviewScreen
        context={context}
        isLoading={query.isPending && !query.isError}
        isRetrying={isRetrying}
        onContinue={continueStory}
        onRetry={retry}
        results={query.isError ? undefined : query.data?.expressionResults}
        savedExpressions={query.data?.saved}
      />
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          accessibilityLabel="홈으로 이동"
          icon={toolbarIcon("home")}
          onPress={home}
        />
      </Stack.Toolbar>
    </>
  );
}
