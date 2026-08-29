import { Chat } from "@ai-sdk/react";
import type { UIMessage } from "ai";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { createEpisodeAskTransport } from "@/features/episode/api/ask-transport";
import type { EpisodeCorrection } from "@/features/episode/api/episode-correction";

/** 배울 표현 하나를 두고 여는 한국어 대화. */
export interface EpisodeAsk {
  /**
   * 대화 자체. 시트 밖에 둔다. 시트는 열리고 닫히지만 이미 오고 있는 답변은
   * 시트 없이도 계속 와야 한다.
   */
  chat: Chat<UIMessage>;
  /** 이 대화가 시작한 교정. 시트 머리에 출처로 보인다. */
  correction: EpisodeCorrection;
  id: string;
}

interface DraftState {
  draft: string;
  editingMessageId: string | undefined;
}

/**
 * 시트가 쓰는 초안 자리.
 *
 * 채팅 기능이 쓰는 것과 같은 모양이지만 그 타입을 가져오지 않는다. 한 기능은
 * 다른 기능을 import하지 않고, 둘을 이어 붙이는 일은 화면이 맡는다.
 */
export interface EpisodeAskDrafts {
  draft: string;
  editingMessageId: string | undefined;
  setDraft: (value: string) => void;
  setEditingMessageId: (value: string | undefined) => void;
  stashedDraft: { current: string };
}

interface EpisodeAsksValue {
  askOf: (id: string) => EpisodeAsk | undefined;
  /** 이 교정의 대화를 열고 그 ID를 답한다. 이미 있으면 그 대화를 그대로 준다. */
  openAsk: (input: {
    correction: EpisodeCorrection;
    snapshot: UIMessage[];
  }) => string;
}

const NO_ASKS: EpisodeAsksValue = {
  askOf: () => undefined,
  openAsk: () => "",
};

const EMPTY_DRAFT: DraftState = { draft: "", editingMessageId: undefined };

const EpisodeAsksContext = createContext<EpisodeAsksValue>(NO_ASKS);
/** 무엇을 쓰다 말았는지. 목록과 나눠 두어 한 글자에 대화가 다시 그려지지 않는다. */
const EpisodeAskDraftsContext = createContext<{
  setDraft: (id: string, value: string) => void;
  setEditingMessageId: (id: string, value: string | undefined) => void;
  stashedDrafts: Map<string, { current: string }>;
  states: Record<string, DraftState>;
}>({
  setDraft: () => undefined,
  setEditingMessageId: () => undefined,
  stashedDrafts: new Map(),
  states: {},
});

/**
 * 한 에피소드에서 연 물어보기 대화 전부.
 *
 * 교정 하나에 대화 하나다. 카드의 버튼을 다시 눌러도 새 대화를 만들지 않고,
 * 나눈 말과 쓰다 만 초안이 그대로 있는 그 대화를 다시 연다. 에피소드를 나가면
 * 이 층이 통째로 사라지고 대화도 함께 사라진다.
 */
export function EpisodeAsksProvider({
  accessToken,
  children,
}: {
  accessToken: string | undefined;
  children: ReactNode;
}) {
  const [asks, setAsks] = useState<EpisodeAsk[]>([]);
  const [states, setStates] = useState<Record<string, DraftState>>({});
  const asksRef = useRef<EpisodeAsk[]>([]);
  const stashedDrafts = useRef(new Map<string, { current: string }>()).current;
  // 보낼 때 읽히므로, 시트가 열린 뒤에 새로 받은 세션도 그대로 닿는다.
  const currentToken = useRef(accessToken);

  asksRef.current = asks;
  currentToken.current = accessToken;

  const openAsk = useCallback<EpisodeAsksValue["openAsk"]>(
    ({ correction, snapshot }) => {
      const id = `ask-${correction.messageId}`;
      const existing = asksRef.current.find((ask) => ask.id === id);

      if (existing) {
        return id;
      }

      const opened: EpisodeAsk = {
        chat: new Chat<UIMessage>({
          id,
          transport: createEpisodeAskTransport(
            () => currentToken.current,
            correction,
            snapshot
          ),
        }),
        correction,
        id,
      };

      setAsks((current) => [opened, ...current]);

      return id;
    },
    []
  );

  // 에피소드를 나가면 아직 오고 있던 답변도 받을 곳이 없다.
  useEffect(
    () => () => {
      for (const ask of asksRef.current) {
        ask.chat.stop().catch(() => {
          // 실패를 보여 줄 화면이 이미 없다.
        });
      }
    },
    []
  );

  const setDraft = useCallback((id: string, value: string) => {
    setStates((current) => ({
      ...current,
      [id]: { ...(current[id] ?? EMPTY_DRAFT), draft: value },
    }));
  }, []);

  const setEditingMessageId = useCallback(
    (id: string, value: string | undefined) => {
      setStates((current) => ({
        ...current,
        [id]: { ...(current[id] ?? EMPTY_DRAFT), editingMessageId: value },
      }));
    },
    []
  );

  const list = useMemo<EpisodeAsksValue>(
    () => ({
      askOf: (id: string) => asks.find((ask) => ask.id === id),
      openAsk,
    }),
    [asks, openAsk]
  );
  const drafts = useMemo(
    () => ({ setDraft, setEditingMessageId, stashedDrafts, states }),
    [setDraft, setEditingMessageId, stashedDrafts, states]
  );

  return (
    <EpisodeAsksContext.Provider value={list}>
      <EpisodeAskDraftsContext.Provider value={drafts}>
        {children}
      </EpisodeAskDraftsContext.Provider>
    </EpisodeAsksContext.Provider>
  );
}

/** 이 에피소드가 연 물어보기 대화들. */
export function useEpisodeAsks(): EpisodeAsksValue {
  return useContext(EpisodeAsksContext);
}

/** 한 물어보기 대화에서 쓰다 만 말. 시트를 닫아도 그대로 남는다. */
export function useEpisodeAskDrafts(id: string): EpisodeAskDrafts {
  const { setDraft, setEditingMessageId, stashedDrafts, states } = useContext(
    EpisodeAskDraftsContext
  );
  const state = states[id] ?? EMPTY_DRAFT;
  let stashedDraft = stashedDrafts.get(id);

  if (!stashedDraft) {
    stashedDraft = { current: "" };
    stashedDrafts.set(id, stashedDraft);
  }

  const stashed = stashedDraft;
  const setThisDraft = useCallback(
    (value: string) => setDraft(id, value),
    [id, setDraft]
  );
  const setThisEditingMessageId = useCallback(
    (value: string | undefined) => setEditingMessageId(id, value),
    [id, setEditingMessageId]
  );

  return useMemo(
    () => ({
      draft: state.draft,
      editingMessageId: state.editingMessageId,
      setDraft: setThisDraft,
      setEditingMessageId: setThisEditingMessageId,
      stashedDraft: stashed,
    }),
    [
      setThisDraft,
      setThisEditingMessageId,
      stashed,
      state.draft,
      state.editingMessageId,
    ]
  );
}
