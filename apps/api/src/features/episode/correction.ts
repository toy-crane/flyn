import {
  generateObject,
  jsonSchema,
  type LanguageModel,
  type ModelMessage,
} from "ai";

/**
 * 배울 표현 하나.
 *
 * 한 메시지에 여러 개가 나올 수 있고, 고친 문장은 그래도 하나다. 항목은 그
 * 문장 안에서 무엇이 어떻게 달라졌는지를 나눠 보여 주는 자리다.
 */
export interface CorrectionEntry {
  /** 고친 문장에서 이 표현에 해당하는 조각. 강조해서 보여 준다. */
  fixed: string;
  /** 원문에서 어긋난 조각. 물결 밑줄로 짚어 준다. */
  original: string;
  /**
   * 같은 패턴을 한 에피소드에서 두 번 만들지 않으려고 쓰는 키.
   *
   * 화면에 보이지 않는다. 앱이 이미 받은 키를 다음 요청에 함께 보내고, 서버는
   * 그 키로 온 항목을 버린다.
   */
  pattern: string;
  /** 왜 그런지 한국어 한 줄. */
  why: string;
}

/** 사용자 메시지 하나에 붙는 교정. */
export interface EpisodeCorrection {
  entries: CorrectionEntry[];
  /** 모든 수정을 반영한 고친 문장 하나. */
  fixed: string;
  /** 이 교정이 붙는 사용자 메시지의 ID. */
  messageId: string;
  /** 사용자가 쓴 원문. */
  original: string;
}

interface CorrectionDraft {
  entries: CorrectionEntry[];
  fixed: string;
}

/**
 * 모델이 채워야 하는 모양.
 *
 * `zod` 대신 `jsonSchema`를 쓴다. 서버가 검증에 쓰는 스키마는 이 하나뿐이라
 * 런타임 검증 라이브러리를 하나 더 들일 이유가 없다.
 */
const correctionSchema = jsonSchema<CorrectionDraft>({
  additionalProperties: false,
  properties: {
    entries: {
      items: {
        additionalProperties: false,
        properties: {
          fixed: {
            description: "고친 문장에서 이 표현에 해당하는 조각 그대로.",
            type: "string",
          },
          original: {
            description: "원문에서 어긋난 조각 그대로.",
            type: "string",
          },
          pattern: {
            description:
              "이 표현이 어떤 규칙인지 가리키는 영어 kebab-case 키. 예: article-the-specific, to-infinitive-after-want.",
            type: "string",
          },
          why: {
            description: "왜 그렇게 쓰는지 해요체 한국어 한 문장.",
            type: "string",
          },
        },
        required: ["fixed", "original", "pattern", "why"],
        type: "object",
      },
      type: "array",
    },
    fixed: {
      description:
        "모든 수정을 반영한 문장 전체. 고칠 것이 없으면 원문 그대로.",
      type: "string",
    },
  },
  required: ["entries", "fixed"],
  type: "object",
});

/**
 * 몰랐던 표현만 고르는 판정자의 지시.
 *
 * 장면을 쓰는 프롬프트와 일부러 나눠 둔다. 인물은 내용에 반응하고 교정하지
 * 않는다는 역할 분리가 이 단위의 전제라, 두 지시가 한 모델 호출에 섞이면 장면
 * 대사에 교정이 새어 나온다.
 */
export function correctionSystemPrompt(
  seenPatterns: readonly string[]
): string {
  const seen =
    seenPatterns.length === 0
      ? ""
      : `
이 에피소드에서 이미 알려 준 규칙:
${seenPatterns.map((pattern) => `- ${pattern}`).join("\n")}
같은 규칙은 다시 만들지 않는다. 그 규칙에 해당하는 실수는 고친 문장에는 반영하되 항목으로 만들지 않는다.
`;

  return `너는 영어 학습자가 방금 쓴 문장에서 "아직 몰라서 못 쓴 표현"만 골라내는 사람이다.

고르는 것:
- 학습자가 규칙 자체를 모르는 것으로 보이는 자리. 관사, 전치사, 동사 형태, 낱말 선택처럼 다시 만나면 또 틀릴 자리다.
- 뜻은 통하지만 원어민이 그렇게 말하지 않는 표현.

고르지 않는 것:
- 오타, 대소문자, 문장 부호.
- 같은 대화에서 이미 맞게 쓴 적 있는 규칙을 이번에만 놓친 자리. 아는데 흘린 것이다.
- 취향 차이라서 학습자의 문장도 그대로 쓸 수 있는 자리.
- 한국어로 쓴 메시지. 이때는 항목을 만들지 않는다.
${seen}
쓰는 방법:
- fixed는 학습자의 문장을 최소한으로 고친 문장 하나다. 학습자가 맞게 쓴 낱말과 뜻은 그대로 두고, 문장을 새로 쓰지 않는다.
- entries의 original은 학습자의 원문에 그대로 있는 조각이어야 하고, fixed는 고친 문장에 그대로 있는 조각이어야 한다. 문장 전체가 아니라 달라진 자리 언저리만 짧게 짚는다.
- why는 해요체 한 문장으로 규칙을 말한다. "틀렸어요", "잘못됐어요" 같은 채점하는 말과 "문법", "어휘" 같은 분류 이름을 쓰지 않는다. 몇 개를 틀렸는지도 세지 않는다.
- 고를 것이 없으면 entries를 빈 배열로 두고 fixed에 원문을 그대로 쓴다.`;
}

/** 원문에 없는 조각을 짚는 항목은 화면에서 강조할 자리를 찾지 못한다. */
function keepsItsWords(
  entry: CorrectionEntry,
  original: string,
  fixed: string
) {
  return original.includes(entry.original) && fixed.includes(entry.fixed);
}

export interface CorrectionRequest {
  /** 장면과 사용자 말이 오간 순서. 아는 규칙과 몰랐던 표현을 가르는 근거다. */
  context: ModelMessage[];
  /** 이 교정이 붙는 사용자 메시지의 ID. */
  messageId: string;
  model: LanguageModel;
  /** 사용자가 방금 쓴 원문. */
  original: string;
  /** 앱이 이 에피소드에서 이미 받은 패턴 키. */
  seenPatterns: readonly string[];
  signal?: AbortSignal;
}

/**
 * 사용자가 방금 쓴 문장에 붙일 교정을 만든다.
 *
 * 장면을 만드는 호출과 나란히 돌고, 결과는 스트림에 뒤늦게 실린다. 판정할 것이
 * 없으면 아무것도 돌려주지 않는다: 교정이 없는 메시지에는 화면에 아무것도
 * 붙지 않아야 한다.
 */
export async function judgeCorrection({
  context,
  messageId,
  model,
  original,
  seenPatterns,
  signal,
}: CorrectionRequest): Promise<EpisodeCorrection | undefined> {
  const trimmed = original.trim();

  if (!trimmed) {
    return;
  }

  const { object } = await generateObject({
    abortSignal: signal,
    messages: [
      ...context,
      {
        content: `방금 학습자가 쓴 문장:\n${trimmed}`,
        role: "user",
      },
    ],
    model,
    schema: correctionSchema,
    system: correctionSystemPrompt(seenPatterns),
  });
  const fixed = object.fixed.trim();
  const seen = new Set(seenPatterns);
  const entries = object.entries.filter(
    (entry) => !seen.has(entry.pattern) && keepsItsWords(entry, trimmed, fixed)
  );

  // 고친 문장이 원문과 같으면 붙일 것이 없다. 항목이 모두 걸러진 경우도 같다.
  if (entries.length === 0 || fixed === trimmed) {
    return;
  }

  return { entries, fixed, messageId, original: trimmed };
}
