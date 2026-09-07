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

export interface EpisodeCorrection {
  entries: CorrectionEntry[];
  fixed: string;
  messageId: string;
  original: string;
}

export type ExpressionResult =
  | { messageId: string; status: "natural" | "unclear" }
  | { messageId: string; status: "corrected"; correction: EpisodeCorrection };

interface CorrectionDraft {
  entries: CorrectionEntry[];
  fixed: string;
  status: "corrected" | "natural" | "unclear";
}

const KOREAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;
const correctionSchema = jsonSchema<CorrectionDraft>({
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
    status: { enum: ["corrected", "natural", "unclear"], type: "string" },
  },
  required: ["status", "fixed", "entries"],
  type: "object",
});

export function correctionSystemPrompt(): string {
  return `사용자의 마지막 문장을 확인하고 JSON만 작성한다. 대화 기록은 뜻과 상황을 파악하는 근거다.
- 영어의 문법, 낱말 선택, 오타, 대소문자, 문장부호를 모두 확인한다. 같은 실수를 이미 알려 줬거나 앞서 올바르게 썼어도 이번 실수는 반드시 교정한다.
- 영어에 실제 오류가 있으면 status=corrected. 뜻과 올바른 낱말을 유지하고 필요한 부분만 고친다. 이미 자연스러우면 취향 차이로 바꾸지 않고 status=natural, fixed=원문, entries=[]로 쓴다.
- 한국어 또는 한국어와 영어가 섞인 문장은 status=corrected로 같은 뜻의 자연스러운 영어 문장 하나를 제안한다. 이미 자연스러운 영어 부분은 가능하면 유지한다. 한국어는 틀린 영어가 아니다. 각 why는 반드시 핵심 영어 표현과 그 한국어 뜻을 짧게 연결한다. 예: ‘집에 가다’는 head home이라고 해요. 한국어 안내의 why에는 문법 용어, 어순 규칙이나 오류 설명을 넣지 않는다.
- 문맥으로도 뜻을 알 수 없으면 status=unclear, fixed="", entries=[]로 쓴다. 뜻을 만들어 붙이거나 natural로 처리하지 않는다.
- corrected일 때 entries는 비울 수 없다. 모든 고친 자리를 포함한다. original과 fixed 조각은 각각 원문과 영어 문장에 실제로 있어야 한다. 같은 규칙이어도 다른 자리는 생략하지 않는다.
- why는 해요체 한국어 한 문장이다. 채점, 칭찬, 틀린 개수, 문법·어휘 같은 분류 이름은 쓰지 않는다.`;
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
  return {
    correction: { entries, fixed, messageId, original: trimmed },
    messageId,
    status: "corrected",
  };
}
