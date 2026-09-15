import type { StoryOutline } from "../src/features/episode/story-creation";
import type { CreationExpectation } from "./story-creation-checks";

export interface CreationCase {
  history?: { content: string; role: "user" | "assistant" }[];
  name: string;
  seed?: StoryOutline;
  turns: ({ question: string } & CreationExpectation)[];
}

const repair: StoryOutline = {
  characters: [
    {
      name: "Noah",
      position: 1,
      role: "30대 매장 직원. 증거를 먼저 확인한다. 영수증이 있으면 가능한 절차를 설명한다.",
    },
  ],
  cover:
    "A man in his thirties, curly black hair, green shirt, attentive, seen from slightly above, looking up, plum background",
  episodes: [
    {
      cast: ["Noah"],
      details:
        "어제 산 커피 머신에서 물이 샌다. 구매 영수증과 누수 영상을 갖고 매장 직원에게 새 제품으로 교환을 요청한다. 직원은 화내지 않으며 교환 결과는 아직 모른다.",
      number: 1,
      preview: "어제 산 커피 머신에서 물이 새서 교환하고 싶어요",
      title: "물이 새는 기계",
    },
  ],
  hook: "산 지 하루 된 커피 머신에서 물이 새요",
  setting: "가전 매장의 반품 창구",
  title: "새 커피 머신",
};
const second = {
  cast: ["Noah"],
  details:
    "다른 날 매장의 체험 코너에서 Noah를 만난다. 우유 거품을 내는 법을 물어본다. 새 제품을 얻었는지는 가정하지 않는다.",
  number: 2,
  preview: "매장의 체험 코너에서 우유 거품을 내는 법을 물어보고 싶어요",
  title: "사용법 묻기",
};

const FIRST_DAY =
  "해외 회사 첫 팀 회의에서 경력과 맡을 일을 영어로 소개하고 싶어요. 경력직인데 영어가 서툴러서 긴장돼요.";
const OFFER =
  "이어서 회사 식당에서 동료와 점심을 먹으며 취미를 물어보는 상황도 해 볼까요? 자기소개 에피소드만 만들어도 좋아요.";
const OFFER_HISTORY: NonNullable<CreationCase["history"]> = [
  { content: FIRST_DAY, role: "user" },
  { content: OFFER, role: "assistant" },
];

export const CREATION_CASES: CreationCase[] = [
  {
    name: "첫 출근의 제안 뒤 조건을 덧붙이기",
    turns: [
      { proposes: true, question: FIRST_DAY, unresolved: true },
      {
        episodes: 2,
        question:
          "회사 식당에서 동료에게 취미 이야기를 제가 먼저 꺼내고 싶어요. 업무 얘기는 피하고 싶어요.",
      },
    ],
  },
  {
    history: OFFER_HISTORY,
    name: "충분한 제안에 짧게 동의하면 바로 카드",
    turns: [{ episodes: 2, question: "좋아요" }],
  },
  {
    history: OFFER_HISTORY,
    name: "제안 대신 다른 사건을 말하면 그 사건만 추가",
    turns: [
      {
        episodes: 2,
        question:
          "점심 말고 사무실에서 동료에게 복사기 사용법을 묻고 싶어요. 양면 복사를 해야 해요.",
      },
    ],
  },
  {
    history: OFFER_HISTORY,
    name: "추가 의사만 있고 사건이 불분명하면 필요한 뜻 확인",
    turns: [
      { asks: true, question: "점심 말고 다른 일을 해보고 싶어요." },
      {
        episodes: 2,
        question: "사무실에서 동료에게 복사기 양면 복사 방법을 물어볼래요.",
      },
    ],
  },
  {
    history: OFFER_HISTORY,
    name: "자연스러운 추가 거절은 이유를 묻지 않고 카드",
    turns: [{ episodes: 1, question: "지금은 자기소개만 할게요" }],
  },
  {
    name: "사고 정보 교환에서 사용자를 별도 인물로 만들지 않기",
    turns: [
      {
        characters: 1,
        episodes: 1,
        question:
          "고속도로에서 사고가 났어요. 상대 운전자와 연락처와 보험 정보를 교환하는 상황을 한 에피소드만 연습하고 싶어요.",
      },
    ],
  },
  {
    name: "육아 갈등에서 원하는 상황 함께 찾기",
    turns: [{ asks: true, question: "어제 와이프랑 육아 문제로 싸웠어" }],
  },
  {
    name: "짧게 끊긴 입력 뒤 추가 인터뷰",
    turns: [
      { asks: true, question: "비" },
      {
        episodes: 1,
        question:
          "My baby keeps crying on a plane. The passenger next to me sighs and looks at us but does not shout. I want to explain I am trying and ask for understanding. Make only this one episode.",
      },
      {
        asks: true,
        question: "에피소드를 하나 더 넣고 싶어요.",
        unresolved: true,
      },
    ],
  },
  {
    name: "충분한 첫 사건 뒤 제안과 자연스러운 거절",
    turns: [
      {
        proposes: true,
        question:
          "어제 산 커피 머신에서 물이 새요. 영수증과 누수 영상을 보여 주며 매장 직원에게 교환을 요청하는 상황을 연습하고 싶어요. 직원은 화내지 않아요.",
        unresolved: true,
      },
      { episodes: 1, question: "아니요, 일단 교환 요청만 연습할래요." },
    ],
  },
  {
    name: "모호한 첫 말과 그냥 만들기",
    turns: [
      { asks: true, question: "해외 생활을 연습하고 싶어요." },
      { episodes: 1, question: "그냥 만들어 줘." },
    ],
  },
  {
    name: "비행기 회귀",
    turns: [
      {
        asks: true,
        question:
          "비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.",
      },
      {
        proposes: true,
        question:
          "옆자리 사람이 한숨을 쉬며 계속 쳐다봐요. 화내지는 않아요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶어요.",
        unresolved: true,
      },
      { episodes: 1, question: "그냥 만들어 줘." },
    ],
  },
  {
    name: "서로 다른 두 상황",
    turns: [
      {
        question:
          "해외에서 집주인과 수리 얘기하기랑 동네 모임에서 인사하기를 연습하고 싶어요.",
      },
      {
        question:
          "집은 난방이 고장 났고 사진과 온도 기록이 있어요. 집주인에게 이번 주 안에 수리해 달라고 부탁하고 싶어요.",
      },
      {
        episodes: 2,
        question:
          "동네 모임에서 처음 만난 이웃과 주말 취미 얘기를 해보고 싶어요. 저는 자전거 타기를 좋아해요. 두 상황은 이것으로 만들어 줘.",
      },
    ],
  },
  {
    name: "추가 의사 뒤 합의",
    seed: repair,
    turns: [
      {
        asks: true,
        question: "에피소드를 하나 더 넣고 싶어요.",
        unresolved: true,
      },
      {
        episodes: 2,
        preserve: [1],
        question:
          "같은 매장에서 다른 날 Noah를 만나 우유 거품을 내는 법을 물어보고 싶어요. 아직 교환에 성공했는지는 모르니 그 결과를 정하지 말아줘.",
      },
    ],
  },
  {
    name: "구체적인 추가",
    seed: repair,
    turns: [
      {
        episodes: 2,
        preserve: [1],
        question:
          "다른 날 같은 매장에서 Noah에게 우유 거품을 내는 법을 묻는 상황을 하나 더 넣어 줘. 교환 결과와 무관하게 매장 체험 코너에 갈 거예요.",
      },
    ],
  },
  {
    name: "한 화만 수정",
    seed: { ...repair, episodes: [...repair.episodes, second] },
    turns: [
      {
        episodes: 2,
        preserve: [2],
        question:
          "1화 목표만 교환이 아니라 환불로 바꿔줘. 다른 조건과 2화는 그대로 둬.",
      },
    ],
  },
  {
    name: "상한과 삭제 뒤 재추가",
    seed: {
      ...repair,
      episodes: [
        ...repair.episodes,
        second,
        ...[3, 4, 5].map((number) => ({
          cast: ["Noah"],
          details: `${number}번째 매장 방문에서 원두 ${number}번의 맛을 묻는다. 이전 구매 결과를 가정하지 않는다.`,
          number,
          preview: "매장에서 다른 원두의 맛을 물어보고 싶어요",
          title: `${number}번째 방문`,
        })),
      ],
    },
    turns: [
      { atLimit: true, question: "에피소드를 하나 더 넣고 싶어요." },
      { episodes: 4, preserve: [1, 2, 3, 4], question: "5화를 빼 줘." },
      {
        episodes: 5,
        preserve: [1, 2, 3, 4],
        question:
          "커피 머신을 청소하는 법을 같은 매장 직원에게 묻는 상황을 한 화 추가해 줘. 세척제를 얼마나 넣어야 할지 모르겠어요.",
      },
    ],
  },
];
