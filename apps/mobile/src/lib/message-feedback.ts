/**
 * 판정이 끝난 발화 하나. 표시와 첨삭 시트가 같은 값을 읽는다 — 시트는 열릴 때
 * 아무것도 다시 부르지 않으므로 필요한 것이 이 행에 다 있어야 한다.
 */

import type { JudgedSentence } from "@flyn/api";

/**
 * 판정 행에 그때 전달된 문장을 더한 것. 스트림이 실어 보내는 판정과 모양이 같아
 * 저장에서 읽은 것과 방금 도착한 것을 섞어 둘 수 있다.
 */
export type MessageFeedback = JudgedSentence;

/**
 * 말풍선 옆에 서는 세 표시. `translated`와 `improvable`은 시트를 열고,
 * `clear`는 그대로 통했다는 상태다.
 */
export type MessageMark = "clear" | "improvable" | "translated";

/**
 * 원문이 있으면 한글로 쓴 것이다. 그때는 말풍선의 영어가 내가 쓴 문장이 아니라서
 * 번역 표시가 먼저다. **두 문장을 견주어 짐작하지 않는다** — 원문이 비어 있음이
 * 곧 번역하지 않았음이라, 판정이 늦게 돌아도 표시가 뒤집히지 않는다.
 */
export function messageMark({
  sourceText,
  verdict,
}: MessageFeedback): MessageMark {
  if (sourceText !== null) {
    return "translated";
  }

  return verdict === "improvable" ? "improvable" : "clear";
}

/** 판정이 없는 발화에는 표시가 없다. 행이 없음이 곧 판정 전이다. */
export function findFeedback(
  feedback: MessageFeedback[],
  messageId: string
): MessageFeedback | null {
  return feedback.find((row) => row.messageId === messageId) ?? null;
}

/**
 * 방금 도착한 판정을 저장에서 읽은 판정 위에 얹는다. 같은 발화가 두 번 오면
 * 먼저 있던 것을 그대로 둔다 — 저장이 곧 판정이고, 다시 판정하지 않는다.
 */
export function withArrivedFeedback(
  feedback: MessageFeedback[],
  arrived: MessageFeedback[]
): MessageFeedback[] {
  const known = new Set(feedback.map((row) => row.messageId));

  return [...feedback, ...arrived.filter((row) => !known.has(row.messageId))];
}
