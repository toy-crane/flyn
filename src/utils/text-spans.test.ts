import { expect, test } from "bun:test";

import { splitBySpans } from "@/utils/text-spans";

test("an error-free sentence stays one plain run — no underline", () => {
  expect(splitBySpans("Where was this photo taken?", [])).toEqual([
    { text: "Where was this photo taken?", flagged: false },
  ]);
});

test("flags only the wrong words inside the learner's own text", () => {
  const text = '*I hold the case tighter* "Why you want to know?"';
  const start = text.indexOf("Why you want");

  const segments = splitBySpans(text, [
    { start, end: start + "Why you want".length },
  ]);

  expect(segments.filter((segment) => segment.flagged)).toEqual([
    { text: "Why you want", flagged: true },
  ]);
  expect(segments.map((segment) => segment.text).join("")).toBe(text);
});

test("keeps several spans in reading order regardless of input order", () => {
  const segments = splitBySpans("one two three", [
    { start: 8, end: 13 },
    { start: 0, end: 3 },
  ]);

  expect(segments).toEqual([
    { text: "one", flagged: true },
    { text: " two ", flagged: false },
    { text: "three", flagged: true },
  ]);
});

test("clamps a span that runs past the end of the text", () => {
  const segments = splitBySpans("short", [{ start: 2, end: 99 }]);

  expect(segments).toEqual([
    { text: "sh", flagged: false },
    { text: "ort", flagged: true },
  ]);
});

test("merges overlapping spans instead of double-cutting", () => {
  const segments = splitBySpans("abcdef", [
    { start: 1, end: 4 },
    { start: 2, end: 5 },
  ]);

  expect(segments.map((segment) => segment.text).join("")).toBe("abcdef");
  expect(segments).toEqual([
    { text: "a", flagged: false },
    { text: "bcd", flagged: true },
    { text: "e", flagged: true },
    { text: "f", flagged: false },
  ]);
});

test("drops an empty or inverted span", () => {
  expect(splitBySpans("abc", [{ start: 2, end: 2 }])).toEqual([
    { text: "abc", flagged: false },
  ]);
  expect(splitBySpans("abc", [{ start: 3, end: 1 }])).toEqual([
    { text: "abc", flagged: false },
  ]);
});
