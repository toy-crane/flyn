import { expect, test } from "bun:test";
import {
  type CorrectionDraft,
  readExpressionResult,
} from "../src/features/episode/correction";
import { CORRECTION_CASES, correctionViolations } from "./correction-cases";
import baseline from "./results/correction-baseline-1789226591539.json";
import previousEvaluation from "./results/correction-candidate-1789471175086.json";
import finalEvaluation from "./results/correction-candidate-1789475800984.json";

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

test("최종 실제 출력 96건은 현재 평가 기준을 모두 통과한다", () => {
  expect(finalEvaluation.records).toHaveLength(CORRECTION_CASES.length * 3);
  for (const record of finalEvaluation.records) {
    const sample = CORRECTION_CASES.find(
      (entry) => entry.name === record.sample.name
    );
    if (!sample) {
      throw new Error(`Unknown evaluation case: ${record.sample.name}`);
    }
    expect(
      correctionViolations(sample, record.output as CorrectionDraft)
    ).toEqual([]);
  }
});

test("현재 필요한 음료를 과거 주문으로 바꾼 이전 평가 출력을 떨어뜨린다", () => {
  const sample = CORRECTION_CASES.find(
    (entry) => entry.name === "수량과 알레르기 요구를 빠뜨리거나 더하지 않음"
  );
  if (!sample) {
    throw new Error("Missing request-preservation case.");
  }
  const changedRequests = previousEvaluation.records.filter(
    (record) => record.sample.name === sample.name && record.round > 1
  );
  expect(changedRequests).toHaveLength(2);
  for (const record of changedRequests) {
    expect(
      correctionViolations(sample, record.output as CorrectionDraft)
    ).not.toEqual([]);
  }
});

test("오류와 제안 분류를 뒤집으면 평가에서 떨어뜨린다", () => {
  const sample = CORRECTION_CASES.find(
    (entry) => entry.name === "오류와 상황 표현을 함께 제안"
  );
  const record = previousEvaluation.records.find(
    (entry) => entry.sample.name === sample?.name
  );
  if (!(sample && record)) {
    throw new Error("Missing mixed correction case.");
  }
  const output = record.output as CorrectionDraft;
  expect(correctionViolations(sample, output)).toEqual([]);
  expect(
    correctionViolations(sample, {
      ...output,
      entries: output.entries.map((entry) => ({
        ...entry,
        isError: !entry.isError,
      })),
    })
  ).not.toEqual([]);
});

test("독립된 오류 중 하나만 수정하면 평가에서 떨어뜨린다", () => {
  const sample = CORRECTION_CASES.find(
    (entry) => entry.name === "독립된 두 오류를 모두 수정"
  );
  if (!sample) {
    throw new Error("Missing multiple-error case.");
  }
  const output: CorrectionDraft = {
    entries: [
      {
        fixed: "goes",
        isError: true,
        original: "go",
        pattern: "agreement",
        why: "주어에 맞춰 goes를 써요.",
      },
      {
        fixed: "went",
        isError: true,
        original: "goed",
        pattern: "past-go",
        why: "go의 과거형은 went예요.",
      },
    ],
    fixed: "She goes to work every day. Yesterday I went home early.",
    review,
    status: "corrected",
  };
  expect(correctionViolations(sample, output)).toEqual([]);
  expect(
    correctionViolations(sample, {
      ...output,
      entries: output.entries.slice(0, 1),
      fixed: "She goes to work every day. Yesterday I goed home early.",
    })
  ).not.toEqual([]);
});

test("빠진 아포스트로피만 보탠 결과는 서버에서도 받지 않는다", () => {
  expect(() =>
    readExpressionResult(
      {
        entries: [
          {
            fixed: "can't",
            isError: true,
            original: "cant",
            pattern: "contraction",
            why: "can't는 cannot의 축약형이에요.",
          },
        ],
        fixed: "I can't come tonight lol",
        review,
        status: "corrected",
      },
      "message",
      "I cant come tonight lol"
    )
  ).toThrow("Expression result changes notation.");
});

test("문장 전체 표현 제안에 섞인 대소문자와 문장 부호 변경을 받지 않는다", () => {
  expect(() =>
    readExpressionResult(
      {
        entries: [
          {
            fixed: "can i get this coffee to go.",
            isError: false,
            original: "Can I take this coffee with me?",
            pattern: "coffee-to-go",
            why: "포장할 음료를 주문할 때는 to go라고 해요.",
          },
        ],
        fixed: "can i get this coffee to go.",
        review,
        status: "corrected",
      },
      "message",
      "Can I take this coffee with me?"
    )
  ).toThrow("Expression result changes notation.");
});
const corrected: CorrectionDraft = {
  entries: [
    {
      fixed: "went",
      isError: true,
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
  entries: [{ fixed: "went", isError: true, original: "goed" }],
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

test("제안문을 표기만 바꿔 다른 예문으로 반복하면 떨어뜨린다", () => {
  expect(
    correctionViolations(sample, {
      ...corrected,
      review: { ...review, example: "I WENT home early." },
    })
  ).toContain("다른 예문이 제안문을 반복함");
});

test("상황에 맞는 표현 제안은 원문 오류와 구분해야 통과한다", () => {
  const contextual = {
    entries: [
      {
        fixed: "get this coffee to go",
        isError: false,
        original: "take this coffee with me",
      },
    ],
    name: "상황에 맞는 표현",
    original: "Can I take this coffee with me?",
    status: "corrected" as const,
  };
  const suggestion: CorrectionDraft = {
    entries: [
      {
        fixed: "get this coffee to go",
        isError: false,
        original: "take this coffee with me",
        pattern: "coffee-to-go",
        why: "음료를 포장해서 가져갈 때는 to go라고 해요.",
      },
    ],
    fixed: "Can I get this coffee to go?",
    review,
    status: "corrected",
  };

  expect(correctionViolations(contextual, suggestion)).toEqual([]);
  const [suggestionEntry] = suggestion.entries;
  if (!suggestionEntry) {
    throw new Error("표현 제안 항목이 필요합니다.");
  }
  expect(
    correctionViolations(contextual, {
      ...suggestion,
      entries: [{ ...suggestionEntry, isError: true }],
    })
  ).not.toEqual([]);
  expect(
    correctionViolations(contextual, {
      ...suggestion,
      fixed: "Can I get this coffee to go",
    })
  ).not.toEqual([]);
});

test("뜻과 태도를 바꾸거나 항목 구분을 빼면 통과하지 않는다", () => {
  const attitude = {
    forbiddenFixedTerms: ["exchange", "sorry"],
    minimumErrorEntries: 1,
    name: "직설적인 환불 요구",
    original: "I dont wants a replacement. I want my money back.",
    requiredFixedTerms: ["replacement", "money back"],
    requiresClassification: true,
    status: "corrected" as const,
  };
  const answer: CorrectionDraft = {
    entries: [
      {
        fixed: "want",
        isError: true,
        original: "wants",
        pattern: "verb-after-do",
        why: "dont 뒤에는 wants가 아니라 want를 써요.",
      },
    ],
    fixed: "I dont want a replacement. I want my money back.",
    review,
    status: "corrected",
  };

  expect(correctionViolations(attitude, answer)).toEqual([]);
  const [answerEntry] = answer.entries;
  if (!answerEntry) {
    throw new Error("교정 항목이 필요합니다.");
  }
  expect(
    correctionViolations(attitude, {
      ...answer,
      fixed: "Sorry, can I exchange it?",
    })
  ).not.toEqual([]);
  expect(
    correctionViolations(attitude, {
      ...answer,
      entries: [{ ...answerEntry, isError: undefined }],
    })
  ).not.toEqual([]);
});
