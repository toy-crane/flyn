import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { generateObject, generateText } from "ai";
import {
  episodeSystemPrompt,
  type StoryMemory,
} from "../src/features/episode/episode";
import type { EpisodeScript } from "../src/features/episode/story";
import {
  type StoryOutline,
  scriptProblem,
  scriptPrompt,
  scriptSystemPrompt,
  WRITTEN_STORY_SCHEMA,
} from "../src/features/episode/story-creation";
import { resolveModelId } from "../src/shared/model-id";
import {
  loadBaselineEpisodePrompt,
  STORY_BASELINE_REVISION,
} from "./story-baseline";

const baseline = process.argv.includes("--baseline");
const BASE_REVISION = STORY_BASELINE_REVISION;
const OLD_SYSTEM =
  /export function scriptSystemPrompt\(\): string \{\s*return `([\s\S]*?)`;/u;
const OLD_EXAMPLE = /const FORMAT_EXAMPLE = `([\s\S]*?)`;/u;
const EXAMPLE_PLACEHOLDER = /\$\{FORMAT_EXAMPLE\}/u;
const DETAILS_LINE = /\n합의한 상세 상황:[^\n]*/gu;
const playPrompt = baseline
  ? await loadBaselineEpisodePrompt()
  : episodeSystemPrompt;
function baselineScriptSystem(): string {
  const source = execFileSync(
    "git",
    [
      "show",
      `${BASE_REVISION}:apps/api/src/features/episode/story-creation.ts`,
    ],
    { encoding: "utf8" }
  );
  const template = source.match(OLD_SYSTEM)?.[1];
  const example = source.match(OLD_EXAMPLE)?.[1];
  if (!(template && example)) {
    throw new Error("이전 대본 프롬프트를 찾지 못했습니다.");
  }
  return template.replace(EXAMPLE_PLACEHOLDER, example);
}

const outline: StoryOutline = {
  characters: [
    {
      name: "Noah",
      position: 1,
      role: "30대 매장 직원. 확인된 자료를 보고 가능한 절차를 설명한다.",
    },
  ],
  cover:
    "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
  episodes: [
    {
      cast: ["Noah"],
      details:
        "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 Noah에게 새 제품으로 교환을 요청한다. 직원은 화내거나 고함치지 않는다. 교환 결과는 아직 모른다.",
      number: 1,
      preview: "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
      title: "물이 새는 기계",
    },
    {
      cast: ["Noah"],
      details:
        "다른 날 매장 체험 코너에서 Noah에게 우유 거품을 내는 법을 물어본다. 매장 체험 기계를 이용한다. 이전 교환의 성공이나 실패, 친밀함을 가정하지 않는다.",
      number: 2,
      preview: "다른 날 매장 체험 코너에서 우유 거품 내는 법을 물어보고 싶어요",
      title: "사용법 묻기",
    },
  ],
  hook: "산 지 하루 된 커피 머신에서 물이 새요",
  title: "동네 커피 매장",
};
const memories: StoryMemory[] = [
  {
    choice: "자료를 차분하게 보여 주며 교환을 요청했다.",
    episode: 1,
    kind: "성공",
    outcome:
      "영수증과 영상을 보여 준 뒤 동일 모델로 교환했다. Noah가 모델과 누수 내용을 확인했다.",
    question: null,
    relationship: "Noah와 차분하게 얘기했고 다음에 사용법을 물어보겠다고 했다.",
    title: "물이 새는 기계",
  },
  {
    choice: "자료를 보여 주기 전에 대화를 끝냈다.",
    episode: 1,
    kind: "실패",
    outcome:
      "영수증과 영상을 보여 주지 않고 매장을 나갔다. Noah는 모델과 누수 내용을 확인하지 못했다.",
    question: null,
    relationship: "Noah와 대화가 끊겼으며 어떤 기계를 쓰는지 공유하지 않았다.",
    title: "물이 새는 기계",
  },
];
const model = resolveModelId();
const system = baseline ? baselineScriptSystem() : scriptSystemPrompt();
// 이전 요청은 같은 카드에서 details만 보내지 않았다.
const prompt = baseline
  ? scriptPrompt(outline).replace(DETAILS_LINE, "")
  : scriptPrompt(outline);
const question =
  "Could you show me how to make milk foam? I would like to try the machine here.";

async function run(round: number) {
  const { object } = await generateObject({
    abortSignal: AbortSignal.timeout(120_000),
    model,
    prompt,
    schema: WRITTEN_STORY_SCHEMA,
    system,
  });
  const violations: string[] = [];
  const problem = scriptProblem(object, outline);
  if (problem) {
    violations.push(problem);
  }
  if (object.episodes.length !== 2) {
    violations.push("두 화가 아님");
  }
  const first = object.episodes.find((episode) => episode.number === 1);
  const next = object.episodes.find((episode) => episode.number === 2);
  if (!(first && next)) {
    throw new Error("대본에 요청한 화가 없습니다.");
  }
  for (const word of ["영수증", "영상"]) {
    if (!first.stage.includes(word)) {
      violations.push(`자료 누락: ${word}`);
    }
  }
  const script: EpisodeScript = {
    ...next,
    cast: object.characters.filter((person) =>
      next.castNames.includes(person.name)
    ),
    endings: {
      compromise: next.endingCompromise,
      failure: next.endingFailure,
      success: next.endingSuccess,
    },
    id: "eval-episode-2",
    storyId: "eval-story",
  };
  const reactions = await Promise.all(
    memories.map(async (memory) => {
      const playSystem = playPrompt(script, [memory]);
      const answer = await generateText({
        abortSignal: AbortSignal.timeout(120_000),
        messages: [
          { content: next.opening, role: "assistant" },
          { content: question, role: "user" },
        ],
        model,
        system: playSystem,
      });
      const followUpQuestion =
        "Can you adapt these instructions to the machine I brought last time, or do you need me to explain it again?";
      const followUp = await generateText({
        abortSignal: AbortSignal.timeout(120_000),
        messages: [
          { content: next.opening, role: "assistant" },
          { content: question, role: "user" },
          { content: answer.text, role: "assistant" },
          { content: followUpQuestion, role: "user" },
        ],
        model,
        system: playSystem,
      });
      return {
        followUp: followUp.text,
        followUpQuestion,
        memory,
        system: playSystem,
        text: answer.text,
      };
    })
  );
  return { reactions, round, script: object, violations };
}

const results = await Promise.allSettled((baseline ? [1] : [1, 2, 3]).map(run));
const directory = join(import.meta.dir, "results");
await mkdir(directory, { recursive: true });
const path = join(
  directory,
  `story-play-${baseline ? "baseline" : "candidate"}-${Date.now()}.md`
);
const failed = results.some(
  (result) => result.status === "rejected" || result.value.violations.length > 0
);
await writeFile(
  path,
  [
    "# 대본과 다음 화 대화 평가",
    "",
    `모델: ${model}`,
    `프롬프트: ${baseline ? BASE_REVISION : "현재 작업본"}`,
    `실행: ${new Date().toISOString()}`,
    `대본 프롬프트 SHA-256: ${createHash("sha256")
      .update(system + prompt)
      .digest("hex")}`,
    "기계 검사는 형식, 화 수와 자료 보존만 판정한다. 조건 변경, 결말 선확정, 도움과 설명의 차이는 아래 전문을 읽어 확인해야 한다. 기억은 비교용 고정 입력이며 실제 사용자의 플레이 기록이 아니다.",
    "",
    "## 대본 입력",
    "```",
    system,
    prompt,
    "```",
    `다음 화의 같은 질문: ${question}`,
    ...results.map(
      (result, index) =>
        `\n## ${index + 1}회\n\n\`\`\`json\n${JSON.stringify(result.status === "fulfilled" ? result.value : { error: String(result.reason) }, null, 2)}\n\`\`\``
    ),
  ].join("\n")
);
process.stdout.write(
  `기계 검사 ${failed ? "실패" : "통과"}. 의미 검토 필요.\n${path}\n`
);
if (failed) {
  process.exitCode = 1;
}
