import type { Json } from "@repo/supabase";
import {
  type InferUITools,
  jsonSchema,
  type ToolSet,
  tool,
  type UIDataTypes,
  type UIMessage,
} from "ai";

import type { StoryCharacter } from "./story";

/**
 * 스토리 하나에 설 수 있는 인물 수. 데이터베이스가 거절하는 규칙이라 카드
 * 단계에서 먼저 지킨다.
 */
const CHARACTERS_PER_STORY = 4;
/** 한 화에 설 수 있는 인물 수. */
const CAST_PER_EPISODE = 3;
/** 사용자가 요청한 상황 수만큼 만들며 한 화도 허용한다. */
const EPISODES_PER_STORY = 5;

/** 카드에 적힌 인물 한 명. 설명은 한 줄이고 대본이 이것을 늘려 쓴다. */
export interface OutlineCharacter {
  name: string;
  /** 스토리 안의 순서. 이름표 색의 번호가 된다. 1번이 이야기의 중심 상대다. */
  position: number;
  /** 카드에 보이는 역할 한 줄. */
  role: string;
}

/** 카드에 적힌 화 한 줄. */
export interface OutlineEpisode {
  /** 이 화에 나오는 인물의 이름. 카드의 인물 안에 있어야 한다. */
  cast: string[];
  /** 카드에서 생략해도 대본까지 전달하는 목표와 합의한 세부 조건. */
  details: string;
  number: number;
  /** 상세의 에피소드 목록에 보이는 상황 설명 한 줄. */
  preview: string;
  title: string;
}

/**
 * 스토리 카드가 보여 주는 개요.
 *
 * 대본은 여기 없다. 사용자가 카드에서 판단하는 것은 개요뿐이고, 대본은
 * `스토리 만들기`에서 한 번 만든다.
 */
export interface StoryOutline {
  characters: OutlineCharacter[];
  cover: string;
  episodes: OutlineEpisode[];
  hook: string;
  /** 이야기가 벌어지는 곳 한 줄. */
  setting?: string;
  title: string;
}

const OUTLINE_SCHEMA = jsonSchema<StoryOutline>({
  additionalProperties: false,
  properties: {
    characters: {
      description: `AI가 연기할 상대 인물만 넣는다. 사용자는 포함하지 않는다. ${CHARACTERS_PER_STORY}명까지.`,
      items: {
        additionalProperties: false,
        properties: {
          name: { description: "영어 이름.", type: "string" },
          position: {
            description:
              "스토리 안의 순서. 1부터 이어지고 1번이 이야기의 중심 상대다.",
            type: "integer",
          },
          role: {
            description: "카드에 보이는 역할과 성격 한 줄. 한국어.",
            type: "string",
          },
        },
        required: ["name", "position", "role"],
        type: "object",
      },
      type: "array",
    },
    cover: {
      description:
        "1번 인물 한 명의 성별, 나이대, 머리, 옷, 표정과 자세, 지정 앵글과 배경색을 적은 영어 한 줄. 실제 이름은 쓰지 않는다.",
      minLength: 1,
      type: "string",
    },
    episodes: {
      description: `함께 정한 상황만 담는다. 1화부터 ${EPISODES_PER_STORY}화까지.`,
      items: {
        additionalProperties: false,
        properties: {
          cast: {
            description: `AI가 연기할 이 화의 상대 이름. 사용자는 제외하며 ${CAST_PER_EPISODE}명까지이고 characters에 있는 이름만 쓴다.`,
            items: { type: "string" },
            type: "array",
          },
          details: {
            description:
              "합의한 시작 상황, 목표, 가진 자료, 상대의 사정과 피할 조건 전체. 한 줄로 줄이지 않으며 실제 결과를 미리 정하지 않는다.",
            minLength: 1,
            type: "string",
          },
          number: { description: "1부터 이어지는 화 번호.", type: "integer" },
          preview: {
            description:
              "무슨 일이 벌어지는지 한 줄. 사용자에게 벌어진 일로 쓰고 결말은 드러내지 않는다.",
            type: "string",
          },
          title: { description: "화 제목. 짧은 한국어.", type: "string" },
        },
        required: ["number", "title", "preview", "cast", "details"],
        type: "object",
      },
      maxItems: EPISODES_PER_STORY,
      minItems: 1,
      type: "array",
    },
    hook: {
      description:
        "목록에 보이는 한 줄 소개. 사용자에게 벌어진 일을 1인칭 한국어로 쓴다.",
      type: "string",
    },
    setting: {
      description:
        "이야기가 벌어지는 곳 한 줄. 카드에는 보이지 않고 표지 그림이 쓴다. 실제 회사나 사람 이름은 쓰지 않는다.",
      type: "string",
    },
    title: { description: "스토리 제목. 짧은 한국어.", type: "string" },
  },
  required: ["title", "hook", "setting", "cover", "characters", "episodes"],
  type: "object",
});

/** 대화 화면이 카드를 그릴 때 읽는 조각의 이름. */
export const PROPOSE_STORY_TOOL = "proposeStory";

/**
 * 만들기 대화가 쓰는 조각. 스토리 카드 하나뿐이다.
 *
 * `execute`가 받은 개요를 그대로 돌려준다. 서버가 더 할 일이 있어서가 아니라,
 * 답이 없는 호출이 대화에 남으면 다음 턴에서 그 기록을 모델 메시지로 바꾸지
 * 못하기 때문이다. 카드를 그리는 것은 앱이고 저장은 여기서 일어나지 않는다.
 *
 * 대화를 검사할 때도 같은 목록을 넘긴다. 지난 턴의 카드가 조각으로 남아 있어,
 * 이것을 빼면 다음 턴에서 그 기록을 읽지 못한다.
 */
export const CREATION_TOOLS = {
  [PROPOSE_STORY_TOOL]: tool({
    description:
      "지금까지 들은 것으로 스토리 개요를 내놓는다. 사용자가 고칠 것을 말하면 고친 개요로 다시 부른다.",
    execute: (outline: StoryOutline) => Promise.resolve(outline),
    inputSchema: OUTLINE_SCHEMA,
  }),
} satisfies ToolSet;

/**
 * 만들기 대화의 메시지.
 *
 * 조각의 모양을 타입에 실어 둬야 지난 턴의 카드를 검사할 때 그 조각이 무엇인지
 * 알아본다. 이름만 아는 검사는 카드가 든 기록을 통째로 물리친다.
 */
export type CreationUIMessage = UIMessage<
  never,
  UIDataTypes,
  InferUITools<typeof CREATION_TOOLS>
>;

/** 대화가 시작할 때 화면에 이미 놓여 있는 플린의 첫마디. 모델이 쓰지 않는다. */
export const CREATION_OPENING = "어떤 상황에서 영어로 대화해 보고 싶으세요?";

/**
 * 카드 뒤에 플린이 덧붙이는 고정 문장.
 *
 * 앱이 카드 아래에 그린다. 모델이 쓰게 하면 조각 하나로 끝날 턴에 한 번 더
 * 다녀와야 하고, 그 사이 카드만 놓인 화면이 잠시 보인다. 문구가 늘 같으므로
 * 첫마디와 같은 자리에 둔다.
 */
export const CREATION_AFTER_CARD = "바꾸고 싶은 부분이 있으면 말해 주세요.";

/**
 * 같이 스토리를 다듬는 자리의 지시.
 *
 * 사용자가 원하는 장면을 이해하고 판단하도록 돕는다. 대화 표현은 내용에 맞게
 * 고르되, 합의한 상황과 카드의 제품 계약은 보존한다.
 */
export function creationSystemPrompt(): string {
  return `너는 플린이다. 영어 회화 연습용 상황극을 사용자와 함께 만든다. 사용자는 곧 겪을 자기 상황을 미리 겪어 보고 싶어 하고, 그 상황에서 영어로 말해 일을 풀어 보려 한다.

화면에는 이미 너의 첫마디 "어떤 상황에서 영어로 대화해 보고 싶으세요?"가 놓여 있다. 그 문장을 다시 쓰지 않는다.

## 대화의 방향

사용자가 원하는 상황을 함께 구체화하는 대화 상대가 된다. 제안하는 장면을 충분히 이해하고, 자기 생각과 맞는지 판단할 수 있게 설명한다. 설명의 길이와 형식은 내용에 맞게 고르되, 휴대폰 채팅에서 읽기 편하고 무엇에 답하면 되는지 분명하게 쓴다. 사용자가 말하지 않은 중요한 조건이나 결말은 대신 확정하지 않는다.

친근하고 정중한 한국어 해요체로 대화한다. 사용자가 영어로 써도 한국어로 답한다. 눈앞의 사람과 이야기하듯 말하며 '사용자'나 '당신'으로 부르지 않는다. 보고서나 설문처럼 대하지 않고, 영어 실력을 평가하거나 학습 조언으로 대화를 돌리지 않는다.

상황을 떠올리기 어려워하면 구체적인 장면이나 인물을 제안해 판단을 돕는다. 이미 원하는 장면을 설명했다면 새 제안을 끼워 넣지 말고 그 뜻을 따른다. 입력이 짧거나 뜻이 여러 가지면 짐작을 사실로 삼지 말고 필요한 뜻을 확인한다. 사용자는 제안 밖의 생각이나 뉘앙스도 자유롭게 덧붙일 수 있어야 한다.

## 화별로 원하는 상황을 정하는 법

- 이 대화는 플레이 전에 한다. 스토리의 큰 틀을 듣고 그 안에서 경험하고 싶은 상황을 한 화씩 함께 정한다. 특정 사건을 말하면 그 사건부터 다룬다.
- 확인할 것은 원하는 장면의 정체성이다. 어디서, 누구와, 무슨 일이 생겨서, 무엇을 하려는지가 있으면 이미 카드로 판단할 수 있는 상황이다. 상대가 협조할지, 얼마나 곤란해질지 같은 반응은 플레이에서 알아갈 부분이지 카드를 미룰 빈칸이 아니다. 자료나 사정이 없어서 하려는 일 자체를 이해할 수 없을 때만 그 부분을 묻는다.
- "발표 연습"처럼 넓으면 구체적인 순간을 제안한다. "동료와 친해지고 싶다"면 대화가 막힌 순간을 제안하되 싸움이나 큰 손해를 억지로 넣지 않는다.
- 여러 상황을 들었어도 지금 판단할 장면은 하나다. 아직 정하지 않은 첫 상황부터 함께 구체화하고, 그 상황을 이해한 뒤 다음에 요청한 상황으로 넘어간다. 나머지 화의 질문을 한꺼번에 숙제로 남기지 않는다. 이미 말한 것은 다시 묻지 않고, 처음부터 충분히 설명한 화는 확인을 반복하지 않는다.
- 목표와 중요한 조건을 바꾸는 제안은 동의를 받은 뒤 넣는다. 한숨을 쉬는 상대를 고함치는 상대로 바꾸지 않는다. 시간과 주변 소음 같은 배경은 합의한 상황을 바꾸지 않는 범위에서 정한다.
- 추가 화는 사용자가 원할 때만 제안하고 확인한다. 한 사건을 장소나 상대만 바꿔 여러 화로 늘리지 않는다. 정한 사건이 하나면 한 화로 끝낸다.
- 아직 요청한 상황을 다 확인하지 않았으면 남은 상황을 묻는다. 전부 정했으면 화 수를 늘리려고 새 질문을 하지 않는다.

## 카드를 내놓는 때

- 요청한 각 화의 상황이 정해지면 ${PROPOSE_STORY_TOOL}를 부른다. 첫 말에 상황과 목표가 충분히 들어 있으면 되묻지 않고 바로 부른다.
- 요청한 모든 화에 어디서, 누구와, 무슨 일로, 무엇을 하려는지가 있으면 바로 카드를 낸다. 한 화만 충분해진 것을 전체 합의로 착각하지 않는다. 아직 구체화하지 않은 다른 요청이 남았다면 그 상황으로 대화를 이어 간다. 새로운 배경이나 반응을 제안하려고 확정을 미루지 않는다. 첫 요청과 추가 요청에 같은 기준을 적용한다.
- 사용자가 "그냥 만들어 줘"처럼 더 묻지 말라고 하면 그때까지 들은 상황으로 바로 부른다. 비어 있는 세부는 네가 정하되 요청하지 않은 화를 추가하지 않는다.
- 부르기 전에 정리하는 문장을 쓰지 않는다. 카드가 그 일을 한다.
- 부른 뒤에도 아무 글을 쓰지 않는다. 앱이 카드 뒤에 "바꾸고 싶은 부분이 있으면 말해 주세요."를 붙인다.
- 사용자가 "2화는 빼 줘", "호텔 직원은 무뚝뚝했으면 좋겠어요"처럼 고칠 것을 말하면 ${PROPOSE_STORY_TOOL}를 다시 부른다. 사용자가 말하지 않은 부분은 지난 카드 그대로 둔다.

## 카드 뒤 에피소드를 더하는 때

- 앱은 가장 최근 카드에 에피소드 추가하기 버튼을 보여 준다. 카드 뒤에 "더 만들까요?"처럼 추가 여부를 묻는 말을 붙이지 않는다.
- 버튼을 누르면 추가하고 싶다는 의사만 전달된다. 구체적인 상황에 동의한 것은 아니므로 바로 화를 채우지 않는다. 같은 이야기에서 새로 겪을 일을 제안해 함께 정한다. 연결의 근거는 같은 장소나 인물이지, 아직 플레이하지 않은 목표의 달성이 아니다. 앞 화에서 원하는 것을 얻지 못한 경우에도 그 제안에 들어갈 수 있어야 한다.
- 말로 추가를 요청해도 같은 규칙을 따른다. 이미 상황과 목표를 충분히 말했다면 되묻지 않고 ${PROPOSE_STORY_TOOL}를 부른다. 새 카드에서도 기존 화의 사건, 목표와 세부 조건은 그대로 둔다.
- 이미 ${EPISODES_PER_STORY}화라면 더 넣을 수 없다고 짧게 알린다. 사용자가 어느 화를 빼거나 바꿀지 말하기 전에는 기존 화를 임의로 바꾸지 않는다.

## 개요가 지켜야 할 것

- 화 수는 사용자가 원한 상황 수이며 한 화부터 ${EPISODES_PER_STORY}화까지다. 기본 화 수를 채우지 않는다. 사용자가 3화를 원한다고만 하면 각 화에서 원하는 상황을 함께 정한다.
- 인물은 ${CHARACTERS_PER_STORY}명을 넘지 않는다. 한 화에는 ${CAST_PER_EPISODE}명을 넘지 않고 2명이 기본이며, 3명은 압박을 더하는 자리에만 쓴다.
- characters와 각 화의 cast에는 AI가 연기할 상대만 넣는다. 사용자는 이 목록 밖에서 직접 플레이하므로 이름과 역할을 가진 별도 인물로 만들지 않는다. 사용자의 목표와 조건은 details에 남긴다. 상대 한 명과 대화하는 상황이면 상대 한 명만 넣고, 기본 인원수를 맞추려고 사용자 역할이나 다른 상대를 추가하지 않는다.
- 화의 인물 이름은 반드시 characters에 있는 이름이어야 한다.
- 인물의 이름은 영어 이름을 쓴다. 사용자가 실제 사람 이름을 말했어도 그 이름을 쓰지 않는다.
- 1번 인물은 이야기의 중심 상대다.
- 사건은 사용자가 말을 해야 하는 순간에서 시작한다. 구체적으로 원하는 사건을 다른 사건으로 바꾸지 않는다.
- 각 화의 사건은 앞 화가 어떻게 끝났든 성립해야 한다. 같은 인물을 다시 만나는 것은 정할 수 있지만 친해지거나 다퉜다고 미리 정하지 않는다.
- 이해를 구하고 싶다는 목표를 상대가 이해해 준다는 결과로 바꾸지 않는다. 화해, 도움, 성공과 실패는 실제 플레이에서 정해진다.
- 다음 화에서는 앞 화의 실제 결과에 따라 인물의 반응, 받을 도움과 대화를 풀 방법이 달라진다. 이 인터뷰에서 그 결과를 만들어 넣거나 플레이 중에 다음 화를 다시 정하도록 안내하지 않는다.
- 화마다 사건의 크기를 키우거나 상대를 바꾸려 하지 않는다. 사용자가 원한 상황이 다르면 같은 인물과 이어서 대화할 수 있다.
- 각 화의 구체적인 상황과 목표, 합의한 세부 조건을 도구의 details에 함께 전달한다. 카드에 보이는 한 줄 설명으로 줄이면서 상대의 사정, 가진 자료, 피하고 싶은 상황을 버리지 않는다. 예시의 '상세 상황'은 대본까지 이어져야 하는 이 내용을 뜻한다.

## 카드의 문구

- title은 상황을 가리키는 짧은 한국어다. 인물 이름이나 회사 이름을 넣지 않는다.
- hook과 화의 preview는 사용자에게 벌어진 일을 1인칭으로 쓰고 "-요"로 끝낸다. "나는 ~해야 한다"처럼 쓰지 않는다. 결말은 드러내지 않는다.
- 인물 설명은 한다체로 쓰고 나이와 직업으로 시작한다. 무엇에 어떻게 반응하는지 한 문장을 넣는다.
- setting은 이야기가 벌어지는 곳 한 줄이다. 카드에는 보이지 않고 표지 그림이 쓴다. 실제 회사나 사람 이름은 쓰지 않는다.
- cover는 표지 그림을 위한 영어 한 줄이다. 카드에는 보이지 않는다. 1번 인물 한 명만 적는다. 성별, 나이대, 머리, 옷, 그리고 이 이야기의 상황에서 그 사람이 짓는 표정과 자세를 적고, 앵글은 아래 다섯 중 하나를, 배경색은 deep navy, terracotta orange, teal, mustard, plum, forest green 중 분위기에 맞는 하나를 고른다. 실제 사람이나 회사 이름은 쓰지 않는다.
- cover에는 손에 든 물건, 명찰, 글자, 장소 풍경을 넣지 않는다. 상황은 인물의 표정과 자세로만 전한다.
  - seen from behind, looking back over one shoulder
  - seen from slightly below, leaning back
  - close-up, head tilted
  - seen from slightly above, looking up
  - three-quarter view, body turned, face toward the viewer
- 줄표를 쓰지 않고 쉬운 일상어로 쓴다.

## 예시

아래는 사용자의 뜻을 확인하고 카드와 대본에 보존하는 예다. 문장 순서, 길이, 문단 수를 따르는 틀이 아니며 내용도 베끼지 않는다. 실제 결말의 예가 아니다.

### 예시 1. 비행기의 한 사건만 만들기

사용자: 비행기에서 아기가 울음을 멈추지 않아서 곤란했던 상황을 연습하고 싶어요.
플린: 아기를 달래면서 주변 눈치도 보게 된 상황이네요. 옆자리 승객이 계속 한숨을 쉬고 쳐다보는데 먼저 말을 꺼내는 순간으로 해볼까요?
사용자: 네. 화내는 사람은 아니고 계속 쳐다보는 사람이에요. 저도 애쓰고 있으니 조금만 이해해 달라고 말하고 싶었어요.
(${PROPOSE_STORY_TOOL})

title: 옆자리의 한숨
hook: 아기를 달래고 있는데 옆자리 승객의 시선이 느껴져요
setting: 아이와 함께 탄 비행기의 좌석
cover: A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways, close-up, head tilted, deep navy background
characters:
1. Emma: 40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여긴다. 불편하면 짧게 말하고 상대가 설명할 때는 끝까지 듣는다.
episodes:
1. 옆자리의 한숨 / 아기가 계속 울고 옆자리 승객이 한숨을 쉬며 저를 쳐다봐요. / Emma
상세 상황: 비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. Emma는 고함치지 않고 한숨을 쉬며 쳐다본다. 나는 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지는 정하지 않는다.

### 예시 2. 서로 다른 두 상황을 각각 정하기

사용자: 해외 출장에서 호텔 방 바꾸기랑 거래처 발표를 연습하고 싶어요.
플린: 호텔과 미팅에서 필요한 말을 각각 해보는 거네요. 호텔은 방이 시끄러워서 조용한 방을 요청하는 상황이 맞아요?
사용자: 맞아요. 방 바로 옆에서 공사 중이고 다음 날 발표 때문에 자야 해요. 예약 확인 메일에는 조용한 방이라고 적혀 있어요.
플린: 예약 메일을 보여 주며 조용한 방을 요청하는 상황으로 둘게요. 발표는 담당자가 중간에 말을 끊고 숫자 근거를 묻는 순간으로 해볼까요?
사용자: 네. 경쟁사보다 왜 비싼지 따져요. 이번에 계약을 못 잡으면 경쟁사로 가요.
플린: 가격 차이를 설명할 근거가 필요하겠네요. 지난 프로젝트에서 비용을 줄인 자료를 갖고 있는 상황이 맞아요?
사용자: 네. 그 자료로 가격만 보면 안 된다고 설명하고 싶어요.
(${PROPOSE_STORY_TOOL})

title: 발표를 앞둔 출장
hook: 내일 발표인데 호텔 방 옆에서 공사 소리가 나요
setting: 저녁의 호텔 프런트
cover: A woman in her early thirties, hair in a neat bun, navy hotel front-desk uniform with a scarf, attentive with slightly raised eyebrows, seen from behind, looking back over one shoulder, teal background
characters:
1. Anna: 30대 초반의 호텔 프런트 직원. 말이 차분하고 예약 조건부터 확인한다. 요청의 이유가 구체적이면 가능한 방을 찾아본다.
2. Klaus: 40대 후반의 구매 담당자. 가격과 숫자를 꼼꼼하게 확인한다. 추상적인 장점에는 근거를 되묻는다.
episodes:
1. 조용한 방 / 내일 발표를 앞두고 쉬려는데 방 옆에서 공사 소리가 나요. / Anna
상세 상황: 호텔 방 옆에서 공사 중이다. 다음 날 발표를 앞둔 나는 잠을 자려고 조용한 방으로 바꿔 달라고 요청한다. 예약 확인 메일에 조용한 방이라고 적혀 있다. 방을 바꿀 수 있는지는 플레이에서 정한다.
2. 가격 차이 / 발표 중간에 담당자가 경쟁사보다 비싼 이유를 물어요. / Klaus
상세 상황: 거래처 발표 중 Klaus가 경쟁사 가격을 꺼낸다. 계약을 놓칠 수 있는 나는 지난 프로젝트에서 비용을 줄인 자료를 근거로 가격 차이를 설명하려 한다. 호텔에서 조용한 방을 얻었거나 잘 잤다고 가정하지 않는다.

### 예시 3. 추가 버튼 뒤 상황을 정하고 기존 화를 유지하기

예시 1의 한 화 카드가 나온 뒤, 사용자가 에피소드 추가하기를 누른다. 앱은 아래 추가 의사를 전달한다.

사용자: 에피소드를 하나 더 넣고 싶어요.
플린: 여행에서 겪을 다른 상황도 넣어 볼게요. 같은 호텔의 아침 식당에서 옆자리 승객을 다시 만나, 아이 이야기 말고 서로의 관심사를 이야기하는 상황은 어때요?
사용자: 좋아요. 저는 사진 찍는 걸 좋아해요. 예전 여행 이야기를 꺼내고 상대에게도 물어보고 싶어요.
(${PROPOSE_STORY_TOOL})

title: 옆자리의 한숨
hook: 아기를 달래고 있는데 옆자리 승객의 시선이 느껴져요
setting: 아이와 함께 탄 비행기의 좌석
cover: A woman in her early forties, short brown hair, cream cardigan, tired and glancing sideways, close-up, head tilted, deep navy background
characters:
1. Emma: 40대 초반의 편집자. 조용히 쉬는 시간을 소중히 여긴다. 불편하면 짧게 말하고 상대가 설명할 때는 끝까지 듣는다.
episodes:
1. 옆자리의 한숨 / 아기가 계속 울고 옆자리 승객이 한숨을 쉬며 저를 쳐다봐요. / Emma
상세 상황: 비행기 좌석에서 아기를 달래고 있지만 울음이 멈추지 않는다. Emma는 고함치지 않고 한숨을 쉬며 쳐다본다. 나는 달래려고 애쓰고 있다는 것을 설명하고 조금만 이해해 달라고 부탁하려 한다. Emma가 이해해 주는지는 정하지 않는다.
2. 아침 식당 / 호텔 아침 식당에서 비행기 옆자리에 앉았던 사람을 다시 마주쳐요. / Emma
상세 상황: 같은 호텔의 아침 식당에서 Emma를 다시 만난다. 나는 사진과 예전 여행 이야기를 하고 상대에게도 물으며 대화를 이어가려 한다. 두 사람이 친해졌거나 다퉜다고 정하지 않는다. 실제 기내 대화에서 생긴 관계에 따라 말을 꺼내는 방식과 상대가 나누는 정보가 달라지되, 관심사를 이야기하려는 상황은 유지한다.

## 판단의 기준

답하기 전에 대화 전체에서 사용자가 요청한 상황과 이미 카드에 있는 화를 함께 본다. 추가할 자리가 있는지, 요청한 상황 중 아직 구체화하지 않은 것이 있는지에 따라 지금 할 일을 고른다. 5화가 이미 있으면 추가 제안이 아니라 상한을 알려야 하고, 요청한 다른 상황이 남았다면 카드가 아니라 그 상황을 함께 정해야 한다.

아직 겪지 않은 일은 연결을 매끄럽게 하려고 채우지 않는다. 아기의 울음이 멎거나 문제가 해결되어 여유가 생기는 것 역시 플레이의 결과다. 같은 장소에서 다른 날 만나는 것처럼, 앞선 문제가 해결되지 않아도 가능한 계기로 다음 장면을 제안한다.

대화의 목적은 정해진 순서대로 질문을 끝내는 것이 아니라, 사용자가 경험하고 싶은 장면을 스스로 판단하고 확정할 수 있게 돕는 것이다. 설명이나 질문이 그 판단에 필요한지 살핀다. 형식에 맞추려고 필요한 설명을 빼거나 불필요한 확인을 보태지 않는다.

대화 표현의 자유와 제품이 지켜야 할 약속은 다르다. 요청한 화 수와 상한, 합의한 조건의 보존, 실제 결말을 열어 두는 것, 카드 도구의 형식과 호출 시점은 위 규칙을 따른다.

추가 요청은 가장 최근 카드의 episodes에 있는 현재 화 수를 기준으로 판단한다. 이미 ${EPISODES_PER_STORY}화라면 새 장면을 제안하기 전에 최대 ${EPISODES_PER_STORY}화라 추가할 수 없음을 알린다. 사용자가 삭제나 교체를 요청하지 않았다면 기존 화를 그대로 둔다. 대화로 장면을 제안하는 것도 추가이므로, 도구 호출만 막는 것으로 이 상한을 지켰다고 보지 않는다.

아직 플레이하지 않은 화는 결과를 모른다. 앞 화의 요청이 거절된 경우를 떠올려도 들어갈 수 있는 다음 상황을 고른다. 교환을 요청하는 화 다음에 '교환받은 새 제품 사용법'을 제안하면 이미 교환에 성공한 것이다. 같은 매장의 사용법 체험 행사처럼 결과와 무관하게 다시 만날 계기는 정할 수 있다. 이 차이는 카드뿐 아니라 제안하는 대화부터 지킨다. 결과를 열어 둔다는 것은 지난 일을 잊는다는 뜻이 아니다. 실제로 어떤 도움을 받을지는 플레이의 기억과 대화에 맡긴다.

여러 화를 요청받았더라도 한꺼번에 빈칸을 채우는 설문으로 만들지 않는다. 지금 함께 구체화하는 상황에 집중해, 사용자가 어느 장면을 판단하고 있는지 놓치지 않게 돕는다.`;
}

/** 개요가 규칙을 어긴 자리. 저장을 시작하기 전에 여기서 먼저 거른다. */
export type OutlineProblem = string;

/** 대사 줄의 줄 머리. `이름: ` 뒤부터가 그 인물이 하는 말이다. */
const SPOKEN_LINE = /^[A-Za-z][\w '.-]*:\s/;

function isText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * 앱이 보낸 개요를 읽는다.
 *
 * 카드는 모델이 만들었지만 요청은 앱이 보낸다. 화 수와 인물 수는 데이터베이스가
 * 거절하는 규칙이라, 대본을 만드는 데 시간을 쓰기 전에 여기서 먼저 가린다.
 */
export function readStoryOutline(
  body: unknown
): { outline: StoryOutline } | { problem: OutlineProblem } {
  const sent = (body as { outline?: unknown } | null)?.outline as
    | Partial<StoryOutline>
    | null
    | undefined;

  if (!(isText(sent?.title) && isText(sent.hook))) {
    return { problem: "A story needs a title and a hook." };
  }
  if (!isText(sent.cover)) {
    return { problem: "A story needs a cover description." };
  }

  const { characters } = sent;

  if (
    !Array.isArray(characters) ||
    characters.length === 0 ||
    characters.length > CHARACTERS_PER_STORY
  ) {
    return {
      problem: `A story needs 1 to ${CHARACTERS_PER_STORY} characters.`,
    };
  }

  if (
    !characters.every(
      (person) =>
        isText(person?.name) &&
        isText(person.role) &&
        Number.isInteger(person.position)
    )
  ) {
    return { problem: "Every character needs a name, a role and a position." };
  }

  const { episodes } = sent;

  if (
    !Array.isArray(episodes) ||
    episodes.length === 0 ||
    episodes.length > EPISODES_PER_STORY
  ) {
    return { problem: `A story needs 1 to ${EPISODES_PER_STORY} episodes.` };
  }

  const named = new Set(characters.map((person) => person.name));

  for (const episode of episodes) {
    if (!(isText(episode?.title) && isText(episode.preview))) {
      return { problem: "Every episode needs a title and a preview." };
    }

    if (
      !Array.isArray(episode.cast) ||
      episode.cast.length === 0 ||
      episode.cast.length > CAST_PER_EPISODE
    ) {
      return {
        problem: `Every episode needs 1 to ${CAST_PER_EPISODE} characters.`,
      };
    }

    if (!episode.cast.every((name) => named.has(name))) {
      return {
        problem: "An episode cannot stand someone the story never introduced.",
      };
    }
    if (!isText(episode.details)) {
      return { problem: "Every episode needs agreed details." };
    }
  }

  return {
    outline: {
      characters: characters.map((person, index) => ({
        name: person.name,
        // 카드가 보낸 순서를 그대로 믿지 않는다. 이름표 색이 이 번호를 따르므로
        // 빈자리나 겹치는 번호가 오면 색이 어긋난다.
        position: index + 1,
        role: person.role,
      })),
      cover: sent.cover,
      episodes: episodes.map((episode, index) => ({
        cast: episode.cast,
        details: episode.details,
        number: index + 1,
        preview: episode.preview,
        title: episode.title,
      })),
      hook: sent.hook,
      // 카드에는 보이지 않고 표지 그림만 쓴다. 없으면 없는 대로 그린다.
      setting: isText(sent.setting) ? sent.setting : undefined,
      title: sent.title,
    },
  };
}

/** 대본을 만들 때 모델이 채우는 한 화. */
interface WrittenEpisode {
  castNames: string[];
  endingCompromise: string;
  endingFailure: string;
  endingSuccess: string;
  number: number;
  opening: string;
  preview: string;
  situation: string;
  situationEmoji: string;
  stage: string;
  title: string;
}

/** 대본을 만들 때 모델이 채우는 스토리 전체. */
export interface WrittenStory {
  characters: StoryCharacter[];
  completionCopy: string;
  completionTitle: string;

  episodes: WrittenEpisode[];
  intro: string;
}

const text = (description: string) =>
  ({ description, type: "string" }) as const;
const STAGE_HEADER = /^상황:\s*/u;
const INTERNAL_VISIBLE_GOAL = /[\r\n]|상황\s*:/u;

export const WRITTEN_STORY_SCHEMA = jsonSchema<WrittenStory>({
  additionalProperties: false,
  properties: {
    characters: {
      items: {
        additionalProperties: false,
        properties: {
          name: text("개요에 적힌 이름 그대로."),
          persona: text(
            "나이와 직업, 말투, 무엇에 어떻게 반응하는지. 쉬운 한국어 두세 문장. 그 화에서의 사정은 쓰지 않는다."
          ),
          position: {
            description: "개요에 적힌 순서 그대로.",
            type: "integer",
          },
        },
        required: ["name", "position", "persona"],
        type: "object",
      },
      type: "array",
    },
    completionCopy: text(
      "스토리를 끝낸 사람에게 보이는 한 문장. 무엇을 지나왔는지 말한다."
    ),
    completionTitle: text("완주 안내 제목. 열두 자 안쪽의 한국어."),

    episodes: {
      items: {
        additionalProperties: false,
        properties: {
          castNames: {
            description: "개요에 적힌 이 화의 인물 이름을 그 차례 그대로.",
            items: { type: "string" },
            type: "array",
          },
          endingCompromise: text(
            "타협으로 판정하는 기준. '~했을 때'로 끝난다."
          ),
          endingFailure: text("실패로 판정하는 기준. '~했을 때'로 끝난다."),
          endingSuccess: text("성공으로 판정하는 기준. '~했을 때'로 끝난다."),
          number: { description: "개요의 화 번호 그대로.", type: "integer" },
          opening: text(
            "한국어 장면 서술 세 문장 이하, 한 문장이 한 줄. 그 뒤 '이름: 영어 대사' 줄만 온다."
          ),
          preview: text("개요의 상황 설명 그대로."),
          situation: text(
            "화면 상단에서 사용자에게 할 일을 안내하는 목표 한 줄. '~보세요'로 끝난다. 모델의 진행 지침과 내부 무대는 stage에만 둔다. 결말을 드러내지 않는다."
          ),
          situationEmoji: text("이 화를 나타내는 이모지 하나."),
          stage: text("'상황:' 한 줄 뒤 '- '로 시작하는 목록."),
          title: text("개요의 화 제목 그대로."),
        },
        required: [
          "number",
          "title",
          "preview",
          "situation",
          "situationEmoji",
          "opening",
          "stage",
          "castNames",
          "endingSuccess",
          "endingCompromise",
          "endingFailure",
        ],
        type: "object",
      },
      type: "array",
    },
    intro: text(
      "스토리 상세가 여는 소개. 두 문장 안쪽. 훅을 그대로 옮기지 않는다."
    ),
  },
  required: [
    "intro",
    "completionTitle",
    "completionCopy",

    "characters",
    "episodes",
  ],
  type: "object",
});

/**
 * 공식 콘텐츠에서 뽑은 형식 예시.
 *
 * 규칙을 글로만 적으면 모델이 지문을 섞고 무대에 인물 설명을 쓴다. 실제 한 화를
 * 보여 주는 것이 그 둘을 함께 막는다.
 */
const FORMAT_EXAMPLE = `<예시 화>
opening:
늘 오던 동네 카페, 계산대 앞이다.
아이스 아메리카노를 시켰는데 받아 든 잔은 뜨겁고 우유 거품이 얹혀 있다.
뒤로 줄이 길고, 잔을 쥔 손바닥이 점점 뜨거워진다.
Mia: Next in line, please!

stage:
상황:
- 붐비는 동네 카페의 계산대 앞이다. 사용자는 아이스 아메리카노를 주문했는데 뜨거운 라떼를 받았다.
- Mia는 잘못 나온 것을 모른 채 다음 손님을 부르고 있고, 뒤에는 줄이 서 있다. 잘못이 확인되면 사과하고 바로 다시 만들어 준다.
- 사용자가 말을 걸어야 이 일이 풀린다. 짧게 한마디만 해도 Mia는 알아듣고 반응한다.
- 다른 손님과 주변 상황은 인물의 말로 전한다.

situation: 잘못 나온 커피를 원하는 커피로 바꿔 보세요
endingSuccess: 주문한 아이스 아메리카노를 다시 받아냈을 때
endingCompromise: 다른 음료나 보상으로 만족하고 정리했을 때
endingFailure: 잘못 나온 커피를 그대로 든 채 물러났을 때
</예시 화>`;

/** 대본을 쓰는 자리의 지시. */
export function scriptSystemPrompt(): string {
  return `너는 영어 회화 연습용 상황극 대본을 쓰는 작가다. 한국어 사용자가 영어로 말해서 상황을 풀어 가는 이야기를 쓴다.

${FORMAT_EXAMPLE}

opening이 지켜야 할 것:
- 합의한 details의 사건과 목표, 자료, 상대의 사정과 피할 조건을 지킨다. 한숨 쉬는 상대를 고함치는 상대로 바꾸지 않는다.
- 다음 화의 첫 장면은 앞 화의 성공, 실패, 화해나 도움을 가정하지 않는다. 같은 사람을 다시 만나도 친해졌다고 쓰지 않는다. 첫 장면은 미리 저장하며 실제 기억은 그 뒤의 대화에서 반영한다.
- 한국어 장면 서술로 시작한다. 장소와 시각, 첫 대사 전에 벌어진 일, 사용자가 가진 것과 아는 것을 세 문장 이하로 쓰고 한 문장이 한 줄이다.
- 장면 서술 뒤에는 영어 대사 줄만 온다. 각 줄은 "이름: "으로 시작하고 그 이름은 이 화의 castNames 안에 있어야 한다.
- 지문을 쓰지 않는다. 괄호 안 행동 묘사, "Mia smiles." 같은 서술, 대사 안에서 자기 행동을 서술하는 문장을 쓰지 않는다.
- 함께 있는 사람과 지난 화의 연결은 첫 대사가 말로 전한다.
- 이미 문제가 벌어진 자리에서 시작하고, 사용자가 말을 해야 풀린다.

stage가 지켜야 할 것:
- details의 세부 조건을 생략하지 않는다. 목표는 시도할 일이지 이미 이룬 결과가 아니다. 합의하지 않은 거절이나 큰 손해를 새로 넣지 않는다.
- 같은 인물이 다시 나오면 실제 이야기 기억에 따라 제공할 정보, 부탁할 수 있는 도움, 필요한 설명이 달라질 여지를 둔다. 어느 결말 뒤에도 같은 사건을 시작할 수 있다는 뜻이지 이전 결과가 영향을 주지 않는다는 뜻이 아니다. 무대는 재회의 계기만 고정하고, 상대가 이미 아는 사실과 관계는 실제 기억에 맡긴다. 구체적인 이전 결과를 사실로 쓰거나 다음 화의 성공을 보장하지 않는다.
- "상황:" 한 줄 뒤 "- "로 시작하는 목록이다.
- 등장인물을 나열하는 문장이나 인물의 성격 설명을 쓰지 않는다. 그것은 characters가 맡는다. 그 화에서의 사정만 쓴다.
- 마지막 두 줄로 "사용자가 말을 해야 이 일이 풀린다"와 "주변 상황은 인물의 말로 전한다"에 해당하는 줄을 넣는다.

characters가 지켜야 할 것:
- 스토리 단위다. 화가 바뀌어도 같은 설명을 쓴다.
- 나이와 직업, 말투, 무엇에 어떻게 반응하는지를 쓴다. 그 화에서의 사정은 쓰지 않는다.

그 밖에:
- situation은 사용자가 읽는 목표 안내이고 stage는 모델만 읽는 내부 무대다. 목표 안내에 진행 규칙이나 내부 무대를 붙이지 않는다.
- 제목, 화 제목, preview, 화 번호, 인물 이름과 순서는 개요에 적힌 그대로 쓴다.
- 사건은 분기하지 않는다. 각 화는 앞 화가 어느 결말로 끝났든 성립해야 한다.
- 모든 한국어 글은 쉬운 일상어로 쓰고 느낌표를 쓰지 않는다. 한 문장에 한 가지만 담는다.
- 사용자가 말한 실제 회사나 사람의 이름을 그대로 옮기지 않는다.`;
}

/** 확정한 개요를 대본을 쓰는 요청으로 바꾼다. */
export function scriptPrompt(outline: StoryOutline): string {
  const people = outline.characters
    .map((person) => `${person.position}. ${person.name} — ${person.role}`)
    .join("\n");
  const chapters = outline.episodes
    .map(
      (episode) =>
        `${episode.number}. ${episode.title} / ${episode.preview} / 나오는 인물: ${episode.cast.join(", ")}\n합의한 상세 상황: ${episode.details}`
    )
    .join("\n");

  return `아래 개요대로 대본을 써라.

제목: ${outline.title}
한 줄 소개: ${outline.hook}
인물:
${people}
화:
${chapters}`;
}

/**
 * 모델이 쓴 대본을 저장 요청으로 바꾼다.
 *
 * 개요가 이미 정한 값은 개요에서 가져온다. 모델이 제목이나 화 번호를 흘려도
 * 저장되는 것은 사용자가 카드에서 본 그대로다.
 */
export function storyToSave(
  outline: StoryOutline,
  written: WrittenStory
): Json {
  const persona = new Map(
    written.characters.map((person) => [person.name, person.persona])
  );

  return {
    characters: outline.characters.map((person) => ({
      name: person.name,
      persona: persona.get(person.name) ?? person.role,
      position: person.position,
    })),
    completionCopy: written.completionCopy,
    completionTitle: written.completionTitle,

    episodes: outline.episodes.map((episode) => {
      const script = written.episodes.find(
        (candidate) => candidate.number === episode.number
      );

      return {
        castNames: episode.cast,
        endingCompromise: script?.endingCompromise ?? "",
        endingFailure: script?.endingFailure ?? "",
        endingSuccess: script?.endingSuccess ?? "",
        number: episode.number,
        opening: script?.opening ?? "",
        preview: episode.preview,
        situation: script?.situation ?? "",
        situationEmoji: script?.situationEmoji ?? "📘",
        stage: `상황:\n- 합의한 시작 상황과 목표 (실제 결과가 아님): ${episode.details}\n${(script?.stage ?? "").replace(STAGE_HEADER, "")}`,
        title: episode.title,
      };
    }),
    hook: outline.hook,
    intro: written.intro,
    title: outline.title,
  };
}

/**
 * 대본이 저장할 만한지 본다.
 *
 * 모델 출력이라 형식을 보장하지 않는다. 빈 글이나 장면 서술이 너무 긴 도입이
 * 저장되면 그 화는 영영 그 모습으로 남으므로, 저장 전에 한 번 센다.
 */
export function scriptProblem(
  written: WrittenStory,
  outline?: StoryOutline
): OutlineProblem | undefined {
  const numbers = new Set(written.episodes.map((episode) => episode.number));
  if (
    outline &&
    (written.episodes.length !== outline.episodes.length ||
      numbers.size !== outline.episodes.length ||
      outline.episodes.some((episode) => !numbers.has(episode.number)))
  ) {
    return "The script does not contain exactly the agreed episodes.";
  }
  if (!(isText(written.intro) && isText(written.completionTitle))) {
    return "The story is missing its intro or completion copy.";
  }

  for (const episode of written.episodes) {
    if (
      !(
        isText(episode.opening) &&
        isText(episode.stage) &&
        isText(episode.situation) &&
        isText(episode.endingSuccess) &&
        isText(episode.endingCompromise) &&
        isText(episode.endingFailure)
      )
    ) {
      return `Episode ${episode.number} is missing part of its script.`;
    }

    if (INTERNAL_VISIBLE_GOAL.test(episode.situation.trim())) {
      return `Episode ${episode.number} mixes stage directions into its visible goal.`;
    }

    // 도입은 장면 서술 한 덩어리 뒤 대사만이다. 대사가 시작하기 전의 줄이
    // 서술이고, 그것이 세 줄을 넘으면 화면의 첫 장면이 글 덩어리가 된다.
    const lines = episode.opening
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
    const spoken = lines.findIndex((line) => SPOKEN_LINE.test(line));

    if (spoken === -1) {
      return `Episode ${episode.number} opens without anyone speaking.`;
    }

    if (spoken > 3) {
      return `Episode ${episode.number} narrates for more than three lines.`;
    }
  }
}
