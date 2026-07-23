import { describe, expect, test } from "bun:test";

import {
  aiBeatSchema,
  correctionThreadRequestSchema,
  correctionThreadResponseSchema,
  endingSchema,
  learnerProfileSchema,
  scenarioGenerationRequestSchema,
  scenarioRewriteResponseSchema,
  scenarioSchema,
  storyTurnRequestSchema,
  storyTurnResponseSchema,
} from "@/lib/ai-contract";
import * as fixtures from "@/lib/fixtures";
import type { Ending, Scenario } from "@/types/story";
import { MAX_TURNS } from "@/types/story";

/**
 * Round-tripping the fixtures proves the schemas and the domain types describe
 * the same shape: the fixtures are typed as the domain, and the parse output is
 * assigned back to the domain type.
 */
describe("schemas and domain types agree", () => {
  test("every fixture scenario parses, and parses back to a Scenario", () => {
    for (const fixture of [
      ...fixtures.SCENARIO_SUGGESTIONS,
      fixtures.DRAFT_SCENARIO,
    ]) {
      const parsed: Scenario = scenarioSchema.parse(fixture);
      expect(parsed).toEqual(fixture);
    }
  });

  test("all three endings parse", () => {
    for (const kind of ["success", "failure", "forced"] as const) {
      const parsed: Ending = endingSchema.parse(fixtures.ENDINGS[kind]);
      expect(parsed.kind).toBe(kind);
    }
  });

  test("the learner profile parses", () => {
    expect(learnerProfileSchema.parse(fixtures.LEARNER_PROFILE)).toEqual(
      fixtures.LEARNER_PROFILE,
    );
  });

  test("a nickname-less profile is valid — onboarding step 5 is skippable", () => {
    expect(
      learnerProfileSchema.parse({
        ...fixtures.LEARNER_PROFILE,
        nickname: null,
      }).nickname,
    ).toBeNull();
  });

  test("narration and dialogue beats parse from the transcript", () => {
    const beats = fixtures.NIGHT_TRAIN_MESSAGES.flatMap((message) =>
      message.speaker === "ai" ? message.beats : [],
    );
    expect(beats.length).toBeGreaterThan(0);
    for (const beat of beats) {
      expect(aiBeatSchema.parse(beat)).toEqual(beat);
    }
  });
});

describe("scenario generation", () => {
  test("defaults to one scenario and no learner idea", () => {
    const parsed = scenarioGenerationRequestSchema.parse({
      profile: fixtures.LEARNER_PROFILE,
    });
    expect(parsed.count).toBe(1);
    expect(parsed.idea).toBeNull();
  });

  test("home may ask for up to three cards, never more", () => {
    expect(
      scenarioGenerationRequestSchema.parse({
        profile: fixtures.LEARNER_PROFILE,
        count: 3,
      }).count,
    ).toBe(3);

    expect(() =>
      scenarioGenerationRequestSchema.parse({
        profile: fixtures.LEARNER_PROFILE,
        count: 4,
      }),
    ).toThrow();
  });

  test("a rewrite returns the whole scenario, so the goal can follow the roles", () => {
    const rewritten = {
      ...fixtures.DRAFT_SCENARIO,
      myRole: "섬을 조사하러 온 형사",
      goal: "형사로서 방문자의 정체를 밝혀내라",
    };
    expect(
      scenarioRewriteResponseSchema.parse({ scenario: rewritten }).scenario
        .goal,
    ).toBe("형사로서 방문자의 정체를 밝혀내라");
  });

  test("rejects a genre outside the onboarding set", () => {
    expect(() =>
      scenarioSchema.parse({ ...fixtures.DRAFT_SCENARIO, genre: "western" }),
    ).toThrow();
  });

  test("rejects a scenario with no achievement conditions", () => {
    expect(() =>
      scenarioSchema.parse({
        ...fixtures.DRAFT_SCENARIO,
        achievementConditions: [],
      }),
    ).toThrow();
  });
});

describe("story turn", () => {
  const request = {
    profile: fixtures.LEARNER_PROFILE,
    scenario: fixtures.SCENARIO_SUGGESTIONS[0]!,
    messages: fixtures.NIGHT_TRAIN_MESSAGES.map((message) =>
      message.speaker === "ai"
        ? { speaker: "ai" as const, beats: message.beats }
        : { speaker: "learner" as const, text: message.text },
    ),
    turnCount: 12,
    learnerInput: '"Where was this photo taken?"',
  };

  test("accepts a transcript-carrying request", () => {
    const parsed = storyTurnRequestSchema.parse(request);
    expect(parsed.messages).toHaveLength(fixtures.NIGHT_TRAIN_MESSAGES.length);
  });

  test("rejects a turn count past the ceiling", () => {
    expect(() =>
      storyTurnRequestSchema.parse({ ...request, turnCount: MAX_TURNS + 1 }),
    ).toThrow();
  });

  test("rejects an empty learner input", () => {
    expect(() =>
      storyTurnRequestSchema.parse({ ...request, learnerInput: "" }),
    ).toThrow();
  });

  test("carries narration, dialogue, correction, judgment, and no ending mid-story", () => {
    const parsed = storyTurnResponseSchema.parse({
      beats: [
        { kind: "narration", text: "She hesitates, fingers tightening." },
        { kind: "dialogue", text: '"Why does it matter to you?"' },
      ],
      corrections: [
        {
          originalText: fixtures.CORRECTIONS[0]!.originalText,
          correctedText: fixtures.CORRECTIONS[0]!.correctedText,
          errorSpans: fixtures.CORRECTIONS[0]!.errorSpans,
          changedSpans: fixtures.CORRECTIONS[0]!.changedSpans,
          reason: fixtures.CORRECTIONS[0]!.reason,
          explanation: fixtures.CORRECTIONS[0]!.explanation,
        },
      ],
      achievement: {
        conditions: [
          {
            id: "photo-origin",
            met: false,
            evidence: "그녀는 아직 장소를 말하지 않았다.",
          },
          {
            id: "trust",
            met: true,
            evidence: "사진을 테이블 위로 밀어 보여 주었다.",
          },
        ],
        verdict: "in-progress",
      },
      ending: null,
    });

    expect(parsed.beats.map((beat) => beat.kind)).toEqual([
      "narration",
      "dialogue",
    ]);
    expect(parsed.corrections).toHaveLength(1);
    expect(parsed.ending).toBeNull();
  });

  test("a clean turn carries no corrections", () => {
    const parsed = storyTurnResponseSchema.parse({
      beats: [{ kind: "dialogue", text: '"Vienna."' }],
      corrections: [],
      achievement: { conditions: [], verdict: "in-progress" },
      ending: null,
    });
    expect(parsed.corrections).toEqual([]);
  });

  test("every ending kind can close a turn", () => {
    for (const kind of ["success", "failure", "forced"] as const) {
      const parsed = storyTurnResponseSchema.parse({
        beats: [{ kind: "narration", text: fixtures.ENDINGS[kind].narration }],
        corrections: [],
        achievement: {
          conditions: [],
          verdict: kind === "success" ? "success" : "in-progress",
        },
        ending: fixtures.ENDINGS[kind],
      });
      expect(parsed.ending?.kind).toBe(kind);
    }
  });

  test("rejects a turn with nothing to render", () => {
    expect(() =>
      storyTurnResponseSchema.parse({
        beats: [],
        corrections: [],
        achievement: { conditions: [], verdict: "in-progress" },
        ending: null,
      }),
    ).toThrow();
  });
});

describe("correction thread", () => {
  test("takes one correction plus the Q&A so far", () => {
    const parsed = correctionThreadRequestSchema.parse({
      profile: fixtures.LEARNER_PROFILE,
      correction: {
        originalText: fixtures.CORRECTIONS[0]!.originalText,
        correctedText: fixtures.CORRECTIONS[0]!.correctedText,
        errorSpans: fixtures.CORRECTIONS[0]!.errorSpans,
        changedSpans: fixtures.CORRECTIONS[0]!.changedSpans,
        reason: fixtures.CORRECTIONS[0]!.reason,
        explanation: fixtures.CORRECTIONS[0]!.explanation,
      },
      messages: fixtures.CORRECTION_THREAD.messages.map((message) => ({
        speaker: message.speaker,
        text: message.text,
      })),
      question: "더 캐주얼한 표현은?",
    });
    expect(parsed.messages).toHaveLength(2);
  });

  test("answers come with suggestion chips", () => {
    const parsed = correctionThreadResponseSchema.parse({
      answer: "구어에서는 생략하기도 해요.",
      suggestedQuestions: fixtures.CORRECTION_THREAD.suggestedQuestions,
    });
    expect(parsed.suggestedQuestions).toEqual([
      "다른 예문 보여줘",
      "더 캐주얼한 표현은?",
    ]);
  });
});
