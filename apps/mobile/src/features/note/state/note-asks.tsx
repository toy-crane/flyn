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

import type { SavedExpression } from "@/features/note/api/expression-note";
import { createNoteAskTransport } from "@/features/note/api/note-ask-transport";
import { readNoteConversation } from "@/features/note/api/note-conversation";

/** 표현 노트에서 담아 둔 표현 하나를 두고 여는 한국어 대화. */
export interface NoteAsk {
  /** 대화 자체. 시트는 열리고 닫히지만 이미 오고 있는 답변은 시트 없이도 와야 한다. */
  chat: Chat<UIMessage>;
  /** 이 대화가 시작한 표현. 시트 머리에 출처로 보인다. */
  expression: SavedExpression;
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
export interface NoteAskDrafts {
  draft: string;
  editingMessageId: string | undefined;
  setDraft: (value: string) => void;
  setEditingMessageId: (value: string | undefined) => void;
  stashedDraft: { current: string };
}

interface NoteAsksValue {
  askOf: (id: string) => NoteAsk | undefined;
  /** 이 표현의 대화를 열고 그 ID를 답한다. 이미 있으면 그 대화를 그대로 준다. */
  openAsk: (expression: SavedExpression) => string;
}

const NO_ASKS: NoteAsksValue = {
  askOf: () => undefined,
  openAsk: () => "",
};

const EMPTY_DRAFT: DraftState = { draft: "", editingMessageId: undefined };

const NoteAsksContext = createContext<NoteAsksValue>(NO_ASKS);
/** 무엇을 쓰다 말았는지. 목록과 나눠 두어 한 글자에 대화가 다시 그려지지 않는다. */
const NoteAskDraftsContext = createContext<{
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
 * 표현 노트에서 연 물어보기 대화 전부.
 *
 * 표현 하나에 대화 하나다. 카드의 `AI에게 물어보기`를 다시 눌러도 새 대화를 만들지
 * 않고, 나눈 말과 쓰다 만 초안이 그대로 있는 그 대화를 다시 연다.
 *
 * 노트 탭 안이 아니라 앱의 화면 전체 위에 둔다. 다른 탭이나 원래 대화에 다녀와도
 * 대화가 남아야 하기 때문이다. 그 대신 계정이 바뀌면 비운다. 로그아웃하면 나눈
 * 대화와 쓰다 만 질문이 사라지고, 앱 프로세스가 끝나면 메모리와 함께 사라진다.
 * 기기 저장소에는 남기지 않으므로 앱을 다시 켜도 돌아오지 않는다. 앱을 잠시 뒤로
 * 보내는 것만으로는 지우지 않는다.
 *
 * 계정이 바뀔 때 이 층을 다시 만들지 않고 안의 대화만 비운다. 이 층은 앱의 화면
 * 전체를 감싸므로, 다시 만들면 로그인하는 순간 내비게이션까지 처음부터 다시 선다.
 */
export function NoteAsksProvider({
  accessToken,
  children,
  userId,
}: {
  accessToken: string | undefined;
  children: ReactNode;
  /** 지금 로그인한 계정. 바뀌거나 비면 앞 계정의 대화를 지운다. */
  userId: string | undefined;
}) {
  const [asks, setAsks] = useState<NoteAsk[]>([]);
  const [states, setStates] = useState<Record<string, DraftState>>({});
  const asksRef = useRef<NoteAsk[]>([]);
  const stashedDrafts = useRef(new Map<string, { current: string }>()).current;
  // 보낼 때 읽히므로, 시트가 열린 뒤에 새로 받은 세션도 그대로 닿는다.
  const currentToken = useRef(accessToken);
  const [owner, setOwner] = useState(userId);
  /** 이 계정이 연 대화 전부. 계정이 바뀌면 여기 남은 답변을 멈춘다. */
  const opened = useRef<NoteAsk[]>([]);

  asksRef.current = asks;
  currentToken.current = accessToken;

  // 렌더 중에 비워 앞 계정의 대화가 한 프레임도 새 계정의 화면에 닿지 않게 한다.
  if (owner !== userId) {
    setOwner(userId);
    setAsks([]);
    setStates({});
  }

  // 계정이 바뀔 때마다 앞 계정이 연 대화를 정리하므로 계정을 의존성에 둔다.
  // biome-ignore lint/correctness/useExhaustiveDependencies: 본문이 읽지 않는 계정이 정리하는 때를 정한다
  useEffect(
    () => () => {
      // 계정이 바뀌거나 앱이 이 층을 내리면 아직 오고 있던 답변도 받을 곳이 없다.
      for (const ask of opened.current) {
        ask.chat.stop().catch(() => {
          // 실패를 보여 줄 화면이 이미 없다.
        });
      }
      opened.current = [];
      stashedDrafts.clear();
    },
    [owner, stashedDrafts]
  );

  const openAsk = useCallback<NoteAsksValue["openAsk"]>((expression) => {
    const id = `note-ask-${expression.id}`;
    const existing = asksRef.current.find((kept) => kept.id === id);

    if (existing) {
      return id;
    }

    const { conversation } = expression;
    const ask: NoteAsk = {
      chat: new Chat<UIMessage>({
        id,
        transport: createNoteAskTransport(
          () => currentToken.current,
          expression,
          // 원래 대화가 지워졌으면 저장한 표현만으로 묻는다.
          async () =>
            conversation
              ? ((await readNoteConversation(
                  currentToken.current ?? "",
                  conversation
                )) ?? [])
              : []
        ),
      }),
      expression,
      id,
    };

    asksRef.current = [ask, ...asksRef.current];
    opened.current = [...opened.current, ask];
    setAsks(asksRef.current);

    return id;
  }, []);

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

  const list = useMemo<NoteAsksValue>(
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
    <NoteAsksContext.Provider value={list}>
      <NoteAskDraftsContext.Provider value={drafts}>
        {children}
      </NoteAskDraftsContext.Provider>
    </NoteAsksContext.Provider>
  );
}

/** 표현 노트가 연 물어보기 대화들. */
export function useNoteAsks(): NoteAsksValue {
  return useContext(NoteAsksContext);
}

/** 한 물어보기 대화에서 쓰다 만 말. 시트를 닫아도 그대로 남는다. */
export function useNoteAskDrafts(id: string): NoteAskDrafts {
  const { setDraft, setEditingMessageId, stashedDrafts, states } =
    useContext(NoteAskDraftsContext);
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
