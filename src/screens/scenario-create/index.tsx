import { Stack, router } from "expo-router";
import { SymbolView } from "expo-symbols";

import { CtaBar } from "@/components/cta-bar";
import { CtaButton } from "@/components/cta-button";
import { ScreenSubtitle, ScreenTitle } from "@/components/headings";
import { Tag } from "@/components/tag";
import { DRAFT_SCENARIO } from "@/lib/fixtures";
import { Pressable, SafeAreaView, ScrollView, Text, View } from "@/tw";
import { GENRE_LABEL } from "@/types/learner";

/** One editable row of the draft scenario. */
function Field({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <View className="flex-row gap-3 border-t border-hairline py-2.5">
      <Text className="w-14 text-sm text-muted">{label}</Text>
      <Text
        className={`flex-1 text-sm leading-6 ${
          emphasize ? "font-bold text-foreground" : "text-sub2"
        }`}
      >
        {value}
      </Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label} 수정`}
        className="min-h-11 min-w-11 items-center justify-center"
      >
        <SymbolView name="pencil" size={18} tintColor="#8b95a1" />
      </Pressable>
    </View>
  );
}

/**
 * ⑥ 상황 만들기 — a random scenario is already waiting; the learner changes
 * only the parts they dislike. S4 wires the edit sheets and regeneration.
 */
export function ScenarioCreateScreen() {
  const scenario = DRAFT_SCENARIO;

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ title: "새로운 상황" }} />
      {/*
        직접 만들기 is a real bar button, not a text link: a six-character
        label would crowd the title, so it takes the compose glyph and keeps
        the words for VoiceOver. S4 opens the idea sheet from here.
      */}
      <Stack.Toolbar placement="right">
        <Stack.Toolbar.Button
          icon="square.and.pencil"
          accessibilityLabel="직접 만들기"
        />
      </Stack.Toolbar>
      <ScrollView className="flex-1 px-3" contentContainerClassName="pb-4">
        <ScreenTitle>이런 상황은 어때요?</ScreenTitle>
        <ScreenSubtitle>
          AI가 즉석에서 만든 상황이에요. 마음에 안 드는 부분만 바꿔도 돼요.
        </ScreenSubtitle>

        <View className="rounded-card bg-surface px-4 py-[18px]">
          <Tag label={GENRE_LABEL[scenario.genre]} />
          <Text className="mt-2.5 mb-1.5 text-[17px] font-bold text-foreground">
            {scenario.title}
          </Text>
          <Field label="장면" value={scenario.scene} />
          <Field label="목표" value={scenario.goal} emphasize />
          <Field label="내 역할" value={scenario.myRole} />
          <Field label="AI 역할" value={scenario.aiRole} />
        </View>
      </ScrollView>

      <CtaBar>
        <CtaButton
          label="이 상황으로 시작"
          onPress={() => router.replace("/session/session-night-train")}
        />
        <CtaButton label="다른 상황 보기" variant="ghost" />
      </CtaBar>
    </SafeAreaView>
  );
}
