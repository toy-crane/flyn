/**
 * Converts model-quoted corrections into the contract's character spans.
 *
 * Models are unreliable at character offsets, so the turn-analysis call quotes
 * exact substrings instead and this helper locates them:
 *
 * 1. Two-level anchoring — `originalText` is located inside the full learner
 *    message first, then each error quote inside that slice, so a quote that
 *    also appears in an `*action*` marker cannot mismatch.
 * 2. Index-preserving normalization fallback (curly↔straight quotes, dashes,
 *    case) when an exact match fails.
 * 3. Degradation ladder — an unmatched quote widens to the whole sentence
 *    span; an unlocatable `originalText` drops the correction entirely, since
 *    a correction whose underline cannot be drawn breaks the 밑줄→패널→스레드
 *    path.
 */
import type { z } from "zod";

import type { correctionDraftSchema } from "@/lib/ai-contract";
import type { TextSpan } from "@/types/correction";

type CorrectionDraft = z.infer<typeof correctionDraftSchema>;

/** A correction as the model emits it — quotes instead of spans. */
export type QuotedCorrectionDraft = {
  originalText: string;
  correctedText: string;
  errorQuotes: string[];
  changedQuotes: string[];
  reason: string;
  explanation: string;
};

/** Single-character, index-preserving folds only — offsets must survive. */
const CHAR_FOLDS: Record<string, string> = {
  "‘": "'",
  "’": "'",
  "‚": "'",
  "′": "'",
  "“": '"',
  "”": '"',
  "„": '"',
  "″": '"',
  "–": "-",
  "—": "-",
  "−": "-",
  " ": " ",
};

function fold(text: string): string {
  let out = "";
  for (const ch of text) {
    const folded = CHAR_FOLDS[ch] ?? ch;
    const lower = folded.toLowerCase();
    out += lower.length === folded.length ? lower : folded;
  }
  return out;
}

function findSpan(haystack: string, needle: string): TextSpan | null {
  if (needle.trim().length === 0) return null;
  const exact = haystack.indexOf(needle);
  if (exact >= 0) return { start: exact, end: exact + needle.length };
  const folded = fold(haystack).indexOf(fold(needle));
  if (folded >= 0) return { start: folded, end: folded + needle.length };
  return null;
}

function mergeSpans(spans: TextSpan[]): TextSpan[] {
  const sorted = [...spans].sort((a, b) => a.start - b.start);
  const merged: TextSpan[] = [];
  for (const span of sorted) {
    const last = merged[merged.length - 1];
    if (last && span.start <= last.end) {
      last.end = Math.max(last.end, span.end);
    } else {
      merged.push({ ...span });
    }
  }
  return merged;
}

/** Locates quotes inside `region` of `text`, falling back to the whole region. */
function quotesToSpans(
  text: string,
  region: TextSpan,
  quotes: string[],
): TextSpan[] {
  const slice = text.slice(region.start, region.end);
  const spans: TextSpan[] = [];
  for (const quote of quotes) {
    const local = findSpan(slice, quote);
    spans.push(
      local
        ? { start: region.start + local.start, end: region.start + local.end }
        : { ...region },
    );
  }
  if (spans.length === 0) spans.push({ ...region });
  return mergeSpans(spans);
}

/**
 * Returns the contract-shaped draft, or `null` when the model's
 * `originalText` cannot be located in the learner message (paraphrased).
 */
export function resolveCorrectionSpans(
  messageText: string,
  draft: QuotedCorrectionDraft,
): CorrectionDraft | null {
  const originalSpan = findSpan(messageText, draft.originalText);
  if (!originalSpan) return null;

  const correctedRegion: TextSpan = {
    start: 0,
    end: draft.correctedText.length,
  };

  return {
    // The learner's sentence exactly as written, even when the model's
    // quoting differed by folded characters.
    originalText: messageText.slice(originalSpan.start, originalSpan.end),
    correctedText: draft.correctedText,
    errorSpans: quotesToSpans(messageText, originalSpan, draft.errorQuotes),
    changedSpans: quotesToSpans(
      draft.correctedText,
      correctedRegion,
      draft.changedQuotes,
    ),
    reason: draft.reason,
    explanation: draft.explanation,
  };
}
