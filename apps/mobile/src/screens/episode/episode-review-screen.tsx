import { useCallback, useLayoutEffect, useMemo } from "react";
import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ExpressionResult } from "@/features/episode/api/episode-correction";
import type {
  SavedExpressionRef,
  SavedExpressionSpot,
} from "@/features/episode/api/saved-expression";
import type { EpisodeReviewContext } from "@/features/episode/state/episode-review";
import {
  SavedExpressionsProvider,
  useEpisodeSavedExpressions,
} from "@/features/episode/state/saved-expressions";
import { ExpressionReviewCard } from "@/features/episode/ui/expression-review-card";
import { useExpressionToast } from "@/features/episode/ui/expression-toast";
import { useExpressionNoteRefresh } from "@/features/note/query/expression-note";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { ScreenUnavailable } from "@/shared/ui/screen-status";
import { EpisodeLoadingScreen } from "./episode-loading-screen";

/** 토스트가 카드 위에 뜨는 높이. Android는 그림자 층으로만 순서를 정한다. */
const TOAST_ELEVATION = 2;

export function EpisodeReviewScreen({
  context,
  isLoading,
  isRetrying,
  results,
  onRetry,
  onContinue,
  savedExpressions,
}: {
  context: EpisodeReviewContext;
  isLoading: boolean;
  isRetrying: boolean;
  results?: readonly ExpressionResult[];
  onRetry: () => void;
  onContinue: () => void;
  /** 이 화에서 이미 담아 둔 자리. 대화에서 담은 것이 여기서도 채워져 보인다. */
  savedExpressions?: readonly SavedExpressionRef[];
}) {
  const insets = useSafeAreaInsets();
  const { fontScale, height } = useWindowDimensions();
  const { episode, nextUp, story } = context;
  const { announce, toast } = useExpressionToast();
  const refreshNote = useExpressionNoteRefresh();
  const changed = useCallback(
    (isSaved: boolean) => {
      announce(isSaved);
      refreshNote();
    },
    [announce, refreshNote]
  );
  const { hydrate, states, toggle } = useEpisodeSavedExpressions();
  const saved = useMemo(
    () => ({
      states,
      toggle: (spot: SavedExpressionSpot) => toggle(spot, changed),
    }),
    [changed, states, toggle]
  );

  // 대화 화면과 같은 저장소에 서버가 아는 자리를 가져다 놓는다. 여기서 담은
  // 것은 대화로 돌아갔을 때, 대화에서 담은 것은 여기서 채워진 채로 보인다.
  // 대화 화면과 같은 이유로 그리기 전에 넣는다.
  useLayoutEffect(() => {
    hydrate({
      episodeId: episode.episodeId,
      saved: savedExpressions,
      storyPlayId: context.storyPlayId,
    });
  }, [context.storyPlayId, episode.episodeId, hydrate, savedExpressions]);

  const cards = results?.flatMap((result) =>
    result.status === "corrected" ? [result.correction] : []
  );
  const nextNumber = nextUp?.number;
  const hasNext = nextUp?.episodeId && typeof nextNumber === "number";
  const action = hasNext
    ? `${nextNumber}화 ${nextUp.isCompleted ? "다시 보기" : "시작하기"}`
    : "대화 기록 보기";
  return (
    <SavedExpressionsProvider value={saved}>
      <View className="flex-1 bg-background">
        {/*
          토스트는 네이티브 헤더 바로 밑에서 나온다. 이 화면은 헤더가 불투명해서
          본문의 맨 위가 곧 헤더 밑이다. 대화처럼 잴 띠가 없다.
        */}
        {toast === undefined ? null : (
          <View
            pointerEvents="none"
            // 자리와 쌓는 순서를 값으로 둔다. 알약이 카드 뒤로 깔리던 것을 기기에서
            // 보고 고친 자리라, 대화 쪽과 같은 모양으로 검사가 그 값을 잰다.
            style={{
              elevation: TOAST_ELEVATION,
              left: 0,
              position: "absolute",
              right: 0,
              top: 0,
              zIndex: TOAST_ELEVATION,
            }}
            testID="review-toast"
          >
            {toast}
          </View>
        )}
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-5 px-6 pt-5 pb-6"
          testID="expression-review-scroll"
        >
          <View className="gap-1" key={`context-${fontScale}`}>
            <Text className="text-muted text-xs" dynamicTypeRamp="caption1">
              {story.title}
            </Text>
            <Text
              className="font-semibold text-foreground text-sm"
              dynamicTypeRamp="footnote"
            >
              {episode.number}화 · {episode.title}
            </Text>
          </View>
          {isLoading && !isRetrying ? (
            <View className="min-h-40">
              <EpisodeLoadingScreen label="표현을 불러오고 있어요" />
            </View>
          ) : null}
          {!(isLoading || isRetrying) && cards && cards.length > 0 ? (
            <View className="gap-3">
              {/*
                개수를 두지 않는다. 카드가 몇 장인지는 목록이 그대로 보여 주고,
                세어 둔 숫자는 이 화면에서 할 일을 알려 주지 않는다.
              */}
              <Text
                accessibilityRole="header"
                className="font-bold text-base text-foreground"
                dynamicTypeRamp="headline"
                key={`heading-${fontScale}`}
              >
                기억해 둘 표현
              </Text>
              {/* 카드 사이는 표현 노트 목록과 같은 10pt다. 같은 카드를 쓴다. */}
              <View className="gap-2.5">
                {cards.map((correction) => (
                  <ExpressionReviewCard
                    correction={correction}
                    key={correction.messageId}
                  />
                ))}
              </View>
            </View>
          ) : null}
          {!(isLoading || isRetrying) && cards?.length === 0 ? (
            <View
              className="items-center gap-4 rounded-2xl bg-surface px-5 py-9"
              key={`empty-${fontScale}`}
            >
              <Icon name="expressions" size="lg" tone="muted" />
              <Text
                className="text-center text-base text-muted leading-6"
                dynamicTypeRamp="body"
              >
                이번 대화에는 안내한 표현이 없어요
              </Text>
            </View>
          ) : null}
          {isRetrying || !(isLoading || cards) ? (
            <ScreenUnavailable
              isRetrying={isRetrying}
              key={`error-${fontScale}`}
              onRetry={onRetry}
              testID="expression-review-unavailable"
              title="표현을 불러오지 못했어요"
            />
          ) : null}
        </ScrollView>
        <View
          className="gap-3 px-6 pt-3"
          key={`next-${fontScale}`}
          style={{
            maxHeight: height * 0.48,
            paddingBottom: Math.max(insets.bottom, 12),
          }}
          testID="expression-review-next"
        >
          <ScrollView
            className="shrink"
            contentContainerClassName="gap-1"
            showsVerticalScrollIndicator={false}
          >
            <Text className="text-muted text-xs" dynamicTypeRamp="caption1">
              {hasNext ? "다음 이야기" : story.title}
            </Text>
            <Text
              className="font-semibold text-base text-foreground leading-6"
              dynamicTypeRamp="headline"
            >
              {hasNext
                ? `${nextNumber}화 · ${nextUp.title}`
                : "마지막 이야기까지 함께했어요"}
            </Text>
            {hasNext ? (
              <Text
                className="text-muted text-sm leading-5"
                dynamicTypeRamp="footnote"
              >
                {nextUp.copy}
              </Text>
            ) : null}
          </ScrollView>
          <Button accessibilityLabel={action} onPress={onContinue}>
            {action}
          </Button>
        </View>
      </View>
    </SavedExpressionsProvider>
  );
}
