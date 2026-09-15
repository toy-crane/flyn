import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";

/** 고친 문장에서 강조할 조각들. 표현이 여럿이어도 문장은 하나다. */
export function fixedMarks(correction: EpisodeCorrection): string[] {
  return correction.entries.map((entry) => entry.fixed);
}

/** 실제 오류만 원문에서 밑줄로 짚는다. 값이 없는 옛 결과는 오류로 읽는다. */
export function originalErrorMarks(
  entries: readonly { isError?: boolean; original: string }[]
): string[] {
  return entries
    .filter((entry) => entry.isError !== false)
    .map((entry) => entry.original);
}
