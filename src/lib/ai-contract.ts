/**
 * The contract between the app and the three AI routes under `src/app/api/`.
 *
 * Client and server share these schemas: screens validate what they send and
 * receive, route handlers validate what they produce. S2 implements the server
 * side against this file; a change here is a change to both sides at once.
 */
import { z } from "zod";

import {
  ENGLISH_LEVELS,
  GENRES,
  INTERESTS,
  LEARNING_GOALS,
} from "@/types/learner";
import { MAX_TURNS } from "@/types/story";

/* ── shared domain shapes ────────────────────────────────────────────── */

export const learnerProfileSchema = z.object({
  englishLevel: z.enum(ENGLISH_LEVELS),
  learningGoals: z.array(z.enum(LEARNING_GOALS)),
  genrePreferences: z.array(z.enum(GENRES)),
  interests: z.array(z.enum(INTERESTS)),
  nickname: z.string().nullable(),
});

export const achievementConditionSchema = z.object({
  id: z.string(),
  description: z.string(),
});

export const scenarioSchema = z.object({
  genre: z.enum(GENRES),
  title: z.string(),
  intro: z.string(),
  scene: z.string(),
  goal: z.string(),
  myRole: z.string(),
  aiRole: z.string(),
  achievementConditions: z.array(achievementConditionSchema).min(1),
});

export const narrationSchema = z.object({
  kind: z.literal("narration"),
  text: z.string(),
});

export const dialogueSchema = z.object({
  kind: z.literal("dialogue"),
  text: z.string(),
});

/** An AI turn is narration and dialogue, in the order they should render. */
export const aiBeatSchema = z.discriminatedUnion("kind", [
  narrationSchema,
  dialogueSchema,
]);

export const textSpanSchema = z.object({
  start: z.number().int().nonnegative(),
  end: z.number().int().nonnegative(),
});

/** A correction as the model produces it — ids are assigned on persistence. */
export const correctionDraftSchema = z.object({
  originalText: z.string(),
  correctedText: z.string(),
  errorSpans: z.array(textSpanSchema),
  changedSpans: z.array(textSpanSchema),
  reason: z.string(),
  explanation: z.string(),
});

export const endingSchema = z.object({
  kind: z.enum(["success", "failure", "forced"]),
  narration: z.string(),
  headline: z.string(),
  note: z.string(),
  summary: z.string(),
});

export const storyMessageSchema = z.discriminatedUnion("speaker", [
  z.object({
    speaker: z.literal("ai"),
    beats: z.array(aiBeatSchema),
  }),
  z.object({
    speaker: z.literal("learner"),
    text: z.string(),
  }),
]);

export const correctionThreadMessageSchema = z.object({
  speaker: z.enum(["learner", "ai"]),
  text: z.string(),
});

/* ── 1. scenario generation ──────────────────────────────────────────── */

export const scenarioGenerationRequestSchema = z.object({
  profile: learnerProfileSchema,
  /** Home suggests two or three cards; 상황 만들기 asks for one. */
  count: z.number().int().min(1).max(3).default(1),
  /** 직접 만들기 — the learner's own idea, Korean allowed. */
  idea: z.string().nullable().default(null),
});

export const scenarioGenerationResponseSchema = z.object({
  scenarios: z.array(scenarioSchema).min(1),
});

/** Fields the learner can edit one at a time with ✎. */
export const scenarioFieldSchema = z.enum([
  "scene",
  "goal",
  "myRole",
  "aiRole",
]);

export const scenarioRewriteRequestSchema = z.object({
  profile: learnerProfileSchema,
  scenario: scenarioSchema,
  field: scenarioFieldSchema,
  /** Present when the learner typed a replacement instead of asking AI to rewrite. */
  replacement: z.string().nullable().default(null),
});

/**
 * The whole scenario comes back, not just the edited field: when the roles or
 * the scene change, the goal is always rewritten from My Role's point of view.
 */
export const scenarioRewriteResponseSchema = z.object({
  scenario: scenarioSchema,
});

/* ── 2. story turn ───────────────────────────────────────────────────── */

export const storyTurnRequestSchema = z.object({
  profile: learnerProfileSchema,
  scenario: scenarioSchema,
  /** The transcript so far, oldest first. */
  messages: z.array(storyMessageSchema),
  /** Turns already taken. The server closes the story at MAX_TURNS. */
  turnCount: z.number().int().min(0).max(MAX_TURNS),
  /** What the learner just wrote — dialogue, `*action*`, or both. */
  learnerInput: z.string().min(1),
});

/**
 * Per-condition judgment, evaluated every turn. `evidence` is what the
 * judgment harness grades against, so it must cite the transcript rather than
 * restate the condition.
 */
export const achievementJudgmentSchema = z.object({
  conditions: z.array(
    z.object({
      id: z.string(),
      met: z.boolean(),
      evidence: z.string(),
    }),
  ),
  verdict: z.enum(["in-progress", "success", "failure"]),
});

export const storyTurnResponseSchema = z.object({
  /** Narration and dialogue for this turn. */
  beats: z.array(aiBeatSchema).min(1),
  /** Empty when the learner's input had no obvious errors — then no underline. */
  corrections: z.array(correctionDraftSchema),
  achievement: achievementJudgmentSchema,
  /** Non-null closes the session; `forced` when the turn ceiling is reached. */
  ending: endingSchema.nullable(),
});

/* ── 3. correction thread ────────────────────────────────────────────── */

export const correctionThreadRequestSchema = z.object({
  profile: learnerProfileSchema,
  correction: correctionDraftSchema,
  /** The Q&A so far, oldest first. */
  messages: z.array(correctionThreadMessageSchema),
  /** The learner's question — Korean-first. */
  question: z.string().min(1),
});

export const correctionThreadResponseSchema = z.object({
  answer: z.string(),
  /** Chips offered under the answer. */
  suggestedQuestions: z.array(z.string()),
});

/* ── inferred request/response types ─────────────────────────────────── */

export type ScenarioGenerationRequest = z.infer<
  typeof scenarioGenerationRequestSchema
>;
export type ScenarioGenerationResponse = z.infer<
  typeof scenarioGenerationResponseSchema
>;
export type ScenarioRewriteRequest = z.infer<
  typeof scenarioRewriteRequestSchema
>;
export type ScenarioRewriteResponse = z.infer<
  typeof scenarioRewriteResponseSchema
>;
export type StoryTurnRequest = z.infer<typeof storyTurnRequestSchema>;
export type StoryTurnResponse = z.infer<typeof storyTurnResponseSchema>;
export type CorrectionThreadRequest = z.infer<
  typeof correctionThreadRequestSchema
>;
export type CorrectionThreadResponse = z.infer<
  typeof correctionThreadResponseSchema
>;
export type ScenarioField = z.infer<typeof scenarioFieldSchema>;
