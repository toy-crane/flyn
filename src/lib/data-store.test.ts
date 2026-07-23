import { expect, test } from "bun:test";

import { describeDataStoreContract } from "@/lib/data-store-contract";
import { createMockDataStore } from "@/lib/data-store-mock";
import * as fixtures from "@/lib/fixtures";

describeDataStoreContract("in-memory mock", () =>
  createMockDataStore({ seed: false }),
);

test("the seeded store opens on the prototype's world", async () => {
  const store = createMockDataStore();

  const profile = await store.getLearnerProfile();
  expect(profile?.nickname).toBe("Alex");

  const books = await store.listBooks();
  expect(books.map((book) => book.title)).toEqual([
    "Night train to Budapest",
    "The dragon's apprentice",
    "Signal from Bay 7",
    "Elevator with the CEO",
  ]);

  const resumable = await store.getInProgressStorySession();
  expect(resumable?.scenario.title).toBe("Night train to Budapest");
});

test("the seeded store hands out the prototype's corrections", async () => {
  const store = createMockDataStore();

  const corrections = await store.listCorrections("session-night-train");
  expect(corrections.map((correction) => correction.correctedText)).toEqual([
    "Why do you want to know?",
    "I've had this case for years.",
    "Could you show me the photo?",
  ]);

  const thread = await store.listCorrectionThreadMessages("fix-1");
  expect(thread).toHaveLength(2);
});

test("the unseeded store shows first-run states", async () => {
  const store = createMockDataStore({ seed: false });

  expect(await store.getLearnerProfile()).toBeNull();
  expect(await store.listBooks()).toEqual([]);
  expect((await store.getLearnerStats()).streakDays).toBe(0);
});

test("mutating what the store returns cannot corrupt the fixtures", async () => {
  const store = createMockDataStore();

  const books = await store.listBooks();
  books[0]!.title = "mutated";

  expect((await store.listBooks())[0]!.title).toBe("Night train to Budapest");
  expect(fixtures.BOOKS[0]!.title).toBe("Night train to Budapest");
});

test("error spans point at the wrong words in the learner's own text", async () => {
  const store = createMockDataStore();

  const correction = await store.getCorrection("fix-1");
  const session = await store.getStorySession("session-night-train");
  const message = session?.messages.find(
    (item) => item.id === correction?.messageId,
  );

  expect(message?.speaker).toBe("learner");
  const text = message?.speaker === "learner" ? message.text : "";
  const [span] = correction!.errorSpans;
  expect(text.slice(span!.start, span!.end)).toBe("Why you want");

  const [changed] = correction!.changedSpans;
  expect(correction!.correctedText.slice(changed!.start, changed!.end)).toBe(
    "do",
  );
});
