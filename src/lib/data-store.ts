/**
 * The seam between screens and persistence.
 *
 * Screens depend on this interface only. S0 ships an in-memory mock; S1 swaps
 * in the Supabase implementation behind the same contract, verified by the
 * shared suite in `data-store-contract.ts`.
 *
 * Everything here is scoped to the signed-in learner — there is no user id
 * parameter, because the implementation derives it from the session.
 */
import type {
  Correction,
  CorrectionThreadMessage,
} from "@/types/correction";
import type { LearnerProfile, LearnerStats } from "@/types/learner";
import type {
  AiBeat,
  Book,
  Ending,
  Scenario,
  SessionStats,
  StoryMessage,
  StorySession,
} from "@/types/story";

/** A message before the store assigns it an id. */
export type NewStoryMessage =
  | { speaker: "ai"; beats: AiBeat[] }
  | { speaker: "learner"; text: string };

/** A correction before the store ties it to a message. */
export type NewCorrection = Omit<
  Correction,
  "id" | "sessionId" | "messageId"
>;

export type NewCorrectionThreadMessage = Omit<CorrectionThreadMessage, "id">;

export interface DataStore {
  /** Null until onboarding finishes — the auth guard routes on this. */
  getLearnerProfile(): Promise<LearnerProfile | null>;
  saveLearnerProfile(profile: LearnerProfile): Promise<LearnerProfile>;

  createStorySession(scenario: Scenario): Promise<StorySession>;
  getStorySession(sessionId: string): Promise<StorySession | null>;
  /** The session the learner walked away from, if any — powers 이어하기. */
  getInProgressStorySession(): Promise<StorySession | null>;
  appendStoryMessage(
    sessionId: string,
    message: NewStoryMessage,
  ): Promise<StoryMessage>;
  completeStorySession(
    sessionId: string,
    ending: Ending,
  ): Promise<StorySession>;

  /** Corrections arrive with the AI reply, after the learner message persists. */
  saveCorrections(
    messageId: string,
    corrections: NewCorrection[],
  ): Promise<Correction[]>;
  listCorrections(sessionId: string): Promise<Correction[]>;
  getCorrection(correctionId: string): Promise<Correction | null>;

  listCorrectionThreadMessages(
    correctionId: string,
  ): Promise<CorrectionThreadMessage[]>;
  appendCorrectionThreadMessage(
    correctionId: string,
    message: NewCorrectionThreadMessage,
  ): Promise<CorrectionThreadMessage>;

  /** Completed sessions, newest first. */
  listBooks(): Promise<Book[]>;
  getLearnerStats(): Promise<LearnerStats>;
  getSessionStats(sessionId: string): Promise<SessionStats>;
}
