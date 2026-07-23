/**
 * Correction Thread (교정 스레드) — Korean-first Q&A anchored to a single
 * correction, kept off the story timeline.
 */
import { generateText, Output } from "ai";

import type { CorrectionThreadRequest, CorrectionThreadResponse } from "@/lib/ai-contract";
import { correctionThreadResponseSchema } from "@/lib/ai-contract";
import { AI_MODEL } from "@/server/ai";
import { learnerFragment } from "@/server/prompt-fragments";

const THREAD_SYSTEM = [
  "너는 영어 학습 앱의 교정 튜터다. 학습자가 받은 교정 하나를 붙잡고 한국어",
  "중심으로 질문에 답한다.",
  "",
  "답변 규칙:",
  "- 한국어로 답하되 영어 예문은 영어 그대로 보여준다.",
  "- 3~6문장, 따뜻하고 단정적으로. 학습자의 수준에 맞는 설명 깊이를 고른다.",
  "- 질문이 교정과 무관해도 짧게 답하고 교정 주제로 부드럽게 돌아온다.",
  "- suggestedQuestions는 이 교정에서 이어질 자연스러운 다음 질문 2~3개를",
  "  한국어 칩 문구(10자 내외)로 만든다. 이미 나온 질문은 반복하지 않는다.",
].join("\n");

export async function answerCorrectionQuestion(
  request: CorrectionThreadRequest,
  signal?: AbortSignal,
): Promise<CorrectionThreadResponse> {
  const { profile, correction, messages, question } = request;
  const history = messages
    .map((m) => `${m.speaker === "learner" ? "학습자" : "튜터"}: ${m.text}`)
    .join("\n");

  const prompt = [
    learnerFragment(profile),
    "",
    "교정 컨텍스트:",
    `- 원문: ${correction.originalText}`,
    `- 교정문: ${correction.correctedText}`,
    `- 한 줄 이유: ${correction.reason}`,
    `- 설명: ${correction.explanation}`,
    "",
    history ? `지금까지의 Q&A:\n${history}\n` : "",
    `학습자의 질문: ${question}`,
  ].join("\n");

  const result = await generateText({
    model: AI_MODEL.correctionThread,
    system: THREAD_SYSTEM,
    prompt,
    temperature: 0.3,
    abortSignal: signal,
    output: Output.object({ schema: correctionThreadResponseSchema }),
  });
  return result.output;
}
