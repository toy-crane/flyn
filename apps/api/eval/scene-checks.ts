import type { EpisodeScene } from "../src/features/episode/scene";

const KOREAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/u;
const ACTION = /[*([]|\bI (?:hand|nod|smile|point|walk|turn|look)\b/iu;

/** 스키마가 보장하지 않는 언어와 대표적인 행동 서술을 검사한다. 전문 검토는 별도다. */
export function sceneProblems(
  scene: EpisodeScene,
  cast: readonly string[],
  closed: boolean
) {
  const problems: string[] = [];
  for (const line of scene.dialogue) {
    if (!cast.includes(line.speaker)) {
      problems.push("화자 누락 또는 목록 밖 화자");
    }
    if (KOREAN.test(line.text)) {
      problems.push("한국어 대사");
    }
    if (ACTION.test(line.text)) {
      problems.push("행동 서술 의심");
    }
  }
  if ((scene.ending !== null) !== closed) {
    problems.push("결말 시점");
  }
  return problems;
}
