import { describe, expect, test } from "bun:test";

import { storyTurnResponseSchema } from "@/lib/ai-contract";
import {
  storyTurnAnalysisSchema,
  storyTurnNarrativeSchema,
} from "@/lib/ai-stream-contract";
import { CORRECTIONS, ENDINGS, NIGHT_TRAIN_MESSAGES } from "@/lib/fixtures";

const { id: _id, sessionId: _s, messageId: _m, ...CORRECTION_DRAFT } =
  CORRECTIONS[0]!;

const ANALYSIS = {
  corrections: [CORRECTION_DRAFT],
  achievement: {
    conditions: [
      { id: "photo-origin", met: false, evidence: "그녀는 아직 장소를 말하지 않았다." },
      { id: "trust", met: false, evidence: "그녀는 사진을 쥔 채 망설이고 있다." },
    ],
    verdict: "in-progress" as const,
  },
};

const AI_BEATS = NIGHT_TRAIN_MESSAGES.find((m) => m.speaker === "ai")!;

describe("story turn stream parts", () => {
  test("analysis part carries corrections and judgment", () => {
    expect(storyTurnAnalysisSchema.parse(ANALYSIS)).toEqual(ANALYSIS);
  });

  test("narrative part carries beats with a null ending mid-story", () => {
    const narrative = { beats: AI_BEATS.beats, ending: null };
    expect(storyTurnNarrativeSchema.parse(narrative)).toEqual(narrative);
  });

  test("narrative part carries every ending kind", () => {
    for (const ending of Object.values(ENDINGS)) {
      const narrative = { beats: AI_BEATS.beats, ending };
      expect(storyTurnNarrativeSchema.parse(narrative)).toEqual(narrative);
    }
  });

  test("merging the two final payloads yields a contract story-turn response", () => {
    const merged = {
      ...storyTurnAnalysisSchema.parse(ANALYSIS),
      ...storyTurnNarrativeSchema.parse({
        beats: AI_BEATS.beats,
        ending: ENDINGS.success,
      }),
    };
    expect(() => storyTurnResponseSchema.parse(merged)).not.toThrow();
  });
});
