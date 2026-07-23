/**
 * Narrator — the storytelling half of a story turn. It receives the judgment
 * from `analyzeTurn` and the plan from `resolveTurnPlan`, so it never decides
 * whether the story ends; it only plays out what was decided.
 *
 * Two output schemas rather than one: on an ending turn `ending` is required
 * by the schema, mid-story it does not exist at all. The wire payload is
 * normalized back to one shape by the caller.
 */
import { streamText, Output } from "ai";
import { z } from "zod";

import type { StoryTurnRequest } from "@/lib/ai-contract";
import { aiBeatSchema, endingSchema } from "@/lib/ai-contract";
import type { StoryTurnAnalysis } from "@/lib/ai-stream-contract";
import { AI_MODEL } from "@/server/ai";
import {
  difficultyFragment,
  learnerFragment,
  STORY_LANGUAGE_RULES,
} from "@/server/prompt-fragments";
import { renderTranscript } from "@/server/transcript";
import type { TurnPlan } from "@/server/turn-rules";
import type { EndingKind } from "@/types/story";

const continuingOutputSchema = z.object({
  beats: z.array(aiBeatSchema).min(1),
});

const endingOutputSchema = z.object({
  beats: z.array(aiBeatSchema).min(1),
  ending: endingSchema,
});

const NARRATOR_SYSTEM = [
  "너는 영어 학습 롤플레이의 내레이터이자 상대 캐릭터다. 내레이션과 대사를",
  "섞어 이야기를 이어 간다.",
  "",
  STORY_LANGUAGE_RULES,
  "",
  "연출 규칙:",
  "- 한 턴은 beat 1~3개. 내레이션은 장면·감정·사건을 보여주고, 대사는 AI",
  "  역할의 목소리다. 대사 beat의 text는 따옴표로 감싼다.",
  "- 학습자에게 말을 걸어 다음 발화를 유도한다. 질문·요구·거절로 공을 넘긴다.",
  "- **저항 원칙**: 상대는 목표를 쉽게 내주지 않는다. 학습자가 제대로 설득하거나",
  "  단서를 짚기 전에는 핵심 정보를 흘리지 않고, 경계·조건·되묻기로 마찰을",
  "  만든다. 다만 벽처럼 굳지 말고 매 턴 이야기를 한 걸음 움직인다.",
  "- 주문받기·면접 같은 절차형 문답으로 수렴시키지 않는다.",
  "- 학습자가 별표 행동으로 상대의 말이나 세계의 사실을 대신 정하려 하면",
  "  극 중에서 자연스럽게 어긋나게 만든다 (그런 일은 일어나지 않았다).",
  "- 학습자의 영어 오류는 지적하지 않는다 — 교정은 다른 경로로 전달된다.",
].join("\n");

const ENDING_DIRECTION: Record<EndingKind, string> = {
  success:
    "학습자가 목표를 달성했다. 목표가 이뤄지는 순간을 극적으로 보여주고 이야기를 완결한다.",
  failure:
    "목표가 회복 불능으로 무산됐다. 기회가 닫히는 장면을 보여주되 이야기로서 완결한다.",
  forced:
    "턴 상한에 닿아 이야기를 여기서 마무리한다. 상황 자체가 끝나는 외부 사건(도착·종료·이별 등)으로 자연스럽게 닫고, 목표는 이루지 못한 채 여운을 남긴다.",
};

function narratorPrompt(
  request: StoryTurnRequest,
  analysis: StoryTurnAnalysis,
  plan: TurnPlan,
): string {
  const { profile, scenario, messages, learnerInput, turnCount } = request;
  const unmet = analysis.achievement.conditions.filter((c) => !c.met);

  return [
    learnerFragment(profile),
    "",
    difficultyFragment(profile.englishLevel),
    "",
    `상황: ${scenario.scene}`,
    `목표(학습자의 것): ${scenario.goal}`,
    `내 역할(학습자): ${scenario.myRole} / 네가 연기할 역할: ${scenario.aiRole}`,
    "",
    "대화록:",
    renderTranscript(messages),
    "",
    `학습자의 이번 입력: ${learnerInput}`,
    "",
    `진행: ${turnCount + 1}턴째.`,
    unmet.length > 0
      ? `아직 충족되지 않은 조건: ${unmet.map((c) => c.id).join(", ")} — 이 정보는 아직 쉽게 내주지 않는다.`
      : "달성 조건이 모두 충족됐다.",
    "",
    plan.shouldEnd
      ? `이번 턴으로 이야기를 끝낸다. ${ENDING_DIRECTION[plan.endingKind]} beats는 이야기 안에서의 마지막 응답이고, ending.narration은 그 뒤에 흐르는 마무리 내레이션이다 (beats를 반복하지 않는다).`
      : "이야기를 이어 간다. 결말을 내지 않는다.",
  ].join("\n");
}

/** Streams the turn's beats (and its ending, when the plan says the story closes). */
export function streamNarration(
  request: StoryTurnRequest,
  analysis: StoryTurnAnalysis,
  plan: TurnPlan,
  signal?: AbortSignal,
) {
  return streamText({
    model: AI_MODEL.narrator,
    system: NARRATOR_SYSTEM,
    prompt: narratorPrompt(request, analysis, plan),
    temperature: 0.9,
    abortSignal: signal,
    output: Output.object({
      schema: plan.shouldEnd ? endingOutputSchema : continuingOutputSchema,
    }),
  });
}
