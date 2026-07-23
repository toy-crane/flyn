/**
 * The DataStore contract, as executable assertions.
 *
 * Any implementation must pass this suite. S0's mock runs it; S1 runs the same
 * suite against the Supabase implementation. If an assertion here is wrong for
 * a real backend, that is a contract change — raise it rather than weakening
 * the suite.
 */
import { beforeEach, describe, expect, test } from "bun:test";

import type { DataStore } from "@/lib/data-store";
import { ENDINGS, SCENARIO_SUGGESTIONS } from "@/lib/fixtures";
import type { LearnerProfile } from "@/types/learner";

const SCENARIO = SCENARIO_SUGGESTIONS[0]!;

const PROFILE: LearnerProfile = {
  englishLevel: "advanced",
  learningGoals: ["business"],
  genrePreferences: ["thriller"],
  interests: ["music"],
  nickname: "Contract",
};

/**
 * @param name label for the implementation under test
 * @param createStore fresh, empty store per test — no seeded fixtures
 */
export function describeDataStoreContract(
  name: string,
  createStore: () => DataStore | Promise<DataStore>,
) {
  describe(`DataStore contract: ${name}`, () => {
    let store: DataStore;

    beforeEach(async () => {
      store = await createStore();
    });

    test("has no learner profile until onboarding saves one", async () => {
      expect(await store.getLearnerProfile()).toBeNull();

      const saved = await store.saveLearnerProfile(PROFILE);
      expect(saved).toEqual(PROFILE);
      expect(await store.getLearnerProfile()).toEqual(PROFILE);
    });

    test("keeps the latest profile after an edit", async () => {
      await store.saveLearnerProfile(PROFILE);
      await store.saveLearnerProfile({ ...PROFILE, nickname: "Renamed" });

      const stored = await store.getLearnerProfile();
      expect(stored?.nickname).toBe("Renamed");
    });

    test("a new session starts in progress, empty, and resumable", async () => {
      const session = await store.createStorySession(SCENARIO);

      expect(session.status).toBe("in-progress");
      expect(session.messages).toEqual([]);
      expect(session.ending).toBeNull();
      expect(session.scenario.title).toBe(SCENARIO.title);

      const resumable = await store.getInProgressStorySession();
      expect(resumable?.id).toBe(session.id);
    });

    test("appends messages in order and assigns distinct ids", async () => {
      const session = await store.createStorySession(SCENARIO);

      const opening = await store.appendStoryMessage(session.id, {
        speaker: "ai",
        beats: [{ kind: "narration", text: "The train rattles through." }],
      });
      const reply = await store.appendStoryMessage(session.id, {
        speaker: "learner",
        text: '"Where did you get this?"',
      });

      expect(opening.id).not.toBe(reply.id);

      const stored = await store.getStorySession(session.id);
      expect(stored?.messages.map((message) => message.id)).toEqual([
        opening.id,
        reply.id,
      ]);
    });

    test("counts one turn per learner message", async () => {
      const session = await store.createStorySession(SCENARIO);
      await store.appendStoryMessage(session.id, {
        speaker: "ai",
        beats: [{ kind: "dialogue", text: '"That case…"' }],
      });
      await store.appendStoryMessage(session.id, {
        speaker: "learner",
        text: '"It\'s mine."',
      });

      expect((await store.getSessionStats(session.id)).turnCount).toBe(1);
    });

    test("attaches corrections to the learner message that earned them", async () => {
      const session = await store.createStorySession(SCENARIO);
      const message = await store.appendStoryMessage(session.id, {
        speaker: "learner",
        text: "Why you want to know?",
      });

      const [correction] = await store.saveCorrections(message.id, [
        {
          originalText: "Why you want to know?",
          correctedText: "Why do you want to know?",
          errorSpans: [{ start: 0, end: 12 }],
          changedSpans: [{ start: 4, end: 6 }],
          reason: "의문문에는 조동사 do가 주어 앞에 와야 해요.",
          explanation: "평서문 어순 그대로 물으면 어색하게 들려요.",
        },
      ]);

      expect(correction).toBeDefined();
      expect(correction!.messageId).toBe(message.id);
      expect(correction!.sessionId).toBe(session.id);

      expect(await store.getCorrection(correction!.id)).toEqual(correction!);
      expect(await store.listCorrections(session.id)).toEqual([correction!]);

      const stored = await store.getStorySession(session.id);
      const storedMessage = stored?.messages.find(
        (item) => item.id === message.id,
      );
      expect(
        storedMessage?.speaker === "learner"
          ? storedMessage.correctionIds
          : undefined,
      ).toEqual([correction!.id]);
    });

    test("leaves an error-free message without corrections", async () => {
      const session = await store.createStorySession(SCENARIO);
      await store.appendStoryMessage(session.id, {
        speaker: "learner",
        text: "Where was this photo taken?",
      });

      expect(await store.listCorrections(session.id)).toEqual([]);
    });

    test("carries a correction thread in order", async () => {
      const session = await store.createStorySession(SCENARIO);
      const message = await store.appendStoryMessage(session.id, {
        speaker: "learner",
        text: "Why you want to know?",
      });
      const [correction] = await store.saveCorrections(message.id, [
        {
          originalText: "Why you want to know?",
          correctedText: "Why do you want to know?",
          errorSpans: [{ start: 0, end: 12 }],
          changedSpans: [{ start: 4, end: 6 }],
          reason: "의문문에는 조동사 do가 필요해요.",
          explanation: "평서문 어순으로 물으면 어색해요.",
        },
      ]);

      expect(await store.listCorrectionThreadMessages(correction!.id)).toEqual(
        [],
      );

      await store.appendCorrectionThreadMessage(correction!.id, {
        speaker: "learner",
        text: "왜 do가 꼭 필요해?",
      });
      await store.appendCorrectionThreadMessage(correction!.id, {
        speaker: "ai",
        text: "구어에서는 생략하기도 하지만 캐주얼하게 들려요.",
      });

      const thread = await store.listCorrectionThreadMessages(correction!.id);
      expect(thread.map((message) => message.speaker)).toEqual([
        "learner",
        "ai",
      ]);
      expect(
        (await store.getSessionStats(session.id)).correctionThreadCount,
      ).toBe(1);
    });

    test("completing a session closes it and shelves a book", async () => {
      const session = await store.createStorySession(SCENARIO);
      await store.appendStoryMessage(session.id, {
        speaker: "learner",
        text: '"Where was this photo taken?"',
      });

      expect(await store.listBooks()).toEqual([]);

      const completed = await store.completeStorySession(
        session.id,
        ENDINGS.success,
      );

      expect(completed.status).toBe("completed");
      expect(completed.ending?.kind).toBe("success");
      expect(completed.completedAt).not.toBeNull();
      expect(await store.getInProgressStorySession()).toBeNull();

      const books = await store.listBooks();
      expect(books).toHaveLength(1);
      expect(books[0]!.sessionId).toBe(session.id);
      expect(books[0]!.title).toBe(SCENARIO.title);
      expect(books[0]!.genre).toBe(SCENARIO.genre);
      expect(books[0]!.endingKind).toBe("success");
      expect(books[0]!.turnCount).toBe(1);
    });

    test("shelves a book for every ending, not only success", async () => {
      for (const ending of [ENDINGS.failure, ENDINGS.forced]) {
        const session = await store.createStorySession(SCENARIO);
        await store.completeStorySession(session.id, ending);
      }

      const books = await store.listBooks();
      expect(books.map((book) => book.endingKind).sort()).toEqual([
        "failure",
        "forced",
      ]);
    });

    test("returns null for sessions and corrections it does not have", async () => {
      expect(await store.getStorySession("nope")).toBeNull();
      expect(await store.getCorrection("nope")).toBeNull();
    });
  });
}
