/**
 * Prompt fragments shared across the AI engine's calls: who the learner is,
 * how hard the English may be, how strongly to correct, and which language
 * each contract field is written in (스펙 언어 매트릭스 — 픽스처 실측).
 */
import type { EnglishLevel, LearnerProfile } from "@/types/learner";
import {
  ENGLISH_LEVEL_COPY,
  GENRE_LABEL,
  INTEREST_LABEL,
  LEARNING_GOAL_LABEL,
} from "@/types/learner";

/** The learner as prompt context. Identity data does not exist by design. */
export function learnerFragment(profile: LearnerProfile): string {
  const level = ENGLISH_LEVEL_COPY[profile.englishLevel];
  const goals = profile.learningGoals
    .map((goal) => LEARNING_GOAL_LABEL[goal])
    .join(", ");
  const genres = profile.genrePreferences
    .map((genre) => GENRE_LABEL[genre])
    .join(", ");
  const interests = profile.interests
    .map((interest) => INTEREST_LABEL[interest])
    .join(", ");
  return [
    `학습자 프로필:`,
    `- 영어 수준: ${level.short} (${profile.englishLevel}) — "${level.title}"`,
    `- 학습 목적: ${goals || "미지정"}`,
    `- 장르 취향: ${genres || "미지정"}`,
    `- 관심사: ${interests || "미지정"}`,
    profile.nickname ? `- 닉네임: ${profile.nickname}` : null,
    ``,
    `학습 목적·장르 취향·관심사는 소재의 가중치이지 엄격한 필터가 아니다.`,
  ]
    .filter((line) => line !== null)
    .join("\n");
}

/** Output-difficulty ladder for English the AI writes (narration, dialogue). */
export function difficultyFragment(level: EnglishLevel): string {
  const ladder: Record<EnglishLevel, string> = {
    beginner:
      "짧고 단순한 문장, 기초 어휘만. 한 beat는 1~2문장. 관용구·구어체 축약을 피한다.",
    intermediate:
      "자연스럽되 명료한 문장. 일상 관용구는 허용하되 문장 구조는 복잡하게 꼬지 않는다.",
    advanced:
      "원어민 수준의 자연스러운 문장. 뉘앙스, 관용구, 함축을 자유롭게 쓴다.",
  };
  return `영어 출력 난이도 (학습자 수준: ${level}): ${ladder[level]}`;
}

/** Correction threshold — the initial strength is "obvious errors only". */
export function correctionStrengthFragment(level: EnglishLevel): string {
  const threshold: Record<EnglishLevel, string> = {
    beginner:
      "의미 전달을 막는 오류만 교정한다. 어색하지만 통하는 표현은 넘어간다.",
    intermediate:
      "명백한 문법·어휘 오류만 교정한다. 스타일 취향이나 더 나은 표현 제안은 하지 않는다.",
    advanced:
      "명백한 오류와 원어민이라면 쓰지 않을 표현을 교정한다. 단순 취향 차이는 넘어간다.",
  };
  return [
    `교정 강도 (학습자 수준: ${level}): ${threshold[level]}`,
    `오류가 없는 입력에는 교정을 만들지 않는다 — 빈 배열이 정답인 경우가 많다.`,
  ].join("\n");
}

/** Which language each field is written in — fixed by the S0 fixtures. */
export const STORY_LANGUAGE_RULES = [
  "언어 규칙:",
  "- 내레이션과 대사(beats)는 영어로 쓴다 — 학습자가 읽고 답하는 본문이다.",
  "- 교정의 originalText·correctedText는 영어(학습자의 문장), reason·explanation은 한국어.",
  "- 판정 evidence는 한국어로, 대화록을 인용해 쓴다.",
  "- 결말의 narration은 영어, headline·note·summary는 한국어.",
].join("\n");

export const SCENARIO_LANGUAGE_RULES = [
  "언어 규칙:",
  "- title은 영어로 짓는다 (책 제목처럼).",
  "- intro·scene·goal·myRole·aiRole·달성 조건 description은 한국어로 쓴다.",
].join("\n");
