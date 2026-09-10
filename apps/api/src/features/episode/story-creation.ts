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
/** 스토리 하나의 화 수 상한. 기본값은 프롬프트가 3화로 잡는다. */
const EPISODES_PER_STORY = 5;

/** 카드에 적힌 인물 한 명. 설명은 한 줄이고 각본이 이것을 늘려 쓴다. */
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
  number: number;
  /** 상세의 에피소드 목록에 보이는 상황 설명 한 줄. */
  preview: string;
  title: string;
}

/**
 * 스토리 카드가 보여 주는 개요.
 *
 * 각본은 여기 없다. 사용자가 카드에서 판단하는 것은 개요뿐이고, 각본은
 * `대화 시작하기`에서 한 번 만든다.
 */
export interface StoryOutline {
  characters: OutlineCharacter[];
  episodes: OutlineEpisode[];
  hook: string;
  title: string;
}

const OUTLINE_SCHEMA = jsonSchema<StoryOutline>({
  additionalProperties: false,
  properties: {
    characters: {
      description: `스토리에 사는 인물. ${CHARACTERS_PER_STORY}명까지.`,
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
    episodes: {
      description: `화 목록. 기본 3화이고 ${EPISODES_PER_STORY}화까지.`,
      items: {
        additionalProperties: false,
        properties: {
          cast: {
            description: `이 화에 나오는 인물의 이름. ${CAST_PER_EPISODE}명까지이고 characters에 있는 이름만 쓴다.`,
            items: { type: "string" },
            type: "array",
          },
          number: { description: "1부터 이어지는 화 번호.", type: "integer" },
          preview: {
            description:
              "무슨 일이 벌어지는지 한 줄. 사용자에게 벌어진 일로 쓰고 결말은 드러내지 않는다.",
            type: "string",
          },
          title: { description: "화 제목. 짧은 한국어.", type: "string" },
        },
        required: ["number", "title", "preview", "cast"],
        type: "object",
      },
      type: "array",
    },
    hook: {
      description:
        "목록에 보이는 한 줄 소개. 사용자에게 벌어진 일을 1인칭 한국어로 쓴다.",
      type: "string",
    },
    title: { description: "스토리 제목. 짧은 한국어.", type: "string" },
  },
  required: ["title", "hook", "characters", "episodes"],
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
export const CREATION_OPENING = "어떤 상황을 만들고 싶어요?";

/**
 * 카드 뒤에 플린이 덧붙이는 고정 문장.
 *
 * 앱이 카드 아래에 그린다. 모델이 쓰게 하면 조각 하나로 끝날 턴에 한 번 더
 * 다녀와야 하고, 그 사이 카드만 놓인 화면이 잠시 보인다. 문구가 늘 같으므로
 * 첫마디와 같은 자리에 둔다.
 */
export const CREATION_AFTER_CARD = "고칠 게 있으면 말해 주세요.";

/**
 * 같이 스토리를 다듬는 자리의 지시.
 *
 * 진단이나 설문을 하지 않는 것이 이 프롬프트의 전부다. 사용자는 연습할 곳을
 * 신고하는 사람이 아니라 상황을 만드는 사람이므로, 플린이 먼저 사건과 인물을
 * 구체적으로 던지고 그것이 맞는지 묻는다.
 */
export function creationSystemPrompt(): string {
  return `너는 영어 회화 연습용 상황극을 사용자와 함께 만드는 사람이다. 사용자는 곧 겪을 자기 상황을 미리 겪어 보고 싶어 한다.

화면에는 이미 너의 첫마디 "${CREATION_OPENING}"가 놓여 있다. 그 문장을 다시 쓰지 않는다.

대화하는 방법:
- 한국어로 말한다. 사용자가 영어로 써도 한국어로 답한다.
- 진단이나 설문을 하지 않는다. 어디서, 누구와, 무엇이 걱정인지 순서대로 묻지 않는다.
- 사용자가 말한 상황에서 먼저 사건과 인물을 구체적으로 제안한다. 발표 상황이면 "발표 중간에 담당자가 말을 끊고 숫자 근거를 묻는 장면" 같은 것을 던지고 그것이 맞는지 묻는다.
- 한 번에 하나만 묻는다. 사용자가 뉘앙스를 덧붙일 수 있게 열린 질문으로 묻는다.
- 짧게 말한다. 서너 문장 안에서 끝낸다.
- 사용자를 가르치지 않는다. 영어 실력을 평가하거나 학습 조언을 하지 않는다.

카드를 내놓는 때:
- 사건 하나와 상대 하나가 정해지면 ${PROPOSE_STORY_TOOL}를 부른다. 보통 두세 번 오간 뒤다.
- 사용자가 "그냥 만들어 줘"처럼 더 묻지 말라고 하면, 그때까지 들은 것으로 바로 부른다. 모자란 것은 네가 정한다.
- 부르기 전에 정리하는 문장을 쓰지 않는다. 카드가 그 일을 한다.
- 부른 뒤에도 아무 글을 쓰지 않는다. 카드 뒤에 붙는 말은 앱이 이미 가지고 있다.
- 사용자가 "2화는 빼 줘", "호텔 직원은 무뚝뚝했으면 좋겠어요"처럼 고칠 것을 말하면 ${PROPOSE_STORY_TOOL}를 다시 부른다. 사용자가 말하지 않은 부분은 지난 카드 그대로 둔다.

개요가 지켜야 할 것:
- 화는 기본 3화이고 ${EPISODES_PER_STORY}화를 넘지 않는다. 사용자가 늘리거나 줄이라고 하면 그 안에서 따른다.
- 인물은 ${CHARACTERS_PER_STORY}명을 넘지 않는다. 한 화에는 ${CAST_PER_EPISODE}명을 넘지 않고 2명이 기본이며, 3명은 압박을 더하는 자리에만 쓴다.
- 화의 인물 이름은 반드시 characters에 있는 이름이어야 한다.
- 인물의 이름은 영어 이름을 쓴다. 사용자가 실제 사람 이름을 말했어도 그 이름을 쓰지 않는다.
- 사건은 이미 문제가 벌어진 자리에서 시작하고, 사용자가 영어로 말을 해야 풀린다.
- 각 화의 사건은 앞 화가 어떻게 끝났든 성립해야 한다.

카드의 문구는 아래 예와 같은 말투로 쓴다. 줄표를 쓰지 않고 쉬운 일상어로 쓴다.

<예시 카드>
title: 출장 일주일
hook: 첫 해외 출장인데, 호텔에 제 예약이 없대요
characters:
1. Anna — 30대 초반의 호텔 프런트 직원. 차분하고 일 처리가 정확하다. 근거가 보이면 방법을 끝까지 찾아 준다.
2. Daniel — 30대 중반의 현지 동료. 무뚝뚝한 척해도 챙길 것은 챙긴다.
episodes:
1. 예약이 없는 밤 / 밤늦게 호텔에 도착했는데 제 이름으로 된 예약이 없대요. / Anna
2. 미팅 시간이 바뀌었어요 / 아침에 일어나 보니 미팅이 두 시간 앞당겨져 있어요. / Daniel, Anna
</예시 카드>

- title은 상황을 가리키는 짧은 한국어다. 인물 이름이나 회사 이름을 넣지 않는다.
- hook과 화의 preview는 사용자에게 벌어진 일을 1인칭으로 쓰고 "-요"로 끝낸다. "나는 ~해야 한다"처럼 쓰지 않는다.
- 인물 설명은 한다체로 쓰고, 나이와 직업으로 시작한다.`;
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
 * 거절하는 규칙이라, 각본을 만드는 데 시간을 쓰기 전에 여기서 먼저 가린다.
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
      episodes: episodes.map((episode, index) => ({
        cast: episode.cast,
        number: index + 1,
        preview: episode.preview,
        title: episode.title,
      })),
      hook: sent.hook,
      title: sent.title,
    },
  };
}

/** 각본을 만들 때 모델이 채우는 한 화. */
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

/** 각본을 만들 때 모델이 채우는 스토리 전체. */
export interface WrittenStory {
  characters: StoryCharacter[];
  completionCopy: string;
  completionTitle: string;
  coverEmoji: string;
  episodes: WrittenEpisode[];
  intro: string;
}

const text = (description: string) =>
  ({ description, type: "string" }) as const;

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
    coverEmoji: text("이 스토리를 나타내는 이모지 하나."),
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
            "사용자가 할 일을 말하는 한 줄. '~보세요'로 끝난다. 결말을 드러내지 않는다."
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
    "coverEmoji",
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

/** 각본을 쓰는 자리의 지시. */
export function scriptSystemPrompt(): string {
  return `너는 영어 회화 연습용 상황극 각본을 쓰는 작가다. 한국어 사용자가 영어로 말해서 상황을 풀어 가는 이야기를 쓴다.

${FORMAT_EXAMPLE}

opening이 지켜야 할 것:
- 한국어 장면 서술로 시작한다. 장소와 시각, 첫 대사 전에 벌어진 일, 사용자가 가진 것과 아는 것을 세 문장 이하로 쓰고 한 문장이 한 줄이다.
- 장면 서술 뒤에는 영어 대사 줄만 온다. 각 줄은 "이름: "으로 시작하고 그 이름은 이 화의 castNames 안에 있어야 한다.
- 지문을 쓰지 않는다. 괄호 안 행동 묘사, "Mia smiles." 같은 서술, 대사 안에서 자기 행동을 서술하는 문장을 쓰지 않는다.
- 함께 있는 사람과 지난 화의 연결은 첫 대사가 말로 전한다.
- 이미 문제가 벌어진 자리에서 시작하고, 사용자가 말을 해야 풀린다.

stage가 지켜야 할 것:
- "상황:" 한 줄 뒤 "- "로 시작하는 목록이다.
- 등장인물을 나열하는 문장이나 인물의 성격 설명을 쓰지 않는다. 그것은 characters가 맡는다. 그 화에서의 사정만 쓴다.
- 마지막 두 줄로 "사용자가 말을 해야 이 일이 풀린다"와 "주변 상황은 인물의 말로 전한다"에 해당하는 줄을 넣는다.

characters가 지켜야 할 것:
- 스토리 단위다. 화가 바뀌어도 같은 설명을 쓴다.
- 나이와 직업, 말투, 무엇에 어떻게 반응하는지를 쓴다. 그 화에서의 사정은 쓰지 않는다.

그 밖에:
- 제목, 화 제목, preview, 화 번호, 인물 이름과 순서는 개요에 적힌 그대로 쓴다.
- 사건은 분기하지 않는다. 각 화는 앞 화가 어느 결말로 끝났든 성립해야 한다.
- 모든 한국어 글은 쉬운 일상어로 쓰고 느낌표를 쓰지 않는다. 한 문장에 한 가지만 담는다.
- 사용자가 말한 실제 회사나 사람의 이름을 그대로 옮기지 않는다.`;
}

/** 확정한 개요를 각본을 쓰는 요청으로 바꾼다. */
export function scriptPrompt(outline: StoryOutline): string {
  const people = outline.characters
    .map((person) => `${person.position}. ${person.name} — ${person.role}`)
    .join("\n");
  const chapters = outline.episodes
    .map(
      (episode) =>
        `${episode.number}. ${episode.title} / ${episode.preview} / 나오는 인물: ${episode.cast.join(", ")}`
    )
    .join("\n");

  return `아래 개요대로 각본을 써라.

제목: ${outline.title}
한 줄 소개: ${outline.hook}
인물:
${people}
화:
${chapters}`;
}

/**
 * 모델이 쓴 각본을 저장 요청으로 바꾼다.
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
    coverEmoji: written.coverEmoji,
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
        stage: script?.stage ?? "",
        title: episode.title,
      };
    }),
    hook: outline.hook,
    intro: written.intro,
    title: outline.title,
  };
}

/**
 * 각본이 저장할 만한지 본다.
 *
 * 모델 출력이라 형식을 보장하지 않는다. 빈 글이나 장면 서술이 너무 긴 도입이
 * 저장되면 그 화는 영영 그 모습으로 남으므로, 저장 전에 한 번 센다.
 */
export function scriptProblem(
  written: WrittenStory
): OutlineProblem | undefined {
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
