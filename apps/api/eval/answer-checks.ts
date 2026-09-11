/** 물어보기 답을 재는 세 갈래. 갈래마다 무엇을 재는지가 다르다. */
export type AnswerScope = "correction" | "nextLine" | "offTopic";

/**
 * 합쇼체 어미. 답은 해요체 하나로 끝나야 한다.
 *
 * 어미 뒤에 문장이 끝나는 자리만 본다. "합니다만"처럼 이어지는 말은 잡지 않는다.
 */
const FORMAL_ENDING = /(습니다|입니다|합니다|됩니다|십시오)[.!?]?(\s|$)/;

/**
 * 답을 덮는 마크다운 기호와 이모지.
 *
 * 굵은 글씨와 백틱을 막는 이유는 꾸밈이 지나쳐서가 아니라, 마침표 뒤에 한글
 * 조사가 붙는 자리에서 강조가 닫히지 않아 별표가 글자로 보이기 때문이다.
 */
const MARKDOWN_MARKS = [
  /\*\*/,
  /`/,
  /^#{1,6}\s/m,
  /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u,
];

/**
 * 그 줄 전체가 영어 문장 하나인 줄.
 *
 * 한국어 문장 안에 이어져 들어간 영어는 여기 걸리지 않는다. 규칙이 자리를
 * 정해 주는 것은 줄로 선 예문뿐이다.
 */
const ENGLISH_LINE = /^[A-Za-z][^가-힣]*[.?!]$/;

/**
 * 답을 닫지 않고 다음 갈래를 여는 말.
 *
 * 되묻기, 미루기, 거절, 떠넘기기가 모두 여기 든다. 대화로 돌아가는 것 말고는
 * 답이 열 수 있는 갈래가 없다.
 *
 * 안 하겠다고 말하는 것도 거절이다. 교정 밖 물음은 조용히 장면으로 돌려보내면
 * 되고, 무엇을 하지 않는지 알릴 자리가 아니다.
 *
 * "나중에"는 뒤에 오는 말까지 함께 본다. 낱말만 찾으면 "나중에 일어날 일을
 * 말할 때는 will을 써요"처럼 미래를 설명하는 정상 답이 미루기로 걸린다.
 */
const OPEN_ENDING =
  /궁금한 게|물어보세요|나중에 (다시|보|알려|설명|이야기|얘기|말씀)|다룰 수 없|펼치지 않|설명하지 않을|답하기 어려|말씀드리기 어려/;

/** 문장이 끝나는 자리. 문단을 나눠야 하는지 세는 데 쓴다. */
const SENTENCE_END = /[.!?。](\s|$)/g;

/** 이 수부터는 한 덩어리로 두지 않는다. */
const CROWDED_SENTENCES = 3;

/**
 * 갈래마다 다른 길이 상한.
 *
 * 교정 안 질문은 설명할 것이 있어 길고, 대화로 돌려보내는 답은 장면을 짚고
 * 예문 하나를 주면 끝난다.
 */
const LENGTH_LIMIT: Record<AnswerScope, number> = {
  correction: 320,
  nextLine: 200,
  offTopic: 200,
};

/**
 * 그 자리의 위아래가 비어 있는지. 답의 끝도 빈 자리로 친다.
 *
 * 글이 아니라 자리를 받는다. 같은 예문이 두 번 나올 때 글로 찾으면 앞엣것만
 * 보게 되어 뒤에 붙어 있는 줄을 놓친다.
 */
function isStandingAlone(lines: string[], at: number): boolean {
  return (
    (at === 0 || lines[at - 1] === "") &&
    (at === lines.length - 1 || lines[at + 1] === "")
  );
}

/**
 * 답 하나에서 규칙에 어긋난 자리를 모은다.
 *
 * 규칙은 [AI에게 물어보기 답변](../../../docs/decisions/ask-ai-answers.md)의
 * 평가 항목이 소유한다. 빈 배열이 통과다.
 */
export function answerViolations(answer: string, scope: AnswerScope): string[] {
  const violations: string[] = [];

  if (FORMAL_ENDING.test(answer)) {
    violations.push("합쇼체");
  }
  if (MARKDOWN_MARKS.some((mark) => mark.test(answer))) {
    violations.push("마크다운 기호");
  }

  const sentences = (answer.match(SENTENCE_END) ?? []).length;

  if (sentences >= CROWDED_SENTENCES && !answer.includes("\n\n")) {
    violations.push("문단 없음");
  }

  const lines = answer.split("\n").map((line) => line.trim());
  const englishLines = lines
    .map((line, at) => ({ at, line }))
    .filter(({ line }) => ENGLISH_LINE.test(line));

  if (englishLines.some(({ at }) => !isStandingAlone(lines, at))) {
    violations.push("붙어 있는 예문 줄");
  }
  if (OPEN_ENDING.test(answer)) {
    violations.push("열린 맺음");
  }
  // 교정 밖 답은 돌아가서 쓸 영어 예문으로 끝나므로 물음표가 남을 수 있다.
  if (scope === "correction" && answer.trim().endsWith("?")) {
    violations.push("질문으로 끝남");
  }
  if (scope !== "correction" && englishLines.length === 0) {
    violations.push("돌아갈 예문 없음");
  }
  if (answer.trim().length > LENGTH_LIMIT[scope]) {
    violations.push("길이 넘침");
  }

  return violations;
}
