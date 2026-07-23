import { useState } from "react";
import { Stack, router } from "expo-router";

import { AiBubble, LearnerBubble } from "@/components/chat-bubble";
import { CorrectionPanel } from "@/components/correction-panel";
import { CtaButton } from "@/components/cta-button";
import { GoalBar, RolesLine } from "@/components/goal-bar";
import { InputBar } from "@/components/input-bar";
import { Narration } from "@/components/narration";
import { useStoreData } from "@/hooks/use-store-data";
import { SafeAreaView, ScrollView, Text, View } from "@/tw";
import type { Correction } from "@/types/correction";

/**
 * ③ 스토리 세션 — narration and dialogue as one text adventure. Bubbles carry
 * no speaker label: alignment and tail say who is talking.
 *
 * The correction panel starts collapsed; only an underline marks the error, so
 * immersion survives. S5 builds the live turn loop on top of this.
 */
export function StorySessionScreen({ sessionId }: { sessionId: string }) {
  const session = useStoreData((store) => store.getStorySession(sessionId));
  const corrections = useStoreData((store) => store.listCorrections(sessionId));
  const [openCorrectionId, setOpenCorrectionId] = useState<string | null>(null);

  if (!session) return <View className="flex-1 bg-background" />;

  const byId = new Map<string, Correction>(
    (corrections ?? []).map((correction) => [correction.id, correction]),
  );
  const turnCount = session.messages.filter(
    (message) => message.speaker === "learner",
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: session.scenario.title }} />
      <View className="px-3 pt-3">
        <GoalBar goal={session.scenario.goal} turnCount={turnCount} />
        <RolesLine
          myRole={session.scenario.myRole}
          aiRole={session.scenario.aiRole}
        />
      </View>

      <ScrollView
        className="flex-1 px-3"
        contentContainerClassName="gap-3 pb-4"
      >
        {session.messages.map((message) =>
          message.speaker === "ai" ? (
            <View key={message.id} className="gap-3">
              {message.beats.map((beat, index) =>
                beat.kind === "narration" ? (
                  <Narration key={index} text={beat.text} />
                ) : (
                  <AiBubble key={index} text={beat.text} />
                ),
              )}
            </View>
          ) : (
            <LearnerBubble
              key={message.id}
              text={message.text}
              errorSpans={message.correctionIds.flatMap(
                (id) => byId.get(id)?.errorSpans ?? [],
              )}
              onPress={() =>
                setOpenCorrectionId((current) =>
                  current === message.correctionIds[0]
                    ? null
                    : (message.correctionIds[0] ?? null),
                )
              }
            >
              {message.correctionIds[0] &&
              openCorrectionId === message.correctionIds[0] &&
              byId.has(message.correctionIds[0]) ? (
                <CorrectionPanel
                  correction={byId.get(message.correctionIds[0])!}
                  onAskMore={() =>
                    router.push(`/correction/${message.correctionIds[0]}`)
                  }
                />
              ) : null}
            </LearnerBubble>
          ),
        )}

        {session.ending ? (
          <View
            className="mt-1 rounded-card bg-cell px-4 py-5"
            style={{ borderCurve: "continuous" }}
          >
            <Text className="mb-1.5 text-center text-[17px] font-bold text-label">
              {session.ending.headline}
            </Text>
            <Text className="mb-3.5 text-center text-[13px] text-secondary">
              {session.ending.note}
            </Text>
            <CtaButton
              label="요약 보기"
              onPress={() => router.replace(`/result/${sessionId}`)}
            />
          </View>
        ) : null}
      </ScrollView>

      {session.ending ? null : (
        <InputBar placeholder="대사 또는 *행동*을 영어로…" />
      )}
    </SafeAreaView>
  );
}
