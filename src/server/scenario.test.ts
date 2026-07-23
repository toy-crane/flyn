import { describe, expect, test } from "bun:test";

import type { ScenarioRewriteRequest } from "@/lib/ai-contract";
import { LEARNER_PROFILE, SCENARIO_SUGGESTIONS } from "@/lib/fixtures";

import { applyRewriteGuard, genreSlots } from "./scenario";

const SCENARIO = SCENARIO_SUGGESTIONS[0]!;

/** A model output that drifted on every field it was told to leave alone. */
const DRIFTED = {
  genre: "comedy" as const,
  title: "Drifted title",
  intro: "표류한 소개",
  scene: "표류한 장면",
  goal: "새로 쓴 목표",
  myRole: "표류한 내 역할",
  aiRole: "새로 쓴 AI 역할",
  achievementConditions: [{ id: "new-cond", description: "새 조건" }],
};

function request(
  field: ScenarioRewriteRequest["field"],
  replacement: string | null,
): ScenarioRewriteRequest {
  return { profile: LEARNER_PROFILE, scenario: SCENARIO, field, replacement };
}

describe("genreSlots", () => {
  test("preferred genres come first and never repeat within a request", () => {
    const slots = genreSlots(LEARNER_PROFILE, 3);
    expect(slots.slice(0, 2)).toEqual(LEARNER_PROFILE.genrePreferences);
    expect(new Set(slots).size).toBe(3);
  });

  test("a learner with no preference still gets distinct genres", () => {
    const slots = genreSlots({ ...LEARNER_PROFILE, genrePreferences: [] }, 3);
    expect(new Set(slots).size).toBe(3);
  });

  test("a single card takes the top preference", () => {
    expect(genreSlots(LEARNER_PROFILE, 1)).toEqual([
      LEARNER_PROFILE.genrePreferences[0]!,
    ]);
  });
});

describe("applyRewriteGuard", () => {
  test("AI rewrite of a role keeps every non-edited field from the request", () => {
    const result = applyRewriteGuard(request("aiRole", null), DRIFTED);
    expect(result.genre).toBe(SCENARIO.genre);
    expect(result.title).toBe(SCENARIO.title);
    expect(result.intro).toBe(SCENARIO.intro);
    expect(result.scene).toBe(SCENARIO.scene);
    expect(result.myRole).toBe(SCENARIO.myRole);
    // The edited field and the goal/conditions are the model's to change.
    expect(result.aiRole).toBe(DRIFTED.aiRole);
    expect(result.goal).toBe(DRIFTED.goal);
    expect(result.achievementConditions).toEqual(DRIFTED.achievementConditions);
  });

  test("a learner replacement lands verbatim in the edited field", () => {
    const result = applyRewriteGuard(
      request("scene", "학습자가 직접 쓴 장면"),
      DRIFTED,
    );
    expect(result.scene).toBe("학습자가 직접 쓴 장면");
    expect(result.myRole).toBe(SCENARIO.myRole);
    expect(result.aiRole).toBe(SCENARIO.aiRole);
    expect(result.goal).toBe(DRIFTED.goal);
  });

  test("a goal replacement keeps the goal verbatim and the conditions regenerated", () => {
    const result = applyRewriteGuard(
      request("goal", "직접 쓴 목표"),
      DRIFTED,
    );
    expect(result.goal).toBe("직접 쓴 목표");
    expect(result.scene).toBe(SCENARIO.scene);
    expect(result.achievementConditions).toEqual(DRIFTED.achievementConditions);
  });
});
