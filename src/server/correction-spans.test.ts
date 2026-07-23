import { describe, expect, test } from "bun:test";

import { resolveCorrectionSpans } from "./correction-spans";

const MESSAGE =
  '*I hold the case tighter* "It\'s just my luggage. Why you want to know?"';

function spanOf(haystack: string, needle: string) {
  const start = haystack.indexOf(needle);
  if (start < 0) throw new Error(`missing ${JSON.stringify(needle)}`);
  return { start, end: start + needle.length };
}

describe("resolveCorrectionSpans", () => {
  test("locates quotes inside the original sentence, offset into the message", () => {
    const draft = resolveCorrectionSpans(MESSAGE, {
      originalText: "Why you want to know?",
      correctedText: "Why do you want to know?",
      errorQuotes: ["Why you want"],
      changedQuotes: ["do"],
      reason: "의문문에는 조동사 do가 주어 앞에 와야 해요.",
      explanation: "의문문에서는 조동사 do가 주어 앞에 와야 해요.",
    });
    expect(draft).not.toBeNull();
    expect(draft!.originalText).toBe("Why you want to know?");
    expect(draft!.errorSpans).toEqual([spanOf(MESSAGE, "Why you want")]);
    expect(draft!.changedSpans).toEqual([
      spanOf("Why do you want to know?", "do"),
    ]);
  });

  test("a quote that also appears in the action marker anchors to the sentence", () => {
    const message = '*I want to leave* "I want go now."';
    const draft = resolveCorrectionSpans(message, {
      originalText: "I want go now.",
      correctedText: "I want to go now.",
      errorQuotes: ["I want"],
      changedQuotes: ["to"],
      reason: "-",
      explanation: "-",
    });
    const sentence = spanOf(message, "I want go now.");
    expect(draft!.errorSpans[0]!.start).toBeGreaterThanOrEqual(sentence.start);
  });

  test("curly quotes from the model still match the learner's straight quotes", () => {
    const draft = resolveCorrectionSpans(MESSAGE, {
      originalText: "It’s just my luggage.",
      correctedText: "It's just my luggage.",
      errorQuotes: ["It’s"],
      changedQuotes: [],
      reason: "-",
      explanation: "-",
    });
    expect(draft).not.toBeNull();
    // originalText comes back exactly as the learner wrote it.
    expect(draft!.originalText).toBe("It's just my luggage.");
    expect(draft!.errorSpans).toEqual([spanOf(MESSAGE, "It's")]);
  });

  test("case differences fall back to the folded match", () => {
    const draft = resolveCorrectionSpans(MESSAGE, {
      originalText: "why you want to know?",
      correctedText: "Why do you want to know?",
      errorQuotes: ["why you want"],
      changedQuotes: ["do"],
      reason: "-",
      explanation: "-",
    });
    expect(draft!.errorSpans).toEqual([spanOf(MESSAGE, "Why you want")]);
  });

  test("an unmatched quote widens to the whole sentence span", () => {
    const draft = resolveCorrectionSpans(MESSAGE, {
      originalText: "Why you want to know?",
      correctedText: "Why do you want to know?",
      errorQuotes: ["you wanted"],
      changedQuotes: ["do"],
      reason: "-",
      explanation: "-",
    });
    expect(draft!.errorSpans).toEqual([
      spanOf(MESSAGE, "Why you want to know?"),
    ]);
  });

  test("one unmatched quote does not swallow the ones that matched", () => {
    const draft = resolveCorrectionSpans(MESSAGE, {
      originalText: "Why you want to know?",
      correctedText: "Why do you want to know?",
      errorQuotes: ["Why you want", "knwo"],
      changedQuotes: ["do"],
      reason: "-",
      explanation: "-",
    });
    expect(draft!.errorSpans).toEqual([spanOf(MESSAGE, "Why you want")]);
  });

  test("empty quote lists widen to the whole region", () => {
    const draft = resolveCorrectionSpans(MESSAGE, {
      originalText: "Why you want to know?",
      correctedText: "Why do you want to know?",
      errorQuotes: [],
      changedQuotes: [],
      reason: "-",
      explanation: "-",
    });
    expect(draft!.errorSpans).toEqual([
      spanOf(MESSAGE, "Why you want to know?"),
    ]);
    expect(draft!.changedSpans).toEqual([
      { start: 0, end: "Why do you want to know?".length },
    ]);
  });

  test("overlapping quotes merge into one span", () => {
    const draft = resolveCorrectionSpans(MESSAGE, {
      originalText: "Why you want to know?",
      correctedText: "Why do you want to know?",
      errorQuotes: ["Why you", "you want"],
      changedQuotes: ["do"],
      reason: "-",
      explanation: "-",
    });
    expect(draft!.errorSpans).toEqual([spanOf(MESSAGE, "Why you want")]);
  });

  test("a paraphrased originalText drops the correction", () => {
    const draft = resolveCorrectionSpans(MESSAGE, {
      originalText: "You want to know why?",
      correctedText: "Why do you want to know?",
      errorQuotes: ["Why you want"],
      changedQuotes: ["do"],
      reason: "-",
      explanation: "-",
    });
    expect(draft).toBeNull();
  });
});
