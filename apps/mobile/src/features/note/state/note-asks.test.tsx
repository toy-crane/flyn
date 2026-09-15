import { expect, jest, test } from "@jest/globals";
import { act, renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";

import type { SavedExpression } from "@/features/note/api/expression-note";
import { NoteAsksProvider, useNoteAskDrafts, useNoteAsks } from "./note-asks";

jest.mock("@/shared/ai/request-options", () => ({
  aiRequestOptions: (path: string) => ({
    api: `http://127.0.0.1:3900${path}`,
  }),
  aiUrl: (path: string) => `http://127.0.0.1:3900${path}`,
}));

function saved(id: string): SavedExpression {
  return {
    conversation: null,
    english: "Next in line, please!",
    entries: null,
    episodeNumber: 1,
    id,
    kind: "dialogue",
    meaning: "다음 분이요!",
    original: null,
    speaker: "Mia",
    storyTitle: "Mia의 카페",
  };
}

function wrapper({ children }: { children: ReactNode }) {
  return (
    <NoteAsksProvider accessToken="token" userId="user-1">
      {children}
    </NoteAsksProvider>
  );
}

test("같은 표현에서 다시 열면 새 대화를 만들지 않고 나눈 대화를 그대로 준다", async () => {
  const { result } = await renderHook(() => useNoteAsks(), { wrapper });
  let first = "";
  let again = "";

  await act(() => {
    first = result.current.openAsk(saved("expression-1"));
  });
  const opened = result.current.askOf(first);

  await act(() => {
    again = result.current.openAsk(saved("expression-1"));
  });

  expect(again).toBe(first);
  expect(result.current.askOf(again)?.chat).toBe(opened?.chat);
});

test("다른 표현은 따로 대화를 연다", async () => {
  const { result } = await renderHook(() => useNoteAsks(), { wrapper });
  let first = "";
  let other = "";

  await act(() => {
    first = result.current.openAsk(saved("expression-1"));
    other = result.current.openAsk(saved("expression-2"));
  });

  expect(other).not.toBe(first);
  expect(result.current.askOf(other)?.expression.id).toBe("expression-2");
});

test("질문창을 닫아도 쓰다 만 질문이 그 표현의 대화에 남는다", async () => {
  const { result } = await renderHook(
    () => ({ asks: useNoteAsks(), drafts: useNoteAskDrafts("note-ask-1") }),
    { wrapper }
  );

  await act(() => {
    result.current.drafts.setDraft("이건 언제 써요?");
  });

  expect(result.current.drafts.draft).toBe("이건 언제 써요?");
});

test("로그아웃하면 나눈 대화와 쓰다 만 질문을 지운다", async () => {
  let userId: string | undefined = "user-1";
  function accountWrapper({ children }: { children: ReactNode }) {
    return (
      <NoteAsksProvider accessToken="token" userId={userId}>
        {children}
      </NoteAsksProvider>
    );
  }
  const { rerender, result } = await renderHook(
    () => ({
      asks: useNoteAsks(),
      drafts: useNoteAskDrafts(`note-ask-${saved("expression-1").id}`),
    }),
    { wrapper: accountWrapper }
  );
  let id = "";

  await act(() => {
    id = result.current.asks.openAsk(saved("expression-1"));
    result.current.drafts.setDraft("이건 언제 써요?");
  });
  const stop = jest.spyOn(
    result.current.asks.askOf(id)?.chat as NonNullable<
      ReturnType<typeof result.current.asks.askOf>
    >["chat"],
    "stop"
  );

  userId = undefined;
  await rerender({});

  expect(result.current.asks.askOf(id)).toBeUndefined();
  expect(result.current.drafts.draft).toBe("");
  expect(stop).toHaveBeenCalled();
});

test("노트 밖에서 열린 대화가 없으면 아무것도 돌려주지 않는다", async () => {
  const { result } = await renderHook(() => useNoteAsks(), { wrapper });

  expect(result.current.askOf("note-ask-missing")).toBeUndefined();
});
