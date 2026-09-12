import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateText, type ModelMessage } from "ai";
import {
  CREATION_TOOLS,
  creationSystemPrompt,
  readStoryOutline,
  type StoryOutline,
} from "../src/features/episode/story-creation";
import { resolveModelId } from "../src/shared/model-id";
import { STORY_BASELINE_REVISION } from "./story-baseline";
import { CREATION_CASES, type CreationCase } from "./story-creation-cases";
import { creationViolations } from "./story-creation-checks";

// 이전 프롬프트는 수정 전 커밋에서 읽는다. 현재 도구 스키마와 같은 검사로 비교한다.
const baseline = process.argv.includes("--baseline");
const revision =
  process.argv
    .find((argument) => argument.startsWith("--baseline-ref="))
    ?.slice("--baseline-ref=".length) || STORY_BASELINE_REVISION;
const PLACEHOLDER = /\$\{(\w+)\}/g;
const BASELINE_VALUES: Record<string, string> = {
  CAST_PER_EPISODE: "3",
  CHARACTERS_PER_STORY: "4",
  CREATION_OPENING: "어떤 상황을 만들고 싶어요?",
  EPISODES_PER_STORY: "5",
  PROPOSE_STORY_TOOL: "proposeStory",
};
const PREVIOUS_PROMPT =
  /export function creationSystemPrompt\(\): string \{\s*return `([\s\S]*?)`;/;
function systemPrompt(): string {
  if (!baseline) {
    return creationSystemPrompt();
  }
  const source = execFileSync(
    "git",
    ["show", `${revision}:apps/api/src/features/episode/story-creation.ts`],
    { encoding: "utf8" }
  );
  const prompt = source.match(PREVIOUS_PROMPT)?.[1];
  if (!prompt) {
    throw new Error("이전 프롬프트를 찾지 못했습니다.");
  }
  return prompt.replace(
    PLACEHOLDER,
    (placeholder, name: string) => BASELINE_VALUES[name] ?? placeholder
  );
}
const model = resolveModelId();
const system = systemPrompt();
interface RecordEntry {
  cards: unknown[];
  name: string;
  question: string;
  round: number;
  text: string;
  violations: string[];
}

function seedMessages(outline: StoryOutline): ModelMessage[] {
  return [
    { content: "이 상황으로 카드를 만들어 줘.", role: "user" },
    {
      content: [
        {
          input: outline,
          toolCallId: "seed",
          toolName: "proposeStory",
          type: "tool-call",
        },
      ],
      role: "assistant",
    },
    {
      content: [
        {
          output: { type: "json", value: JSON.parse(JSON.stringify(outline)) },
          toolCallId: "seed",
          toolName: "proposeStory",
          type: "tool-result",
        },
      ],
      role: "tool",
    },
  ];
}

async function run(
  conversation: CreationCase,
  round: number
): Promise<RecordEntry[]> {
  const messages: ModelMessage[] = conversation.seed
    ? seedMessages(conversation.seed)
    : [];
  const records: RecordEntry[] = [];
  let previous = conversation.seed;
  for (const turn of conversation.turns) {
    messages.push({ content: turn.question, role: "user" });
    // biome-ignore lint/performance/noAwaitInLoops: 앞 답과 카드가 다음 질문의 문맥이다
    const answer = await generateText({
      abortSignal: AbortSignal.timeout(120_000),
      messages,
      model,
      system,
      tools: CREATION_TOOLS,
    });
    const cards = answer.toolCalls
      .filter((call) => call.toolName === "proposeStory")
      .map((call) => call.input);
    records.push({
      cards,
      name: conversation.name,
      question: turn.question,
      round,
      text: answer.text,
      violations: creationViolations(answer.text, cards, turn, previous),
    });
    messages.push(...answer.response.messages);
    const read = readStoryOutline({ outline: cards[0] });
    if ("outline" in read) {
      previous = read.outline;
    }
  }
  return records;
}

const records: RecordEntry[] = [];
const errors: string[] = [];
for (const round of Array.from(
  { length: baseline ? 1 : 3 },
  (_, at) => at + 1
)) {
  // biome-ignore lint/performance/noAwaitInLoops: 한 묶음을 끝내고 반복해 동시 호출 수를 제한한다
  const results = await Promise.allSettled(
    CREATION_CASES.map((conversation) => run(conversation, round))
  );
  for (const [index, result] of results.entries()) {
    if (result.status === "fulfilled") {
      records.push(...result.value);
    } else {
      errors.push(
        `${round}번째 ${CREATION_CASES[index]?.name}: ${String(result.reason)}`
      );
    }
  }
  process.stdout.write(`${round}번째 완료\n`);
}
const failed = records.filter((record) => record.violations.length);
const directory = join(import.meta.dir, "results");
await mkdir(directory, { recursive: true });
const path = join(
  directory,
  `story-creation-${baseline ? "baseline" : "candidate"}-${Date.now()}.md`
);
await writeFile(
  path,
  [
    "# 스토리 만들기 인터뷰 평가",
    "",
    `모델: ${model}`,
    `실행: ${new Date().toISOString()}`,
    `프롬프트: ${baseline ? revision : "현재 작업본"}`,
    `프롬프트 SHA-256: ${createHash("sha256").update(system).digest("hex")}`,
    `답 ${records.length}개, 실패 ${failed.length}개, 호출 실패 ${errors.length}개`,
    "",
    "기계 검사는 카드 계약을 확인한다. 대화의 이해도, 답할 지점, 말투와 가독성은 아래 전문으로 따로 검토한다. 문장 수와 서식 유무는 합격 기준이 아니다. 사용자 재미 확인도 별도다.",
    "",
    ...errors,
    ...records.map((record) =>
      [
        `## ${record.round}번째 ${record.name}`,
        `질문: ${record.question}`,
        "",
        record.text,
        "",
        "```json",
        JSON.stringify(record.cards, null, 2),
        "```",
        `검사: ${record.violations.join(", ") || "통과"}`,
        "",
      ].join("\n")
    ),
  ].join("\n")
);
process.stdout.write(
  `실패 ${failed.length}개, 호출 실패 ${errors.length}개\n${path}\n`
);
if (failed.length || errors.length) {
  process.exitCode = 1;
}
