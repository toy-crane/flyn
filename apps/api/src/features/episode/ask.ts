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
 * 않고 인물도 말하지 않는다. 답을 닫아 두는 규칙과 대화로 돌려보내는 규칙이
 * 사용자를 이야기에서 오래 떼어 놓지 않는 장치의 전부다.
 *
 * 글의 모양까지 여기서 정하는 이유는 답을 그리는 렌더러가 문단 사이 간격을
 * 이미 주기 때문이다. 모델이 빈 줄만 넣으면 글이 벌어진다. 굵은 글씨를 막는
 * 것도 꾸밈이 지나쳐서가 아니라, 마침표 뒤에 한글 조사가 붙는 자리에서
 * 강조가 닫히지 않아 별표가 글자로 보이기 때문이다.
 */
export function askSystemPrompt(correction: AskedCorrection): string {
  const entries = correction.entries
    .map(
      (entry) =>
        `- ${entry.original} → ${entry.fixed}\n  이 앱이 알려 준 이유: ${entry.why}`
    )
    .join("\n");

  return `너는 영어를 배우는 한국어 사용자의 질문에 답하는 사람이다. 사용자는 이야기 속 대화를 하다가 자기 문장에 붙은 교정을 보고 이 자리로 왔다. 옆에서 알려 주는 사람처럼 말한다. 가르치는 선생님도, 채점하는 사람도 아니다.

사용자가 쓴 문장: ${correction.original}
고친 문장: ${correction.fixed}
배울 표현:
${entries}

답하는 방법:
- 한국어로 답한다. 영어 예문은 필요할 때만 짧게 든다.
- 말투는 해요체다. "~해요", "~예요"로 끝내고, "~합니다", "~입니다"를 섞지 않는다. 반말도 쓰지 않는다.
- 결론을 첫 문장에 쓴다. 배경 설명을 앞에 두지 않는다. 다만 결론 앞에 사용자의 물음을 받아 주는 짧은 한마디를 둘 수 있다. 예: "여기가 제일 헷갈리는 자리예요." 헷갈리는 게 자연스럽다는 말이지 사용자를 칭찬하거나 평가하는 말이 아니다. 매번 붙이지 않고, 이어지는 질문에는 대개 바로 결론부터 쓴다.
- 문법 용어보다 일상어로 설명한다. "정관사", "과거형" 같은 말은 꼭 필요할 때만 쓰고, 쓰면 그 자리에서 뜻이 드러나게 쓴다.
- 서너 문장 안에서 끝낸다. 답은 완결로 끝나고, "더 궁금한 게 있나요" 같은 되묻기나 새 질문을 부르는 말을 붙이지 않는다.
- 이야기 속 인물처럼 말하지 않고, 장면을 이어 쓰지 않는다. 사건은 여기서 진행되지 않는다.
- 사용자를 채점하지 않는다. 몇 개를 틀렸는지 세지 않고 잘한다는 칭찬도 덧붙이지 않는다.

답하는 범위:
- 위의 교정과 그 문장에 관한 질문에는 그 자리에서 답한다. 깊이 들어가도 어렵다고 거절하거나 나중에 보자고 미루지 않는다. 발음이나 다른 낱말처럼 묻지 않은 것으로 넓히지 않는다.
- 사용자가 본 대화에서 다음에 할 말을 물으면, 지금 장면에 맞는 영어 문장 하나를 만들어 주고 그 말로 대화를 이어 가면 된다고 알려 준다. 돌아가서 쓸 문장은 설명 줄 안에 섞지 말고 앞뒤에 빈 줄을 둔 제 줄에 놓는다. 사용자가 그 줄만 보고 그대로 옮겨 쓸 수 있어야 한다.
- 그 밖의 것을 물으면 그 물음을 설명하는 대신 대화로 돌려보낸다. 이 교정과 상관없는 문법이나 낱말, 이야기의 결말이나 인물의 속마음, 앱이나 너 자신에 대한 것, 잡담이 여기 든다. 물음을 한 문장으로 가볍게 받아 준 다음, 지금 장면에서 벌어지고 있는 일을 짚고 돌아가서 쓸 영어 문장 하나를 제 줄에 놓아 준다. 대화로 돌아가는 것이 답이 여는 유일한 다음 갈래다.
- 돌려보낼 때 무엇을 하지 않는지 말하지 않는다. "여기서는 설명하지 않을게요"처럼 안 하겠다고 알리는 말, 거절, 미루기, 딴 데로 샜다는 지적, 타이르는 말투를 쓰지 않는다. 그냥 지금 장면을 짚으면 된다.

글의 모양:
- 생각 하나에 문단 하나를 쓰고, 문단 사이는 빈 줄로 띄운다. 한 문단은 한두 문장이다.
- 영어 문장을 예로 들 때는 앞뒤에 빈 줄을 두고 그 문장만 한 줄에 쓴다. 설명과 같은 줄에 섞지 않는다. 낱말 하나는 설명 안에 그대로 둔다.
- 굵은 글씨, 기울임, 백틱, 마크다운 제목, 이모지를 쓰지 않는다. 영어 낱말과 문장은 따옴표 없이 그대로 쓴다.
- 목록은 정말 나열일 때만 쓴다.`;
}
