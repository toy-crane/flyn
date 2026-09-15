import type { ModelMessage } from "ai";
import {
  type CorrectionDraft,
  readExpressionResult,
} from "../src/features/episode/correction";

export interface CorrectionCase {
  context?: ModelMessage[];
  entries?: { fixed: string; isError?: boolean; original: string }[];
  fixed?: string;
  forbiddenFixedTerms?: string[];
  korean?: boolean;
  maximumErrorEntries?: number;
  minimumErrorEntries?: number;
  name: string;
  original: string;
  requiredFixedTerms?: string[];
  requiresClassification?: boolean;
  requiresSuggestion?: boolean;
  status?: CorrectionDraft["status"];
}

export const CORRECTION_CASES: CorrectionCase[] = [
  {
    context: [
      { content: "이동 시간이 다가와 커피를 포장하려 해요", role: "user" },
      {
        content: "Mia: Would you like a mug or a paper cup?",
        role: "assistant",
      },
    ],
    maximumErrorEntries: 0,
    name: "문법은 맞지만 상황에 맞는 표현이 있음",
    original: "Can I take this coffee with me?",
    requiredFixedTerms: ["coffee", "to go"],
    requiresClassification: true,
    requiresSuggestion: true,
    status: "corrected",
  },
  {
    context: [
      { content: "이동 시간이 다가와 커피를 포장하려 해요", role: "user" },
      {
        content: "Mia: Would you like a mug or a paper cup?",
        role: "assistant",
      },
    ],
    name: "이미 상황에 맞는 표현",
    original: "Can I get this coffee to go?",
    status: "natural",
  },
  {
    context: [
      { content: "이동 시간이 다가와 커피를 포장하려 해요", role: "user" },
      {
        content: "Mia: Would you like a mug or a paper cup?",
        role: "assistant",
      },
    ],
    minimumErrorEntries: 1,
    name: "오류와 상황 표현을 함께 제안",
    original: "I wants this coffee in a cup I can take away.",
    requiredFixedTerms: ["want", "coffee", "to go"],
    requiresClassification: true,
    requiresSuggestion: true,
    status: "corrected",
  },
  {
    context: [
      {
        content: "Mia: I can make another one for you.",
        role: "assistant",
      },
    ],
    forbiddenFixedTerms: ["exchange", "sorry", "apolog"],
    minimumErrorEntries: 1,
    name: "직설적인 환불 요구와 태도 보존",
    original: "I dont wants a replacement. I want my money back.",
    requiredFixedTerms: ["replacement", "money back"],
    requiresClassification: true,
    status: "corrected",
  },
  {
    context: [
      {
        content: "주문과 다른 음료를 받아 다시 만들어 달라고 해요",
        role: "user",
      },
      { content: "Mia: Is something wrong with it?", role: "assistant" },
    ],
    forbiddenFixedTerms: ["allerg", "two drinks", "refund"],
    minimumErrorEntries: 1,
    name: "긴 문장의 뜻과 사실 보존",
    original:
      "I ordered an iced latte with oat milk, but you give me a hot one with regular milk, and I want you to make it again.",
    requiredFixedTerms: ["iced", "oat milk", "hot", "regular milk"],
    requiresClassification: true,
    status: "corrected",
  },
  {
    context: [
      {
        content: "주문한 아이스커피 대신 뜨거운 커피가 나왔어요",
        role: "user",
      },
      { content: "Mia: Here you go. One hot latte!", role: "assistant" },
    ],
    maximumErrorEntries: 0,
    name: "주문과 다른 음료 문맥의 표현 제안",
    original: "This is not my coffee.",
    requiredFixedTerms: ["order"],
    requiresClassification: true,
    requiresSuggestion: true,
    status: "corrected",
  },
  {
    context: [
      { content: "두 잔 가운데 자기 커피를 찾고 있어요", role: "user" },
      { content: "Mia: Which one is yours?", role: "assistant" },
    ],
    name: "같은 문장이 소유를 가르는 문맥에서는 그대로",
    original: "This is not my coffee.",
    status: "natural",
  },
  {
    context: [
      { content: "저녁이라 카페인 없는 커피를 주문하려 해요", role: "user" },
      {
        content: "Mia: What kind of coffee would you like?",
        role: "assistant",
      },
    ],
    korean: true,
    maximumErrorEntries: 0,
    name: "한국어와 영어 혼합 안내",
    original: "Can I get this coffee 디카페인으로?",
    requiredFixedTerms: ["coffee", "decaf"],
    requiresClassification: true,
    requiresSuggestion: true,
    status: "corrected",
  },
  {
    context: [
      {
        content: "주문한 아이스커피 대신 뜨거운 커피가 나왔어요",
        role: "user",
      },
      { content: "Mia: Here you go. One hot latte!", role: "assistant" },
    ],
    name: "문맥으로도 뜻을 알 수 없음",
    original: "Coffee before blue same because.",
    status: "unclear",
  },
  {
    context: [
      { content: "주문 조건이 모두 다른 음료를 받았어요", role: "user" },
      { content: "Mia: Did I get something wrong?", role: "assistant" },
    ],
    forbiddenFixedTerms: ["refund", "exchange"],
    minimumErrorEntries: 1,
    name: "수량과 알레르기 요구를 빠뜨리거나 더하지 않음",
    original:
      "I need two decaf lattes with oat milk because I am allergic to dairy, but you gives me one regular latte.",
    requiredFixedTerms: [
      "need",
      "two",
      "decaf",
      "oat milk",
      "allerg",
      "dairy",
      "one",
      "regular",
    ],
    requiresClassification: true,
    status: "corrected",
  },
  {
    context: [
      {
        content: "아이스 아메리카노를 주문했는데 뜨거운 라테가 나왔어요",
        role: "user",
      },
      {
        content:
          "Mia: I’m sorry. I’ll make a new one now. It will be ready soon.",
        role: "assistant",
      },
    ],
    entries: [{ fixed: "tomorrow", original: "tommorow" }],
    fixed: "Thanks sarah. See you tomorrow",
    name: "대화 중 두 문장의 표기를 보존하며 철자 교정",
    original: "Thanks sarah. See you tommorow",
  },
  {
    context: [
      {
        content: "아이스 아메리카노를 주문했는데 뜨거운 라테가 나왔어요",
        role: "user",
      },
      {
        content:
          "Mia: I’m sorry. Your receipt says iced Americano, so I made the wrong drink. I’ll make a new one now. It will be ready soon.",
        role: "assistant",
      },
      { content: "Thanks sarah. See you tommorow", role: "user" },
      {
        content:
          "Mia: It’s Mia, but no problem. Do you still want the iced Americano?",
        role: "assistant",
      },
    ],
    name: "대화 문맥에서도 공손함과 표기를 고치지 않음",
    original: "Yes please, I want the iced americano",
  },
  { name: "문장 중간 대문자", original: "Hello. what is your name?" },
  { name: "문장 끝 부호 생략", original: "Hello. What is your name" },
  { name: "아포스트로피 생략", original: "I dont like it here" },
  { name: "고유명사 소문자", original: "Thanks sarah" },
  { name: "채팅 말투", original: "Im gonna go lol" },
  { name: "이모지와 겹친 부호", original: "Thanks!!! 😊" },
  { name: "영국식 철자", original: "My favourite colour is blue" },
  { name: "띄어쓰기와 쉼표", original: "Yes  I like it" },
  {
    entries: [{ fixed: "went", original: "goed" }],
    fixed: "I went home early",
    name: "문법만 교정",
    original: "I goed home early",
  },
  {
    entries: [{ fixed: "want", original: "wants" }],
    fixed: "I dont want it",
    name: "표기를 보존하며 교정",
    original: "I dont wants it",
  },
  {
    entries: [{ fixed: "tomorrow", original: "tommorow" }],
    fixed: "See you tomorrow",
    name: "철자 오타",
    original: "See you tommorow",
  },
  {
    entries: [{ fixed: "receive", original: "recieve" }],
    fixed: "I will receive it",
    name: "다른 철자 오타",
    original: "I will recieve it",
  },
  {
    entries: [{ fixed: "It's", original: "Its" }],
    fixed: "It's raining outside",
    name: "its와 it's",
    original: "Its raining outside",
  },
  {
    entries: [{ fixed: "their", original: "there" }],
    fixed: "This is their house",
    name: "there와 their",
    original: "This is there house",
  },
  {
    entries: [{ fixed: "We'll", original: "Well" }],
    fixed: "We'll go home tomorrow",
    name: "well과 we'll",
    original: "Well go home tomorrow",
  },
  { korean: true, name: "한국어 안내", original: "집에 일찍 가고 싶어요" },
  { name: "예시에 없는 표기", original: "we are meeting alex on monday" },
  { name: "예시에 없는 축약", original: "I cant come tonight lol" },
  {
    entries: [{ fixed: "doesnt", original: "dont" }],
    fixed: "She doesnt want coffee!!!",
    name: "예시에 없는 문법과 부호",
    original: "She dont want coffee!!!",
  },
];

/** 판정뿐 아니라 고친 문장 전체와 항목을 검사해 표기 교정이 섞이는 것도 찾는다. */
export function correctionViolations(
  sample: CorrectionCase,
  result: CorrectionDraft
): string[] {
  const expected =
    sample.status ?? (sample.fixed || sample.korean ? "corrected" : "natural");
  if (result.status !== expected) {
    return [`판정: ${result.status}, 기대: ${expected}`];
  }
  if (result.status === "natural") {
    return result.fixed === sample.original &&
      result.entries.length === 0 &&
      result.review === null
      ? []
      : ["문제없음에 수정 내용이 있음"];
  }
  if (result.status === "unclear") {
    return result.fixed === "" &&
      result.entries.length === 0 &&
      result.review === null
      ? []
      : ["뜻을 알 수 없음에 수정 내용이 있음"];
  }

  const errors: string[] = [];
  if (sample.fixed && result.fixed !== sample.fixed) {
    errors.push(`고친 문장: ${result.fixed}`);
  }
  errors.push(...classificationViolations(sample, result.entries));
  errors.push(...entryViolations(sample, result));
  errors.push(...meaningViolations(sample, result.fixed));
  try {
    readExpressionResult(result, "evaluation-message", sample.original.trim());
  } catch (error) {
    errors.push(
      `서버 검사: ${error instanceof Error ? error.message : "Invalid expression result."}`
    );
  }
  return errors;
}

function classificationViolations(
  sample: CorrectionCase,
  entries: CorrectionDraft["entries"]
): string[] {
  const errors: string[] = [];
  if (
    sample.requiresClassification &&
    entries.some((entry) => typeof entry.isError !== "boolean")
  ) {
    errors.push("실제 오류와 표현 제안 구분이 없음");
  }
  const errorEntries = entries.filter((entry) => entry.isError !== false);
  if (
    sample.minimumErrorEntries !== undefined &&
    errorEntries.length < sample.minimumErrorEntries
  ) {
    errors.push(`실제 오류 항목: ${errorEntries.length}개`);
  }
  if (
    sample.maximumErrorEntries !== undefined &&
    errorEntries.length > sample.maximumErrorEntries
  ) {
    errors.push(
      `실제 오류가 아닌 항목을 오류로 표시함: ${errorEntries.length}개`
    );
  }
  if (
    sample.requiresSuggestion &&
    !entries.some((entry) => entry.isError === false)
  ) {
    errors.push("상황에 맞는 표현 제안이 없음");
  }
  return errors;
}

function entryViolations(
  sample: CorrectionCase,
  result: CorrectionDraft
): string[] {
  const errors: string[] = [];
  const { entries } = result;
  if (
    sample.entries &&
    (entries.length !== sample.entries.length ||
      entries.some(
        (entry, index) =>
          entry.original !== sample.entries?.[index]?.original ||
          entry.fixed !== sample.entries?.[index]?.fixed ||
          (sample.entries[index]?.isError !== undefined &&
            entry.isError !== sample.entries[index]?.isError)
      ))
  ) {
    errors.push(`표현 항목: ${JSON.stringify(entries)}`);
  }
  if (
    !entries.length ||
    entries.some(
      (entry) =>
        !(
          entry.original.trim() &&
          entry.fixed.trim() &&
          sample.original.includes(entry.original) &&
          result.fixed.includes(entry.fixed)
        )
    )
  ) {
    errors.push("원문이나 고친 문장에 없는 표현 항목");
  }
  if (
    !result.review ||
    Object.values(result.review).some((value) => !value.trim())
  ) {
    errors.push("학습 내용이 없음");
  }
  return errors;
}

function meaningViolations(sample: CorrectionCase, fixed: string): string[] {
  const errors: string[] = [];
  const normalized = (value: string) =>
    value.replace(/[\p{P}\p{S}\p{C}\s]/gu, "").toLocaleLowerCase("en-US");
  const lowered = normalized(fixed);
  for (const term of sample.requiredFixedTerms ?? []) {
    if (!lowered.includes(normalized(term))) {
      errors.push(`보존해야 할 뜻이 없음: ${term}`);
    }
  }
  for (const term of sample.forbiddenFixedTerms ?? []) {
    if (lowered.includes(normalized(term))) {
      errors.push(`추가하면 안 되는 뜻이 있음: ${term}`);
    }
  }
  return errors;
}
