import { Stack } from "expo-router";

import { AiBubble, LearnerBubble } from "@/components/chat-bubble";
import { Chip, ChipGroup } from "@/components/chip";
import { InputBar } from "@/components/input-bar";
import { useStoreData } from "@/hooks/use-store-data";
import { CORRECTION_THREAD } from "@/lib/fixtures";
import { SafeAreaView, ScrollView, Text, View } from "@/tw";

/**
 * ④ 교정 스레드 — step three of the correction path. Korean-first Q&A about
 * one correction, kept off the story timeline.
 */
export function CorrectionThreadScreen({
  correctionId,
}: {
  correctionId: string;
}) {
  const correction = useStoreData((store) => store.getCorrection(correctionId));
  const messages = useStoreData((store) =>
    store.listCorrectionThreadMessages(correctionId),
  );

  if (!correction) return <View className="flex-1 bg-background" />;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "교정" }} />
      <View className="px-3 pt-3">
        <View
          className="rounded-card bg-card p-4"
          style={{ borderCurve: "continuous" }}
        >
          <Text className="mb-1.5 text-sm text-tertiary line-through">
            {correction.originalText}
          </Text>
          <Text className="mb-2.5 text-base font-bold text-tint">
            {correction.correctedText}
          </Text>
          <Text className="text-[16px] leading-7 text-secondary">
            {correction.explanation}
          </Text>
        </View>
      </View>

      <ScrollView
        className="flex-1 px-3"
        contentContainerClassName="gap-3 pt-3 pb-4"
      >
        {(messages ?? []).map((message) =>
          message.speaker === "ai" ? (
            <AiBubble key={message.id} text={message.text} />
          ) : (
            <LearnerBubble key={message.id} text={message.text} />
          ),
        )}
        <ChipGroup>
          {CORRECTION_THREAD.suggestedQuestions.map((question) => (
            <Chip key={question} label={question} />
          ))}
        </ChipGroup>
      </ScrollView>

      <InputBar placeholder="이 교정에 대해 물어보세요…" />
    </SafeAreaView>
  );
}
