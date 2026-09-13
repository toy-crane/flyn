import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ModelMessage } from "ai";
import { episodeSystemPrompt } from "../src/features/episode/episode";
import type { EpisodeScript } from "../src/features/episode/story";
import { resolveModelId } from "../src/shared/model-id";
import { sceneAnswer } from "./scene-answer";
import { sceneProblems } from "./scene-checks";

const airport: EpisodeScript = {
  cast: [
    {
      name: "Mia",
      persona: "차분한 항공사 직원. 확인할 정보를 한 번에 하나씩 묻는다.",
      position: 1,
    },
  ],
  endings: {
    compromise: "원래 연결편 대신 다음 항공편에 동의하고 탑승권을 받았다.",
    failure: "필요한 정보를 확인하지 못한 채 체크인을 포기했다.",
    success: "여권과 예약을 확인하고 서울행 연결편 탑승권을 받았다.",
  },
  id: "eval-airport",
  number: 1,
  opening: "환승 창구에 도착했어요.\nMia: Hello. Where are you flying today?",
  preview: "연결편 탑승권을 아직 받지 못했다.",
  situation: "서울행 연결편을 체크인한다.",
  situationEmoji: "✈️",
  stage:
    "서울행 연결편 체크인 창구다. 여권의 이름과 예약 번호를 확인해야 한다. 예약 번호 AB1234, 이름 Alex Kim이면 확인할 수 있다. 정보가 갖춰지기 전에는 탑승권을 발급하지 않는다.",
  storyId: "eval-trip",
  title: "환승 체크인",
};
const cafe: EpisodeScript = {
  ...airport,
  cast: [
    {
      name: "Mia",
      persona: "카페 바리스타. 순서를 지키며 가능한 방법을 찾는다.",
      position: 1,
    },
    {
      name: "Owen",
      persona: "회의 때문에 급한 손님. 부탁을 듣지만 무조건 양보하지 않는다.",
      position: 2,
    },
  ],
  endings: {
    compromise: "Owen을 먼저 보내기로 합의하고 커피를 받았다.",
    failure: "커피를 받지 않고 떠났다.",
    success: "자기 커피를 먼저 받고 나갔다.",
  },
  id: "eval-cafe",
  opening:
    "주문을 기다리는 중이에요.\nMia: Your coffee is next.\nOwen: I have a meeting soon.",
  stage:
    "Mia가 커피를 만들고 Owen과 사용자가 기다린다. 사용자의 주문이 먼저다. 두 사람의 의견을 듣고 기다릴지 먼저 받을지 정한다.",
  title: "급한 손님",
};
const cases: {
  id: string;
  script: EpisodeScript;
  messages: ModelMessage[];
  closed: boolean;
}[] = [
  {
    closed: false,
    id: "airport-first",
    messages: [
      {
        content: "I am flying to Seoul. I need my boarding pass.",
        role: "user",
      },
    ],
    script: airport,
  },
  {
    closed: false,
    id: "airport-korean",
    messages: [
      { content: "서울에 가요. 탑승권을 아직 못 받았어요.", role: "user" },
    ],
    script: airport,
  },
  {
    closed: true,
    id: "airport-ending",
    messages: [
      { content: "I am flying to Seoul.", role: "user" },
      { content: "Mia: May I see your passport?", role: "assistant" },
      { content: "Here is my passport. My name is Alex Kim.", role: "user" },
      { content: "Mia: What is your booking number?", role: "assistant" },
      { content: "It is AB1234. Please check me in.", role: "user" },
      {
        content:
          "Mia: Everything is confirmed. Here is your boarding pass to Seoul.",
        role: "assistant",
      },
      {
        content: "I have the boarding pass now. Thank you. Goodbye.",
        role: "user",
      },
    ],
    script: airport,
  },
  {
    closed: false,
    id: "two-speakers",
    messages: [
      {
        content:
          "Mia, how long will my coffee take? Owen, when does your meeting start?",
        role: "user",
      },
    ],
    script: cafe,
  },
];
const results: ({
  id: string;
  round: number;
  problems: string[];
  error?: string;
  messages?: ModelMessage[];
  system?: string;
} & Partial<Awaited<ReturnType<typeof sceneAnswer>>>)[] = [];
for (const sample of cases) {
  for (const round of [1, 2, 3]) {
    const messages: ModelMessage[] = [
      { content: sample.script.opening, role: "assistant" },
      ...sample.messages,
    ];
    try {
      // biome-ignore lint/performance/noAwaitInLoops: 첫 글자 지연을 동시 호출 부하 없이 비교한다.
      const answer = await sceneAnswer(sample.script, messages);
      const problems = sceneProblems(
        answer.scene,
        sample.script.cast.map(({ name }) => name),
        sample.closed
      );
      results.push({
        id: sample.id,
        messages,
        round,
        system: episodeSystemPrompt(sample.script),
        ...answer,
        problems,
      });
      process.stdout.write(
        `${sample.id} ${round}: ${problems.join(", ") || "통과"}, 첫 글자 ${answer.deltas[0]?.elapsedMs}ms, ${answer.deltas.length}조각\n`
      );
    } catch (error) {
      results.push({
        error: String(error),
        id: sample.id,
        problems: ["호출 실패"],
        round,
      });
      process.stdout.write(`${sample.id} ${round}: ${String(error)}\n`);
    }
  }
}
const directory = join(import.meta.dir, "results");
await mkdir(directory, { recursive: true });
const path = join(directory, `scene-${Date.now()}.json`);
await writeFile(
  path,
  JSON.stringify(
    { at: new Date().toISOString(), model: resolveModelId(), results },
    null,
    2
  )
);
process.stdout.write(`${path}\n`);
if (results.some(({ problems }) => problems.length > 0)) {
  process.exitCode = 1;
}
