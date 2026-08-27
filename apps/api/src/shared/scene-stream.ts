import type { UIMessageStreamWriter } from "ai";

/**
 * 장면 스트림이 화자를 나르는 part의 데이터. 지문은 이름이 없다.
 */
export interface SceneSpeakerData {
  name: string | null;
}

/**
 * 장면을 닫는 part의 데이터. 사건이 끝났을 때 한 번만 흐른다.
 */
export interface SceneEndingData {
  /** 결말의 종류. `endings`에 적어 둔 줄 머리 그대로다. */
  kind: string;
  /** 사건의 결과 한 줄. */
  outcome: string;
}

/**
 * 한 장면에서 줄 머리가 될 수 있는 이름들.
 *
 * `cast`는 말풍선이 되고, `endings`는 사건이 끝났다는 판정이 된다. `notes`는
 * 화면에 흐르지 않고 스트림 끝에서 기록으로만 남는 줄이다. 목록에 없는 줄
 * 머리는 전부 지문으로 흐른다.
 */
export interface SceneTags {
  cast: readonly string[];
  endings?: readonly string[];
  notes?: readonly string[];
}

/** 장면 하나가 남긴 것. 흐르는 글 말고 뒤에 남는 것들이다. */
export interface SceneOutcome {
  /** 사건이 끝났다면 그 판정. 아직 진행 중이면 없다. */
  ending: SceneEndingData | undefined;
  /** `notes`에 적어 둔 줄 머리로 온 기록. 쓰지 않은 줄은 없다. */
  notes: Record<string, string>;
}

type LineKind = "cast" | "ending" | "note";

interface LineTag {
  kind: LineKind;
  name: string;
  prefix: string;
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
 *
 * `endings`를 넘기면 그 줄 머리는 말풍선이 아니라 장면을 닫는 판정이 된다.
 * 결말 줄은 화면에 흐르지 않고 스트림 끝에서 `data-ending` part 하나로 나간다.
 *
 * `notes`를 넘기면 그 줄 머리도 화면에 흐르지 않는다. 다만 판정이 아니라 뒤에
 * 남기는 기록이라, 스트림에는 아무 part도 나가지 않고 반환값으로만 온다. 같은
 * 이름이 두 번 오면 처음 것만 남는다.
 *
 * `onEnding`은 결말 part를 쓰기 전에 기다린다. 결말을 어딘가에 남겨야 하는
 * 기능은 여기에 그 일을 걸어 두면, 남기지 못했을 때 화면이 끝난 척하는 대신
 * 오류로 돌아간다. 던지면 결말 part는 나가지 않는다. 기록은 결말 줄 뒤에 오므로
 * 이 시점에는 이미 다 모여 있다.
 */
export async function streamSceneText(
  textStream: AsyncIterable<string>,
  tags: SceneTags,
  writer: UIMessageStreamWriter,
  onEnding?: (outcome: SceneOutcome) => Promise<void>
): Promise<SceneOutcome> {
  const prefixes: LineTag[] = [
    ...tags.cast.map((name) => ({
      kind: "cast" as const,
      name,
      prefix: `${name}:`,
    })),
    ...(tags.endings ?? []).map((name) => ({
      kind: "ending" as const,
      name,
      prefix: `${name}:`,
    })),
    ...(tags.notes ?? []).map((name) => ({
      kind: "note" as const,
      name,
      prefix: `${name}:`,
    })),
  ];
  let segment: { name: string | null; textId: string } | undefined;
  let segmentCount = 0;
  // 아직 화자인지 지문인지 정해지지 않은 줄 머리.
  let lineBuffer = "";
  let isLineDecided = false;
  // 줄 사이에서 본 줄바꿈 수. 같은 화자가 이어지면 문단으로 살리고, 화자가
  // 바뀌면 새 조각이 대신하므로 버린다.
  let pendingNewlines = 0;
  // 사건이 끝났다는 판정. 모델이 두 번 쓰면 처음 것만 남는다.
  let ending: SceneEndingData | undefined;
  const notes: Record<string, string> = {};
  // 지금 흐르는 줄이 화면이 아니라 기록으로 가는 중이면 그 자리. 결말도 기록의
  // 한 종류라 같은 길을 지난다.
  let capture: { kind: "ending" | "note"; name: string } | undefined;
  // 그 줄이 기록으로 남는 첫 줄인지. 같은 이름이 두 번 오면 뒤의 글자가 앞의
  // 기록에 덧붙지 않게 막는다.
  let isCaptureKept = false;

  function append(text: string) {
    if (text.length === 0) {
      return;
    }

    if (capture !== undefined) {
      if (!isCaptureKept) {
        return;
      }

      if (capture.kind === "ending") {
        if (ending !== undefined) {
          ending.outcome += text;
        }
      } else {
        notes[capture.name] += text;
      }

      return;
    }

    if (segment === undefined) {
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

  // 결말과 기록은 말풍선을 열지 않는다. 두 번째로 온 같은 줄은 앞의 것을
  // 뒤집지 않고 화면에도 흐르지 않는다.
  function beginCapture(tag: LineTag, text: string) {
    closeSegment();
    isLineDecided = true;
    pendingNewlines = 0;

    if (tag.kind === "ending") {
      capture = { kind: "ending", name: tag.name };
      isCaptureKept = ending === undefined;
      ending ??= { kind: tag.name, outcome: text };

      return;
    }

    capture = { kind: "note", name: tag.name };
    isCaptureKept = notes[tag.name] === undefined;

    if (isCaptureKept) {
      notes[tag.name] = text;
    }
  }

  // 판정이 끝난 줄의 내용을 흘려보낼 자리를 마련한다. 직전 조각과 같은
  // 화자면 그 조각에 줄바꿈으로 잇고, 아니면 조각을 새로 연다.
  function beginLine(name: string | null, text: string) {
    isLineDecided = true;
    capture = undefined;

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

        if (tag.kind === "cast") {
          beginLine(tag.name, text);
        } else {
          beginCapture(tag, text);
        }

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
    capture = undefined;
    isCaptureKept = false;
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

  const outcome: SceneOutcome = { ending, notes };

  if (ending !== undefined) {
    await onEnding?.(outcome);
    writer.write({ data: ending, id: "ending", type: "data-ending" });
  }

  return outcome;
}
