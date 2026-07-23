import { router } from "expo-router";

import { ChoiceCard } from "@/components/choice-card";
import { CtaBar } from "@/components/cta-bar";
import { CtaButton } from "@/components/cta-button";
import { ScreenSubtitle, ScreenTitle } from "@/components/headings";
import { ScrollView, SafeAreaView, Text, View } from "@/tw";
import { ENGLISH_LEVELS, ENGLISH_LEVEL_COPY } from "@/types/learner";

/**
 * ① 온보딩 — five questions, one per screen. This placeholder shows step 1;
 * S3 builds the step machine and the remaining four.
 */
export function OnboardingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-grouped">
      <ScrollView className="flex-1 px-3" contentContainerClassName="pb-4">
        <Text className="mt-1 text-[13px] font-bold text-tint">1 / 5</Text>
        <ScreenTitle>{"지금 영어로 말할 때,\n어느 쪽에 가까워요?"}</ScreenTitle>
        <ScreenSubtitle>
          스토리 난이도와 교정 강도를 여기에 맞춰드려요.
        </ScreenSubtitle>

        <View>
          {ENGLISH_LEVELS.map((level) => (
            <ChoiceCard
              key={level}
              title={ENGLISH_LEVEL_COPY[level].title}
              detail={ENGLISH_LEVEL_COPY[level].detail}
              selected={level === "intermediate"}
            />
          ))}
        </View>
      </ScrollView>

      <CtaBar background="grouped">
        <CtaButton label="다음" onPress={() => router.replace("/home")} />
      </CtaBar>
    </SafeAreaView>
  );
}
