import type { UIMessage, UIMessageStreamWriter } from "ai";

/** 도입의 장면 서술에만 이름이 없다. */
export interface SceneSpeakerData {
  name: string | null;
}

/** 대본의 첫 장면에서 대사로 읽을 이름 목록. */
export interface SceneTags {
  cast: readonly string[];
}

const LEADING_INDENT = /^[ \t]+/;
const SPACE_AFTER_COLON = /^ /;

/**
 * 화자 part를 모델이 읽을 대본의 줄 머리로 되살린다.
 *
 * `convertToModelMessages`는 data part를 기본으로 버리므로, 지난 장면에서
 * 누가 무슨 말을 했는지는 이 변환이 없으면 다음 호출에 전달되지 않는다.
 */
export function speakerModelText(data: unknown): string {
  const name = (data as SceneSpeakerData | null | undefined)?.name;

  return typeof name === "string" ? `\n${name}: ` : "\n";
}

/** 대본의 첫 장면만 읽는다. 인물 대사와 도입 서술 외의 판정은 하지 않는다. */
export async function streamOpeningScene(
  textStream: AsyncIterable<string>,
  tags: SceneTags,
  writer: UIMessageStreamWriter
): Promise<{ parts: UIMessage["parts"] }> {
  const prefixes = tags.cast.map((name) => ({ name, prefix: `${name}:` }));
  let segment: { name: string | null; textId: string } | undefined;
  let segmentCount = 0;
  // 아직 화자인지 지문인지 정해지지 않은 줄 머리.
  let lineBuffer = "";
  let isLineDecided = false;
  // 줄 사이에서 본 줄바꿈 수. 같은 화자가 이어지면 문단으로 살리고, 화자가
  // 바뀌면 새 조각이 대신하므로 버린다.
  let pendingNewlines = 0;
  // 흘려보낸 것과 같은 차례로 쌓는 part. 저장은 이 목록을 쓴다.
  const parts: UIMessage["parts"] = [];

  function append(text: string) {
    if (text.length === 0) {
      return;
    }

    if (segment === undefined) {
      return;
    }

    const open = parts.at(-1);

    if (open?.type === "text") {
      open.text += text;
    }

    writer.write({ delta: text, id: segment.textId, type: "text-delta" });
  }

  function closeSegment() {
    if (segment !== undefined) {
      const open = parts.at(-1);

      if (open?.type === "text") {
        open.state = "done";
      }

      writer.write({ id: segment.textId, type: "text-end" });
      segment = undefined;
    }
  }

  // 판정이 끝난 줄의 내용을 흘려보낼 자리를 마련한다. 직전 조각과 같은
  // 화자면 그 조각에 줄바꿈으로 잇고, 아니면 조각을 새로 연다.
  function beginLine(name: string | null, text: string) {
    isLineDecided = true;

    if (segment !== undefined && segment.name === name) {
      append("\n".repeat(Math.min(pendingNewlines, 2)));
    } else {
      closeSegment();
      segmentCount += 1;
      const textId = `scene-${segmentCount}`;

      parts.push({
        data: { name } satisfies SceneSpeakerData,
        id: `speaker-${segmentCount}`,
        type: "data-speaker",
      });
      parts.push({ state: "streaming", text: "", type: "text" });
      writer.write({
        data: { name } satisfies SceneSpeakerData,
        id: `speaker-${segmentCount}`,
        type: "data-speaker",
      });
      writer.write({ id: textId, type: "text-start" });
      segment = { name, textId };
    }

    pendingNewlines = 0;
    append(text);
  }

  // 줄 머리만으로 화자를 판정한다. 아직 어느 이름의 앞부분일 수도 있으면
  // 줄이 끝나기 전까지는 기다린다.
  function decide(isLineComplete: boolean) {
    const head = lineBuffer.replace(LEADING_INDENT, "");

    if (head.length === 0) {
      return;
    }

    for (const tag of prefixes) {
      if (head.startsWith(tag.prefix)) {
        const text = head
          .slice(tag.prefix.length)
          .replace(SPACE_AFTER_COLON, "");

        beginLine(tag.name, text);

        return;
      }
    }

    const couldStillMatch = prefixes.some(({ prefix }) =>
      prefix.startsWith(head)
    );

    if (couldStillMatch && !isLineComplete) {
      return;
    }

    beginLine(null, head);
  }

  function endLine() {
    lineBuffer = "";
    isLineDecided = false;
    pendingNewlines += 1;
  }

  for await (const delta of textStream) {
    let rest = delta;

    while (rest.length > 0) {
      const newlineIndex = rest.indexOf("\n");
      const chunk = newlineIndex === -1 ? rest : rest.slice(0, newlineIndex);

      rest = newlineIndex === -1 ? "" : rest.slice(newlineIndex + 1);

      if (isLineDecided) {
        append(chunk);
      } else {
        lineBuffer += chunk;
        decide(newlineIndex !== -1);
      }

      if (newlineIndex !== -1) {
        endLine();
      }
    }
  }

  // 줄바꿈 없이 끝난 마지막 줄도 장면의 일부다.
  if (!isLineDecided) {
    decide(true);
  }

  closeSegment();

  return { parts };
}
