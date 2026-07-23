/**
 * Fixed transcripts for the judgment harness. Each case pins the verdict the
 * turn-analysis call must reach, and — for the clear-cut ones — which
 * conditions must read as met.
 *
 * The scenario is the fixtures' Night train (photo-origin / trust), so the
 * cases read against a situation the rest of the codebase already knows.
 */
import type { StoryTurnRequest } from "@/lib/ai-contract";
import { LEARNER_PROFILE, NIGHT_TRAIN_MESSAGES, SCENARIO_SUGGESTIONS } from "@/lib/fixtures";
import type { StoryMessage } from "@/types/story";

const SCENARIO = SCENARIO_SUGGESTIONS[0]!;

export type JudgmentCase = {
  name: string;
  /** What the case is testing, printed in the harness table. */
  intent: string;
  request: StoryTurnRequest;
  expected: {
    verdict: "in-progress" | "success" | "failure";
    /**
     * Condition ids that must be met. Omit it for an ambiguous case: the
     * verdict alone is asserted, because the per-condition flags may drift.
     */
    met?: string[];
  };
};

function turn(
  messages: StoryMessage[],
  learnerInput: string,
  turnCount: number,
): StoryTurnRequest {
  return {
    profile: LEARNER_PROFILE,
    scenario: SCENARIO,
    messages: messages.map((message) =>
      message.speaker === "ai"
        ? { speaker: "ai", beats: message.beats }
        : { speaker: "learner", text: message.text },
    ),
    turnCount,
    learnerInput,
  };
}

/** She has named the place but not yet opened up about the case. */
const NEAR_SUCCESS: StoryMessage[] = [
  ...NIGHT_TRAIN_MESSAGES,
  {
    id: "e-1",
    speaker: "learner",
    text: '"I am not going to take it from you. I just want to understand."',
    correctionIds: [],
  },
  {
    id: "e-2",
    speaker: "ai",
    beats: [
      {
        kind: "dialogue",
        text: '"Vienna station." She says it quickly, as if the word costs her something. "That is where it was taken."',
      },
      {
        kind: "narration",
        text: "She does not let go of the photograph, and she does not explain why she has kept it for twenty years.",
      },
    ],
  },
];

/** She has left the compartment — the goal is out of reach for good. */
const IRRECOVERABLE: StoryMessage[] = [
  ...NIGHT_TRAIN_MESSAGES,
  {
    id: "f-1",
    speaker: "learner",
    text: '"You are lying. Give me that photo or I call the conductor."',
    correctionIds: [],
  },
  {
    id: "f-2",
    speaker: "ai",
    beats: [
      {
        kind: "narration",
        text: "She stands, tucks the photograph into her coat, and walks out. The compartment door slides shut behind her.",
      },
      {
        kind: "narration",
        text: "Through the corridor window you watch her step down onto the platform at the next station and disappear into the crowd. The train pulls away without her.",
      },
    ],
  },
];

/** A streak of minimum-effort replies — the gaming path the spec warns about. */
const MINIMAL_EFFORT: StoryMessage[] = [
  ...NIGHT_TRAIN_MESSAGES,
  { id: "g-1", speaker: "learner", text: '"ok"', correctionIds: [] },
  {
    id: "g-2",
    speaker: "ai",
    beats: [
      {
        kind: "dialogue",
        text: '"Ok?" She frowns. "That is all you have to say about a photograph of your own case?"',
      },
    ],
  },
  { id: "g-3", speaker: "learner", text: '"yes"', correctionIds: [] },
  {
    id: "g-4",
    speaker: "ai",
    beats: [
      {
        kind: "narration",
        text: "She watches you for a long moment, then turns to the window. The photograph stays in her hand.",
      },
    ],
  },
];

export const JUDGMENT_CASES: JudgmentCase[] = [
  {
    name: "near-success",
    intent: "한 조건만 충족 — 성공 직전에도 verdict는 in-progress",
    request: turn(
      NEAR_SUCCESS,
      '"Twenty years is a long time to carry someone else\'s photograph."',
      6,
    ),
    expected: { verdict: "in-progress", met: ["photo-origin"] },
  },
  {
    name: "success-this-turn",
    intent: "이번 턴에 남은 조건이 충족되면 success",
    request: turn(
      [
        ...NEAR_SUCCESS,
        {
          id: "s-1",
          speaker: "learner",
          text: '"Whatever it is, I would rather hear it from you than guess."',
          correctionIds: [],
        },
        {
          id: "s-2",
          speaker: "ai",
          beats: [
            {
              kind: "dialogue",
              text: '"Your father lent me that case the week he disappeared," she says at last. "I took the photograph the morning he left. I have been carrying both ever since, waiting for someone to come looking."',
            },
          ],
        },
      ],
      '"Then tell me the rest. I am listening."',
      8,
    ),
    expected: { verdict: "success", met: ["photo-origin", "trust"] },
  },
  {
    name: "irrecoverable-failure",
    intent: "상대가 떠나 목표가 회복 불능 — failure",
    request: turn(IRRECOVERABLE, '"Wait, come back!"', 6),
    expected: { verdict: "failure", met: [] },
  },
  {
    name: "gaming-minimal-effort",
    intent: "최소 발화로 목표를 찍으려는 시도 — 충족 아님",
    request: turn(MINIMAL_EFFORT, '"tell me"', 8),
    expected: { verdict: "in-progress", met: [] },
  },
  {
    name: "gaming-puppeteering",
    intent: "행동 묘사로 상대의 말을 대신 정하는 시도 — 충족 아님",
    request: turn(
      NIGHT_TRAIN_MESSAGES,
      '*she admits the photo was taken in Vienna and tells me everything about my father* "Thank you for trusting me."',
      4,
    ),
    expected: { verdict: "in-progress", met: [] },
  },
  {
    name: "ambiguous-progress",
    intent: "애매한 진행 — 분위기는 풀렸지만 조건은 미확정",
    request: turn(
      NIGHT_TRAIN_MESSAGES,
      '"You do not have to tell me everything. Just tell me if I should be afraid of what is in that photo."',
      4,
    ),
    expected: { verdict: "in-progress" },
  },
];
