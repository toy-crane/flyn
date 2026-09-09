import { useCallback, useState } from "react";
import { Pressable, Text, useWindowDimensions, View } from "react-native";
import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";
import { Icon } from "@/shared/ui/icon";
import { correctionPresentation } from "./correction-presentation";
import { fixedMarks, markedParts } from "./correction-text";

/** 한 메시지의 모든 수정과 문맥을 한 카드에 보존한다. 읽음 여부를 따로 기록하지 않는다. */
export function ExpressionReviewCard({
  correction,
}: {
  correction: EpisodeCorrection;
}) {
  const [expanded, setExpanded] = useState(false);
  const { fontScale } = useWindowDimensions();
  const toggle = useCallback(() => setExpanded((value) => !value), []);
  const presentation = correctionPresentation(correction.original);
  return (
    <View
      className="gap-3 rounded-2xl bg-surface px-4 pt-4 pb-2"
      key={fontScale}
      testID={`expression-card-${correction.messageId}`}
    >
      <View className="flex-row items-start gap-1.5">
        <Icon name="learn" size="xs" tone={presentation.tone} />
        <Text
          className={`flex-1 text-xs leading-4 ${presentation.text}`}
          dynamicTypeRamp="caption1"
        >
          {correction.review.situation}
        </Text>
      </View>
      <Text
        className="font-medium text-foreground text-lg leading-7"
        dynamicTypeRamp="body"
        selectable
      >
        {markedParts(correction.fixed, fixedMarks(correction)).map((part) => (
          <Text
            className={
              part.isMarked
                ? `font-semibold ${presentation.text} ${presentation.surface}`
                : undefined
            }
            key={part.at}
          >
            {part.text}
          </Text>
        ))}
      </Text>
      <Text
        className="text-muted text-sm leading-5"
        dynamicTypeRamp="footnote"
        selectable
      >
        {correction.review.meaning}
      </Text>
      <Pressable
        accessibilityLabel="내 대화와 다른 예문"
        accessibilityRole="button"
        accessibilityState={{ expanded }}
        className="min-h-11 flex-row items-center justify-between gap-3"
        onPress={toggle}
      >
        <Text
          className="flex-1 text-muted text-xs leading-5"
          dynamicTypeRamp="footnote"
        >
          내 대화와 다른 예문
        </Text>
        <Icon name={expanded ? "collapse" : "expand"} size="sm" tone="muted" />
      </Pressable>
      {expanded ? (
        <View className="gap-3 border-separator border-t pt-4 pb-3">
          <View className="gap-2">
            <Text className="text-muted text-xs" dynamicTypeRamp="caption1">
              내가 쓴 문장
            </Text>
            <Text
              className="text-foreground text-sm leading-5"
              dynamicTypeRamp="body"
              selectable
            >
              {correction.original}
            </Text>
            {correction.entries.map((entry) => (
              <Text
                className="text-muted text-sm leading-5"
                dynamicTypeRamp="body"
                key={`${entry.pattern}:${entry.original}:${entry.fixed}`}
                selectable
              >
                {entry.why}
              </Text>
            ))}
          </View>
          <View className="gap-2">
            <Text className="text-muted text-xs" dynamicTypeRamp="caption1">
              다른 상황에서
            </Text>
            <Text
              className="font-medium text-base text-foreground leading-6"
              dynamicTypeRamp="body"
              selectable
            >
              {correction.review.example}
            </Text>
            <Text
              className="text-muted text-sm leading-5"
              dynamicTypeRamp="footnote"
              selectable
            >
              {correction.review.exampleMeaning}
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}
