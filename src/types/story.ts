import type { Genre } from "@/types/learner";

/**
 * Scenario (상황) — the stage a Story Session plays out on.
 * AI generates it; the learner may edit any field. When the roles or the scene
 * change, the goal is always rewritten from My Role's point of view.
 */
export type Scenario = {
  genre: Genre;
  title: string;
  /** Card blurb on the home screen (소개). */
  intro: string;
  /** The opening situation in full (장면). */
  scene: string;
  /** Goal (목표) — the narrative task, revealed from the start, and the end trigger. */
  goal: string;
  /** My Role (내 역할) — the part the learner plays. */
  myRole: string;
  /** AI Role (AI 역할) — the opposite part, narration included. */
  aiRole: string;
  /** Structured conditions evaluated every turn to decide success or failure. */
  achievementConditions: AchievementCondition[];
};

/**
 * One machine-checkable clause of the goal, generated alongside the Scenario.
 * The story-turn route evaluates these each turn rather than re-judging prose.
 */
export type AchievementCondition = {
  id: string;
  /** What must become true for the goal to count as achieved. */
  description: string;
};

/** Hard turn ceiling — a cost-control device, and the forced-ending trigger. */
export const MAX_TURNS = 30;

/**
 * Story Session (스토리 세션) — one scenario played out as a text adventure
 * of mixed narration and dialogue, ending in an Ending.
 */
export type StorySession = {
  id: string;
  /** Snapshot: edits to the profile or scenario later must not rewrite history. */
  scenario: Scenario;
  status: StorySessionStatus;
  messages: StoryMessage[];
  /** Present once the session has finished. */
  ending: Ending | null;
  startedAt: string;
  completedAt: string | null;
};

export type StorySessionStatus = "in-progress" | "completed";

/** Turns counted for the "12 / 30턴" counter — one learner message is one turn. */
export type StoryMessage = AiMessage | LearnerMessage;

/** The AI speaks as narrator and as the AI Role, often in the same turn. */
export type AiMessage = {
  id: string;
  speaker: "ai";
  beats: AiBeat[];
};

/**
 * What the learner sends: English dialogue, action description, or both
 * (`*I hold the case tighter* "It's just my luggage."`).
 */
export type LearnerMessage = {
  id: string;
  speaker: "learner";
  /** Raw input as typed, including any `*action*` markers. */
  text: string;
  /** Empty when the turn had no obvious errors — then no underline is drawn. */
  correctionIds: string[];
};

/** Narration (내레이션) — the AI describing scene and event, not a character line. */
export type Narration = { kind: "narration"; text: string };

/** A character line, spoken by the AI Role or the learner. */
export type Dialogue = { kind: "dialogue"; text: string };

/** Action (행동 묘사) — a character's action, written between asterisks. */
export type Action = { kind: "action"; text: string };

/** An AI turn renders as narration blocks and dialogue bubbles, in order. */
export type AiBeat = Narration | Dialogue;

/** A learner turn parses into dialogue and action segments for rendering. */
export type LearnerBeat = Dialogue | Action;

/**
 * Ending (결말) — every session closes as a finished story, whichever branch.
 */
export type Ending = {
  kind: EndingKind;
  /** Closing narration that plays the story out. */
  narration: string;
  /** End card headline ("이야기 완성 — 목표 달성"). */
  headline: string;
  /** End card sub-line ("사진의 출처를 알아냈어요."). */
  note: string;
  /** One-paragraph recap shown on the result screen. */
  summary: string;
};

export type EndingKind = "success" | "failure" | "forced";

export const ENDING_BADGE: Record<EndingKind, string> = {
  success: "성공",
  failure: "실패",
  forced: "강제 결말",
};

/**
 * A completed session as it appears in the Library (서재) — cover-sized
 * projection, without the message history.
 */
export type Book = {
  sessionId: string;
  title: string;
  genre: Genre;
  endingKind: EndingKind;
  completedAt: string;
  turnCount: number;
  correctionCount: number;
};

/** Result screen stat tiles (턴 / 교정 / 교정 대화). */
export type SessionStats = {
  turnCount: number;
  correctionCount: number;
  correctionThreadCount: number;
};

/**
 * Book cover fill per genre. The spec names four; the remaining onboarding
 * genres fall back until the spec assigns them colors.
 */
export const GENRE_COVER_COLOR: Partial<Record<Genre, string>> = {
  mystery: "#22304a",
  fantasy: "#4b3a8f",
  scifi: "#0f5e63",
  daily: "#9a5b12",
};

export const FALLBACK_COVER_COLOR = "#22304a";

export function coverColorFor(genre: Genre): string {
  return GENRE_COVER_COLOR[genre] ?? FALLBACK_COVER_COLOR;
}
