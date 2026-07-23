import { router } from "expo-router";

import { CtaButton } from "@/components/cta-button";
import { ScreenSubtitle, ScreenTitle } from "@/components/headings";
import { ScenarioCard } from "@/components/scenario-card";
import { ScreenScroll } from "@/components/screen-scroll";
import { SCENARIO_SUGGESTIONS } from "@/lib/fixtures";
import { View } from "@/tw";

/** ② 홈 — the AI's suggestions, and the door to making your own. */
export function HomeScreen() {
  // Suggestions come from the scenario-generation route in S7; until then the
  // fixtures stand in.
  const scenarios = SCENARIO_SUGGESTIONS;

  return (
    <ScreenScroll>
      <ScreenTitle>오늘의 이야기</ScreenTitle>
      <ScreenSubtitle>마음에 드는 상황을 골라 시작하세요.</ScreenSubtitle>

      {scenarios.map((scenario) => (
        <ScenarioCard
          key={scenario.title}
          scenario={scenario}
          onPress={() => router.push("/session/session-night-train")}
        />
      ))}

      <View className="mt-0.5">
        <CtaButton
          label="＋ 나만의 상황 만들기"
          variant="ghost"
          onPress={() => router.push("/create")}
        />
      </View>
    </ScreenScroll>
  );
}
