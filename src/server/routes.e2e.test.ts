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
} from "@/lib/ai-contract";
import { CORRECTIONS, LEARNER_PROFILE, SCENARIO_SUGGESTIONS } from "@/lib/fixtures";
import { GENRES } from "@/types/learner";

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
      expect(data.scenarios).toHaveLength(3);
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
