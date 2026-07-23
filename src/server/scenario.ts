/**
 * Scenario generation and rewrite — the 상황 생성 route family's engine.
 *
 * The consistency rule (역할·장면이 바뀌면 목표는 내 역할 시점으로 재작성,
 * 목표가 바뀌면 달성 조건 재생성) is asked of the model but enforced in code:
 * `applyRewriteGuard` copies every field the model must not drift back from
 * the request, and applies the learner's verbatim replacement.
 */
import { generateText, Output } from "ai";
import { z } from "zod";

import type { ScenarioGenerationRequest, ScenarioGenerationResponse, ScenarioRewriteRequest, ScenarioRewriteResponse } from "@/lib/ai-contract";
import { scenarioSchema } from "@/lib/ai-contract";
import { AI_MODEL } from "@/server/ai";
import { learnerFragment, SCENARIO_LANGUAGE_RULES } from "@/server/prompt-fragments";
import type { Genre, LearnerProfile } from "@/types/learner";
import { GENRE_LABEL, GENRES } from "@/types/learner";

type Scenario = z.infer<typeof scenarioSchema>;

const SCENARIO_SYSTEM = [
  "너는 영어 학습 롤플레이 앱의 상황(Scenario) 작가다. 학습자가 영어로 대사와",
  "행동을 입력하며 헤쳐 나갈 이야기 상황을 만든다.",
  "",
  SCENARIO_LANGUAGE_RULES,
  "",
  "상황 설계 규칙:",
  "- goal은 서사적 과제다(단서 알아내기, 마음 돌리기, 설득하기…) — 주문·면접",
  "  같은 과제형 절차로 수렴시키지 않는다. 항상 내 역할(myRole) 시점으로 쓴다.",
  "- goal은 시작부터 공개되는 종료 트리거다 — 한 문장의 명령형으로 또렷하게.",
  "- scene은 구체적 장소·시각·긴장 요소를 담은 3~4문장. intro는 카드용 1~2문장",
  "  요약으로 호기심을 남긴다.",
  "- myRole·aiRole은 짧은 명사구. aiRole은 학습자가 대화로 상대할 단일 인물이다.",
  "- achievementConditions는 정확히 2개. 각각 goal의 기계 판정 가능한 절로,",
  "  '상대(aiRole)가 ~한다'처럼 대화록에서 참/거짓을 확인할 수 있는 상태여야",
  "  한다. id는 의미 있는 영어 kebab-case 한 단어~두 단어.",
  "- 조건은 학습자의 발화로 끌어내야만 달성되는 것이어야 한다 — 시작 상태에서",
  "  이미 참인 조건은 금지.",
].join("\n");

/**
 * Genres for the slots of one request. The learner's preferences come first
 * (they are weights, not filters), the rest of the onboarding set fills in, so
 * a three-card home never suggests the same genre twice.
 */
export function genreSlots(profile: LearnerProfile, count: number): Genre[] {
  const preferred = [...profile.genrePreferences];
  const rest = GENRES.filter((genre) => !preferred.includes(genre));
  const pool = [...preferred, ...rest];
  return Array.from({ length: count }, (_, i) => pool[i % pool.length]!);
}

/**
 * One call per card rather than one call for all of them: a three-scenario
 * single call runs long enough to hit gateway timeouts, and the slots have no
 * reason to share a generation.
 */
export async function generateScenarios(
  request: ScenarioGenerationRequest,
  signal?: AbortSignal,
): Promise<ScenarioGenerationResponse> {
  const { profile, count, idea } = request;
  const slots = genreSlots(profile, count);

  const scenarios = await Promise.all(
    slots.map(async (genre) => {
      const prompt = [
        learnerFragment(profile),
        "",
        `이번 상황의 장르는 "${GENRE_LABEL[genre]}"(${genre})다. genre 필드에 그대로 넣어라.`,
        idea === null
          ? `학습자 프로필에 어울리는 상황 1개를 만들어라.`
          : `학습자가 직접 낸 아이디어를 이 장르로 구체화하라. 아이디어(한국어일 수 있음): ${JSON.stringify(idea)}`,
      ].join("\n");

      const result = await generateText({
        model: AI_MODEL.scenario,
        system: SCENARIO_SYSTEM,
        prompt,
        temperature: 0.9,
        abortSignal: signal,
        output: Output.object({ schema: scenarioSchema }),
      });
      return { ...result.output, genre };
    }),
  );
  return { scenarios };
}

const REWRITE_FIXED_FIELDS = ["scene", "myRole", "aiRole"] as const;

/**
 * Everything the model must not drift comes back from the request: genre,
 * title and intro always; scene/roles unless they are the edited field; the
 * learner's replacement text verbatim. The model's contribution survives only
 * where the rewrite asked for it (the edited field, the goal, the conditions).
 */
export function applyRewriteGuard(
  request: ScenarioRewriteRequest,
  generated: Scenario,
): Scenario {
  const { scenario, field, replacement } = request;
  const next = { ...generated };
  next.genre = scenario.genre;
  next.title = scenario.title;
  next.intro = scenario.intro;
  for (const fixed of REWRITE_FIXED_FIELDS) {
    if (fixed !== field) next[fixed] = scenario[fixed];
  }
  if (replacement !== null) {
    next[field] = replacement;
  }
  return next;
}

export async function rewriteScenario(
  request: ScenarioRewriteRequest,
  signal?: AbortSignal,
): Promise<ScenarioRewriteResponse> {
  const { profile, scenario, field, replacement } = request;
  const instruction =
    replacement === null
      ? `학습자가 "${field}" 필드의 AI 다시 쓰기를 요청했다. 그 필드를 새로운 방향으로 다시 써라.`
      : `학습자가 "${field}" 필드를 직접 이 값으로 바꿨다(그대로 반영하라): ${JSON.stringify(replacement)}`;

  const prompt = [
    learnerFragment(profile),
    "",
    `현재 상황: ${JSON.stringify(scenario)}`,
    "",
    instruction,
    "",
    "정합성 규칙에 따라 전체 상황 JSON을 반환하라:",
    "- scene·myRole·aiRole이 바뀌면 goal을 항상 내 역할(myRole) 시점으로 다시 쓴다.",
    "- goal이 바뀌면 achievementConditions를 새 goal의 기계 판정 절 2개로 다시 만든다.",
    "- 편집되지 않은 필드와 genre·title·intro는 그대로 둔다.",
  ].join("\n");

  const result = await generateText({
    model: AI_MODEL.scenario,
    system: SCENARIO_SYSTEM,
    prompt,
    temperature: 0.9,
    abortSignal: signal,
    output: Output.object({ schema: scenarioSchema }),
  });
  return { scenario: applyRewriteGuard(request, result.output) };
}
