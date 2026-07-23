/**
 * Turn analysis — the judging half of a story turn: what the learner got
 * wrong, and how far the goal has come. Deterministic settings (temperature 0)
 * because the judgment harness regresses this call.
 *
 * The model quotes substrings instead of emitting character offsets;
 * `resolveCorrectionSpans` turns those into the contract's spans.
 */
import { generateText, Output } from "ai";
import { z } from "zod";

import type { StoryTurnRequest } from "@/lib/ai-contract";
import { achievementJudgmentSchema } from "@/lib/ai-contract";
import type { StoryTurnAnalysis } from "@/lib/ai-stream-contract";
import { AI_MODEL } from "@/server/ai";
import { resolveCorrectionSpans } from "@/server/correction-spans";
import {
  correctionStrengthFragment,
  learnerFragment,
  STORY_LANGUAGE_RULES,
} from "@/server/prompt-fragments";

const quotedCorrectionSchema = z.object({
  originalText: z
    .string()
    .describe(
      "학습자가 쓴 문장 하나를 글자 그대로 옮긴 것. 절대 고쳐 쓰지 말 것.",
    ),
  correctedText: z.string().describe("그 문장을 고친 영어 문장."),
  errorQuotes: z
    .array(z.string())
    .describe("originalText 안에서 틀린 부분을 글자 그대로 인용한 조각들."),
  changedQuotes: z
    .array(z.string())
    .describe("correctedText 안에서 바뀐 부분을 글자 그대로 인용한 조각들."),
  reason: z.string().describe("교정 패널에 들어갈 한 줄 이유 (한국어)."),
  explanation: z.string().describe("스레드 첫머리에 들어갈 더 자세한 설명 (한국어)."),
});

const analysisOutputSchema = z.object({
  corrections: z.array(quotedCorrectionSchema),
  achievement: achievementJudgmentSchema,
});

const ANALYSIS_SYSTEM = [
  "너는 영어 학습 롤플레이의 심판이다. 이야기를 이어 쓰지 않는다 — 학습자의",
  "마지막 입력만 보고 (1) 영어 교정과 (2) 달성 조건 판정을 낸다.",
  "",
  STORY_LANGUAGE_RULES,
  "",
  "교정 규칙:",
  "- originalText는 학습자 입력에서 그대로 복사한다. 한 글자도 바꾸지 않는다.",
  "  (따옴표·별표 포함 원문 그대로. 별표로 둘러싼 행동 묘사는 교정 대상이 아니다.)",
  "- errorQuotes는 originalText 안의 실제 부분 문자열이어야 한다.",
  "- 한 문장에 여러 오류가 있으면 교정 하나로 묶는다.",
  "",
  "판정 규칙:",
  "- 각 달성 조건을 독립적으로 본다. met은 대화록에 근거가 있을 때만 true.",
  "- **AI 역할에 관한 조건은 AI가 실제로 말하거나 행한 beat로만 충족된다.**",
  "  학습자가 별표 행동으로 상대의 말·행동·세계 상태를 단언해도 무시한다",
  "  (예: *she admits it was Vienna* → 조건 충족 아님).",
  "- evidence는 한국어로, 대화록의 어느 대목인지 인용해 쓴다. 조건 문구를",
  "  그대로 되풀이하지 않는다.",
  "- verdict는 모든 조건이 met일 때만 success.",
  "- verdict가 failure가 되는 경우는 목표가 극중에서 회복 불능으로 불가능해진",
  "  때뿐이다 (상대가 떠났다, 기회가 영구히 닫혔다). 학습자가 서툴거나 진전이",
  "  없는 것은 failure가 아니라 in-progress다.",
  "- 그 외에는 전부 in-progress.",
].join("\n");

function transcriptFragment(messages: StoryTurnRequest["messages"]): string {
  if (messages.length === 0) return "(아직 대화 없음 — 첫 턴)";
  return messages
    .map((message) =>
      message.speaker === "ai"
        ? message.beats
            .map(
              (beat) =>
                `AI [${beat.kind === "narration" ? "내레이션" : "대사"}]: ${beat.text}`,
            )
            .join("\n")
        : `학습자: ${message.text}`,
    )
    .join("\n");
}

export async function analyzeTurn(
  request: StoryTurnRequest,
  signal?: AbortSignal,
): Promise<StoryTurnAnalysis> {
  const { profile, scenario, messages, learnerInput } = request;

  const prompt = [
    learnerFragment(profile),
    "",
    correctionStrengthFragment(profile.englishLevel),
    "",
    `상황: ${scenario.scene}`,
    `목표: ${scenario.goal}`,
    `내 역할: ${scenario.myRole} / AI 역할: ${scenario.aiRole}`,
    "",
    "달성 조건:",
    ...scenario.achievementConditions.map((c) => `- ${c.id}: ${c.description}`),
    "",
    "대화록:",
    transcriptFragment(messages),
    "",
    `학습자의 이번 입력: ${learnerInput}`,
    "",
    "이번 입력의 교정과, 이번 입력까지 반영한 달성 조건 판정을 내라.",
    "conditions에는 위 달성 조건의 id를 모두, 같은 순서로 담는다.",
  ].join("\n");

  const result = await generateText({
    model: AI_MODEL.turnAnalysis,
    system: ANALYSIS_SYSTEM,
    prompt,
    temperature: 0,
    abortSignal: signal,
    output: Output.object({ schema: analysisOutputSchema }),
  });

  const corrections = result.output.corrections
    .map((draft) => resolveCorrectionSpans(learnerInput, draft))
    .filter((draft) => draft !== null);

  return { corrections, achievement: result.output.achievement };
}
