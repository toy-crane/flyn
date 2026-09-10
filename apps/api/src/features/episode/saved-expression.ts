import {
  generateObject,
  jsonSchema,
  type LanguageModel,
  type ModelMessage,
  type UIMessage,
} from "ai";

import type { SceneSpeakerData } from "../../shared/scene-stream";
import { type EpisodeCorrection, isKoreanText } from "./correction.js";
import type { SavedExpressionDraft } from "./progress";

/** 담을 수 있는 출처. 화면에 그대로 보이지 않으므로 영어 키를 쓴다. */
export type SavedExpressionKind = "utterance" | "correction" | "guidance";

/**
 * 대화에서 담아 둔 표현 하나를 가리키는 이름표.
 *
 * 앱은 이것만으로 어느 말풍선과 어느 한 줄에 책갈피를 채울지 정하고, 취소할
 * 때는 `id`를 돌려보낸다.
 */
export interface SavedExpressionRef {
  id: string;
  kind: SavedExpressionKind;
  messageId: string;
  /** 인물 대사는 장면 안의 몇 번째 대사인지, 나머지는 없다. */
  utteranceAt: number | null;
}

/** 장면 안의 인물 대사 하나. 지문은 여기 들어오지 않는다. */
export interface SceneUtterance {
  /** 장면 안에서 몇 번째 대사인지. 지문은 세지 않는다. */
  at: number;
  speaker: string;
  text: string;
}

/**
 * 저장한 메시지에서 인물의 대사만 차례대로 꺼낸다.
 *
 * 앱의 `sceneOfMessage`와 같은 걸음이다. `data-speaker` part가 조각을 열고 뒤에
 * 오는 텍스트 part가 그 조각의 글이 되며, 글이 없는 조각은 버린다. 이름이 없는
 * 조각은 지문이라 세지 않으므로, 여기서 매기는 자리는 화면이 말풍선에만 붙이는
 * 책갈피의 자리와 같다.
 *
 * 앱이 보낸 문장을 믿지 않고 저장된 part에서 다시 읽는 이유가 이것이다. 자리
 * 번호 하나만 받으면 표현 노트에 들어갈 영어와 화자를 서버가 정한다.
 */
export function sceneUtterances(parts: UIMessage["parts"]): SceneUtterance[] {
  const segments: { name: string | null; text: string }[] = [];

  for (const part of parts) {
    if (part.type === "data-speaker") {
      const data = part.data as SceneSpeakerData | null | undefined;

      segments.push({
        name: typeof data?.name === "string" ? data.name : null,
        text: "",
      });
      continue;
    }

    if (part.type === "text") {
      const current = segments.at(-1);

      if (current) {
        current.text += part.text;
      } else {
        segments.push({ name: null, text: part.text });
      }
    }
  }

  const utterances: SceneUtterance[] = [];

  for (const segment of segments) {
    if (segment.text.length === 0 || segment.name === null) {
      continue;
    }

    utterances.push({
      at: utterances.length,
      speaker: segment.name,
      text: segment.text,
    });
  }

  return utterances;
}

interface MeaningDraft {
  meaning: string;
}

const meaningSchema = jsonSchema<MeaningDraft>({
  additionalProperties: false,
  properties: {
    meaning: {
      description: "그 대사를 한국어로 옮긴 해요체 한 문장.",
      type: "string",
    },
  },
  required: ["meaning"],
  type: "object",
});

export function meaningSystemPrompt(): string {
  return `인물이 방금 한 영어 대사를 한국어로 옮기고 JSON만 작성한다. 앞의 대화는 상황을 파악하는 근거다.
- 대사 하나만 옮긴다. 앞뒤 문장이나 상황 설명을 덧붙이지 않는다.
- 말한 사람의 말투를 살린 자연스러운 해요체 한국어로 쓴다. 직역해서 어색해지지 않게 한다.
- 문법 설명, 낱말 풀이, 영어 원문 인용을 넣지 않는다.
- 대사가 여러 문장이면 그대로 여러 문장으로 옮긴다.`;
}

export interface MeaningRequest {
  /** 이 대사가 든 장면까지의 대화. 상황을 잡는 데만 쓴다. */
  context: ModelMessage[];
  model: LanguageModel;
  signal?: AbortSignal;
  speaker: string;
  text: string;
}

/**
 * 담아 둘 인물 대사의 한국어 뜻을 한 번 만든다.
 *
 * 뜻이 없으면 나중에 목록에서 그 문장을 떠올릴 실마리가 없다. 그래서 만들지
 * 못하면 저장하지 않고 실패로 돌아간다. 반쪽짜리 항목을 남기는 것보다 다시
 * 누르게 하는 편이 낫다.
 */
export async function writeKoreanMeaning({
  context,
  model,
  signal,
  speaker,
  text,
}: MeaningRequest): Promise<string> {
  const trimmed = text.trim();

  if (!trimmed) {
    throw new Error("The utterance carries no text.");
  }

  const { object } = await generateObject({
    abortSignal: signal,
    maxRetries: 0,
    messages: [
      ...context,
      { content: `옮길 대사:\n${speaker}: ${trimmed}`, role: "user" },
    ],
    model,
    schema: meaningSchema,
    system: meaningSystemPrompt(),
  });
  const meaning =
    typeof object?.meaning === "string" ? object.meaning.trim() : "";

  if (!meaning) {
    throw new Error("The Korean meaning came back empty.");
  }

  return meaning;
}

/** 메시지에 든 글자만 이어 붙인다. 사용자가 쓴 말을 그대로 읽는 자리에 쓴다. */
export function textOfMessage(message: UIMessage): string {
  return message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");
}

/**
 * 담아 둘 배울 표현 하나를 이미 저장된 교정에서 만든다.
 *
 * 새로 만들 값이 없다. 고친 문장도, 어긋난 자리도, 이유도, 그 문장의 한국어
 * 뜻도 판정하던 때에 이미 행으로 남았으므로 그대로 옮긴다. 뜻을 여기서 다시
 * 만들지 않으므로 담을 때 모델을 부르는 곳은 인물 대사 하나뿐이다.
 *
 * 영어 교정인지 한국어 안내인지는 사용자가 쓴 문장을 보고 가르며, 그 판정은
 * 교정을 만들 때 쓰는 것과 같은 하나다.
 */
export function learningDraft({
  corrections,
  episodeId,
  message,
}: {
  corrections: readonly EpisodeCorrection[];
  episodeId: string;
  message: UIMessage;
}): SavedExpressionDraft | undefined {
  const correction = corrections.find(
    (candidate) => candidate.messageId === message.id
  );

  if (message.role !== "user" || !correction) {
    return;
  }

  const original = correction.original || textOfMessage(message);

  return {
    english: correction.fixed,
    entries: correction.entries.map((entry) => ({
      fixed: entry.fixed,
      original: entry.original,
      why: entry.why,
    })),
    episodeId,
    kind: isKoreanText(original) ? "guidance" : "correction",
    meaning: correction.review.meaning,
    messageId: message.id,
    original,
    speaker: null,
    utteranceAt: null,
  };
}
