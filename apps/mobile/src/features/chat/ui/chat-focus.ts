import { createContext } from "react";

/**
 * 대화를 여는 자리가 짚는 인물 대사 하나. 패널이 목록 안의 장면에 내려보낸다.
 *
 * 목록의 행을 다시 만들지 않고 짚는 말풍선 하나만 다시 그리려고 행의 속성이 아니라
 * 문맥으로 둔다.
 */
export interface ChatFocusTarget {
  /** 장면 안 몇 번째 대사인지. 메시지 전체를 짚으면 없다. */
  dialogueIndex: number | undefined;
  isHighlighting: boolean;
  messageId: string;
  onHighlightEnd: () => void;
  /** 짚는 메시지 아래 매달린 것이 그 행 안에서 선 높이. 패널이 첫 자리를 잡는 데 쓴다. */
  reportAddonTop: (top: number) => void;
  /** 짚는 대사가 자기 장면 안에서 선 높이. 패널이 첫 자리를 잡는 데 쓴다. */
  reportUtteranceTop: (top: number) => void;
}

export const ChatFocusContext = createContext<ChatFocusTarget | undefined>(
  undefined
);
