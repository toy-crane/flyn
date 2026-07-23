/**
 * Story turn orchestration: judge, decide, narrate.
 *
 *   analyzeTurn (temp 0)  → corrections + achievement judgment
 *   resolveTurnPlan       → whether this turn closes the story, and how
 *   streamNarration       → beats (+ ending) streamed to the client
 *
 * The judgment is written to the stream as soon as it exists, so the learner's
 * underline appears while the AI's reply is still being written.
 */
import { createUIMessageStream } from "ai";

import type { StoryTurnRequest } from "@/lib/ai-contract";
import type { StoryTurnUIMessage } from "@/lib/ai-stream-contract";
import {
  storyTurnNarrativeSchema,
  TURN_ANALYSIS_PART,
  TURN_ANALYSIS_PART_ID,
  TURN_NARRATIVE_PART,
  TURN_NARRATIVE_PART_ID,
} from "@/lib/ai-stream-contract";
import { streamNarration } from "@/server/narrator";
import { resolveTurnPlan } from "@/server/turn-rules";
import { analyzeTurn } from "@/server/turn-analysis";

/** Each partial snapshot re-sends the whole object, so writes are throttled. */
const SNAPSHOT_INTERVAL_MS = 100;

type PartialNarrative = {
  beats?: unknown;
  ending?: unknown;
};

export function streamStoryTurn(
  request: StoryTurnRequest,
  signal?: AbortSignal,
) {
  return createUIMessageStream<StoryTurnUIMessage>({
    onError: (error) => {
      const summary =
        error instanceof Error
          ? `${error.name}: ${error.message}`
          : String(error);
      console.error(`[story-turn] stream failed — ${summary}`);
      return "ai-failed";
    },
    execute: async ({ writer }) => {
      const analysis = await analyzeTurn(request, signal);
      writer.write({
        type: TURN_ANALYSIS_PART,
        id: TURN_ANALYSIS_PART_ID,
        data: analysis,
      });

      const plan = resolveTurnPlan({
        verdict: analysis.achievement.verdict,
        turnCount: request.turnCount,
      });

      const result = streamNarration(request, analysis, plan, signal);

      let lastWrite = 0;
      for await (const snapshot of result.partialOutputStream) {
        const now = Date.now();
        if (now - lastWrite < SNAPSHOT_INTERVAL_MS) continue;
        lastWrite = now;
        const partial = snapshot as PartialNarrative;
        writer.write({
          type: TURN_NARRATIVE_PART,
          id: TURN_NARRATIVE_PART_ID,
          data: {
            beats: (partial.beats ?? []) as never,
            ending: (partial.ending ?? null) as never,
          },
        });
      }

      // The final write is the only validated one — partial snapshots above
      // are deep-partial by nature.
      const complete = (await result.output) as PartialNarrative;
      writer.write({
        type: TURN_NARRATIVE_PART,
        id: TURN_NARRATIVE_PART_ID,
        data: storyTurnNarrativeSchema.parse({
          beats: complete.beats,
          ending: complete.ending ?? null,
        }),
      });
    },
  });
}
