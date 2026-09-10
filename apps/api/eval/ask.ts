import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

import { generateText, type ModelMessage } from "ai";

import { askSystemPrompt } from "../src/features/episode/ask";
import { resolveModelId } from "../src/shared/model-id";
import { answerViolations } from "./answer-checks";
import { ASK_CONVERSATIONS, type AskedConversation } from "./ask-questions";

/**
 * 물어보기 프롬프트를 실제 모델로 재는 자리.
 *
 * 같은 물음에도 답이 매번 달라서 한 번 통과한 것으로는 규칙이 섰는지 알 수
 * 없다. 그래서 같은 묶음을 여러 번 돌리고 전부 통과해야 통과로 본다.
 *
 * 재는 것은 프롬프트이지 경로가 아니다. HTTP 경로가 하는 인증과 검증은 가짜
 * 모델을 쓰는 `bun test`가 이미 지킨다. 여기서는 경로가 모델에게 보내는 것과
 * 같은 지시와 같은 문맥을 그대로 만들어 보낸다.
 */
const ROUNDS = 3;
const RESULTS_DIR = join(import.meta.dir, "results");
const MODEL = resolveModelId();

interface AnswerRecord {
  answer: string;
  kind: string;
  question: string;
  round: number;
  violations: string[];
}

/** 한 자리의 물음을 차례로 던지고 답을 모은다. 앞 답이 다음 물음의 문맥이다. */
async function runConversation(
  conversation: AskedConversation,
  round: number
): Promise<AnswerRecord[]> {
  const messages: ModelMessage[] = [...conversation.snapshot];
  const records: AnswerRecord[] = [];

  for (const turn of conversation.turns) {
    messages.push({ content: turn.question, role: "user" });

    // biome-ignore lint/performance/noAwaitInLoops: 앞 답이 다음 물음의 문맥이라 차례로 받아야 한다
    const { text } = await generateText({
      messages,
      model: MODEL,
      system: askSystemPrompt(conversation.correction),
    });

    messages.push({ content: text, role: "assistant" });
    records.push({
      answer: text.trim(),
      kind: turn.kind,
      question: turn.question,
      round,
      violations: answerViolations(text.trim(), turn.scope),
    });
  }

  return records;
}

/** 사람이 읽을 기록. 기계 검사는 모양만 가르고 말맛은 여기서 읽는다. */
function transcriptOf(records: AnswerRecord[], unanswered: string[]): string {
  const failed = records.filter((record) => record.violations.length > 0);
  const head = [
    "# AI에게 물어보기 평가 기록",
    "",
    `모델: \`${MODEL}\``,
    `돌린 때: ${new Date().toISOString()}`,
    `답 ${records.length}개 중 ${records.length - failed.length}개 통과`,
    ...(unanswered.length > 0
      ? ["", "받지 못한 답:", ...unanswered.map((line) => `- ${line}`)]
      : []),
    "",
  ];
  const body = records.map((record) => {
    const verdict =
      record.violations.length > 0
        ? `어긋난 자리: ${record.violations.join(", ")}`
        : "통과";

    return [
      `## ${record.round}번째, ${record.kind}`,
      "",
      `물음: ${record.question}`,
      "",
      record.answer
        .split("\n")
        .map((line) => (line.trim() === "" ? ">" : `> ${line}`))
        .join("\n"),
      "",
      verdict,
      "",
    ].join("\n");
  });

  return [...head, ...body].join("\n");
}

const collected: AnswerRecord[] = [];
const failures: string[] = [];

for (const round of Array.from({ length: ROUNDS }, (_, at) => at + 1)) {
  // biome-ignore lint/performance/noAwaitInLoops: 한 번에 모두 보내면 같은 순간에 마흔 번 넘게 모델을 부른다
  const answered = await Promise.allSettled(
    ASK_CONVERSATIONS.map((conversation) =>
      runConversation(conversation, round)
    )
  );

  for (const [at, settled] of answered.entries()) {
    if (settled.status === "fulfilled") {
      collected.push(...settled.value);
      continue;
    }

    // 한 자리가 넘어져도 나머지 답과 기록은 남긴다. 마흔다섯 번을 다시 부르는
    // 것보다, 무엇이 오지 않았는지 보이는 편이 낫다.
    failures.push(
      `${round}번째 ${ASK_CONVERSATIONS[at]?.turns[0]?.kind ?? "알 수 없는 자리"}: ${String(settled.reason)}`
    );
  }

  process.stdout.write(`${round}번째를 마쳤습니다.\n`);
}

await mkdir(RESULTS_DIR, { recursive: true });

const path = join(RESULTS_DIR, `ask-${Date.now()}.md`);

await writeFile(path, transcriptOf(collected, failures));

const failed = collected.filter((record) => record.violations.length > 0);

for (const record of failed) {
  process.stdout.write(
    `어긋남 ${record.round}번째 ${record.kind}: ${record.violations.join(", ")}\n`
  );
}
for (const failure of failures) {
  process.stdout.write(`답을 받지 못함 ${failure}\n`);
}

process.stdout.write(
  `답 ${collected.length}개 중 ${collected.length - failed.length}개가 통과했습니다.\n기록: ${path}\n`
);

// 못 받은 답도 통과가 아니다. 다 돌지 못한 평가를 통과로 읽으면 안 된다.
if (failed.length > 0 || failures.length > 0) {
  process.exit(1);
}
