import {
  generateObject,
  jsonSchema,
  type LanguageModel,
  type ModelMessage,
} from "ai";

export interface CorrectionEntry {
  fixed: string;
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
const CHANGED_NOTATION = /[\p{P}\r\n\t]| {2,}/u;
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
  ["cant", "can't"],
  ["wont", "won't"],
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
  properties: {
    entries: {
      items: {
        additionalProperties: false,
        properties: {
          fixed: {
            description: "영어 문장에 그대로 있는 대응하는 조각.",
            type: "string",
          },
          original: {
            description: "원문에 그대로 있는 짧은 조각.",
            type: "string",
          },
          pattern: { description: "영어 kebab-case 규칙 키.", type: "string" },
          why: {
            description:
              "핵심 규칙 또는 영어 표현과 한국어 뜻을 연결하는 짧은 해요체 한 문장.",
            type: "string",
          },
        },
        required: ["original", "fixed", "pattern", "why"],
        type: "object",
      },
      type: "array",
    },
    fixed: {
      description:
        "고치거나 한국어에서 옮긴 영어 문장 전체. natural이면 원문 그대로, unclear이면 빈 문자열.",
      type: "string",
    },
    review: {
      anyOf: [
        {
          additionalProperties: false,
          properties: {
            example: {
              description: "같은 표현을 다른 상황에서 쓰는 영어 예문 한 개.",
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
    status: { enum: ["corrected", "natural", "unclear"], type: "string" },
  },
  required: ["status", "fixed", "entries", "review"],
  type: "object",
});

export function correctionSystemPrompt(): string {
  return `사용자의 마지막 문장을 확인하고 JSON만 작성한다. 대화 기록은 뜻과 상황을 파악하는 근거다.
- 판정 대상과 언어는 마지막의 '확인할 문장'만으로 정한다. 앞서 한국어를 썼어도 마지막 문장이 영어면 영어 교정 규칙을 따른다. 대화 기록의 문장을 다시 번역하거나 교정하지 않는다.
- 영어는 표현만 확인한다. 표현은 문법, 낱말 선택, 철자 오타다. 같은 표현 실수를 이미 알려 줬거나 앞서 올바르게 썼어도 이번 실수는 교정한다.
- 표기는 교정하지 않는다. 대소문자(문장 첫 글자, i, 사람 이름 포함), 문장 끝 부호, 쉼표, 띄어쓰기, 다른 낱말이 되지 않는 아포스트로피 생략은 그대로 둔다. dont, im처럼 아포스트로피가 없어도 뜻이 같은 것은 표기다. 표기만 어긋나면 status=natural, fixed=원문 그대로, entries=[], review=null이다.
- gonna, lol, 이모지, !!! 같은 채팅 말투와 미국식·영국식 철자 차이는 고치지도 지적하지도 않는다.
- recieve, tommorow 같은 철자 오타는 반드시 교정한다. its/it's, there/their, well/we'll처럼 서로 다른 낱말은 문맥에 맞지 않을 때 표현 교정이다. 모든 아포스트로피 차이를 무시하지 않는다.
- 표현을 교정해도 fixed에는 원문의 표기를 그대로 보존한다. 표현 자리만 바꾸고 대문자, 아포스트로피, 쉼표, 마침표, 물음표나 공백을 더하거나 빼지 않는다. entries에는 바뀐 표현의 최소 조각만 넣는다. 표기 항목을 만들거나 문장 전체를 항목으로 넣지 않는다.
- 영어의 fixed는 원문에서 entries의 original 조각을 fixed 조각으로 바꾼 결과여야 한다. 마지막으로 그 결과와 fixed 전체를 비교해 항목 밖의 글자가 바뀌었다면 원문대로 되돌린다. 여러 문장이어도 동일하며, 마지막 문장 끝이 낱말이면 fixed도 그 낱말에서 끝낸다. 예문을 새로 쓰듯 문장 끝을 다듬지 않는다.
- 표현을 바꾸면서 활용형이 달라져도 원문의 표기 방식을 따른다. 아포스트로피 없이 쓴 부정 축약형을 다른 활용형으로 바꿀 때도 아포스트로피를 넣지 않는다. 단, its/it's나 well/we'll처럼 서로 다른 낱말을 바로잡는 경우는 예외다.
- 예: Hello. what is your name? → natural. I dont like it here → natural. Thanks sarah → natural. Im gonna go lol → natural.
- 예: i dont wants it → fixed="i dont want it", entries의 조각은 wants → want 하나. I goed home early → fixed="I went home early", 조각은 goed → went 하나. See you tommorow → fixed="See you tomorrow", 조각은 tommorow → tomorrow 하나. 문장 끝 부호를 붙이지 않는다.
- 예: Its raining outside → fixed="It's raining outside", 조각은 Its → It's 하나. This is there house → fixed="This is their house", 조각은 there → their 하나. Well go home tomorrow → fixed="We'll go home tomorrow", 조각은 Well → We'll 하나.
- 영어에 실제 오류가 있으면 status=corrected. 뜻과 올바른 낱말을 유지하고 필요한 부분만 고친다. 이미 자연스러우면 취향 차이로 바꾸지 않고 status=natural, fixed=원문, entries=[]로 쓴다.
- 문법과 낱말이 맞는 요청은 직설적이어도 natural이다. 더 공손하게, 부드럽게, 격식 있게 바꾸는 것은 교정이 아니다. 원하는 것을 말하는 동사를 공손한 요청 구문으로 바꾸지 않는다. 인물의 반응은 태도를 다룰 수 있지만 이 판정은 예절을 가르치지 않는다.
- 한국어 또는 한국어와 영어가 섞인 문장은 status=corrected로 같은 뜻의 자연스러운 영어 문장 하나를 제안한다. 이미 자연스러운 영어 부분은 가능하면 유지한다. 한국어는 틀린 영어가 아니다. 각 why는 반드시 핵심 영어 표현과 그 한국어 뜻을 짧게 연결한다. 예: ‘집에 가다’는 head home이라고 해요. 한국어 안내의 why에는 문법 용어, 어순 규칙이나 오류 설명을 넣지 않는다.
- 문맥으로도 뜻을 알 수 없으면 status=unclear, fixed="", entries=[]로 쓴다. 뜻을 만들어 붙이거나 natural로 처리하지 않는다.
- corrected일 때 entries는 비울 수 없다. 모든 고친 표현 자리를 포함한다. original과 fixed 조각은 대소문자까지 각각 원문과 영어 문장에 실제로 있어야 한다. 같은 규칙이어도 다른 자리는 생략하지 않는다. 영어 표기 보존 규칙은 한국어 입력의 영어 안내에는 적용하지 않는다.
- 한국어 안내의 original도 원문에서 연속된 글자를 그대로 복사한다. 사전형으로 바꾸거나 떨어진 조각을 합치지 않는다. fixed 조각도 완성한 영어 문장에서 연속된 글자를 그대로 복사한다.
- why는 해요체 한국어 한 문장이다. 채점, 칭찬, 틀린 개수, 문법·어휘 같은 분류 이름은 쓰지 않는다.
- corrected이면 review에 쓰는 상황 한 줄, fixed 전체 문장의 한국어 뜻, 같은 표현을 다른 상황에서 쓴 영어 예문 하나와 그 뜻을 함께 작성한다. 한 메시지의 모든 수정은 같은 카드에 담는다. natural 또는 unclear이면 review=null이다.`;
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
  const { object } = await generateObject({
    abortSignal: signal,
    maxRetries: 0,
    messages: [
      ...context,
      { content: `확인할 문장:\n${trimmed}`, role: "user" },
    ],
    model,
    schema: correctionSchema,
    system: correctionSystemPrompt(),
  });
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
  const entries: CorrectionEntry[] = [];
  const seen = new Set<string>();
  for (const entry of object.entries) {
    if (
      !(
        entry &&
        [entry.original, entry.fixed, entry.pattern, entry.why].every(
          (value) => typeof value === "string" && value.trim()
        ) &&
        trimmed.includes(entry.original) &&
        fixed.includes(entry.fixed)
      )
    ) {
      throw new Error("Invalid expression entry.");
    }
    const key = JSON.stringify([entry.original, entry.fixed, entry.pattern]);
    if (!seen.has(key)) {
      seen.add(key);
      entries.push(entry);
    }
  }
  if (!isKoreanText(trimmed)) {
    const keepsPunctuation = entries.every(keepsEntryNotation);
    if (!(keepsPunctuation && onlyReplacesEntries(trimmed, fixed, entries))) {
      throw new Error("Expression result changes notation.");
    }
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
  const before = entry.original.toLowerCase().replace(/’/g, "'");
  const after = entry.fixed.toLowerCase().replace(/’/g, "'");
  if (original === fixed) {
    return (
      DISTINCT_APOSTROPHE_WORDS.get(before) === after ||
      DISTINCT_APOSTROPHE_WORDS.get(after) === before
    );
  }
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
  let start = 0;
  let originalEnd = original.length;
  let fixedEnd = fixed.length;
  while (
    start < originalEnd &&
    start < fixedEnd &&
    original[start] === fixed[start]
  ) {
    start += 1;
  }
  while (
    originalEnd > start &&
    fixedEnd > start &&
    original[originalEnd - 1] === fixed[fixedEnd - 1]
  ) {
    originalEnd -= 1;
    fixedEnd -= 1;
  }
  const changedOriginal = original.slice(start, originalEnd);
  const changedFixed = fixed.slice(start, fixedEnd);
  if (!keepsWordCase(original, fixed)) {
    return false;
  }
  // 같은 뒷말에 다른 표현을 붙일 때 그 사이의 공백을 없애지 않는다.
  // 관사처럼 표현 전체를 넣거나 빼는 교정은 허용한다.
  if (
    changedOriginal &&
    changedFixed &&
    originalEnd < original.length &&
    fixedEnd < fixed.length &&
    TRAILING_SPACE.test(changedOriginal) !== TRAILING_SPACE.test(changedFixed)
  ) {
    return false;
  }
  return !(
    CHANGED_NOTATION.test(changedOriginal) ||
    CHANGED_NOTATION.test(changedFixed)
  );
}

function keepsWordCase(original: string, fixed: string): boolean {
  const before: string[] = original.match(WORD) ?? [];
  const after: string[] = fixed.match(WORD) ?? [];
  if ((before.length + 1) * (after.length + 1) > 10_000) {
    return false;
  }
  let costs = Array.from({ length: after.length + 1 }, (_, index) => index);
  let valid = costs.map(() => true);
  for (const word of before) {
    const nextCosts = [(costs[0] ?? 0) + 1];
    const nextValid = [valid[0] ?? true];
    for (const [index, replacement] of after.entries()) {
      const sameWord = word.toLowerCase() === replacement.toLowerCase();
      const replace = (costs[index] ?? 0) + (sameWord ? 0 : 1);
      const remove = (costs[index + 1] ?? 0) + 1;
      const insert = (nextCosts[index] ?? 0) + 1;
      const best = Math.min(replace, remove, insert);
      // 최소 낱말 편집 경로에서만 표기를 비교한다. 관사 삽입을 치환으로 읽지 않는다.
      const keepsCase =
        word === "I" ||
        replacement === "I" ||
        wordCase(word) === wordCase(replacement);
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
