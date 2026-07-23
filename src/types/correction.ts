/**
 * Correction (교정) — what the AI offers on a sentence the learner wrote.
 * Not one-off feedback: it is the opening of a deeper conversation.
 *
 * Three-step path through the UI:
 *   underline (notice) → panel (correction + one-line reason) → thread (Q&A).
 */

/** Half-open character range `[start, end)`. */
export type TextSpan = { start: number; end: number };

export type Correction = {
  id: string;
  sessionId: string;
  /** The learner message this corrects. */
  messageId: string;
  /** The learner's sentence as written, standalone. */
  originalText: string;
  correctedText: string;
  /**
   * Ranges into the learner message's full text — what gets the wavy underline
   * in the story bubble. Offsets are into `LearnerMessage.text`, not into
   * `originalText`, because the message may hold action and dialogue together.
   */
  errorSpans: TextSpan[];
  /** Ranges into `correctedText` — what renders blue and bold in the panel. */
  changedSpans: TextSpan[];
  /** One line, shown in the correction panel. */
  reason: string;
  /** The fuller why, shown at the head of the correction thread. */
  explanation: string;
};

/**
 * Correction Thread (교정 스레드) — Korean-first Q&A about one correction,
 * kept off the story timeline.
 */
export type CorrectionThread = {
  correctionId: string;
  messages: CorrectionThreadMessage[];
  /** Chips offered under the latest answer. */
  suggestedQuestions: string[];
};

export type CorrectionThreadMessage = {
  id: string;
  speaker: "learner" | "ai";
  text: string;
};
