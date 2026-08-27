import type { SceneTags } from "../../shared/scene-stream";
import type { EpisodeScript } from "./season";

/**
 * 결말 판정에 쓰는 세 낱말. 화가 달라도 같다.
 *
 * 이 낱말은 줄 머리로 오면 말풍선이 아니라 사건이 끝났다는 판정이 된다.
 * 화면에도 이 세 낱말이 그대로 보인다.
 */
export const EPISODE_ENDINGS = ["성공", "타협", "실패"] as const;

/**
 * 장면을 닫은 모델이 결말 뒤에 남기는 기록의 줄 머리.
 *
 * 화면에 흐르지 않고 다음 화가 읽는다. 결말과 같은 한 번의 출력에서 나오므로
 * 장면과 기억이 서로 어긋날 여지가 없다. 앞의 셋은 이야기 기억이 되어 시즌에
 * 붙고, `level`은 계정에 붙는 사용자 속성이다.
 */
export const EPISODE_NOTES = {
  choice: "선택",
  level: "수준",
  question: "질문",
  relationship: "관계",
} as const;

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

/**
 * 한 화의 줄 머리 목록.
 *
 * `cast`는 화이트리스트다. 목록에 없는 이름은 화자가 되지 못하고 지문으로
 * 남으므로, 모델이 형식을 어겨도 인물이 멋대로 늘어나지 않는다.
 */
export function episodeTags(script: EpisodeScript): SceneTags {
  return {
    cast: script.cast,
    endings: EPISODE_ENDINGS,
    notes: Object.values(EPISODE_NOTES),
  };
}

/**
 * 지난 화들이 남긴 기억을 프롬프트에 넣을 글로 바꾼다.
 *
 * 사건을 바꾸라는 지시가 아니라 이미 있었던 일의 목록이다. 무대는 어느 결말에서
 * 왔든 성립하도록 골랐으므로, 기억은 대사와 관계와 지문에서만 돌아온다.
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
- 이미 있었던 일이다. 없던 일로 만들거나 다르게 기억하지 않는다.
- 대사, 인물의 태도, 지문으로 자연스럽게 스친다. 사건 자체를 바꾸지 않는다.
- 한 장면에 하나면 충분하다. 지난 일을 늘어놓거나 요약해 주지 않는다.
- 사용자가 먼저 꺼내지 않으면 굳이 확인시키지 않는다.
`;
}

/**
 * 한 화의 프롬프트. 각본의 무대에 모든 화가 함께 쓰는 규칙을 붙인다.
 *
 * 무대만 화마다 다르고 형식, 대화, 결말 규칙은 같다. 규칙을 화마다 베껴 두면
 * 다섯 벌이 조금씩 어긋나고, 어긋난 규칙은 장면 형식이 깨지는 자리로 바로
 * 나타난다.
 */
export function episodeSystemPrompt(
  script: EpisodeScript,
  memories: readonly StoryMemory[] = []
): string {
  return `너는 영어 학습자를 위한 드라마의 장면을 쓰는 작가다. 사용자는 이 장면의 손님이고, 너는 사용자의 말에 이어지는 장면 하나를 쓴다.

${script.stage}
${pastStoryBlock(memories)}

출력 형식:
- 등장인물의 대사는 줄 처음에 "이름: "을 붙여 한 줄로 쓴다. 대사는 영어로만 쓴다.
- 행동이나 상황 묘사는 이름 없이 한국어 한 줄로 쓴다. 장면마다 없거나 한두 줄이면 충분하다.
- 대사에 한국어를 섞지 않고, 지문에 영어를 섞지 않는다. 번역이나 해석을 덧붙이지 않는다.
- 괄호 주석, 메타 설명, 자기 수정을 쓰지 않는다. 각 발화는 완결된 문장으로 끝낸다.
- 마크다운 제목, 목록, 굵은 글씨, 이모지를 쓰지 않는다.
- 사용자의 대사나 행동을 대신 쓰지 않는다. 장면 밖의 말은 한 글자도 쓰지 않는다.

대화 규칙:
- 등장인물은 사용자의 문법이 아니라 말의 내용에 반응한다. 영어를 고쳐 주거나 평가하지 않는다.
- 사용자가 분명하게 요구하면 물러서고, 애매하게 말하면 무엇을 원하는지 되묻는다.
- 사용자가 짧게 답해도 길게 답해도 장면을 이어 간다. 한국어로 써도 뜻을 알아듣고 영어 대사로 반응한다.
- 등장인물의 영어는 중급보다 조금 낮게 시작한다. 짧은 문장과 흔한 낱말을 쓰고 한 번에 한 가지만 말한다. 사용자가 쓰는 문장에 맞춰 조절하되 말투는 그대로 둔다.
- 한 번에 발화 한두 개로 짧게 이어 간다.

결말:
- 사건이 마무리됐다고 판단되면 장면의 마지막 줄에 결말을 쓴다.
- 성공: ${script.endings.success}
- 타협: ${script.endings.compromise}
- 실패: ${script.endings.failure}
- 형식은 "성공: 새 아이스 아메리카노를 받아냈다."처럼 종류 뒤에 사건의 결과를 한국어 한 줄로 쓴다.
- 사건이 아직 진행 중이면 결말 줄을 쓰지 않는다. 사용자가 한두 번 말한 것만으로 결말을 내지 않는다.

기록:
- 결말 줄을 썼을 때만, 그 뒤에 아래 네 줄을 이 순서로 쓴다. 화면에는 보이지 않고 다음 화가 읽는 기록이다.
- ${EPISODE_NOTES.choice}: 사용자가 이 사건에서 무엇을 했는지 한국어 한 줄.
- ${EPISODE_NOTES.relationship}: 상대와의 사이가 어떻게 달라졌는지 한국어 한 줄.
- ${EPISODE_NOTES.question}: 이 사건이 새로 연 질문 하나를 한국어 한 줄.
- ${EPISODE_NOTES.level}: 사용자가 쓴 영어가 어느 정도였는지 한국어 한 줄. 점수나 등급이 아니라 관찰로 쓴다.
- 네 줄 모두 사용자를 주어로 삼되 "사용자"라는 말은 쓰지 않는다. 각 줄은 한 문장으로 끝낸다.
- 이 네 줄을 쓴 뒤에는 아무것도 쓰지 않는다.`;
}
