/**
 * In-memory DataStore seeded with the prototype fixtures. Stands in until the
 * Supabase implementation lands, and stays useful afterwards for screen work
 * that should not need a network.
 */
import * as fixtures from "@/lib/fixtures";
import type {
  DataStore,
  NewCorrection,
  NewCorrectionThreadMessage,
  NewStoryMessage,
} from "@/lib/data-store";
import type {
  Correction,
  CorrectionThreadMessage,
} from "@/types/correction";
import type { LearnerProfile, LearnerStats } from "@/types/learner";
import type {
  Book,
  Ending,
  Scenario,
  SessionStats,
  StoryMessage,
  StorySession,
} from "@/types/story";

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export type MockDataStoreOptions = {
  /** Start empty to exercise first-run states (빈 서재, 온보딩 미완). */
  seed?: boolean;
};

export function createMockDataStore(
  options: MockDataStoreOptions = {},
): DataStore {
  const seed = options.seed ?? true;

  let profile: LearnerProfile | null = seed
    ? clone(fixtures.LEARNER_PROFILE)
    : null;
  const sessions = new Map<string, StorySession>();
  const corrections = new Map<string, Correction>();
  const threads = new Map<string, CorrectionThreadMessage[]>();
  const stats = new Map<string, SessionStats>();
  const books: Book[] = seed ? clone(fixtures.BOOKS) : [];

  let nextId = 1;
  const id = (prefix: string) => `${prefix}-${nextId++}`;

  if (seed) {
    const completed = clone(fixtures.COMPLETED_SESSION);
    const inProgress = clone(fixtures.IN_PROGRESS_SESSION);
    // The seeded session is the same story in two states; the library shows the
    // finished one, so it is the record the store keeps.
    sessions.set(completed.id, completed);
    sessions.set("session-in-progress", {
      ...inProgress,
      id: "session-in-progress",
    });
    stats.set(completed.id, clone(fixtures.SESSION_STATS));
    for (const correction of clone(fixtures.CORRECTIONS)) {
      corrections.set(correction.id, correction);
    }
    threads.set(
      fixtures.CORRECTION_THREAD.correctionId,
      clone(fixtures.CORRECTION_THREAD.messages),
    );
  }

  function requireSession(sessionId: string): StorySession {
    const session = sessions.get(sessionId);
    if (!session) throw new Error(`unknown story session: ${sessionId}`);
    return session;
  }

  function statsFor(sessionId: string): SessionStats {
    let record = stats.get(sessionId);
    if (!record) {
      record = { turnCount: 0, correctionCount: 0, correctionThreadCount: 0 };
      stats.set(sessionId, record);
    }
    return record;
  }

  return {
    async getLearnerProfile() {
      return profile ? clone(profile) : null;
    },

    async saveLearnerProfile(next: LearnerProfile) {
      profile = clone(next);
      return clone(profile);
    },

    async createStorySession(scenario: Scenario) {
      const session: StorySession = {
        id: id("session"),
        scenario: clone(scenario),
        status: "in-progress",
        messages: [],
        ending: null,
        startedAt: new Date().toISOString(),
        completedAt: null,
      };
      sessions.set(session.id, session);
      statsFor(session.id);
      return clone(session);
    },

    async getStorySession(sessionId: string) {
      const session = sessions.get(sessionId);
      return session ? clone(session) : null;
    },

    async getInProgressStorySession() {
      for (const session of sessions.values()) {
        if (session.status === "in-progress") return clone(session);
      }
      return null;
    },

    async appendStoryMessage(sessionId: string, message: NewStoryMessage) {
      const session = requireSession(sessionId);
      const stored: StoryMessage =
        message.speaker === "ai"
          ? { id: id("msg"), speaker: "ai", beats: clone(message.beats) }
          : {
              id: id("msg"),
              speaker: "learner",
              text: message.text,
              correctionIds: [],
            };
      session.messages.push(stored);
      if (stored.speaker === "learner") statsFor(sessionId).turnCount += 1;
      return clone(stored);
    },

    async completeStorySession(sessionId: string, ending: Ending) {
      const session = requireSession(sessionId);
      session.status = "completed";
      session.ending = clone(ending);
      session.completedAt = new Date().toISOString();
      const sessionStats = statsFor(sessionId);
      books.unshift({
        sessionId: session.id,
        title: session.scenario.title,
        genre: session.scenario.genre,
        endingKind: ending.kind,
        completedAt: session.completedAt,
        turnCount: sessionStats.turnCount,
        correctionCount: sessionStats.correctionCount,
      });
      return clone(session);
    },

    async saveCorrections(messageId: string, drafts: NewCorrection[]) {
      const session = [...sessions.values()].find((candidate) =>
        candidate.messages.some((message) => message.id === messageId),
      );
      if (!session) throw new Error(`unknown story message: ${messageId}`);
      const message = session.messages.find((item) => item.id === messageId);
      if (!message || message.speaker !== "learner") {
        throw new Error(`not a learner message: ${messageId}`);
      }

      const saved = drafts.map((draft) => {
        const correction: Correction = {
          ...clone(draft),
          id: id("fix"),
          sessionId: session.id,
          messageId,
        };
        corrections.set(correction.id, correction);
        message.correctionIds.push(correction.id);
        return correction;
      });
      statsFor(session.id).correctionCount += saved.length;
      return clone(saved);
    },

    async listCorrections(sessionId: string) {
      return clone(
        [...corrections.values()].filter(
          (correction) => correction.sessionId === sessionId,
        ),
      );
    },

    async getCorrection(correctionId: string) {
      const correction = corrections.get(correctionId);
      return correction ? clone(correction) : null;
    },

    async listCorrectionThreadMessages(correctionId: string) {
      return clone(threads.get(correctionId) ?? []);
    },

    async appendCorrectionThreadMessage(
      correctionId: string,
      message: NewCorrectionThreadMessage,
    ) {
      const correction = corrections.get(correctionId);
      if (!correction) throw new Error(`unknown correction: ${correctionId}`);
      const existing = threads.get(correctionId) ?? [];
      if (existing.length === 0) {
        statsFor(correction.sessionId).correctionThreadCount += 1;
      }
      const stored: CorrectionThreadMessage = { ...message, id: id("thread") };
      threads.set(correctionId, [...existing, stored]);
      return clone(stored);
    },

    async listBooks() {
      return clone(books);
    },

    async getLearnerStats(): Promise<LearnerStats> {
      // Real streak and totals are computed from completed sessions in S7.
      return clone(
        seed
          ? fixtures.LEARNER_STATS
          : {
              streakDays: 0,
              completedStories: 0,
              totalTurns: 0,
              totalCorrections: 0,
              daysSinceJoined: 0,
              weeklyActivity: fixtures.LEARNER_STATS.weeklyActivity.map(
                (day) => ({ ...day, studied: false }),
              ),
            },
      );
    },

    async getSessionStats(sessionId: string) {
      return clone(statsFor(sessionId));
    },
  };
}
