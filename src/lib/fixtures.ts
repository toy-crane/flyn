/**
 * Fixture data lifted from prototype.html, including its state variants
 * (empty library, no corrections, three endings). Placeholder screens read
 * these until the real data and AI routes land.
 */
import type {
  Correction,
  CorrectionThread,
  TextSpan,
} from "@/types/correction";
import type { LearnerProfile, LearnerStats } from "@/types/learner";
import type {
  Book,
  Ending,
  Scenario,
  SessionStats,
  StoryMessage,
  StorySession,
} from "@/types/story";

/** Locates a fragment inside a message so error spans stay in sync with the text. */
function spanOf(haystack: string, needle: string): TextSpan {
  const start = haystack.indexOf(needle);
  if (start < 0) {
    throw new Error(`fixture text does not contain ${JSON.stringify(needle)}`);
  }
  return { start, end: start + needle.length };
}

function daysAgo(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

/** 프로토타입 ⑧ 프로필 — Alex, 중급. */
export const LEARNER_PROFILE: LearnerProfile = {
  englishLevel: "intermediate",
  learningGoals: ["travel", "media"],
  genrePreferences: ["mystery", "scifi"],
  interests: ["travel", "film", "science"],
  nickname: "Alex",
};

export const LEARNER_STATS: LearnerStats = {
  streakDays: 6,
  completedStories: 12,
  totalTurns: 214,
  totalCorrections: 38,
  daysSinceJoined: 32,
  weeklyActivity: [
    { weekday: "월", studied: true, isToday: false },
    { weekday: "화", studied: true, isToday: false },
    { weekday: "수", studied: true, isToday: false },
    { weekday: "목", studied: false, isToday: true },
    { weekday: "금", studied: false, isToday: false },
    { weekday: "토", studied: false, isToday: false },
    { weekday: "일", studied: false, isToday: false },
  ],
};

/** 프로토타입 ② 홈 — AI가 제안하는 상황 카드 3개. */
export const SCENARIO_SUGGESTIONS: Scenario[] = [
  {
    genre: "mystery",
    title: "Night train to Budapest",
    intro:
      "야간열차에서 맞은편 승객이 당신의 낡은 가방을 알아본다. 그녀는 20년 전 사진 한 장을 꺼내는데…",
    scene:
      "부다페스트로 향하는 야간열차의 좁은 객실. 맞은편에 앉은 회색 코트의 여자가 당신의 낡은 가방을 자꾸 흘끔거린다. 자정이 지났고, 객실에는 둘뿐이다.",
    goal: "사진의 출처를 알아내라",
    myRole: "야간열차 승객",
    aiRole: "회색 코트의 여자",
    achievementConditions: [
      {
        id: "photo-origin",
        description: "그녀가 사진이 찍힌 장소를 구체적으로 밝힌다",
      },
      {
        id: "trust",
        description:
          "그녀가 가방과 사진의 관계를 스스로 이야기할 만큼 신뢰한다",
      },
    ],
  },
  {
    genre: "scifi",
    title: "Signal from Bay 7",
    intro:
      "화성 기지의 통신이 끊겼다. 유일하게 깨어 있는 동료는 패닉에 빠져 격납고 문을 열려 한다.",
    scene:
      "화성 기지의 7번 격납고. 지구와의 통신이 여섯 시간째 끊겼고, 비상등만 돌아간다. 동료가 헬멧도 없이 외부 해치의 잠금장치를 풀고 있다.",
    goal: "동료를 진정시키고 문을 못 열게 막아라",
    myRole: "정비 엔지니어",
    aiRole: "패닉에 빠진 동료",
    achievementConditions: [
      { id: "calm", description: "동료가 해치에서 손을 뗀다" },
      { id: "stay", description: "동료가 통신 복구를 함께 기다리기로 한다" },
    ],
  },
  {
    genre: "daily",
    title: "The wrong suitcase",
    intro:
      "공항에서 가방이 바뀌었다. 가방 주인은 비행기 탑승 10분 전, 연락처는 가방 안에 있다.",
    scene:
      "출국장 수하물 찾는 곳. 똑같이 생긴 남색 캐리어를 열어 보니 남의 짐이다. 게이트 앞에서 같은 캐리어를 끌고 가는 사람을 발견했고, 그의 탑승까지 10분 남았다.",
    goal: "탑승 전에 가방을 되찾아라",
    myRole: "여행자",
    aiRole: "가방을 바꿔 간 승객",
    achievementConditions: [
      { id: "convince", description: "상대가 가방이 바뀌었다는 것을 인정한다" },
      { id: "swap", description: "탑승 전에 두 가방을 서로 돌려받는다" },
    ],
  },
];

/** 프로토타입 ⑥ 상황 만들기 — 들어오자마자 보이는 무작위 상황. */
export const DRAFT_SCENARIO: Scenario = {
  genre: "mystery",
  title: "The lighthouse knock",
  intro: "폭풍우 치는 밤, 외딴 등대에 누군가 문을 두드린다.",
  scene:
    "폭풍우 치는 밤, 외딴 등대에서 눈을 뜬다. 자정이 넘은 시각, 누군가 문을 세 번씩 규칙적으로 두드리고 있다. 이 섬에 나 말고는 아무도 없어야 한다.",
  goal: "방문자의 정체를 알아내고, 문을 열지 결정하라",
  myRole: "등대지기",
  aiRole: "문 밖의 방문자",
  achievementConditions: [
    { id: "identity", description: "방문자가 자신이 누구인지 밝힌다" },
    { id: "decision", description: "문을 열지 말지 스스로 결정한다" },
  ],
};

const NIGHT_TRAIN_SCENARIO = SCENARIO_SUGGESTIONS[0]!;

const LEARNER_TURN_1 =
  '*I hold the case tighter* "It\'s just my luggage. Why you want to know?"';
const LEARNER_TURN_3 = '"I have this case since years. It was my father\'s."';
const LEARNER_TURN_4 = '*I lean forward* "Show me the photo."';

/** 프로토타입 ③ 세션 — 진행 중인 대화록. */
export const NIGHT_TRAIN_MESSAGES: StoryMessage[] = [
  {
    id: "msg-1",
    speaker: "ai",
    beats: [
      {
        kind: "narration",
        text: "The train rattles through the dark. Across from you, a woman in a gray coat keeps glancing at your suitcase. She finally leans forward.",
      },
      { kind: "dialogue", text: '"That case… where did you get it?"' },
    ],
  },
  {
    id: "msg-2",
    speaker: "learner",
    text: LEARNER_TURN_1,
    correctionIds: ["fix-1"],
  },
  {
    id: "msg-3",
    speaker: "ai",
    beats: [
      {
        kind: "dialogue",
        text: '"Because I have seen it before." She slides a photograph across the table. "Twenty years ago. Same case, same scratch on the corner."',
      },
    ],
  },
  {
    id: "msg-4",
    speaker: "learner",
    text: '"That\'s impossible. Where was this photo taken?"',
    correctionIds: [],
  },
  {
    id: "msg-5",
    speaker: "ai",
    beats: [
      {
        kind: "narration",
        text: "She hesitates, fingers tightening around the photograph. Outside, the lights of a small station flash past.",
      },
    ],
  },
];

/** 결말로 향하는 뒷부분 — 완성된 책의 대화록에만 들어간다. */
const NIGHT_TRAIN_CLOSING_MESSAGES: StoryMessage[] = [
  {
    id: "msg-6",
    speaker: "learner",
    text: LEARNER_TURN_3,
    correctionIds: ["fix-2"],
  },
  {
    id: "msg-7",
    speaker: "ai",
    beats: [
      {
        kind: "dialogue",
        text: 'She studies your face. "Your father." A pause. "Then you already know part of this story."',
      },
    ],
  },
  {
    id: "msg-8",
    speaker: "learner",
    text: LEARNER_TURN_4,
    correctionIds: ["fix-3"],
  },
];

/** 프로토타입 ③ 세션의 결말 3갈래. */
export const ENDINGS: Record<Ending["kind"], Ending> = {
  success: {
    kind: "success",
    narration:
      'She finally exhales. "Vienna station. My father took it — the day he disappeared." The name of the station settles over you both as the train slows. You have your answer, and she has questions of her own.',
    headline: "이야기 완성 — 목표 달성",
    note: "사진의 출처를 알아냈어요.",
    summary:
      "그녀를 설득해 사진이 빈 역에서 찍혔다는 것과 사라진 아버지의 이야기를 들었다.",
  },
  failure: {
    kind: "failure",
    narration:
      '"Forget it." She snatches the photograph back and moves to another compartment. Whatever she knew about the case leaves with her.',
    headline: "이야기 끝 — 목표 실패",
    note: "그녀의 신뢰를 잃어 사진의 출처를 듣지 못했어요.",
    summary:
      "끝내 그녀의 경계를 풀지 못했고, 사진은 그녀와 함께 객실을 떠났다.",
  },
  forced: {
    kind: "forced",
    narration:
      '"Budapest! Final stop!" The conductor\'s voice cuts through the compartment. She tucks the photograph away and vanishes into the crowd on the platform — the answer still hers alone.',
    headline: "이야기 끝 — 열차가 종착역에 도착",
    note: "30턴이 지나 이야기가 마무리됐어요.",
    summary:
      "종착역에 닿을 때까지 대화는 이어졌지만, 사진의 출처는 끝내 듣지 못했다.",
  },
};

/** 프로토타입 ③ 세션 — 진행 중(이어하기 대상). */
export const IN_PROGRESS_SESSION: StorySession = {
  id: "session-night-train",
  scenario: NIGHT_TRAIN_SCENARIO,
  status: "in-progress",
  messages: NIGHT_TRAIN_MESSAGES,
  ending: null,
  startedAt: daysAgo(0),
  completedAt: null,
};

/** 프로토타입 ⑤ 결과 · ⑨ 책 상세 — 완성된 세션. */
export const COMPLETED_SESSION: StorySession = {
  ...IN_PROGRESS_SESSION,
  status: "completed",
  messages: [...NIGHT_TRAIN_MESSAGES, ...NIGHT_TRAIN_CLOSING_MESSAGES],
  ending: ENDINGS.success,
  completedAt: daysAgo(0),
};

/** 프로토타입 ③ 교정 패널 · ⑤ 결과 교정 리뷰 · ④ 교정 스레드. */
export const CORRECTIONS: Correction[] = [
  {
    id: "fix-1",
    sessionId: "session-night-train",
    messageId: "msg-2",
    originalText: "Why you want to know?",
    correctedText: "Why do you want to know?",
    errorSpans: [spanOf(LEARNER_TURN_1, "Why you want")],
    changedSpans: [spanOf("Why do you want to know?", "do")],
    reason: "의문문에는 조동사 do가 주어 앞에 와야 해요.",
    explanation:
      "의문문에서는 조동사 do가 주어 앞에 와야 해요. 평서문 어순 그대로 물으면 어색하게 들려요.",
  },
  {
    id: "fix-2",
    sessionId: "session-night-train",
    messageId: "msg-6",
    originalText: "I have this case since years.",
    correctedText: "I've had this case for years.",
    errorSpans: [spanOf(LEARNER_TURN_3, "have this case since years")],
    changedSpans: [spanOf("I've had this case for years.", "'ve had")],
    reason: "과거부터 지금까지 이어지는 상태는 현재완료로 써요.",
    explanation:
      "과거에 시작해 지금도 이어지는 일은 현재완료(have + 과거분사)로 말해요. 기간 앞에는 since가 아니라 for를 쓰고요.",
  },
  {
    id: "fix-3",
    sessionId: "session-night-train",
    messageId: "msg-8",
    originalText: "Show me the photo.",
    correctedText: "Could you show me the photo?",
    errorSpans: [spanOf(LEARNER_TURN_4, "Show me the photo.")],
    changedSpans: [spanOf("Could you show me the photo?", "Could you")],
    reason: "명령문은 무례하게 들릴 수 있어요.",
    explanation:
      "처음 만난 사람에게 명령문을 쓰면 강압적으로 들려요. Could you로 부탁하면 같은 내용도 정중해져요.",
  },
];

/** 프로토타입 ④ 교정 스레드 — fix-1을 붙잡고 이어가는 Q&A. */
export const CORRECTION_THREAD: CorrectionThread = {
  correctionId: "fix-1",
  messages: [
    {
      id: "thread-1",
      speaker: "learner",
      text: '왜 do가 꼭 필요해? 드라마에서는 "Why you say that?"처럼 말하던데.',
    },
    {
      id: "thread-2",
      speaker: "ai",
      text: '좋은 관찰이에요. 구어에서는 do를 생략하기도 하지만 매우 캐주얼하고 방언적인 느낌이라, 처음 본 사람에게 쓰면 무례하거나 어눌하게 들릴 수 있어요. 중립적인 상황에서는 "Why do you…"가 안전해요.',
    },
  ],
  suggestedQuestions: ["다른 예문 보여줘", "더 캐주얼한 표현은?"],
};

/** 프로토타입 ⑤ 결과 — 통계 3종. */
export const SESSION_STATS: SessionStats = {
  turnCount: 14,
  correctionCount: 3,
  correctionThreadCount: 2,
};

/** 프로토타입 ⑦ 서재 — 완성한 책 4권. */
export const BOOKS: Book[] = [
  {
    sessionId: "session-night-train",
    title: "Night train to Budapest",
    genre: "mystery",
    endingKind: "success",
    completedAt: daysAgo(0),
    turnCount: 14,
    correctionCount: 3,
  },
  {
    sessionId: "session-dragon",
    title: "The dragon's apprentice",
    genre: "fantasy",
    endingKind: "failure",
    completedAt: daysAgo(1),
    turnCount: 18,
    correctionCount: 4,
  },
  {
    sessionId: "session-bay-7",
    title: "Signal from Bay 7",
    genre: "scifi",
    endingKind: "success",
    completedAt: daysAgo(3),
    turnCount: 21,
    correctionCount: 5,
  },
  {
    sessionId: "session-elevator",
    title: "Elevator with the CEO",
    genre: "daily",
    endingKind: "forced",
    completedAt: daysAgo(7),
    turnCount: 30,
    correctionCount: 2,
  },
];
