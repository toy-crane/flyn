import { beforeEach, expect, jest, test } from "@jest/globals";
import { screen } from "@testing-library/react-native";
import { useHeaderHeight } from "expo-router/react-navigation";
import type { ReactElement } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import type { ChatSession } from "@/features/chat/state/use-chat-session";
import { useConversation } from "@/features/chat/state/use-chat-session";
import type { EpisodeAsk } from "@/features/episode/state/episode-asks";
import { useEpisodeAsks } from "@/features/episode/state/episode-asks";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeAskScreen } from "./episode-ask-screen";

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: jest.fn(),
}));

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: jest.fn(),
}));

jest.mock("@ai-sdk/react", () => ({
  useChat: () => ({ messages: [] }),
}));

jest.mock("@/features/chat/state/use-chat-session", () => ({
  STREAM_UPDATE_INTERVAL_MS: 50,
  useConversation: jest.fn(),
}));

jest.mock("@/features/episode/state/episode-asks", () => ({
  useEpisodeAskDrafts: () => ({
    draft: "",
    editingMessageId: undefined,
    setDraft: jest.fn(),
    setEditingMessageId: jest.fn(),
    stashedDraft: { current: "" },
  }),
  useEpisodeAsks: jest.fn(),
}));

jest.mock("@/shared/navigation/use-screen-arrival", () => ({
  useFocusOnArrival: () => ({ current: null }),
}));

interface PanelProps {
  chat: { tag?: string };
  onAskInSideChat?: unknown;
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

const CORRECTION = {
  entries: [
    {
      fixed: "the wrong coffee",
      original: "wrong coffee",
      pattern: "article-the-specific",
      why: "잘못 나온 그 하나를 짚어 말할 때는 the를 붙여요.",
    },
  ],
  fixed: "I think you gave me the wrong coffee.",
  messageId: "m1",
  original: "I think this is wrong coffee.",
};

const ASK = {
  chat: { tag: "ask-chat" },
  correction: CORRECTION,
  id: "ask-m1",
} as unknown as EpisodeAsk;

const mockUseAuthSession = jest.mocked(useAuthSession);
const mockUseConversation = jest.mocked(useConversation);
const mockUseEpisodeAsks = jest.mocked(useEpisodeAsks);
const mockUseHeaderHeight = jest.mocked(useHeaderHeight);
const onMissing = jest.fn();

function stubAsks(asks: EpisodeAsk[]) {
  mockUseEpisodeAsks.mockReturnValue({
    askOf: (id: string) => asks.find((ask) => ask.id === id),
    openAsk: jest.fn(() => "ask-m1"),
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
    tag: "ask-session",
  } as unknown as ChatSession);
  stubAsks([ASK]);
});

test("출처에 내가 쓴 원문과 고친 문장을 배울 표현으로 보여 준다", async () => {
  await renderWithHeroUI(
    <EpisodeAskScreen id="ask-m1" onMissing={onMissing} />
  );

  expect(screen.getByTestId("ask-panel")).toBeOnTheScreen();
  expect(screen.getByText("배울 표현")).toBeOnTheScreen();
  expect(screen.getByTestId("correction-source-original")).toHaveTextContent(
    "I think this is wrong coffee."
  );
  expect(screen.getByTestId("correction-source-fixed")).toHaveTextContent(
    "I think you gave me the wrong coffee."
  );
  expect(panel?.placeholder).toBe("궁금한 것을 한국어로 물어보세요");
});

// 이 시트는 이해 전용이다. 본 채팅으로 무언가를 보내는 장치를 두지 않고,
// 여기서 또 다른 물어보기를 시작하지도 않는다.
test("여기서 또 다른 물어보기를 시작할 수 없다", async () => {
  await renderWithHeroUI(
    <EpisodeAskScreen id="ask-m1" onMissing={onMissing} />
  );

  expect(panel?.onAskInSideChat).toBeUndefined();
});

test("열려던 대화가 없으면 아무것도 그리지 않고 시트를 닫는다", async () => {
  stubAsks([]);

  await renderWithHeroUI(
    <EpisodeAskScreen id="ask-m1" onMissing={onMissing} />
  );

  expect(screen.queryByTestId("ask-panel")).toBeNull();
  expect(onMissing).toHaveBeenCalled();
});
