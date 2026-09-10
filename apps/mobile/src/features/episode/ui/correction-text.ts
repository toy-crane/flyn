import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";

/** 고친 문장에서 강조할 조각들. 표현이 여럿이어도 문장은 하나다. */
export function fixedMarks(correction: EpisodeCorrection): string[] {
  return correction.entries.map((entry) => entry.fixed);
}
