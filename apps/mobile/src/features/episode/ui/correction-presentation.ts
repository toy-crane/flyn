import { correctionLabels } from "./episode-labels";

const KOREAN = /[가-힣ㄱ-ㅎㅏ-ㅣ]/;

/** 안내 종류는 저장된 원문으로도 동일하게 판정하므로 기존 기록도 같은 제목을 쓴다. */
export function correctionPresentation(original: string) {
  return KOREAN.test(original)
    ? {
        surface: "bg-expression-surface",
        text: "text-expression",
        title: correctionLabels.suggestionLabel,
        tone: "expression" as const,
      }
    : {
        surface: "bg-learn-surface",
        text: "text-learn",
        title: correctionLabels.label,
        tone: "learn" as const,
      };
}
