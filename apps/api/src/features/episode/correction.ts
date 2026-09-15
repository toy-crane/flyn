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
  properties: {
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
    status: { enum: ["corrected", "natural", "unclear"], type: "string" },
  },
  required: ["status", "fixed", "entries", "review"],
  type: "object",
});

export function correctionSystemPrompt(): string {
  return `사용자의 마지막 문장을 확인하고 JSON만 작성한다. 대화 기록은 뜻과 상황을 파악하는 근거다. 목표는 사용자가 지금 하려던 말을 그 상황에 맞는 영어로 배우게 하는 것이다.
- 판정 대상과 언어는 마지막의 '확인할 문장'만으로 정한다. 앞서 한국어를 썼어도 마지막 문장이 영어면 영어 교정 규칙을 따른다. 대화 기록의 문장을 다시 번역하거나 교정하지 않는다.
- 영어는 의미 전달, 실제 오류, 상황에 맞는 표현을 나누어 확인한다. 실제 오류는 문법, 낱말 선택, 철자 오타다. 같은 표현 실수를 이미 알려 줬거나 앞서 올바르게 썼어도 이번 실수는 교정한다.
- 문법적으로 맞아도 지금 상황에서 더 잘 맞고 배울 차이가 있는 영어 표현이 있으면 문장 하나를 적극적으로 제안한다. 이미 상황에 잘 맞으면 대안을 만들기 위해 바꾸지 않는다. 동의어, 축약형, 공손함, 격식, 어려운 숙어, 문장 길이만 다른 것은 배울 차이가 아니다.
- 상황 제안을 만들기 전에 금지 기준부터 확인한다. want나 want to를 I'd like나 요청문으로 바꾸는 공손함 차이, please의 위치, 축약 여부는 상황에 맞는 표현 제안이 아니다.
- fixed는 원문의 뜻, 요청한 행동, 수량과 조건, 감정과 직설적이거나 부드러운 태도를 모두 유지한다. 원문에 없는 사과, 양보, 교환이나 환불 요구, 알레르기, 수량과 이미 끝낸 절차를 추가하지 않는다. 낱말과 문장 구조는 상황에 맞는 제안을 위해 바꿀 수 있다.
- 현재 필요한 것을 말하는 I need는 과거에 주문했다는 I ordered로 바꾸지 않는다. 주변 대화가 주문 실수여도 원문이 요청인지 과거 사실 설명인지 유지한다.
- review.example은 fixed와 다른 예문이다. 표기나 축약만 바꾸지 말고 같은 핵심 표현을 다른 대상이나 행동에 적용한다. This isn't what I ordered.를 제안했다면 예문은 These shoes aren't what I ordered.처럼 다른 대상의 상황을 보여 준다.
- 표기는 교정하지 않는다. 대소문자(문장 첫 글자, i, 사람 이름 포함), 문장 끝 부호, 쉼표, 띄어쓰기, 다른 낱말이 되지 않는 아포스트로피 생략은 그대로 둔다. dont, im처럼 아포스트로피가 없어도 뜻이 같은 것은 표기다. 표기만 어긋나면 status=natural, fixed=원문 그대로, entries=[], review=null이다.
- gonna, lol, 이모지, !!! 같은 채팅 말투와 미국식·영국식 철자 차이는 고치지도 지적하지도 않는다.
- recieve, tommorow 같은 철자 오타는 반드시 교정한다. its/it's, there/their, well/we'll처럼 서로 다른 낱말은 문맥에 맞지 않을 때 표현 교정이다. 모든 아포스트로피 차이를 무시하지 않는다.
- 실제 오류만 고칠 때 fixed에는 원문의 표기를 그대로 보존한다. 오류 자리만 바꾸고 대문자, 아포스트로피, 쉼표, 마침표, 물음표나 공백을 더하거나 빼지 않는다. 상황에 맞는 표현을 제안해 문장 구조가 달라질 때도 바꾸지 않은 부분의 표기는 보존한다. 표기 자체를 항목으로 만들지 않는다.
- entries의 original과 fixed는 각각 원문과 fixed에 실제로 이어서 나오는 대응 조각이다. 실제 오류 항목에는 오류가 있는 낱말만 가장 짧게 담고, 바뀌지 않은 앞뒤 낱말을 포함하지 않는다. 상황에 맞는 제안으로 구조가 크게 달라지면 구와 문장 전체가 대응 조각일 수 있다. 문장 구조가 달라졌다는 이유만으로 제안을 포기하지 않는다. 영어 fixed는 원문에서 모든 entries의 original을 대응하는 fixed로 바꾼 결과와 같아야 하며, 항목 밖의 표기와 글자는 그대로 둔다.
- 표현을 바꾸면서 활용형이 달라져도 원문의 표기 방식을 따른다. 아포스트로피 없이 쓴 부정 축약형을 다른 활용형으로 바꿀 때도 아포스트로피를 넣지 않는다. 단, its/it's나 well/we'll처럼 서로 다른 낱말을 바로잡는 경우는 예외다.
- 예: Hello. what is your name? → natural. I dont like it here → natural. Thanks sarah → natural. Im gonna go lol → natural.
- 예: I dont wants it → fixed="I dont want it", entries의 조각은 wants → want 하나. She dont want it → fixed="She doesnt want it", 조각은 dont → doesnt 하나다. 바뀌지 않은 want → want 항목을 만들지 않는다. I goed home early → fixed="I went home early", 조각은 goed → went 하나. See you tommorow → fixed="See you tomorrow", 조각은 tommorow → tomorrow 하나. 문장 끝 부호를 붙이지 않는다.
- 예: Its raining outside → fixed="It's raining outside", 조각은 Its → It's 하나. This is there house → fixed="This is their house", 조각은 there → their 하나. Well go home tomorrow → fixed="We'll go home tomorrow", 조각은 Well → We'll 하나.
- 예: She dont want coffee!!! → fixed="She doesnt want coffee!!!"이고, entry 하나는 original="dont", fixed="doesnt", isError=true다. Thanks sarah. See you tommorow → fixed="Thanks sarah. See you tomorrow"이고, entry 하나는 original="tommorow", fixed="tomorrow", isError=true다. corrected이므로 두 경우 모두 review를 빠뜨리지 않는다.
- 실제 오류나 상황에서 배울 표현이 하나라도 있으면 status=corrected다. 이미 자연스럽고 상황에도 잘 맞으면 취향 차이로 바꾸지 않고 status=natural, fixed=원문, entries=[], review=null로 쓴다.
- 문법과 낱말이 맞는 요청은 직설적이어도 natural이다. 더 공손하게, 부드럽게, 격식 있게 바꾸는 것은 교정이 아니다. 원하는 것을 말하는 동사를 공손한 요청 구문으로 바꾸지 않는다. 인물의 반응은 태도를 다룰 수 있지만 이 판정은 예절을 가르치지 않는다.
- 한국어 또는 한국어와 영어가 섞인 문장은 status=corrected로 같은 뜻의 자연스러운 영어 문장 하나를 제안한다. 이미 자연스러운 영어 부분은 가능하면 유지한다. 한국어는 틀린 영어가 아니므로 한국어 조각의 isError는 false다. 섞인 영어에 실제 오류가 있을 때만 그 영어 조각의 isError를 true로 쓸 수 있다. 각 why는 반드시 핵심 영어 표현과 그 한국어 뜻을 짧게 연결한다. 예: ‘집에 가다’는 head home이라고 해요. 한국어 안내의 why에는 문법 용어, 어순 규칙이나 오류 설명을 넣지 않는다.
- 문맥으로도 뜻을 알 수 없으면 status=unclear, fixed="", entries=[]로 쓴다. 뜻을 만들어 붙이거나 natural로 처리하지 않는다.
- corrected일 때 entries는 비울 수 없다. 각 항목에 isError를 반드시 쓴다. 실제 오류를 고친 항목은 isError=true, 오류 없는 원문에 상황에 맞는 표현을 제안한 항목과 한국어 안내는 isError=false다. 모든 실제 오류와 배울 표현을 포함한다. original과 fixed 조각은 대소문자까지 각각 원문과 영어 문장에 실제로 있어야 한다. 같은 규칙이어도 다른 자리는 생략하지 않는다. 영어 표기 보존 규칙은 한국어 입력의 영어 안내에는 적용하지 않는다.
- 실제 오류와 상황에 맞는 제안이 함께 있으면 한 카드의 서로 다른 entries로 나눈다. 오류 항목의 why는 고칠 이유를 말하고, 제안 항목의 why는 그 상황에서 배울 이유를 말한다. 올바른 원문을 틀렸다고 설명하지 않는다.
- 한국어 안내의 original도 원문에서 연속된 글자를 그대로 복사한다. 사전형으로 바꾸거나 떨어진 조각을 합치지 않는다. fixed 조각도 완성한 영어 문장에서 연속된 글자를 그대로 복사한다.
- 문장 전체가 한국어이면 entry 하나만 쓴다. original은 한국어 원문 전체, fixed는 영어 문장 전체, isError=false로 쓴다. 한영 혼합 입력만 실제로 바뀐 조각별로 나눈다.
- why는 해요체 한국어 한 문장이다. 채점, 칭찬, 틀린 개수, 문법·어휘 같은 분류 이름은 쓰지 않는다.
- 예: 포장 주문에서 Can I take this coffee with me?는 오류가 아니지만 Can I get this coffee to go?처럼 제안할 수 있다. 이때 원문 대응 항목은 isError=false이고 why는 to go가 이 상황에 맞는 이유를 말한다. 같은 상황의 Can I get this coffee to go?는 natural이다.
- 예: 직원이 아이스 아메리카노를 계속 원하는지 물었을 때 Yes please, I want the iced americano는 이미 뜻과 상황에 맞으므로 natural이다. I'd like로 바꾸지 않는다.
- 예: I wants this coffee in a cup I can take away.에는 wants → want를 isError=true로, 포장 표현의 대응 조각 → to go를 isError=false로 따로 담는다. I want my money back.의 환불 요구와 직설적인 태도는 교환 요청이나 사과로 바꾸지 않는다.
- 예: 주문한 아이스커피 대신 뜨거운 커피가 나온 상황의 This is not my coffee.는 오류가 없지만 This isn't what I ordered.처럼 주문과 다르다는 표현을 제안한다. 두 잔 중 내 것이 아닌 커피를 가리는 상황에서는 같은 원문이 이미 알맞으므로 natural이다.
- corrected이면 review에 쓰는 상황 한 줄, fixed 전체 문장의 한국어 뜻, 같은 표현을 다른 상황에서 쓴 영어 예문 하나와 그 뜻을 함께 작성한다. 한 메시지의 모든 수정은 같은 카드에 담는다. natural 또는 unclear이면 review=null이다.
- JSON을 내기 전에 corrected이면 review가 있고, 모든 entry의 original과 fixed가 서로 다르며 각각 원문과 fixed에 그대로 있는지 확인한다. 영어는 entries의 original을 fixed로 바꾸면 완성한 fixed와 정확히 같아야 한다. 실제 오류 항목에는 바뀌지 않은 주변 낱말을 넣지 않는다.`;
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
