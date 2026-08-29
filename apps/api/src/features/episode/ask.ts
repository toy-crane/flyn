import type { CorrectionEntry } from "./correction";

/** 시트가 답을 구하는 근거. 앱이 보낸 교정 그대로다. */
export interface AskedCorrection {
  entries: CorrectionEntry[];
  fixed: string;
  original: string;
}

function isEntry(value: unknown): value is CorrectionEntry {
  const entry = value as Partial<CorrectionEntry> | null;

  return (
    typeof entry?.fixed === "string" &&
    typeof entry.original === "string" &&
    typeof entry.pattern === "string" &&
    typeof entry.why === "string"
  );
}

/**
 * 앱이 보낸 교정을 읽는다.
 *
 * 시트의 답은 이 교정 안에서만 나온다. 교정이 없으면 답할 자리가 없으므로
 * 요청을 받지 않는다.
 */
export function readAskedCorrection(
  body: unknown
): AskedCorrection | undefined {
  const sent = (body as { correction?: unknown } | null)?.correction as
    | Partial<AskedCorrection>
    | null
    | undefined;

  if (
    typeof sent?.fixed !== "string" ||
    typeof sent.original !== "string" ||
    !Array.isArray(sent.entries) ||
    !sent.entries.every(isEntry)
  ) {
    return;
  }

  return {
    entries: sent.entries,
    fixed: sent.fixed,
    original: sent.original,
  };
}

/**
 * 배울 표현 하나를 두고 한국어로 답하는 자리의 지시.
 *
 * 장면을 쓰는 프롬프트와 아무것도 나누지 않는다. 여기서는 사건이 진행되지
 * 않고 인물도 말하지 않는다. 답을 닫아 두는 규칙이 이 자리의 전부인데, 그것이
 * 사용자를 이야기에서 오래 떼어 놓지 않는 유일한 장치이기 때문이다.
 */
export function askSystemPrompt(correction: AskedCorrection): string {
  const entries = correction.entries
    .map(
      (entry) =>
        `- ${entry.original} → ${entry.fixed}\n  이 앱이 알려 준 이유: ${entry.why}`
    )
    .join("\n");

  return `너는 영어를 배우는 한국어 사용자의 질문에 답하는 사람이다. 사용자는 이야기 속 대화를 하다가 자기 문장에 붙은 교정을 보고 이 자리로 왔다.

사용자가 쓴 문장: ${correction.original}
고친 문장: ${correction.fixed}
배울 표현:
${entries}

답하는 방법:
- 한국어로 답한다. 영어 예문은 필요할 때만 짧게 든다.
- 결론을 첫 문장에 쓴다. 배경 설명을 앞에 두지 않는다.
- 서너 문장 안에서 끝낸다. 답은 완결로 끝나고, "더 궁금한 게 있나요" 같은 되묻기나 다음 갈래를 여는 말을 붙이지 않는다.
- 위의 교정과 지금까지의 대화 안에서 답한다. 관련 없는 문법으로 넓히지 않는다.
- 깊은 질문에도 그 자리에서 답한다. 어렵다고 거절하거나 나중에 보자고 미루지 않는다.
- 이야기 속 인물처럼 말하지 않고, 장면을 이어 쓰지 않는다. 사건은 여기서 진행되지 않는다.
- 사용자를 채점하지 않는다. 몇 개를 틀렸는지 세지 않고 잘한다는 칭찬도 덧붙이지 않는다.
- 마크다운 제목과 이모지를 쓰지 않는다. 목록은 정말 나열일 때만 쓴다.`;
}
