/**
 * Streaming carrier for the story-turn route. S0 fixed the complete-payload
 * contract in `ai-contract.ts` and delegated the transport design to S2 —
 * this file is that design: the story-turn route answers with an AI SDK
 * UIMessageStream (SSE) carrying two data parts.
 *
 *   1. `data-turn-analysis` — written once when the turn-analysis call
 *      finishes: the corrections and the achievement judgment.
 *   2. `data-turn-narrative` — written repeatedly under one id while the
 *      narrator streams (clients reconcile by id). Intermediate snapshots are
 *      deep-partial; only the final write parses against the schema.
 *
 * Merging the two final payloads yields exactly a `storyTurnResponseSchema`
 * object — the payload schemas are compositions of the S0 contract, never a
 * reshaping of it.
 */
import type { DeepPartial, UIMessage } from "ai";
import type { z } from "zod";

import { storyTurnResponseSchema } from "@/lib/ai-contract";

export const TURN_ANALYSIS_PART = "data-turn-analysis";
export const TURN_NARRATIVE_PART = "data-turn-narrative";

export const TURN_ANALYSIS_PART_ID = "turn-analysis";

/** Reconciliation id shared by the narrative part's repeated writes. */
export const TURN_NARRATIVE_PART_ID = "turn-narrative";

export const storyTurnAnalysisSchema = storyTurnResponseSchema.pick({
  corrections: true,
  achievement: true,
});

export const storyTurnNarrativeSchema = storyTurnResponseSchema.pick({
  beats: true,
  ending: true,
});

export type StoryTurnAnalysis = z.infer<typeof storyTurnAnalysisSchema>;
export type StoryTurnNarrative = z.infer<typeof storyTurnNarrativeSchema>;

/**
 * The message type the story-turn route streams. Data-part keys drop the
 * `data-` prefix here; the constants above carry the wire names.
 */
export type StoryTurnUIMessage = UIMessage<
  never,
  {
    "turn-analysis": StoryTurnAnalysis;
    "turn-narrative": DeepPartial<StoryTurnNarrative>;
  }
>;
