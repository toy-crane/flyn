import { createContext, useContext } from "react";

/**
 * 표현 노트에서 찾아 들어온 배울 표현 하나.
 *
 * 사용자 메시지 아래의 교정이나 안내 한 줄이 이것을 읽고 그 둘레를 잠깐 짚는다.
 * 인물 대사는 말풍선이 대화 기능의 것이라 여기서 다루지 않는다.
 */
export interface EpisodeFocus {
  isHighlighting: boolean;
  /** 배울 표현이 매달린 사용자 메시지. */
  messageId: string;
  onHighlightEnd: () => void;
}

const EpisodeFocusContext = createContext<EpisodeFocus | undefined>(undefined);

export const EpisodeFocusProvider = EpisodeFocusContext.Provider;

/** 지금 짚는 배울 표현. 노트에서 들어오지 않았으면 없다. */
export function useEpisodeFocus(): EpisodeFocus | undefined {
  return useContext(EpisodeFocusContext);
}
