import type { TextSpan } from "@/types/correction";

export type TextSegment = { text: string; flagged: boolean };

/**
 * Cuts `text` into flagged and plain runs, in order — the underline in a story
 * bubble and the accent bold in a correction panel are both drawn from this.
 *
 * Spans are clamped to the text and merged when they overlap, so a stale span
 * from the model degrades into a shorter highlight rather than a crash.
 */
export function splitBySpans(text: string, spans: TextSpan[]): TextSegment[] {
  if (spans.length === 0) return [{ text, flagged: false }];

  const ordered = [...spans].sort((a, b) => a.start - b.start);
  const segments: TextSegment[] = [];
  let cursor = 0;

  for (const span of ordered) {
    const start = Math.max(cursor, Math.max(0, span.start));
    const end = Math.min(text.length, span.end);
    if (start >= end) continue;
    if (start > cursor) {
      segments.push({ text: text.slice(cursor, start), flagged: false });
    }
    segments.push({ text: text.slice(start, end), flagged: true });
    cursor = end;
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), flagged: false });
  }
  return segments;
}
