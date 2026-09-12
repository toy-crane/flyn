import { expect, test } from "bun:test";
import type { CorrectionDraft } from "../src/features/episode/correction";
import { correctionViolations } from "./correction-cases";
import baseline from "./results/correction-baseline-1789226591539.json";

test("변경 전 모델의 대소문자 교정 세 번을 모두 떨어뜨린다", () => {
  const answers = baseline.records.filter(
    (record) => record.sample.name === "문장 중간 대문자"
  );
  expect(answers).toHaveLength(3);
  for (const answer of answers) {
    expect(
      correctionViolations(answer.sample, answer.output as CorrectionDraft)
    ).not.toEqual([]);
  }
});

const review = {
  example: "I went to school early.",
  exampleMeaning: "학교에 일찍 갔어요.",
  meaning: "집에 일찍 갔어요.",
  situation: "집에 간 일을 말할 때",
};
const corrected: CorrectionDraft = {
  entries: [
    {
      fixed: "went",
      original: "goed",
      pattern: "past-go",
      why: "go의 과거형은 went예요.",
    },
  ],
  fixed: "I went home early",
  review,
  status: "corrected",
};
const sample = {
  entries: [{ fixed: "went", original: "goed" }],
  fixed: "I went home early",
  name: "과거형",
  original: "I goed home early",
};

test("표현 자리만 고친 답을 통과시키고 표기 수정이 섞인 답은 떨어뜨린다", () => {
  expect(correctionViolations(sample, corrected)).toEqual([]);
  expect(
    correctionViolations(sample, { ...corrected, fixed: "I went home early." })
  ).not.toEqual([]);
  expect(
    correctionViolations(sample, {
      ...corrected,
      entries: [
        {
          fixed: "I went",
          original: "I goed",
          pattern: "past-go",
          why: "go의 과거형은 went예요.",
        },
      ],
    })
  ).not.toEqual([]);
});

test("표기만 어긋난 문장을 교정하거나 몰래 고치면 떨어뜨린다", () => {
  const notation = { name: "표기", original: "Hello. what is your name?" };
  expect(correctionViolations(notation, corrected)).not.toEqual([]);
  expect(
    correctionViolations(notation, {
      entries: [],
      fixed: "Hello. What is your name?",
      review: null,
      status: "natural",
    })
  ).not.toEqual([]);
  expect(
    correctionViolations(notation, {
      entries: [],
      fixed: notation.original,
      review: null,
      status: "natural",
    })
  ).toEqual([]);
});

test("교정 항목이나 학습 내용이 없으면 통과하지 않는다", () => {
  expect(
    correctionViolations(sample, { ...corrected, entries: [] })
  ).not.toEqual([]);
  expect(
    correctionViolations(sample, { ...corrected, review: null })
  ).not.toEqual([]);
});
