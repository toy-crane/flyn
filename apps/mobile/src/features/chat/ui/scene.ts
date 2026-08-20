import type { UIMessage } from "ai";

/** 장면의 한 조각. 지문은 이름이 없다. */
export interface SceneSegment {
  name: string | null;
  text: string;
}

/**
 * 장면 메시지를 화자 순서대로 자른다.
 *
 * 서버가 `data-speaker` part 뒤에 그 발화의 텍스트 part를 이어 보내므로,
 * part를 순서대로 걸으면 장면이 된다. `data-speaker` part가 하나도 없는
 * 메시지는 장면이 아니라서 undefined를 돌려주고, 화면은 단일 답변 그리기로
 * 돌아간다. 글자가 아직 도착하지 않은 조각은 이름표만 있는 빈 말풍선을
 * 만들지 않도록 버린다.
 */
export function sceneOfMessage(message: UIMessage): SceneSegment[] | undefined {
  let hasSpeakerParts = false;
  const segments: SceneSegment[] = [];

  for (const part of message.parts) {
    if (part.type === "data-speaker") {
      hasSpeakerParts = true;

      const data = part.data as { name?: unknown } | null | undefined;

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

  if (!hasSpeakerParts) {
    return;
  }

  return segments.filter((segment) => segment.text.length > 0);
}

/** 복사하거나 이어 붙일 때는 화자를 각본의 줄 머리로 되살린다. */
export function sceneCopyText(segments: SceneSegment[]): string {
  return segments
    .map((segment) =>
      segment.name === null ? segment.text : `${segment.name}: ${segment.text}`
    )
    .join("\n");
}
