import {
  generateObject,
  jsonSchema,
  type LanguageModel,
  type ModelMessage,
} from "ai";

export interface CorrectionEntry {
  fixed: string;
  /** 원문의 실제 오류를 고친 항목인지. 옛 결과는 true로 읽는다. */
  isError?: boolean;
  original: string;
  /** 표현의 규칙을 가리키는 키. 반복된 실수를 숨기는 데 쓰지 않는다. */
  pattern: string;
  why: string;
}

export interface ExpressionReviewContent {
  example: string;
  exampleMeaning: string;
  meaning: string;
  situation: string;
}

export interface EpisodeCorrection {
  entries: CorrectionEntry[];
  fixed: string;
  messageId: string;
  original: string;
  review: ExpressionReviewContent;
}

export type ExpressionResult =
  | { messageId: string; status: "natural" | "unclear" }
  | { messageId: string; status: "corrected"; correction: EpisodeCorrection };

export interface CorrectionDraft {
  entries: CorrectionEntry[];
  fixed: string;
  review: ExpressionReviewContent | null;
  status: "corrected" | "natural" | "unclear";
}

const KOREAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
const CHANGED_NOTATION = /[\p{P}\p{S}\p{C}]|\uFE0E|\uFE0F|\u20E3/u;
const SPACING = /[\s\u0085]/gu;
const PROTECTED_SPACING = / {2,}|[^\S ]|\u0085/gu;
const ORDINARY_SPACING = /^ ?$/;
const POSSESSIVE_ENDING = /['’]s$/iu;
const S_CONTRACTION_STEMS = new Set([
  "he",
  "she",
  "it",
  "that",
  "this",
  "there",
  "here",
  "what",
  "who",
  "where",
  "when",
  "why",
  "how",
  "let",
]);
const TRAILING_SPACE = /\s$/;
const WORD = /\p{L}+(?:['’]\p{L}+)*/gu;
const UPPERCASE = /\p{Lu}/u;
const INTERNAL_APOSTROPHE = /(?<=\p{L})['’](?=\p{L})/gu;
const OMITTED_CONTRACTION =
  /\b(?:(?:do|does|did|is|are|was|were|has|have|had|could|should|would|must|need|might|dare|sha)nt|im|ive|youre|youve|youll|youd|hes|shes|thats|theres|heres|whats|whos|hows|wheres|whens|whys|theyre|theyve|theyll|theyd|weve)\b/gi;
const DISTINCT_APOSTROPHE_WORDS = new Map([
  ["its", "it's"],
  ["well", "we'll"],
  ["ill", "i'll"],
  ["hell", "he'll"],
  ["shell", "she'll"],
  ["wed", "we'd"],
  ["were", "we're"],
  ["lets", "let's"],
  ["id", "i'd"],
  ["shed", "she'd"],
  ["whore", "who're"],
]);

/**
 * 사용자가 한국어로 썼는지.
 *
 * 영어 교정과 한국어 안내를 가르는 판정이 여기 하나로 있다. 담아 둔 표현의
 * 출처 종류도 같은 문장을 같은 규칙으로 읽어야 카드가 교정과 안내를 뒤집어
 * 그리지 않는다.
 */
export function isKoreanText(text: string): boolean {
  return KOREAN.test(text);
}
export const correctionSchema = jsonSchema<CorrectionDraft>({
  additionalProperties: false,
  // biome-ignore assist/source/useSortedKeys: 모델이 판정과 완성 문장을 먼저 생성한 뒤 대응 조각을 추출하도록 출력 순서를 유지한다.
  properties: {
    status: { enum: ["corrected", "natural", "unclear"], type: "string" },
    fixed: {
      description:
        "먼저 완성하는 영어 문장 전체. natural이면 원문 그대로, unclear이면 빈 문자열. entries는 이 문장을 만든 뒤 원문과 비교해 추출한다.",
      type: "string",
    },
    entries: {
      items: {
        additionalProperties: false,
        properties: {
          fixed: {
            description:
              "영어 문장에 그대로 있는 대응 조각. isError=true면 실제로 바뀐 오류 낱말만 쓰며 바뀌지 않은 주변 낱말을 넣지 않는다.",
            minLength: 1,
            type: "string",
          },
          isError: {
            description:
              "원문의 실제 오류를 고쳤으면 true, 오류 없는 원문에 상황에 맞는 표현을 제안하면 false.",
            type: "boolean",
          },
          original: {
            description:
              "원문에 그대로 있는 대응 조각. isError=true면 오류 낱말만 쓰고, isError=false이며 구조가 크게 달라지면 구나 문장 전체를 쓸 수 있다.",
            minLength: 1,
            type: "string",
          },
          pattern: {
            description: "영어 kebab-case 규칙 키.",
            minLength: 1,
            type: "string",
          },
          why: {
            description:
              "핵심 규칙 또는 영어 표현과 한국어 뜻을 연결하는 짧은 해요체 한 문장.",
            minLength: 1,
            type: "string",
          },
        },
        required: ["original", "fixed", "pattern", "why", "isError"],
        type: "object",
      },
      type: "array",
    },
    review: {
      anyOf: [
        {
          additionalProperties: false,
          properties: {
            example: {
              description:
                "같은 표현을 다른 상황에서 쓰는 영어 예문 한 개. fixed를 반복하지 말고 대상이나 행동을 바꾸어 새 상황을 보여 준다.",
              maxLength: 1000,
              type: "string",
            },
            exampleMeaning: {
              description: "example 전체 문장의 한국어 뜻.",
              maxLength: 1000,
              type: "string",
            },
            meaning: {
              description: "fixed 전체 문장의 한국어 뜻.",
              maxLength: 1000,
              type: "string",
            },
            situation: {
              description: "이 표현을 쓰는 상황. 예: 주문한 것을 다시 말할 때",
              maxLength: 160,
              type: "string",
            },
          },
          required: ["situation", "meaning", "example", "exampleMeaning"],
          type: "object",
        },
        { type: "null" },
      ],
    },
  },
  required: ["status", "fixed", "entries", "review"],
  type: "object",
});

export function correctionSystemPrompt(): string {
  return `사용자의 마지막 '확인할 문장'을 영어 학습용으로 확인하고 JSON만 작성한다. 이전 대화는 상황을 이해하는 데만 쓰며, 이전 문장을 판정하지 않는다.

1. 뜻과 언어를 확인한다.
- 문맥으로도 뜻을 알 수 없으면 unclear, fixed="", entries=[], review=null이다.
- 한국어가 포함되면 같은 뜻의 자연스러운 영어를 안내한다. 한국어 원문은 오류가 아니다.
- 영어이면 실제 오류를 모두 찾은 뒤 상황에서 배울 새 표현이 필요한지 판단한다.

2. 완성 문장 fixed를 정한다.
- 실제 오류는 문법, 잘못 고른 낱말과 철자 오타다. 같은 실수가 반복돼도 모든 자리를 고친다. 각 동사의 주어를 원문에서 확인한다.
- 영어 표기(대소문자, 공백, 문장 부호, 아포스트로피 생략)는 그대로 둔다. dont/im 같은 표기, gonna/lol, 이모지와 미국식·영국식 철자 차이는 고치지 않는다.
- recieve/tommorow는 철자 오타다. its/it's, there/their, well/we'll은 뜻이 다른 낱말이므로 문맥에 맞지 않으면 고친다.
- 오류 없는 영어도 지금 상황에서 배울 차이가 있으면 표현을 제안한다. 포장 주문의 take this coffee with me → get this coffee to go처럼 상황에 쓰는 표현을 알려 준다.
- 이미 상황에 맞으면 그대로 둔다. 동의어, 축약, 공손함, 격식만 다른 표현은 제안하지 않는다. want → I'd like처럼 말투만 바꾸지 않는다.
- 뜻, 요청 행동, 수량, 조건, 감정과 태도를 보존한다. I need는 현재 필요하다는 말이고 I ordered는 과거 주문 사실이므로 서로 바꾸지 않는다. 원문에 없는 사과, 양보, 환불, 교환, 알레르기나 끝낸 절차를 추가하지 않는다.
- 한국어 안내는 영어로 옮기되 이미 자연스러운 영어 부분은 유지한다.
- 바꿀 내용이 없으면 natural, fixed=원문 그대로, entries=[], review=null이다. 바꿀 내용이 있으면 corrected다.

3. 원문과 완성한 fixed를 비교해 entries를 만든다.
- 실제로 다른 조각만 원문 순서대로 쓴다. original은 원문에서, fixed는 완성 문장에서 연속된 글자를 대소문자까지 그대로 복사한다. 같은 조각을 오류와 제안으로 중복해서 쓰지 않는다.
- 실제 오류는 가장 짧은 오류 낱말만 original에 넣고 isError=true로 쓴다. 주변의 올바른 낱말을 포함하지 않는다.
- 올바른 원문을 상황 표현으로 바꾼 항목은 isError=false다. 구조가 달라지면 구나 문장 전체도 대응 조각일 수 있다.
- 영어 원문의 entries.original을 대응 fixed로 치환한 결과가 완성 문장 fixed와 정확히 같아야 한다. 항목 밖의 표기와 글자를 바꾸지 않는다.
- 한국어 전체 문장은 entry 하나로 원문 전체와 영어 문장 전체를 대응하고 isError=false로 쓴다. 한영 혼합 문장도 조각은 반드시 실제 원문에서 복사한다.
- pattern은 subject-verb-agreement처럼 짧은 영어 kebab-case 키다. why는 고칠 이유 또는 상황에서 배울 이유를 설명하는 한국어 해요체 한 문장이다. 한국어 안내의 why는 핵심 영어 표현과 한국어 뜻을 연결한다. 채점, 칭찬, 오류 개수는 쓰지 않는다.

4. corrected에는 review를 작성한다.
- situation: 표현을 쓰는 상황 한 줄. meaning: fixed 전체 문장의 한국어 뜻.
- example: 같은 핵심 표현을 다른 대상이나 행동에 쓰는 영어 예문. fixed를 반복하거나 표기·축약만 바꾸지 않는다.
- exampleMeaning: example 전체 문장의 한국어 뜻.

판정 예시:
- "I dont wants it" → fixed="I dont want it", wants → want만 오류다.
- "She dont want it" → fixed="She doesnt want it", dont → doesnt만 오류다.
- "I goed home early" → fixed="I went home early", goed → went만 오류다.
- "Thanks sarah. See you tommorow" → fixed="Thanks sarah. See you tomorrow", tommorow → tomorrow만 오류다.
- "Its raining outside" → fixed="It's raining outside", Its → It's는 오류다.
- "This is there house" → fixed="This is their house", there → their는 오류다.
- "Well go home tomorrow" → fixed="We'll go home tomorrow", Well → We'll은 오류다.
- Hello. what is your name? / I dont like it here / Im gonna go lol → natural.
- 포장 주문: Can I take this coffee with me? → Can I get this coffee to go? (isError=false). 이미 Can I get this coffee to go?이면 natural.
- 포장 주문: I wants this coffee in a cup I can take away. → I want this coffee to go. wants → want는 true, in a cup I can take away → to go는 false다.
- 주문과 다른 음료를 받음: This is not my coffee. → This isn't what I ordered. (false). 다른 예문은 These shoes aren't what I ordered.처럼 대상을 바꾼다. 두 잔 중 내 것을 가리는 상황의 This is not my coffee.는 natural.
- Yes please, I want the iced americano / I want my money back. → 상황에 맞으면 natural. 공손한 말투로 바꾸지 않는다.`;
}

export interface CorrectionRequest {
  context: ModelMessage[];
  messageId: string;
  model: LanguageModel;
  original: string;
  signal?: AbortSignal;
}

/** 빈 출력과 확인 실패를 문제없음으로 바꾸지 않는다. */
export async function judgeExpression({
  context,
  messageId,
  model,
  original,
  signal,
}: CorrectionRequest): Promise<ExpressionResult> {
  const trimmed = original.trim();
  if (!trimmed) {
    return { messageId, status: "unclear" };
  }
  const messages: ModelMessage[] = [
    ...context,
    { content: `확인할 문장:\n${trimmed}`, role: "user" },
  ];
  const generate = (input: ModelMessage[], repairInstruction = "") =>
    generateObject({
      abortSignal: signal,
      maxRetries: 0,
      messages: input,
      model,
      schema: correctionSchema,
      system: `${correctionSystemPrompt()}${repairInstruction}`,
    });
  const { object } = await generate(messages);
  try {
    return readExpressionResult(object, messageId, trimmed);
  } catch (error) {
    // 모델이 만든 모순된 결과만 한 번 고친다. 네트워크 오류는 재호출하지 않고,
    // 두 호출은 요청이 받은 같은 시간 제한과 취소 신호를 사용한다.
    signal?.throwIfAborted();
    const repaired = await generate(
      [
        ...messages,
        { content: JSON.stringify(object), role: "assistant" },
        { content: `확인할 문장:\n${trimmed}`, role: "user" },
      ],
      `\n\n이전 판정은 검사에서 거절됐다: ${error instanceof Error ? error.message : "Invalid expression result."} 마지막 사용자 메시지의 '확인할 문장'을 다시 판정한다. 검사 안내를 번역하거나 교정하지 않는다. 실제로 바꾼 표현만 교정 항목에 담고, 각 조각은 원문과 고친 문장에서 그대로 가져온다. 영어는 모든 entry를 원문에 그대로 치환한 결과가 fixed와 정확히 같아야 한다. entry 밖의 대소문자, 공백, 아포스트로피와 문장 끝 부호는 원문 그대로 둔다. 실제 오류 항목에는 바뀌지 않은 주변 낱말을 넣지 않는다. 문장 전체가 한국어이면 entry 하나의 original에 한국어 원문 전체를, fixed에 영어 문장 전체를 그대로 복사하고 isError=false로 쓴다. corrected이면 review를 빠뜨리지 않는다. 고칠 말이나 상황에서 배울 표현이 없다면 항목을 만들어 내지 말고 natural로 판정한다.`
    );
    return readExpressionResult(repaired.object, messageId, trimmed);
  }
}

export function readExpressionResult(
  object: CorrectionDraft,
  messageId: string,
  trimmed: string
): ExpressionResult {
  if (
    !(object && Array.isArray(object.entries)) ||
    typeof object.fixed !== "string"
  ) {
    throw new Error("Invalid expression result.");
  }
  if (
    object.status === "unclear" &&
    object.entries.length === 0 &&
    !object.fixed.trim()
  ) {
    return { messageId, status: "unclear" };
  }
  const fixed = object.fixed.trim();
  if (
    object.status === "natural" &&
    fixed === trimmed &&
    object.entries.length === 0 &&
    !KOREAN.test(trimmed)
  ) {
    return { messageId, status: "natural" };
  }
  if (
    object.status !== "corrected" ||
    !fixed ||
    fixed === trimmed ||
    object.entries.length === 0
  ) {
    throw new Error("Inconsistent expression result.");
  }
  const entries = readCorrectionEntries(object.entries, trimmed, fixed);
  if (!isKoreanText(trimmed)) {
    validateEnglishChanges(trimmed, fixed, entries);
  }
  return {
    correction: {
      entries,
      fixed,
      messageId,
      original: trimmed,
      review: readReviewContent(object.review),
    },
    messageId,
    status: "corrected",
  };
}

function readCorrectionEntries(
  rawEntries: CorrectionDraft["entries"],
  original: string,
  fixed: string
): CorrectionEntry[] {
  const entries: CorrectionEntry[] = [];
  const seen = new Set<string>();
  for (const entry of rawEntries) {
    if (!entry) {
      throw new Error("Invalid expression entry.");
    }
    for (const key of ["original", "fixed", "pattern", "why"] as const) {
      if (typeof entry[key] !== "string" || !entry[key].trim()) {
        throw new Error(
          `Invalid expression entry. ${key} must be a non-empty string.`
        );
      }
    }
    if (!original.includes(entry.original)) {
      throw new Error(
        "Invalid expression entry. entries.original must be copied exactly from the user's original sentence."
      );
    }
    if (!fixed.includes(entry.fixed)) {
      throw new Error(
        "Invalid expression entry. entries.fixed must be copied exactly from the complete fixed sentence."
      );
    }
    if (entry.isError !== undefined && typeof entry.isError !== "boolean") {
      throw new Error("Invalid expression entry.");
    }
    const key = JSON.stringify([
      entry.original,
      entry.fixed,
      entry.pattern,
      entry.isError,
    ]);
    if (!seen.has(key)) {
      seen.add(key);
      entries.push(entry);
    }
  }
  return entries;
}

function validateEnglishChanges(
  original: string,
  fixed: string,
  entries: CorrectionEntry[]
): void {
  const errors = entries.filter((entry) => entry.isError !== false);
  const suggestions = entries.filter((entry) => entry.isError === false);
  const keepsPunctuation = errors.every(keepsEntryNotation);
  const hasOnlyLearnableSuggestions = suggestions.every(
    (entry) => hasLearnableDifference(entry) && keepsEntryNotation(entry)
  );
  const changesOnlyEntries = onlyReplacesEntries(original, fixed, entries);
  if (
    !(keepsPunctuation && hasOnlyLearnableSuggestions && changesOnlyEntries)
  ) {
    throw new Error("Expression result changes notation.");
  }
}

/** 표기만 다른 조각을 상황에 맞는 새 표현으로 저장하지 않는다. */
function hasLearnableDifference(entry: CorrectionEntry): boolean {
  const expression = (value: string) =>
    value.replace(/[\p{P}\p{S}\p{C}\s]/gu, "").toLocaleLowerCase("en-US");

  return expression(entry.original) !== expression(entry.fixed);
}

/** 최소 표현 조각의 앞뒤 표기는 그대로 두고, 바뀐 부분만 확인한다. */
function keepsEntryNotation(entry: CorrectionEntry): boolean {
  const withoutCaseOrSpacing = (value: string) =>
    value.replace(/\s/g, "").toLowerCase();
  if (
    withoutCaseOrSpacing(entry.original) === withoutCaseOrSpacing(entry.fixed)
  ) {
    return false;
  }
  const original = entry.original.replace(INTERNAL_APOSTROPHE, "");
  const fixed = entry.fixed.replace(INTERNAL_APOSTROPHE, "");
  // 활용형을 바꾸며 생략했던 부호를 복원하지 않는다. 낱말 자체가 다른
  // your/you're, their/they're, whose/who's는 이 생략 규칙에 포함되지 않는다.
  if (
    (entry.original.match(OMITTED_CONTRACTION)?.length ?? 0) >
      (entry.fixed.match(OMITTED_CONTRACTION)?.length ?? 0) &&
    (entry.fixed.match(INTERNAL_APOSTROPHE)?.length ?? 0) >
      (entry.original.match(INTERNAL_APOSTROPHE)?.length ?? 0)
  ) {
    return false;
  }
  const originalCharacters = Array.from(original);
  const fixedCharacters = Array.from(fixed);
  let start = 0;
  let originalEnd = originalCharacters.length;
  let fixedEnd = fixedCharacters.length;
  while (
    start < originalEnd &&
    start < fixedEnd &&
    originalCharacters[start] === fixedCharacters[start]
  ) {
    start += 1;
  }
  while (
    originalEnd > start &&
    fixedEnd > start &&
    originalCharacters[originalEnd - 1] === fixedCharacters[fixedEnd - 1]
  ) {
    originalEnd -= 1;
    fixedEnd -= 1;
  }
  const changedOriginal = originalCharacters.slice(start, originalEnd).join("");
  const changedFixed = fixedCharacters.slice(start, fixedEnd).join("");
  if (!keepsWordNotation(entry.original, entry.fixed)) {
    return false;
  }
  // 같은 뒷말에 다른 표현을 붙일 때 그 사이의 공백을 없애지 않는다.
  // 관사처럼 표현 전체를 넣거나 빼는 교정은 허용한다.
  if (
    changedOriginal &&
    changedFixed &&
    originalEnd < originalCharacters.length &&
    fixedEnd < fixedCharacters.length &&
    TRAILING_SPACE.test(changedOriginal) !== TRAILING_SPACE.test(changedFixed)
  ) {
    return false;
  }
  return !(
    CHANGED_NOTATION.test(changedOriginal.replace(SPACING, "")) ||
    CHANGED_NOTATION.test(changedFixed.replace(SPACING, ""))
  );
}

function keepsWordNotation(original: string, fixed: string): boolean {
  const source = notationWords(original);
  const target = notationWords(fixed);
  const before = source.words;
  const after = target.words;
  if (
    !keepsSpacing(source.tail, target.tail) ||
    JSON.stringify(original.match(PROTECTED_SPACING) ?? []) !==
      JSON.stringify(fixed.match(PROTECTED_SPACING) ?? []) ||
    (before.length + 1) * (after.length + 1) > 10_000
  ) {
    return false;
  }
  let costs = Array.from({ length: after.length + 1 }, (_, index) => index);
  let valid = costs.map(() => true);
  for (const [originalIndex, { word, spacing }] of before.entries()) {
    const nextCosts = [(costs[0] ?? 0) + 1];
    const nextValid = [valid[0] ?? true];
    for (const [index, next] of after.entries()) {
      const replacement = next.word;
      const sameWord = plainWord(word) === plainWord(replacement);
      const replace = (costs[index] ?? 0) + (sameWord ? 0 : 1);
      const remove = (costs[index + 1] ?? 0) + 1;
      const insert = (nextCosts[index] ?? 0) + 1;
      const best = Math.min(replace, remove, insert);
      // 최소 낱말 편집 경로에서만 표기를 비교한다. 관사 삽입을 치환으로 읽지 않는다.
      const keepsCase = keepsWordPair(
        word,
        replacement,
        spacing,
        next.spacing,
        originalIndex,
        index
      );
      nextCosts.push(best);
      nextValid.push(
        (replace === best && !!valid[index] && keepsCase) ||
          (remove === best && !!valid[index + 1]) ||
          (insert === best && !!nextValid[index])
      );
    }
    costs = nextCosts;
    valid = nextValid;
  }
  return valid[after.length] ?? false;
}

function notationWords(text: string) {
  let previousEnd = 0;
  const words = Array.from(text.matchAll(WORD), (match) => {
    const spacing = (
      text.slice(previousEnd, match.index).match(SPACING) ?? []
    ).join("");
    previousEnd = match.index + match[0].length;
    return { spacing, word: match[0] };
  });
  return {
    tail: (text.slice(previousEnd).match(SPACING) ?? []).join(""),
    words,
  };
}

function keepsSpacing(
  original: string,
  fixed: string,
  boundaryShift = false
): boolean {
  return (
    original === fixed ||
    (boundaryShift &&
      ORDINARY_SPACING.test(original) &&
      ORDINARY_SPACING.test(fixed))
  );
}

function plainWord(word: string): string {
  return word.replace(INTERNAL_APOSTROPHE, "").toLowerCase();
}

function keepsWordPair(
  original: string,
  fixed: string,
  originalSpacing: string,
  fixedSpacing: string,
  originalIndex: number,
  fixedIndex: number
): boolean {
  return (
    (original === "I" ||
      fixed === "I" ||
      wordCase(original) === wordCase(fixed)) &&
    keepsWordApostrophe(original, fixed) &&
    keepsSpacing(
      originalSpacing,
      fixedSpacing,
      (originalIndex === 0 || fixedIndex === 0) && originalIndex !== fixedIndex
    )
  );
}

function keepsWordApostrophe(original: string, fixed: string): boolean {
  if (plainWord(original) !== plainWord(fixed)) {
    if (plainWord(original).endsWith("s") && plainWord(fixed).endsWith("s")) {
      return possessiveEnding(original) === possessiveEnding(fixed);
    }
    return true;
  }
  const before = original.toLowerCase();
  const after = fixed.toLowerCase();
  return (
    before === after ||
    DISTINCT_APOSTROPHE_WORDS.get(before.replace(/’/g, "'")) ===
      after.replace(/’/g, "'") ||
    DISTINCT_APOSTROPHE_WORDS.get(after.replace(/’/g, "'")) ===
      before.replace(/’/g, "'")
  );
}

function possessiveEnding(word: string): string {
  const ending = word.match(POSSESSIVE_ENDING)?.[0];
  if (
    !ending ||
    S_CONTRACTION_STEMS.has(word.slice(0, -ending.length).toLowerCase())
  ) {
    return "";
  }
  return ending;
}

function wordCase(word: string): string {
  if (word === word.toLowerCase()) {
    return "lower";
  }
  if (word === word.toUpperCase()) {
    return "upper";
  }
  if (
    UPPERCASE.test(word[0] ?? "") &&
    word.slice(1) === word.slice(1).toLowerCase()
  ) {
    return "title";
  }
  return Array.from(word)
    .flatMap((letter, index) => (UPPERCASE.test(letter) ? [index] : []))
    .join(":");
}

/** 같은 조각이 여러 번 나와도 실제로 바꾼 자리만 대응시킨다. */
function onlyReplacesEntries(
  original: string,
  fixed: string,
  entries: CorrectionEntry[]
): boolean {
  const allUsed = "1".repeat(entries.length);
  const indexedEntries = entries.map((entry, index) => ({ entry, index }));
  const pending: [number, number, string][] = [
    [0, 0, "0".repeat(entries.length)],
  ];
  const seen = new Set<string>();
  while (pending.length) {
    const position = pending.pop();
    if (!position) {
      break;
    }
    let [left, right, used] = position;
    const key = `${left}:${right}:${used}`;
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    // 모호한 모델 출력 때문에 조합을 끝없이 검사하지 않는다.
    if (seen.size > 10_000) {
      return false;
    }
    while (left < original.length && right < fixed.length) {
      const matches = indexedEntries.filter(
        ({ entry }) =>
          entry.original !== entry.fixed &&
          original.startsWith(entry.original, left) &&
          fixed.startsWith(entry.fixed, right)
      );
      for (const { entry, index } of matches) {
        pending.push([
          left + entry.original.length,
          right + entry.fixed.length,
          `${used.slice(0, index)}1${used.slice(index + 1)}`,
        ]);
      }
      if (original[left] !== fixed[right]) {
        break;
      }
      left += 1;
      right += 1;
    }
    if (
      left === original.length &&
      right === fixed.length &&
      used === allUsed
    ) {
      return true;
    }
  }
  return false;
}

function readReviewContent(
  value: ExpressionReviewContent | null
): ExpressionReviewContent {
  if (
    !(
      value &&
      [
        value.situation,
        value.meaning,
        value.example,
        value.exampleMeaning,
      ].every(
        (text) =>
          typeof text === "string" &&
          text.trim().length > 0 &&
          text.length <= 1000
      )
    ) ||
    value.situation.length > 160
  ) {
    throw new Error("Incomplete expression review content.");
  }
  return {
    example: value.example.trim(),
    exampleMeaning: value.exampleMeaning.trim(),
    meaning: value.meaning.trim(),
    situation: value.situation.trim(),
  };
}
