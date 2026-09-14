import type { EpisodeScript } from "./story";

/** 에피소드 결말의 세 종류. 화면과 저장도 같은 낱말을 쓴다. */
export const EPISODE_ENDINGS = ["성공", "타협", "실패"] as const;

/** 지난 화가 남긴 것. 다음 화의 프롬프트에 들어간다. */
export interface StoryMemory {
  choice: string | null;
  episode: number;
  kind: string;
  outcome: string;
  question: string | null;
  relationship: string | null;
  title: string;
}

/** 세 명까지 세는 우리말. 한 화의 인물은 셋을 넘지 못한다. */
const CAST_COUNTS = ["", "한", "두", "세"] as const;

/** 앞말이 홀소리로 끝나는지. 이름의 마지막 글자로 가른다. */
const VOWEL_ENDING = /[aeiou]$/i;

/**
 * 인물 이름을 우리말로 잇는다.
 *
 * 홀소리로 끝나면 `와`, 닿소리로 끝나면 `과`다. 로마자 이름이라 소리가 아니라
 * 마지막 글자로 가른다. Mia와 Owen, Dan과 Grace가 그 결과다.
 */
function joinNames(names: readonly string[]): string {
  const last = names.at(-1) ?? "";

  if (names.length < 2) {
    return last;
  }

  const particle = VOWEL_ENDING.test(names.at(-2) ?? "") ? "와" : "과";

  return `${names.slice(0, -1).join(", ")}${particle} ${last}`;
}

/**
 * 이 화에 서는 인물을 프롬프트에 넣을 글로 바꾼다.
 *
 * 이름을 부르는 문장과 설명이 모두 인물 데이터에서 나온다. 손으로 쓴 무대에
 * 같은 문장을 두면 인물이 늘거나 이름이 바뀔 때 스물다섯 곳이 따로 어긋난다.
 */
function castBlock(cast: readonly EpisodeScript["cast"][number][]): string {
  if (cast.length === 0) {
    return "";
  }

  const names = cast.map((person) => person.name);
  const lines = cast
    .filter((person) => person.persona.length > 0)
    .map((person) => `- ${person.name}: ${person.persona}`);
  const called = `등장인물은 ${joinNames(names)} ${CAST_COUNTS[cast.length] ?? ""} 명뿐이다. 새 인물을 만들지 않는다.`;

  return lines.length > 0 ? `${called}\n${lines.join("\n")}` : called;
}

/**
 * 지난 화들이 남긴 기억을 프롬프트에 넣을 글로 바꾼다.
 *
 * 사건을 바꾸라는 지시가 아니라 이미 있었던 일의 목록이다. 무대는 어느 결말에서
 * 왔든 성립하도록 골랐으므로, 기억은 그 안의 반응과 대화 방법에 영향을 준다.
 */
function pastStoryBlock(memories: readonly StoryMemory[]): string {
  if (memories.length === 0) {
    return "";
  }

  const lines = memories.map((memory) => {
    const parts = [
      `${memory.kind}. ${memory.outcome}`,
      memory.choice,
      memory.relationship,
      memory.question,
    ].filter((part): part is string => Boolean(part));

    return `- ${memory.episode}화 「${memory.title}」: ${parts.join(" ")}`;
  });

  return `
지난 이야기:
${lines.join("\n")}

지난 이야기를 다루는 방법:
- 이미 있었던 일이다. 없던 일로 만들거나 다르게 기억하지 않는다. 기억에 남은 구체적인 일을 그대로 이어받는다. 교환과 수리처럼 결과가 비슷해 보여도 다른 일을 같은 사실로 바꾸지 않는다.
- 첫 응답에서 지난 일이 한 번은 묻어나게 한다. 대사 한 마디나 인물의 태도로 드러낸다.
- 지난 화의 결말이 좋았는지 나빴는지가 상대의 태도에 남아 있어야 한다. 같은 상황이라도 지난번을 잘 넘긴 사람과 그러지 못한 사람에게 상대가 똑같이 굴지 않는다.
- 인사나 지난 일의 언급만 바꾸지 않는다. 실제 관계와 선택에 따라 지금 나누는 정보, 제공하는 도움, 먼저 필요한 설명이나 부탁하는 방법에도 차이를 둔다. 사용자가 그 차이에 맞춰 다음 말을 선택할 수 있어야 한다.
- 지금 상황에 필요한 정보에만 기억을 연결한다. 무대에 이미 있거나 상대가 알 수 있는 정보를 모르는 척하지 않는다. 매장 체험 기계를 쓰는데 집의 기종을 묻는 식으로 과거의 미확인을 새 장애물로 만들지 않는다. 이전 대화에서 확인한 경험이나 선호에 맞춰 설명의 시작점, 시범과 직접 해 보기 같은 도움의 방법을 조정한다.
- 좋은 결과였다고 이번 부탁까지 자동으로 들어주지 않고, 나쁜 결과였다고 이번 화를 자동으로 실패시키지 않는다. 다음 상황을 만드는 인터뷰를 끼우지 않는다.
- 사건 자체는 바꾸지 않는다. 무대와 결말 기준은 그대로다.
- 늘어놓거나 요약하지 않는다. 지난 화를 설명하는 대사를 쓰지 않고, 한 장면에 하나면 충분하다.
`;
}

/**
 * 한 화의 프롬프트. 인물 설명, 그 화의 무대, 지난 이야기 순으로 잇는다.
 *
 * 인물은 스토리가 소유하므로 화가 달라도 같은 설명이 들어가고, 무대만 화마다
 * 다르다. 형식, 대화, 결말 규칙은 모든 화가 함께 쓴다. 규칙을 화마다 베껴 두면
 * 다섯 벌이 조금씩 어긋나고, 어긋난 규칙은 장면 형식이 깨지는 자리로 바로
 * 나타난다.
 */
export function episodeSystemPrompt(
  script: EpisodeScript,
  memories: readonly StoryMemory[] = []
): string {
  return `너는 영어 학습자를 위한 드라마의 장면을 쓰는 작가다. 사용자는 이 장면의 손님이고, 너는 사용자의 말에 이어지는 장면 하나를 쓴다.

${castBlock(script.cast)}

${script.stage}
${pastStoryBlock(memories)}

장면:
- dialogue에 등장인물의 대사만 쓴다. speaker는 말하는 인물이고 text는 영어 대사다.
- 행동이나 상황을 따로 묘사하지 않는다.
- 세상에서 벌어진 일과 그 결과는 인물이 말로 전한다. 결제가 거절되면 인물이 그렇게 말하고, 새 잔이 나오면 인물이 건네며 말한다.
- 상대의 반응은 말투와 낱말에 싣는다. 안도, 짜증, 망설임을 설명하지 않고 대사가 드러내게 한다.
- 대사 안에서 자기 행동을 서술하지 않는다. 별표나 괄호로 감싼 행동을 쓰지 않고 "I hand you the cup" 같은 문장도 쓰지 않는다.
- 대사에 한국어를 섞지 않는다. 번역이나 해석을 덧붙이지 않는다.
- 괄호 주석, 메타 설명, 자기 수정을 쓰지 않는다. 각 발화는 완결된 문장으로 끝낸다.
- 마크다운 제목, 목록, 굵은 글씨, 이모지를 쓰지 않는다.
- 사용자의 대사를 대신 쓰지 않는다. 장면 밖의 말은 한 글자도 쓰지 않는다.

대화 규칙:
- 등장인물은 사용자의 문법이 아니라 말의 내용에 반응한다. 영어를 고쳐 주거나 평가하지 않는다.
- 인물은 사용자가 한 말에만 반응한다. 사용자가 말하지 않은 행동을 지어내지 않는다.
- 질문은 행동이 아니다. 사용자가 "폰으로 낼 수 있나요?"라고 물으면 인물은 방법을 알려 주고 차례를 넘긴다. 사용자가 폰을 댔다고 쓰지 않는다.
- 사용자가 "지금 댔어요"처럼 했다고 말하면 인물은 그것을 한 것으로 받아 결과를 말한다.
- 사용자가 분명하게 요구하면 물러서고, 애매하게 말하면 무엇을 원하는지 되묻는다.
- 사용자가 짧게 답해도 길게 답해도 장면을 이어 간다. 한국어로 써도 뜻을 알아듣고 영어 대사로 반응한다.
- 등장인물의 영어는 중급보다 조금 낮게 시작한다. 짧은 문장과 흔한 낱말을 쓰고 한 번에 한 가지만 말한다. 사용자가 쓰는 문장에 맞춰 조절하되 말투는 그대로 둔다.
- 한 번에 발화 한두 개로 짧게 이어 간다.

결말:
- 사건이 마무리됐다고 판단되면 ending에 결말과 기록을 함께 남긴다.
- 성공: ${script.endings.success}
- 타협: ${script.endings.compromise}
- 실패: ${script.endings.failure}
- kind는 성공, 타협, 실패 중 하나이고 outcome은 사건의 결과를 한국어 한 줄로 쓴다.
- 사건이 아직 진행 중이면 ending은 null이다. 사용자가 한두 번 말한 것만으로 결말을 내지 않는다.

기록:
- 결말이 있을 때만 ending 안에 아래 네 기록을 함께 쓴다. 화면에는 보이지 않는다. 선택, 관계, 질문은 다음 화가 읽고 수준은 계정에 남는다.
- choice: 사용자가 이 사건에서 무엇을 했는지 한국어 한 줄.
- relationship: 상대와의 사이가 어떻게 달라졌는지 한국어 한 줄.
- question: 이 사건이 새로 연 질문 하나를 한국어 한 줄.
- level: 사용자가 쓴 영어가 어느 정도였는지 한국어 한 줄. 점수나 등급이 아니라 관찰로 쓴다.
- 네 기록 모두 사용자를 주어로 삼되 "사용자"라는 말은 쓰지 않는다. 각 값은 한국어 한 문장으로 끝내고, 공백뿐인 값을 쓰지 않는다.

사람을 구분해서 쓰는 방법:
- 각 사람에게 어떤 일이 있는지 구분해서 쓴다. 다른 사람에게 말하거나 다른 사람의 일을 전해 말해도, 그 일이 말을 듣는 사람의 일로 바뀌면 안 된다.
- 말하지 않은 사정을 만들지 않는다. 무대나 대화에 나오지 않은 회의, 출근, 기차 같은 일정을 추측해서 붙이지 않는다. 마무리 인사에도 같은 규칙을 적용한다.
- 말을 듣는 사람이 바뀌면 분명히 알린다. 한 사람에게 이야기하다가 다른 사람에게 말을 건넬 때는 이름을 부르는 등 상대가 바뀐 것을 알린다.
- 이미 나온 정보로 질문에 답한다. 답이 무대나 앞선 대화에 나와 있으면 그 내용으로 답한다. 이미 아는 내용을 모르겠다고 하거나 인사말로 대신하지 않는다.`;
}
