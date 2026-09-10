import type { ModelMessage } from "ai";

import type { AskedCorrection } from "../src/features/episode/ask";
import type { AnswerScope } from "./answer-checks";

/** 물어볼 말 하나와 그 답을 어느 갈래로 재는지. */
export interface AskedQuestion {
  kind: string;
  question: string;
  scope: AnswerScope;
}

/**
 * 교정 하나를 두고 이어서 묻는 한 자리.
 *
 * `turns`가 둘이면 앞 답을 문맥으로 받은 두 번째 물음이다. 이어지는 물음에서
 * 규칙이 풀리는지는 한 번짜리 물음으로 알 수 없다.
 */
export interface AskedConversation {
  correction: AskedCorrection;
  snapshot: ModelMessage[];
  turns: AskedQuestion[];
}

/**
 * 카페에서 잘못 나온 커피. 영어로 쓴 문장에 붙은 교정이다.
 */
const WRONG_COFFEE: AskedCorrection = {
  entries: [
    {
      fixed: "the wrong coffee",
      original: "wrong coffee",
      pattern: "definite-article",
      why: "지금 받은 그 잘못 나온 커피를 가리키니까 the를 붙여요.",
    },
    {
      fixed: "I ordered",
      original: "I order",
      pattern: "past-tense",
      why: "이미 주문한 일이라 과거형으로 써요.",
    },
    {
      fixed: "an iced americano",
      original: "ice americano",
      pattern: "iced-drink-article",
      why: "음료 이름은 iced로 쓰고, 한 잔이니까 an을 붙여요.",
    },
  ],
  fixed: "I think this is the wrong coffee. I ordered an iced americano.",
  original: "I think this is wrong coffee. I order ice americano.",
};

/**
 * 같은 장면에서 한국어로 쓴 메시지. 교정이 아니라 영어 표현 안내다.
 */
const KOREAN_INPUT: AskedCorrection = {
  entries: [
    {
      fixed: "I ordered",
      original: "시켰는데",
      pattern: "order-verb",
      why: "'시키다'는 주문할 때 order라고 해요.",
    },
    {
      fixed: "I got a latte",
      original: "라떼가 나왔어요",
      pattern: "receive-verb",
      why: "'~가 나왔다'는 받았다는 뜻으로 I got이라고 해요.",
    },
  ],
  fixed: "I ordered an iced americano, but I got a latte.",
  original: "아이스 아메리카노 시켰는데 라떼가 나왔어요",
};

/**
 * 물어보기가 문맥으로 받는 에피소드 대화.
 *
 * 경로가 `data-speaker` 조각을 되살려 보내는 것과 같은 모양으로 적는다.
 * 모델이 보는 글이 같아야 평가가 실제 답과 같은 것을 잰다.
 */
function snapshotOf(sent: string): ModelMessage[] {
  return [
    { content: "Mia: Here's your latte. Next, please!", role: "assistant" },
    { content: sent, role: "user" },
    {
      content: "Mia: Oh, sorry about that. Let me check your order.",
      role: "assistant",
    },
  ];
}

/**
 * 평가가 늘 같은 자리에서 재는 물음들.
 *
 * 갈래마다 하나씩 둔다. 얕은 물음만 모으면 답이 길어지는 자리를 놓치고,
 * 교정 밖 물음만 모으면 답해야 할 자리에서 돌려보내는지 알 수 없다.
 */
export const ASK_CONVERSATIONS: AskedConversation[] = [
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "교정 안 얕은 물음",
        question: "the를 왜 붙여요?",
        scope: "correction",
      },
    ],
  },
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "교정 안 깊은 물음",
        question: "관사는 언제 the 쓰고 언제 a 써요? 맨날 헷갈려요",
        scope: "correction",
      },
    ],
  },
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "교정 안 얕은 물음",
        question: "the를 왜 붙여요?",
        scope: "correction",
      },
      {
        kind: "이어지는 교정 안 물음",
        question: "그럼 이번엔 커피가 두 잔 잘못 나왔으면 뭐라고 해요?",
        scope: "correction",
      },
    ],
  },
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "교정 안 얕은 물음",
        question: "the를 왜 붙여요?",
        scope: "correction",
      },
      {
        kind: "이어지는 교정 밖 물음",
        question: "그럼 will이랑 be going to 차이는요?",
        scope: "offTopic",
      },
    ],
  },
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "다음 말 준비",
        question: "Mia한테 환불해 달라고 하려면 뭐라고 해요?",
        scope: "nextLine",
      },
    ],
  },
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "교정 밖 상관없는 문법",
        question: "가정법 과거는 언제 써요?",
        scope: "offTopic",
      },
    ],
  },
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "교정 밖 이야기 결말",
        question: "이 이야기 결말이 뭐예요? Mia가 바꿔 줘요?",
        scope: "offTopic",
      },
    ],
  },
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "교정 밖 잡담",
        question: "오늘 저녁 뭐 먹을까요?",
        scope: "offTopic",
      },
    ],
  },
  {
    correction: WRONG_COFFEE,
    snapshot: snapshotOf(WRONG_COFFEE.original),
    turns: [
      {
        kind: "교정 밖 너 자신",
        question: "너는 누구야? ChatGPT야?",
        scope: "offTopic",
      },
    ],
  },
  {
    correction: KOREAN_INPUT,
    snapshot: snapshotOf(KOREAN_INPUT.original),
    turns: [
      {
        kind: "한국어 안내, 교정 안 얕은 물음",
        question: "got 말고 다른 말은 없어요?",
        scope: "correction",
      },
    ],
  },
  {
    correction: KOREAN_INPUT,
    snapshot: snapshotOf(KOREAN_INPUT.original),
    turns: [
      {
        kind: "한국어 안내, 교정 안 깊은 물음",
        question: "but 대신 and 쓰면 이상해요?",
        scope: "correction",
      },
    ],
  },
  {
    correction: KOREAN_INPUT,
    snapshot: snapshotOf(KOREAN_INPUT.original),
    turns: [
      {
        kind: "한국어 안내, 다음 말 준비",
        question: "바꿔 달라고 하고 싶은데 뭐라고 해요?",
        scope: "nextLine",
      },
    ],
  },
  {
    correction: KOREAN_INPUT,
    snapshot: snapshotOf(KOREAN_INPUT.original),
    turns: [
      {
        kind: "한국어 안내, 교정 밖",
        question: "가정법 과거는 언제 써요?",
        scope: "offTopic",
      },
    ],
  },
];
