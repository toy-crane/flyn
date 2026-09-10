import { ScrollView, Text, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ExpressionResult } from "@/features/episode/api/episode-correction";
import type { EpisodeReviewContext } from "@/features/episode/state/episode-review";
import { ExpressionReviewCard } from "@/features/episode/ui/expression-review-card";
import { StoryUnavailable } from "@/features/story/ui/story-status";
import { Button } from "@/shared/ui/button";
import { Icon } from "@/shared/ui/icon";
import { EpisodeLoadingScreen } from "./episode-loading-screen";

export function EpisodeReviewScreen({
  context,
  isLoading,
  isRetrying,
  results,
  onRetry,
  onContinue,
}: {
  context: EpisodeReviewContext;
  isLoading: boolean;
  isRetrying: boolean;
  results?: readonly ExpressionResult[];
  onRetry: () => void;
  onContinue: () => void;
}) {
  const insets = useSafeAreaInsets();
  const { fontScale, height } = useWindowDimensions();
  const { episode, nextUp, story } = context;
  const cards = results?.flatMap((result) =>
    result.status === "corrected" ? [result.correction] : []
  );
  const nextNumber = nextUp?.number;
  const hasNext = nextUp?.episodeId && typeof nextNumber === "number";
  const action = hasNext
    ? `${nextNumber}화 ${nextUp.isCompleted ? "다시 보기" : "시작하기"}`
    : "대화 기록 보기";
  return (
    <View className="flex-1 bg-background">
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
          <View className="gap-4">
            <View
              className="flex-row items-baseline justify-between gap-3"
              key={`heading-${fontScale}`}
            >
              <Text
                accessibilityRole="header"
                className="flex-1 font-bold text-base text-foreground"
                dynamicTypeRamp="headline"
              >
                기억해 둘 표현
              </Text>
              <Text className="text-muted text-xs" dynamicTypeRamp="caption1">
                {cards.length}개
              </Text>
            </View>
            {cards.map((correction) => (
              <ExpressionReviewCard
                correction={correction}
                key={correction.messageId}
              />
            ))}
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
          <StoryUnavailable
            isRetrying={isRetrying}
            key={`error-${fontScale}`}
            onRetry={onRetry}
            testID="expression-review-unavailable"
            title="표현을 불러오지 못했어요."
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
  );
}
