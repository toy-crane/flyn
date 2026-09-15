import {
  readStoryOutline,
  type StoryOutline,
} from "../src/features/episode/story-creation";

const ENGLISH_NAME = /^[A-Za-z][A-Za-z '.-]*$/;
const PALETTE = /deep navy|terracotta orange|teal|mustard|plum|forest green/;
const LIMIT_COUNT = /(5|다섯)/u;
const LIMIT_NOTICE = /없|최대|상한|한도/u;
const OPTIONAL_EPISODE =
  /(?:만으로|만 해도|만 하셔도|만 만들|만 진행|만 연습해도|만 에피소드로|하나로|하나만|한 (?:화|에피소드)로|한 화만|추가하지 않|더하지 않|추가 없이)/u;
const PREDETERMINED_RESULT =
  /문제를 해결한 뒤(?!가 아니라)|교환받은 (?:새 )?기계|교환한 뒤|아기가 잠든 뒤|아기를 달랜 뒤/u;
// 실제 출력에서 발견한 의미 반전의 회귀 검사다. 나머지 의미는 전문으로 확인한다.
const FORBIDDEN_PLAY_RESULT = /실제 (?:대화|플레이)에서(?:도)? 정하지 않/u;
// 고정 평가 입력은 한국어와 영어다. 문장 부호·숫자·이모지·결합 문자는 허용한다.
const STRAY_SCRIPT =
  /[^\p{Script=Hangul}\p{Script=Latin}\p{Script=Common}\p{Script=Inherited}]/u;
const HELD_PHONE = /holding (?:a |the )?phone/i;

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
  characters?: number;
  episodes?: number;
  preserve?: number[];
  proposes?: boolean;
  unresolved?: boolean;
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
  if (STRAY_SCRIPT.test(JSON.stringify(outline))) {
    violations.push("관계없는 외국어 조각");
  }
  if (HELD_PHONE.test(outline.cover)) {
    violations.push("표지에 손에 든 소품");
  }
  if (
    outline.episodes.some((episode) =>
      FORBIDDEN_PLAY_RESULT.test(episode.details)
    )
  ) {
    violations.push("실제 플레이의 결과 결정 금지");
  }
  if (
    expected.characters !== undefined &&
    outline.characters.length !== expected.characters
  ) {
    violations.push("요청한 상대 인원과 다름");
  }
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

/** 카드 계약을 검사한다. 대화의 이해도, 말투와 가독성은 전문으로 따로 확인한다. */
export function creationViolations(
  text: string,
  cards: unknown[],
  expected: CreationExpectation,
  previous?: StoryOutline
): string[] {
  const answer = text.trim();
  const violations: string[] = [];
  if (STRAY_SCRIPT.test(answer)) {
    violations.push("관계없는 외국어 조각");
  }
  if (FORBIDDEN_PLAY_RESULT.test(answer)) {
    violations.push("실제 플레이의 결과 결정 금지");
  }
  if (expected.proposes && !OPTIONAL_EPISODE.test(answer)) {
    violations.push("한 에피소드로 끝내는 안내 없음");
  }
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
    if (!answer) {
      violations.push("대화 없음");
    }
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
