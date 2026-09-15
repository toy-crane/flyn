import type { SavedExpression } from "@/features/note/api/expression-note";

/**
 * 담아 둔 표현의 형광펜. 영어 교정은 보라, 한국어 안내는 초록으로, 대화 곁의
 * 표현과 같은 채널을 쓴다. 종류는 담을 때 서버가 정했으므로 여기서 다시 판정하지
 * 않는다.
 *
 * 인물 대사에는 형광펜이 없다. 짚을 자리가 없는 것이 곧 그 카드의 표시다.
 */
export function expressionMarkClassName(kind: SavedExpression["kind"]): string {
  if (kind === "dialogue") {
    return "";
  }

  return kind === "translation"
    ? "bg-expression-surface text-expression"
    : "bg-learn-surface text-learn";
}
