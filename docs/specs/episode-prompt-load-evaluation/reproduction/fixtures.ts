import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ModelMessage } from "ai";
import type { EpisodeScript } from "./src/features/episode/story";

export const repo = resolve(process.env.FLYN_EVAL_REPO ?? process.cwd(), process.env.FLYN_EVAL_REPO ? "." : "../..");
const seed = readFileSync(resolve(repo, "supabase/seed.sql"), "utf8");
const content = (text: string) => [...text.matchAll(/\$content\$([\s\S]*?)\$content\$/g)].map(m => m[1]!);
const episodeValues = content(seed.slice(seed.indexOf("$content$계산이 꼬인 아침$content$")));
const persona = (name: string) => content(seed.slice(seed.indexOf(`$content$${name}$content$`)))[1]!;
export const script: EpisodeScript = {
  id: "eval-payment", storyId: "eval-cafe", number: 2,
  title: episodeValues[0]!, preview: episodeValues[1]!, situation: episodeValues[2]!,
  situationEmoji: episodeValues[3]!, opening: episodeValues[4]!, stage: episodeValues[5]!,
  cast: ["Mia", "Owen"].map((name, index) => ({ name, persona: persona(name), position: index + 1 })),
  endings: { success: episodeValues[8]!, compromise: episodeValues[9]!, failure: episodeValues[10]! },
};
// D uses exactly these seven existing facts; only order and grouping change.
const facts = script.stage.split("\n").filter(line => line.startsWith("- "));
if (facts.length !== 7) throw new Error("Seed stage changed: review D's grouping.");
export const groupedStage = [
  "상황:", facts[0],
  "사용자의 결제:", facts[1], facts[2], facts[5],
  "Mia:", facts[3],
  "Owen:", facts[4],
  "주변 상황:", facts[6],
].join("\n");

const evidence = JSON.parse(readFileSync(resolve(repo, "docs/follow-ups/evidence/multi-person-dialogue-role-confusion/multi-cast-runtime-dialogue.json"), "utf8"));
const prior: ModelMessage[] = evidence.previousMessages.map((m: { role: "user" | "assistant"; parts: { type: string; text?: string; data?: { name: string | null } }[] }) => ({
  role: m.role,
  content: m.parts.map(p => p.type === "text" ? p.text : p.type === "data-speaker" && p.data?.name ? `\n${p.data.name}: ` : "").join(""),
}));
const user = (content: string): ModelMessage => ({ role: "user", content });
const assistant = (content: string): ModelMessage => ({ role: "assistant", content });
const observed = evidence.observedTurns as { user: string; dialogue: { speaker: string; text: string }[] }[];
const beforeLast: ModelMessage[] = [...prior, ...observed.slice(0, 2).flatMap(t => [user(t.user), assistant(t.dialogue.map(d => `${d.speaker}: ${d.text}`).join("\n"))])];

export interface Fixture {
  id: string;
  title: string;
  messages: ModelMessage[];
  expectedEnding: "성공" | "타협" | "실패" | null;
  rubric: string[];
  source: string;
  script?: EpisodeScript;
  groupedStage?: string;
}
export const fixtures: Fixture[] = [
  {
    id: "s1-owner", title: "회의 일정의 주인", messages: [...beforeLast, user(observed[2]!.user)], expectedEnding: "성공",
    rubric: ["회의는 Owen의 일정이다. 사용자에게 회의가 있다고 말하지 않는다.", "사용자가 폰을 대고 소리를 들었다. 원래 음료를 건네며 성공으로 종료할 수 있다.", "어제의 적은 얼음 선호가 다른 인물에게 옮겨지지 않는다."],
    source: "실제 기록의 대화 전문. 당시 system·이야기 기억 원문은 없어 현재 seed와 기억 없는 prompt로 재구성한다.",
  },
  {
    id: "s2-addressee", title: "한 입력 안에서 상대 전환", messages: [...prior, user("Owen, can you wait one more minute? Mia, how should I pay?")], expectedEnding: null,
    rubric: ["기다리는 사람은 Owen이고 결제를 안내하는 직원은 Mia다.", "Owen을 결제해야 하는 손님으로 오인하지 않는다.", "사용자는 아직 결제하지 않았다. 결제 완료·음료 수령을 지어내지 않는다.", "두 요청에 필요한 응답을 하고 말하는 상대를 모호하게 바꾸지 않는다."], source: "실제 기록에서 상대 전환만 고정한 변형",
  },
  {
    id: "s3-not-done", title: "질문과 완료 행동 구분", messages: [...prior, user("Mia, I have opened my payment app, but I have not tapped yet. Where should I hold my phone? Owen, thanks for waiting.")], expectedEnding: null,
    rubric: ["단말기 위치나 폰을 대는 방법을 알려 준다.", "폰을 대거나 결제가 완료된 것으로 쓰지 않는다.", "Owen의 회의와 사용자의 결제를 구분한다."], source: "실제 사용자 입력을 결제 전 상태에 배치",
  },
  {
    id: "s4-success", title: "원래 목표 달성", messages: [...beforeLast, user("The payment screen says Approved, and I have my iced Americano now. Thank you, Mia. Owen, thank you for waiting.")], expectedEnding: "성공",
    rubric: ["사용자가 폰 결제로 원래 주문한 아이스 아메리카노를 받았다는 사실을 유지한다.", "Owen에게 결제 도움을 받았다고 쓰지 않는다.", "이미 마친 결제를 다시 요구하지 않는다. Owen의 회의를 사용자에게 옮기지 않는다."], source: "성공 조건을 분명히 만족하는 대조 입력",
  },
  {
    id: "s5-compromise", title: "대체 음료로 타협", messages: [...prior,
      user("My phone payment app is not working. Is there a cheaper drink I can buy with my cash?"),
      assistant("Mia: A small hot soy latte costs less. Your cash is enough for that. Would you like it instead?\nOwen: I can wait another minute."),
      user("Yes, I will take the hot soy latte instead. Here is my cash."),
      assistant("Mia: Thank you. The cash covers it. Here is your hot soy latte."),
      user("I have the hot soy latte now. That works for me. Thank you both."),
    ], expectedEnding: "타협",
    rubric: ["원래 아이스 아메리카노 대신 뜨거운 두유 라테를 받은 타협이다.", "현금으로 냈고 폰 결제 성공이 아니다.", "Owen이 대신 결제했다고 쓰지 않는다. 회의 일정의 주인도 유지한다."], source: "현재 seed의 음료 변경 타협 기준을 만족하는 합성 대화",
  },
  {
    id: "s6-failure", title: "주문 취소로 종료", messages: [...prior,
      user("My phone payment does not work either. I do not want anyone else to pay for me. Please cancel my order."),
      assistant("Mia: All right. I have canceled your order.\nOwen: Sorry it did not work out."),
      user("My order has been canceled. I am leaving without a drink. Thanks for trying, Mia. Owen, I hope you get to your meeting on time."),
    ], expectedEnding: "실패",
    rubric: ["취소 후 음료 없이 떠난 실패다. 대화 종료 자체를 성공으로 판정하지 않는다.", "결제·수령·대신 계산을 지어내지 않는다.", "회의는 Owen의 일정이다."], source: "현재 seed의 실패 기준을 만족하는 합성 대화",
  },
];

