import {
  readStoryOutline,
  type StoryOutline,
} from "../src/features/episode/story-creation";

const SENTENCES = /[.!?]+(?:\s|$)/u;
const USER_ADDRESS = /사용자|당신/u;
const FORMATTING = /\*|`|^#|^[-\d]+[.) ]|[\p{Extended_Pictographic}]/mu;
const ENGLISH_NAME = /^[A-Za-z][A-Za-z '.-]*$/;
const PALETTE = /deep navy|terracotta orange|teal|mustard|plum|forest green/;
const LIMIT_COUNT = /(5|다섯)/u;
const LIMIT_NOTICE = /없|최대|상한|한도/u;
const PREDETERMINED_RESULT =
  /문제를 해결한 뒤(?!가 아니라)|교환받은 (?:새 )?기계/u;

export const COVER_ANGLES = [
  "seen from behind, looking back over one shoulder",
  "seen from slightly below, leaning back",
  "close-up, head tilted",
  "seen from slightly above, looking up",
  "three-quarter view, body turned, face toward the viewer",
];

export interface CreationExpectation {
  asks?: boolean;
  atLimit?: boolean;
  episodes?: number;
  preserve?: number[];
  unresolved?: boolean;
}

function dialogueViolations(answer: string, asks?: boolean): string[] {
  const violations: string[] = [];
  if (!answer) {
    violations.push("대화 없음");
  }
  if (answer.includes("\n")) {
    violations.push("여러 문단");
  }
  const sentences = answer.split(SENTENCES).filter(Boolean);
  if (sentences.length > 3) {
    violations.push("세 문장 초과");
  }
  if (sentences.some((sentence) => !sentence.trim().endsWith("요"))) {
    violations.push("해요체 아님");
  }
  if (USER_ADDRESS.test(answer)) {
    violations.push("사용자 호칭");
  }
  if (FORMATTING.test(answer)) {
    violations.push("서식 또는 이모지");
  }
  const questions = answer.match(/\?/g) ?? [];
  if (
    (asks && questions.length !== 1) ||
    questions.length > 1 ||
    (questions.length > 0 && !answer.endsWith("?"))
  ) {
    violations.push("마지막 문장 질문 규칙");
  }
  return violations;
}

function cardViolations(
  card: unknown,
  expected: CreationExpectation,
  previous?: StoryOutline
): string[] {
  const violations: string[] = [];
  const read = readStoryOutline({ outline: card });
  if (!("outline" in read)) {
    return [read.problem];
  }
  const { outline } = read;
  if (outline.episodes.length !== expected.episodes) {
    violations.push("요청한 화 수와 다름");
  }
  if (outline.characters.some((person) => !ENGLISH_NAME.test(person.name))) {
    violations.push("영어 이름 아님");
  }
  if (!COVER_ANGLES.some((angle) => outline.cover.includes(angle))) {
    violations.push("지정 앵글 없음");
  }
  if (!PALETTE.test(outline.cover)) {
    violations.push("지정 배경색 없음");
  }
  for (const number of expected.preserve ?? []) {
    if (!previous) {
      violations.push(`${number}화의 이전 카드 없음`);
      continue;
    }
    const before = previous.episodes.find(
      (episode) => episode.number === number
    );
    const after = outline.episodes.find((episode) => episode.number === number);
    if (
      !(before && after) ||
      before.title !== after.title ||
      before.preview !== after.preview ||
      before.details !== after.details ||
      JSON.stringify(before.cast) !== JSON.stringify(after.cast)
    ) {
      violations.push(`${number}화 변경`);
    }
  }
  return violations;
}

/** 형식과 합의된 카드의 보존을 검사한다. 의미와 재미는 전문으로 따로 확인한다. */
export function creationViolations(
  text: string,
  cards: unknown[],
  expected: CreationExpectation,
  previous?: StoryOutline
): string[] {
  const answer = text.trim();
  const violations: string[] = [];
  if (
    expected.atLimit &&
    !(LIMIT_COUNT.test(answer) && LIMIT_NOTICE.test(answer))
  ) {
    violations.push("상한 안내 없음");
  }
  if (expected.unresolved && PREDETERMINED_RESULT.test(answer)) {
    violations.push("이전 결과 선확정");
  }
  if (expected.episodes === undefined) {
    if (cards.length) {
      violations.push("합의 전에 카드 생성");
    }
    violations.push(...dialogueViolations(answer, expected.asks));
  } else {
    if (cards.length !== 1) {
      violations.push("카드 하나 필요");
    }
    if (answer) {
      violations.push("카드 앞뒤 대화 중복");
    }
  }
  return [
    ...violations,
    ...cards.flatMap((card) => cardViolations(card, expected, previous)),
  ];
}
