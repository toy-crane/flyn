import type { UIMessageStreamWriter } from "ai";

/**
 * 장면 스트림이 화자를 나르는 part의 데이터. 지문은 이름이 없다.
 */
export interface SceneSpeakerData {
  name: string | null;
}

/** 줄 머리 판정 전에 걷어내는 들여쓰기. 마크다운 코드 블록 오인도 막는다. */
const LEADING_INDENT = /^[ \t]+/;
/** `이름:` 바로 뒤에 오는 공백 하나. */
const SPACE_AFTER_COLON = /^ /;

/**
 * 화자 part를 모델이 읽을 각본의 줄 머리로 되살린다.
 *
 * `convertToModelMessages`는 data part를 기본으로 버리므로, 지난 장면에서
 * 누가 무슨 말을 했는지는 이 변환이 없으면 다음 호출에 전달되지 않는다.
 */
export function speakerModelText(data: unknown): string {
  const name = (data as SceneSpeakerData | null | undefined)?.name;

  return typeof name === "string" ? `\n${name}: ` : "\n";
}

/**
 * 모델의 텍스트 스트림에서 줄 머리의 `이름:`을 화자 part로 바꿔 쓴다.
 *
 * 장면은 한 메시지 안에서 `data-speaker` part와 그 발화의 텍스트 part가
 * 번갈아 흐르는 형태가 된다. 이름 목록은 화이트리스트다: 목록에 없는 줄은
 * 전부 지문(`name: null`)으로 흐르므로, 모델이 형식을 어겨도 발화가 엉뚱한
 * 화자를 만들지 않고 지문으로 보인다.
 *
 * 줄 머리가 어느 이름과도 이어질 수 없다고 판정되는 즉시 그 줄은 흐르기
 * 시작한다. 판정을 위해 붙잡아 두는 글자는 가장 긴 이름 언저리를 넘지
 * 않아서, 스트리밍의 체감을 거의 해치지 않는다.
 */
export async function streamSceneText(
  textStream: AsyncIterable<string>,
  cast: readonly string[],
  writer: UIMessageStreamWriter
): Promise<void> {
  const prefixes = cast.map((name) => ({ name, prefix: `${name}:` }));
  let segment: { name: string | null; textId: string } | undefined;
  let segmentCount = 0;
  // 아직 화자인지 지문인지 정해지지 않은 줄 머리.
  let lineBuffer = "";
  let isLineDecided = false;
  // 줄 사이에서 본 줄바꿈 수. 같은 화자가 이어지면 문단으로 살리고, 화자가
  // 바뀌면 새 조각이 대신하므로 버린다.
  let pendingNewlines = 0;

  function append(text: string) {
    if (text.length === 0 || segment === undefined) {
      return;
    }

    writer.write({ delta: text, id: segment.textId, type: "text-delta" });
  }

  function closeSegment() {
    if (segment !== undefined) {
      writer.write({ id: segment.textId, type: "text-end" });
      segment = undefined;
    }
  }

  // 판정이 끝난 줄의 내용을 흘려보낼 자리를 마련한다. 직전 조각과 같은
  // 화자면 그 조각에 줄바꿈으로 잇고, 아니면 조각을 새로 연다.
  function beginLine(name: string | null, text: string) {
    if (segment !== undefined && segment.name === name) {
      append("\n".repeat(Math.min(pendingNewlines, 2)));
    } else {
      closeSegment();
      segmentCount += 1;
      const textId = `scene-${segmentCount}`;

      writer.write({
        data: { name } satisfies SceneSpeakerData,
        id: `speaker-${segmentCount}`,
        type: "data-speaker",
      });
      writer.write({ id: textId, type: "text-start" });
      segment = { name, textId };
    }

    pendingNewlines = 0;
    isLineDecided = true;
    append(text);
  }

  // 줄 머리만으로 화자를 판정한다. 아직 어느 이름의 앞부분일 수도 있으면
  // 줄이 끝나기 전까지는 기다린다.
  function decide(isLineComplete: boolean) {
    const head = lineBuffer.replace(LEADING_INDENT, "");

    if (head.length === 0) {
      return;
    }

    for (const { name, prefix } of prefixes) {
      if (head.startsWith(prefix)) {
        beginLine(
          name,
          head.slice(prefix.length).replace(SPACE_AFTER_COLON, "")
        );

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
}
