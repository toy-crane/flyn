import { beforeEach, expect, jest, test } from "@jest/globals";
import type { Session } from "@supabase/supabase-js";
import { screen, userEvent } from "@testing-library/react-native";
import { useHeaderHeight } from "expo-router/react-navigation";
import type { ReactNode } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import type { ChatSession } from "@/features/chat/state/use-chat-session";
import { useConversation } from "@/features/chat/state/use-chat-session";
import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeScreen } from "./episode-screen";

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: jest.fn(),
}));

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: jest.fn(),
}));

jest.mock("@/features/chat/state/use-chat-session", () => ({
  useConversation: jest.fn(),
  useLocalChatDrafts: () => ({
    draft: "",
    editingMessageId: undefined,
    setDraft: jest.fn(),
    setEditingMessageId: jest.fn(),
    stashedDraft: { current: "" },
  }),
}));

/**
 * The run is stood in for so the test never reaches the network. Opening is
 * what the real hook does on mount, so the stand-in reports the same moment:
 * a fresh run means the scene starts over.
 */
const mockOpenedRuns = jest.fn<(token: string | undefined) => void>();
let mockEnding: EpisodeEnding | undefined;

jest.mock("@/features/episode/state/use-episode-run", () => {
  const React = require("react") as typeof import("react");

  return {
    useEpisodeRun: (accessToken: string | undefined) => {
      React.useEffect(() => {
        mockOpenedRuns(accessToken);
      }, [accessToken]);

      return {
        chat: { tag: "episode-chat" },
        ending: mockEnding,
        open: jest.fn(),
      };
    },
  };
});

interface PanelProps {
  chat: { tag?: string };
  closing?: ReactNode;
  hasMessageActions?: boolean;
  onAskInSideChat?: unknown;
  onOpenSideChat?: unknown;
  placeholder?: string;
  sideChats?: unknown;
  topInset?: number;
}

let panel: PanelProps | undefined;

// The screen hands the panel a conversation and a closing, so the panel is
// stood in for and the test watches what it receives.
jest.mock("@/features/chat/ui/chat-panel", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    ChatPanel: (props: PanelProps) => {
      panel = props;

      return React.createElement(
        View,
        { accessibilityLabel: "episode panel" },
        props.closing
      );
    },
  };
});

const mockUseAuthSession = jest.mocked(useAuthSession);
const mockUseConversation = jest.mocked(useConversation);
const mockUseHeaderHeight = jest.mocked(useHeaderHeight);

const conversation = {
  messages: [],
  retry: jest.fn(),
  tag: "conversation",
} as unknown as ChatSession;

beforeEach(() => {
  panel = undefined;
  mockEnding = undefined;
  mockOpenedRuns.mockClear();
  mockUseHeaderHeight.mockReturnValue(96);
  mockUseAuthSession.mockReturnValue({
    session: { access_token: "token-1" } as Session,
    status: "signedIn",
  } as ReturnType<typeof useAuthSession>);
  mockUseConversation.mockReturnValue(conversation);
});

test("화면에 들어오면 그 자리에서 에피소드를 연다", async () => {
  await renderWithHeroUI(<EpisodeScreen onLeave={jest.fn()} />);

  expect(mockOpenedRuns).toHaveBeenCalledWith("token-1");
  expect(panel?.chat).toMatchObject({ tag: "conversation" });
  expect(panel?.topInset).toBe(96);
  expect(panel?.placeholder).toBe("영어로 말해 보세요");
});

// 잠깐 물어보기는 다음 단위다. 템플릿의 Side chat이 그 자리를 미리 차지하지
// 않도록 진입을 아예 넘기지 않는다.
test("Side chat으로 들어가는 길과 메시지 동작을 두지 않는다", async () => {
  await renderWithHeroUI(<EpisodeScreen onLeave={jest.fn()} />);

  expect(panel?.onAskInSideChat).toBeUndefined();
  expect(panel?.onOpenSideChat).toBeUndefined();
  expect(panel?.sideChats).toBeUndefined();
  expect(panel?.hasMessageActions).toBe(false);
});

test("사건이 진행 중이면 마무리를 두지 않는다", async () => {
  await renderWithHeroUI(<EpisodeScreen onLeave={jest.fn()} />);

  expect(panel?.closing).toBeUndefined();
});

test("결말이 오면 마무리가 입력 자리를 대신한다", async () => {
  const leave = jest.fn();
  const user = userEvent.setup();

  mockEnding = { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." };
  await renderWithHeroUI(<EpisodeScreen onLeave={leave} />);

  expect(panel?.closing).toBeDefined();
  expect(screen.getByTestId("episode-closing-kind")).toHaveTextContent("성공");

  await user.press(screen.getByRole("button", { name: "홈으로 가기" }));

  expect(leave).toHaveBeenCalledTimes(1);
});

// 다시 시작은 지난 에피소드를 이어 가는 것이 아니라 처음부터 새로 여는 것이다.
test("다시 시작하면 에피소드를 처음부터 새로 연다", async () => {
  const user = userEvent.setup();

  mockEnding = { kind: "실패", outcome: "그냥 들고 나왔다." };
  await renderWithHeroUI(<EpisodeScreen onLeave={jest.fn()} />);

  expect(mockOpenedRuns).toHaveBeenCalledTimes(1);

  await user.press(screen.getByRole("button", { name: "다시 시작하기" }));

  expect(mockOpenedRuns).toHaveBeenCalledTimes(2);
});
