import type { CorrectionDraft } from "../src/features/episode/correction";

export interface CorrectionCase {
  entries?: { original: string; fixed: string }[];
  fixed?: string;
  korean?: boolean;
  name: string;
  original: string;
}

export const CORRECTION_CASES: CorrectionCase[] = [
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
    fixed: "i dont want it",
    name: "표기를 보존하며 교정",
    original: "i dont wants it",
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
    fixed: "she doesnt want coffee!!!",
    name: "예시에 없는 문법과 부호",
    original: "she dont want coffee!!!",
  },
];

/** 판정뿐 아니라 고친 문장 전체와 항목을 검사해 표기 교정이 섞이는 것도 찾는다. */
export function correctionViolations(
  sample: CorrectionCase,
  result: CorrectionDraft
): string[] {
  const expected = sample.fixed || sample.korean ? "corrected" : "natural";
  if (result.status !== expected) {
    return [`판정: ${result.status}, 기대: ${expected}`];
  }
  const errors: string[] = [];
  if (result.status === "natural") {
    return result.fixed === sample.original &&
      result.entries.length === 0 &&
      result.review === null
      ? []
      : ["문제없음에 수정 내용이 있음"];
  }
  if (sample.fixed && result.fixed !== sample.fixed) {
    errors.push(`고친 문장: ${result.fixed}`);
  }
  const { entries } = result;
  if (
    sample.entries &&
    (entries.length !== sample.entries.length ||
      entries.some(
        (entry, index) =>
          entry.original !== sample.entries?.[index]?.original ||
          entry.fixed !== sample.entries?.[index]?.fixed
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
