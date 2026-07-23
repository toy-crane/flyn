import { Stack, router } from "expo-router";
import { SymbolView } from "expo-symbols";

import { CtaBar } from "@/components/cta-bar";
import { CtaButton } from "@/components/cta-button";
import { ScreenTitle } from "@/components/headings";
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
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${label} 수정`}
      className="flex-row items-start gap-3 border-t border-hairline py-3.5"
    >
      {/*
        Label above, value below, both on the same left edge — a label column
        beside the value cannot align when the two are different sizes, and it
        boxes the scene description into a narrow gutter. The whole row is the
        edit target, as it is in Settings, so the glyph needs no hit area of
        its own. iOS type scale: Footnote label, Body value.
      */}
      <View className="flex-1">
        <Text className="mb-1 text-[13px] text-muted">{label}</Text>
        <Text
          className={`text-[17px] leading-7 ${
            emphasize ? "font-semibold text-foreground" : "text-sub2"
          }`}
        >
          {value}
        </Text>
      </View>
      <SymbolView
        name="chevron.right"
        size={14}
        tintColor="#8b95a1"
        style={{ marginTop: 3 }}
      />
    </Pressable>
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

        <View className="mt-3 rounded-card bg-surface px-4 pt-[18px] pb-1.5">
          <Tag label={GENRE_LABEL[scenario.genre]} />
          {/* Title 3 — the card is this screen's subject, one clear step
              below the screen title. */}
          <Text className="mt-3 mb-2.5 text-xl font-bold leading-7 text-foreground">
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
