import { beforeEach, expect, jest, test } from "@jest/globals";
import { screen, within } from "@testing-library/react-native";
import { useHeaderHeight } from "expo-router/react-navigation";
import type { ReactElement } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import type { ChatSession } from "@/features/chat/state/use-conversation";
import { useConversation } from "@/features/chat/state/use-conversation";
import type { SavedExpression } from "@/features/note/api/expression-note";
import type { NoteAsk } from "@/features/note/state/note-asks";
import { useNoteAsks } from "@/features/note/state/note-asks";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { NoteAskScreen } from "./note-ask-screen";

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: jest.fn(),
}));

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: jest.fn(),
}));

jest.mock("@ai-sdk/react", () => ({
  useChat: () => ({ messages: [] }),
}));

jest.mock("@/features/chat/state/use-conversation", () => ({
  STREAM_UPDATE_INTERVAL_MS: 50,
  useConversation: jest.fn(),
}));

jest.mock("@/features/note/state/note-asks", () => ({
  useNoteAskDrafts: () => ({
    draft: "",
    editingMessageId: undefined,
    setDraft: jest.fn(),
    setEditingMessageId: jest.fn(),
    stashedDraft: { current: "" },
  }),
  useNoteAsks: jest.fn(),
}));

jest.mock("@/shared/navigation/use-screen-arrival", () => ({
  useFocusOnArrival: () => ({ current: null }),
}));

interface PanelProps {
  chat: { tag?: string };
  placeholder?: string;
  source?: ReactElement;
}

let panel: PanelProps | undefined;

jest.mock("@/features/chat/ui/chat-panel", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    ChatPanel: (props: PanelProps) => {
      panel = props;

      return React.createElement(View, { testID: "ask-panel" }, props.source);
    },
  };
});

const CORRECTION: SavedExpression = {
  conversation: null,
  english: "I ordered a hot americano.",
  entries: [
    { fixed: "ordered", original: "order", why: "지난 일은 ordered로 말해요." },
  ],
  episodeNumber: 3,
  id: "5a4ed000-0000-4000-8000-000000000002",
  kind: "correction",
  meaning: "저는 뜨거운 아메리카노를 시켰어요.",
  original: "I order a hot americano.",
  speaker: null,
  storyTitle: "Mia의 카페",
};

const TRANSLATION: SavedExpression = {
  ...CORRECTION,
  english: "Could I get an iced americano instead?",
  entries: null,
  id: "5a4ed000-0000-4000-8000-000000000003",
  kind: "translation",
  meaning: "대신 아이스 아메리카노로 받을 수 있을까요?",
  original: "대신 아이스 아메리카노로 받을 수 있을까요?",
};

const DIALOGUE: SavedExpression = {
  ...CORRECTION,
  english: "Could I get a name for the order?",
  entries: null,
  id: "5a4ed000-0000-4000-8000-000000000004",
  kind: "dialogue",
  meaning: "주문하실 분 성함을 알려 주시겠어요?",
  original: null,
  speaker: "Mia",
};

function askFor(expression: SavedExpression) {
  return {
    chat: { tag: "note-chat" },
    expression,
    id: `note-ask-${expression.id}`,
  } as unknown as NoteAsk;
}

const ASK = askFor(CORRECTION);

const mockUseAuthSession = jest.mocked(useAuthSession);
const mockUseConversation = jest.mocked(useConversation);
const mockUseNoteAsks = jest.mocked(useNoteAsks);
const mockUseHeaderHeight = jest.mocked(useHeaderHeight);
const onMissing = jest.fn();

function stubAsks(asks: NoteAsk[]) {
  mockUseNoteAsks.mockReturnValue({
    askOf: (id: string) => asks.find((ask) => ask.id === id),
    openAsk: jest.fn(() => ASK.id),
  });
}

beforeEach(() => {
  panel = undefined;
  onMissing.mockClear();
  mockUseHeaderHeight.mockReturnValue(96);
  mockUseAuthSession.mockReturnValue({
    session: { access_token: "token-1" },
    status: "signedIn",
  } as ReturnType<typeof useAuthSession>);
  mockUseConversation.mockReturnValue({
    tag: "note-session",
  } as unknown as ChatSession);
  stubAsks([ASK]);
});

test("영어 교정은 대화에서 연 질문창처럼 제목, 내가 쓴 원문과 고친 문장을 읽기 전용으로 보여 준다", async () => {
  await renderWithHeroUI(<NoteAskScreen id={ASK.id} onMissing={onMissing} />);

  const source = within(screen.getByTestId("correction-source"));

  expect(source.getByText("더 자연스러운 영어 표현")).toBeOnTheScreen();
  expect(source.getByText("I order a hot americano.")).toBeOnTheScreen();
  expect(source.getByText("I ordered a hot americano.")).toBeOnTheScreen();
  expect(source.queryByText("Mia의 카페 · 3화")).toBeNull();
  expect(source.queryByRole("button")).toBeNull();
  expect(panel?.placeholder).toBe("궁금한 것을 한국어로 물어보세요");
});

test("한국어 안내는 안내 제목, 내가 쓴 한국어와 안내한 영어를 보여 준다", async () => {
  stubAsks([askFor(TRANSLATION)]);

  await renderWithHeroUI(
    <NoteAskScreen id={askFor(TRANSLATION).id} onMissing={onMissing} />
  );

  const source = within(screen.getByTestId("correction-source"));

  expect(source.getByText("이럴 때 쓰는 영어 표현")).toBeOnTheScreen();
  expect(
    source.getByText("대신 아이스 아메리카노로 받을 수 있을까요?")
  ).toBeOnTheScreen();
  expect(
    source.getByText("Could I get an iced americano instead?")
  ).toBeOnTheScreen();
});

test("인물 대사는 대사 뜻 제목, 화자, 영어 대사와 뜻을 보여 준다", async () => {
  stubAsks([askFor(DIALOGUE)]);

  await renderWithHeroUI(
    <NoteAskScreen id={askFor(DIALOGUE).id} onMissing={onMissing} />
  );

  const source = within(screen.getByTestId("utterance-source"));

  expect(source.getByText("대사 뜻")).toBeOnTheScreen();
  expect(source.getByText("Mia")).toBeOnTheScreen();
  expect(
    source.getByText("Could I get a name for the order?")
  ).toBeOnTheScreen();
  expect(
    source.getByText("주문하실 분 성함을 알려 주시겠어요?")
  ).toBeOnTheScreen();
});

test("열려던 대화가 없으면 아무것도 그리지 않고 시트를 닫는다", async () => {
  stubAsks([]);

  await renderWithHeroUI(<NoteAskScreen id={ASK.id} onMissing={onMissing} />);

  expect(screen.queryByTestId("ask-panel")).toBeNull();
  expect(onMissing).toHaveBeenCalled();
});
