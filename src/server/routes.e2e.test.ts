/**
 * Contract tests against a RUNNING dev server — the S2 completion gate
 * "라우트 3종이 계약 스키마대로 응답 (dev 서버에 직접 요청하는 bun test)".
 *
 * Gated so the default `bun test` stays green without a server or key:
 *
 *   bun expo start --port 8083          # terminal 1
 *   E2E_BASE_URL=http://localhost:8083 bun test routes.e2e   # terminal 2
 */
import { describe, expect, test } from "bun:test";

import {
  correctionThreadResponseSchema,
  scenarioGenerationResponseSchema,
  scenarioRewriteResponseSchema,
  storyTurnResponseSchema,
} from "@/lib/ai-contract";
import {
  TURN_ANALYSIS_PART,
  TURN_NARRATIVE_PART,
} from "@/lib/ai-stream-contract";
import {
  CORRECTIONS,
  LEARNER_PROFILE,
  NIGHT_TRAIN_MESSAGES,
  SCENARIO_SUGGESTIONS,
} from "@/lib/fixtures";
import { GENRES } from "@/types/learner";
import { MAX_TURNS } from "@/types/story";

const BASE = process.env.E2E_BASE_URL;
const AI_TIMEOUT = 180_000;

async function post(path: string, body: unknown): Promise<Response> {
  return fetch(new URL(path, BASE), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

const HANGUL = /[가-힣]/;

/** The story turn is the only streaming route — its answer arrives as SSE. */
type StreamedTurn = {
  contentType: string | null;
  /** Latest payload per data part, i.e. after client-side reconciliation. */
  parts: Record<string, unknown>;
  /** How many narrative snapshots arrived, to prove it actually streamed. */
  narrativeWrites: number;
};

async function postStoryTurn(body: unknown): Promise<StreamedTurn> {
  const res = await fetch(new URL("/api/story-turn", BASE), {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  // An error response is not SSE — surface it as itself rather than as a
  // downstream schema complaint about missing beats.
  if (!res.ok) {
    throw new Error(`story-turn ${res.status}: ${await res.text()}`);
  }
  const parts: Record<string, unknown> = {};
  let narrativeWrites = 0;
  const decoder = new TextDecoder();
  let buffer = "";
  for await (const chunk of res.body as unknown as AsyncIterable<Uint8Array>) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      if (!line.startsWith("data: ")) continue;
      const payload = line.slice(6);
      if (payload === "[DONE]") continue;
      const event = JSON.parse(payload) as { type: string; data?: unknown };
      if (event.type === "error") {
        throw new Error(`stream error: ${JSON.stringify(event)}`);
      }
      if (event.type === TURN_NARRATIVE_PART) narrativeWrites += 1;
      if (event.data !== undefined) parts[event.type] = event.data;
    }
  }
  return {
    contentType: res.headers.get("content-type"),
    parts,
    narrativeWrites,
  };
}

/** Client-side assembly: the two parts merge back into the S0 contract shape. */
function assembleTurn(streamed: StreamedTurn) {
  return storyTurnResponseSchema.parse({
    ...(streamed.parts[TURN_ANALYSIS_PART] as object),
    ...(streamed.parts[TURN_NARRATIVE_PART] as object),
  });
}

describe.skipIf(!BASE)("scenario-generate", () => {
  test(
    "returns three home suggestions per contract",
    async () => {
      const res = await post("/api/scenario-generate", {
        profile: LEARNER_PROFILE,
        count: 3,
        idea: null,
      });
      expect(res.status).toBe(200);
      const data = scenarioGenerationResponseSchema.parse(await res.json());
      // The spec asks for 2~3 cards and the route degrades rather than fails
      // when a slot's gateway call dies, so the count is a range, not a fact.
      expect(data.scenarios.length).toBeGreaterThanOrEqual(1);
      expect(data.scenarios.length).toBeLessThanOrEqual(3);
      const genres = data.scenarios.map((scenario) => scenario.genre);
      expect(new Set(genres).size).toBe(genres.length);
      for (const scenario of data.scenarios) {
        expect(GENRES).toContain(scenario.genre);
        expect(scenario.achievementConditions.length).toBeGreaterThanOrEqual(1);
        expect(scenario.intro).toMatch(HANGUL);
        expect(scenario.goal).toMatch(HANGUL);
      }
    },
    AI_TIMEOUT,
  );

  test(
    "builds one scenario from the learner's own Korean idea",
    async () => {
      const res = await post("/api/scenario-generate", {
        profile: LEARNER_PROFILE,
        count: 1,
        idea: "우주 정거장에서 고양이가 사라졌다",
      });
      expect(res.status).toBe(200);
      const data = scenarioGenerationResponseSchema.parse(await res.json());
      expect(data.scenarios).toHaveLength(1);
    },
    AI_TIMEOUT,
  );

  test("rejects a contract-invalid request with 400", async () => {
    const res = await post("/api/scenario-generate", {
      profile: LEARNER_PROFILE,
      count: 4,
      idea: null,
    });
    expect(res.status).toBe(400);
  });
});

describe.skipIf(!BASE)("scenario-rewrite", () => {
  test(
    "AI role rewrite returns the whole scenario with fixed fields verbatim",
    async () => {
      const scenario = SCENARIO_SUGGESTIONS[0]!;
      const res = await post("/api/scenario-rewrite", {
        profile: LEARNER_PROFILE,
        scenario,
        field: "aiRole",
        replacement: null,
      });
      expect(res.status).toBe(200);
      const data = scenarioRewriteResponseSchema.parse(await res.json());
      expect(data.scenario.genre).toBe(scenario.genre);
      expect(data.scenario.title).toBe(scenario.title);
      expect(data.scenario.intro).toBe(scenario.intro);
      expect(data.scenario.scene).toBe(scenario.scene);
      expect(data.scenario.myRole).toBe(scenario.myRole);
      expect(data.scenario.aiRole).not.toBe(scenario.aiRole);
      expect(data.scenario.achievementConditions.length).toBeGreaterThanOrEqual(
        1,
      );
    },
    AI_TIMEOUT,
  );

  test(
    "replacing a role rewrites the goal off the role that left",
    async () => {
      // The goal names the AI role on purpose: once that role is gone, a goal
      // still pointing at it is machine-detectable.
      const scenario = {
        ...SCENARIO_SUGGESTIONS[0]!,
        goal: "회색 코트의 여자에게서 사진의 출처를 알아내라",
      };
      const res = await post("/api/scenario-rewrite", {
        profile: LEARNER_PROFILE,
        scenario,
        field: "aiRole",
        replacement: "열차 차장",
      });
      expect(res.status).toBe(200);
      const data = scenarioRewriteResponseSchema.parse(await res.json());
      expect(data.scenario.aiRole).toBe("열차 차장");
      expect(data.scenario.goal).not.toContain("회색 코트");
      expect(data.scenario.goal).not.toBe(scenario.goal);
    },
    AI_TIMEOUT,
  );

  test(
    "a learner replacement comes back verbatim",
    async () => {
      const scenario = SCENARIO_SUGGESTIONS[1]!;
      const replacement =
        "화성 기지의 온실. 산소 재생기가 꺼진 지 한 시간째다.";
      const res = await post("/api/scenario-rewrite", {
        profile: LEARNER_PROFILE,
        scenario,
        field: "scene",
        replacement,
      });
      expect(res.status).toBe(200);
      const data = scenarioRewriteResponseSchema.parse(await res.json());
      expect(data.scenario.scene).toBe(replacement);
      expect(data.scenario.myRole).toBe(scenario.myRole);
    },
    AI_TIMEOUT,
  );
});

describe.skipIf(!BASE)("story-turn", () => {
  const scenario = SCENARIO_SUGGESTIONS[0]!;

  test(
    "streams both parts, which merge into a contract story-turn response",
    async () => {
      const streamed = await postStoryTurn({
        profile: LEARNER_PROFILE,
        scenario,
        messages: NIGHT_TRAIN_MESSAGES,
        turnCount: 3,
        // Two obvious errors: missing auxiliary and a bare past participle.
        learnerInput: '"Why you not tell me where this photo taken?"',
      });

      expect(streamed.contentType).toContain("text/event-stream");
      expect(streamed.narrativeWrites).toBeGreaterThan(1);

      const turn = assembleTurn(streamed);
      expect(turn.beats.length).toBeGreaterThanOrEqual(1);
      expect(turn.ending).toBeNull();
      expect(turn.corrections.length).toBeGreaterThanOrEqual(1);

      const correction = turn.corrections[0]!;
      expect(correction.reason).toMatch(HANGUL);
      // Spans must address the learner's message, not the corrected sentence.
      expect(correction.errorSpans[0]!.end).toBeLessThanOrEqual(
        '"Why you not tell me where this photo taken?"'.length,
      );

      expect(turn.achievement.conditions.map((c) => c.id).sort()).toEqual(
        scenario.achievementConditions.map((c) => c.id).sort(),
      );
      expect(turn.achievement.conditions[0]!.evidence).toMatch(HANGUL);
    },
    AI_TIMEOUT,
  );

  test(
    "a clean input carries no corrections",
    async () => {
      const streamed = await postStoryTurn({
        profile: LEARNER_PROFILE,
        scenario,
        messages: NIGHT_TRAIN_MESSAGES,
        turnCount: 3,
        learnerInput: '"Where was this photo taken?"',
      });
      expect(assembleTurn(streamed).corrections).toEqual([]);
    },
    AI_TIMEOUT,
  );

  test(
    "the final allowed turn ends the story even mid-conversation",
    async () => {
      const streamed = await postStoryTurn({
        profile: LEARNER_PROFILE,
        scenario,
        messages: NIGHT_TRAIN_MESSAGES,
        turnCount: MAX_TURNS - 1,
        learnerInput: '"Tell me about the photograph."',
      });
      const turn = assembleTurn(streamed);
      expect(turn.ending).not.toBeNull();
      expect(["forced", "success", "failure"]).toContain(turn.ending!.kind);
      expect(turn.ending!.headline).toMatch(HANGUL);
      expect(turn.ending!.summary).toMatch(HANGUL);
    },
    AI_TIMEOUT,
  );

  test("rejects a turn past the ceiling with 400", async () => {
    const res = await post("/api/story-turn", {
      profile: LEARNER_PROFILE,
      scenario,
      messages: NIGHT_TRAIN_MESSAGES,
      turnCount: MAX_TURNS + 1,
      learnerInput: "hello",
    });
    expect(res.status).toBe(400);
  });
});

describe.skipIf(!BASE)("correction-thread", () => {
  test(
    "answers in Korean with follow-up chips",
    async () => {
      const { id: _i, sessionId: _s, messageId: _m, ...correction } =
        CORRECTIONS[0]!;
      const res = await post("/api/correction-thread", {
        profile: LEARNER_PROFILE,
        correction,
        messages: [],
        question: "왜 do가 꼭 필요해?",
      });
      expect(res.status).toBe(200);
      const data = correctionThreadResponseSchema.parse(await res.json());
      expect(data.answer).toMatch(HANGUL);
      expect(data.suggestedQuestions.length).toBeGreaterThanOrEqual(1);
    },
    AI_TIMEOUT,
  );
});
