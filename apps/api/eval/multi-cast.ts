import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelMessage } from "ai";
import { episodeSystemPrompt } from "../src/features/episode/episode";
import type { EpisodeScript } from "../src/features/episode/story";
import { resolveModelId } from "../src/shared/model-id";
import { sceneAnswer } from "./scene-answer";
import { sceneProblems } from "./scene-checks";

const cafe: EpisodeScript = {
  cast: [
    {
      name: "Mia",
      persona:
        "28세 바리스타. 차분하고 짧게 말한다. 순서를 지키고 실용적인 대안을 낸다.",
      position: 1,
    },
    {
      name: "Owen",
      persona:
        "32세 회사원. 급하면 직설적으로 말한다. 이유를 듣지만 마냥 양보하지 않는다.",
      position: 2,
    },
  ],
  endings: {
    compromise: "Owen을 먼저 보내기로 합의하고 커피를 받았다.",
    failure: "주문을 취소하고 떠났다.",
    success: "순서를 지키고 자기 커피를 먼저 받았다.",
  },
  id: "eval-multi-cast",
  number: 1,
  opening:
    "아침 카페에서 주문을 기다린다.\nMia: Your coffee is next.\nOwen: Could I go first? I'm late for a meeting.",
  preview: "커피를 기다리는데 뒤의 손님이 먼저 달라고 한다.",
  situation: "급한 손님과 주문 순서를 정한다.",
  situationEmoji: "☕",
  stage:
    "사용자가 먼저 주문했고 커피는 2분 뒤 완성된다. Owen의 회의는 3분 뒤 시작하고 여기서 2분을 걸어야 한다. Mia는 주문 순서를 지킨다. 사용자는 아직 순서 변경에 동의하지 않았으며 커피를 받지도 않았다. 상황을 묻는 것만으로 순서 변경이나 수령이 완료되지는 않는다.",
  storyId: "eval-cafe",
  title: "급한 손님",
};
const three: EpisodeScript = {
  ...cafe,
  cast: [
    ...cafe.cast,
    {
      name: "Nora",
      persona:
        "24세 계산 담당 직원. 친절하고 구체적으로 결제 방법을 알려 준다. 커피 제조나 주문 순서는 Mia에게 맡긴다.",
      position: 3,
    },
  ],
  opening: `${cafe.opening}\nNora: You can pay here while you wait.`,
  stage: `${cafe.stage} Nora는 계산을 맡고 사용자는 아직 결제하지 않았다. 폰 결제가 가능하고 커피를 받기 전에 결제할 수 있다. 결제 단말기는 계산대 위에 있다. Nora는 사용자가 폰을 댔다고 말하기 전에는 결제됐다고 단정하지 않는다.`,
};
const scenarios = [
  {
    id: "two-people",
    inputs: [
      "Mia, how long will my coffee take? Owen, when does your meeting start?",
      "Owen, would waiting two minutes make you late? Please be honest.",
      "Mia, please keep my order first. Owen, I understand you're in a hurry, but I ordered before you. Is there another way?",
    ],
    script: cafe,
  },
  {
    id: "three-people",
    inputs: [
      "Mia, how long will my coffee take? Owen, when does your meeting start? Nora, can I pay with my phone?",
      "Nora, just to confirm: can I pay with my phone before my drink is ready?",
      "Owen, I haven't agreed to change our places. Mia, please keep my order first. Nora, please tell me where to tap my phone while Mia makes it.",
    ],
    script: three,
  },
];
type Answer = Awaited<ReturnType<typeof sceneAnswer>>;
const results: {
  scenario: string;
  round: number;
  script: EpisodeScript;
  system: string;
  turns: ({ input: string; problems: string[] } & Answer)[];
  error?: string;
}[] = [];

for (const scenario of scenarios) {
  for (const round of [1, 2, 3]) {
    const entry: (typeof results)[number] = {
      round,
      scenario: scenario.id,
      script: scenario.script,
      system: episodeSystemPrompt(scenario.script),
      turns: [],
    };
    const messages: ModelMessage[] = [
      { content: scenario.script.opening, role: "assistant" },
    ];
    try {
      for (const input of scenario.inputs) {
        messages.push({ content: input, role: "user" });
        // biome-ignore lint/performance/noAwaitInLoops: 실제 앞 응답을 다음 입력의 대화 기록에 넣는다.
        const answer = await sceneAnswer(scenario.script, messages);
        const problems = sceneProblems(
          answer.scene,
          scenario.script.cast.map(({ name }) => name),
          false
        );
        entry.turns.push({ input, ...answer, problems });
        messages.push({ content: answer.text, role: "assistant" });
        process.stdout.write(
          `${scenario.id} ${round}/${entry.turns.length}: ${answer.text}\n${problems.join(", ") || "형식 통과"}\n`
        );
        if (answer.scene.ending) {
          break;
        }
      }
    } catch (error) {
      entry.error = String(error);
    }
    results.push(entry);
  }
}
const directory = join(import.meta.dir, "results");
await mkdir(directory, { recursive: true });
const path = join(directory, `multi-cast-${Date.now()}.json`);
await writeFile(
  path,
  JSON.stringify(
    { at: new Date().toISOString(), model: resolveModelId(), results },
    null,
    2
  )
);
process.stdout.write(`${path}\n`);
if (
  results.some(
    ({ error, turns }) =>
      error || turns.some(({ problems }) => problems.length > 0)
  )
) {
  process.exitCode = 1;
}
