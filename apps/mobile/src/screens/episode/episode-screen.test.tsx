import { beforeEach, expect, jest, test } from "@jest/globals";
import type { Session } from "@supabase/supabase-js";
import { screen, userEvent } from "@testing-library/react-native";
import type { UIMessage } from "ai";
import {
  useHeaderHeight,
  usePreventRemove,
} from "expo-router/react-navigation";
import type { ComponentType, ReactNode } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import type { ChatSession } from "@/features/chat/state/use-chat-session";
import { useConversation } from "@/features/chat/state/use-chat-session";
import type { EpisodeEnding } from "@/features/episode/state/episode-ending";
import type { EpisodeNextUp } from "@/features/episode/state/episode-next-up";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeScreen } from "./episode-screen";

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: jest.fn(),
}));

const mockNavigationDispatch = jest.fn();

jest.mock("expo-router", () => ({
  useNavigation: () => ({ dispatch: mockNavigationDispatch }),
}));

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: jest.fn(),
  usePreventRemove: jest.fn(),
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

/** 물어보는 대화는 경로가 소유한다. 화면이 여는 자리만 확인한다. */
const mockOpenAskConversation = jest.fn<
  (input: { correction: unknown; snapshot: unknown[] }) => string
>(() => "ask-m1");

jest.mock("@/features/episode/state/episode-asks", () => ({
  useEpisodeAsks: () => ({
    askOf: () => undefined,
    openAsk: mockOpenAskConversation,
  }),
}));

/**
 * The run is stood in for so the test never reaches the network. Opening is
 * what the real hook does on mount, so the stand-in reports the same moment:
 * a fresh run means the scene starts over.
 */
const mockOpenedRuns =
  jest.fn<
    (
      token: string | undefined,
      episodeId: string,
      initialMessageCount: number,
      readOnly: boolean
    ) => void
  >();
let mockEnding: EpisodeEnding | undefined;
let mockNextUp: EpisodeNextUp | undefined;
/** 카페 1화에서 실제로 나올 법한 교정 하나와 그것이 붙는 메시지. */
const CORRECTED_MESSAGE = {
  id: "m1",
  parts: [{ text: "I think this is wrong coffee.", type: "text" }],
  role: "user",
} as unknown as UIMessage;

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

/** 교정 상태도 대화가 소유하므로 같은 스탠드인이 함께 돌려준다. */
let mockCorrections: {
  beginResend: jest.Mock<(messageId: string) => void>;
  byMessageId: Record<string, typeof CORRECTION>;
  confirmResend: jest.Mock<() => void>;
  receive: jest.Mock<() => void>;
  resent: Record<string, true>;
  seenPatterns: () => string[];
};

jest.mock("@/features/episode/state/use-episode-run", () => {
  const React = require("react") as typeof import("react");

  return {
    useEpisodeRun: (
      accessToken: string | undefined,
      episodeId: string,
      initialMessages: unknown[],
      readOnly: boolean
    ) => {
      React.useEffect(() => {
        mockOpenedRuns(
          accessToken,
          episodeId,
          initialMessages.length,
          readOnly
        );
      }, [accessToken, episodeId, initialMessages.length, readOnly]);

      return {
        chat: { tag: "episode-chat" },
        corrections: mockCorrections,
        ending: mockEnding,
        nextUp: mockNextUp,
        open: jest.fn(),
      };
    },
  };
});

const mockOpenAsk = jest.fn<(id: string) => void>();

/** The episode the route says this screen is playing. */
const PLAYING = {
  episodeId: "11000000-0000-4000-8000-000000000002",
  initialMessages: [],
  isStartingNext: false,
  onOpenAsk: mockOpenAsk,
  readOnly: false,
  situation: "다른 방법을 찾아 계산을 끝내 보세요",
  situationEmoji: "💳",
};

interface PanelProps {
  banner?: ReactNode;
  busyLabel?: string;
  canStop?: boolean;
  chat: {
    isBusy?: boolean;
    send?: () => void;
    stop?: () => Promise<void>;
    tag?: string;
  };
  closing?: ReactNode;
  hasMessageActions?: boolean;
  messageAddon?: ComponentType<{ message: UIMessage }>;
  onAskInSideChat?: unknown;
  onOpenSideChat?: unknown;
  placeholder?: string;
  sideChats?: unknown;
  topInset?: number;
}

let panel: PanelProps | undefined;

// The screen hands the panel a conversation, a banner and a closing, so the
// panel is stood in for and the test watches what it receives.
jest.mock("@/features/chat/ui/chat-panel", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    ChatPanel: (props: PanelProps) => {
      panel = props;
      const Addon = props.messageAddon;

      // 실제 패널은 메시지마다 하나씩 놓는다. 스탠드인은 교정이 붙은 그 메시지
      // 하나만 놓아, 화면이 매단 것이 실제로 무엇을 그리는지 확인한다.
      return React.createElement(
        View,
        { accessibilityLabel: "episode panel" },
        props.banner,
        props.closing,
        Addon
          ? React.createElement(Addon, { message: CORRECTED_MESSAGE })
          : null
      );
    },
  };
});

const mockUseAuthSession = jest.mocked(useAuthSession);
const mockUseConversation = jest.mocked(useConversation);
const mockUseHeaderHeight = jest.mocked(useHeaderHeight);
const mockUsePreventRemove = jest.mocked(usePreventRemove);

let preventedRemoval:
  | ((options: { data: { action: { type: string } } }) => void)
  | undefined;
let isRemovalPrevented = false;

const mockSend = jest.fn<() => void>();
const mockSetDraft = jest.fn<(value: string) => void>();

const conversation = {
  isBusy: false,
  messages: [CORRECTED_MESSAGE],
  retry: jest.fn(),
  send: mockSend,
  setDraft: mockSetDraft,
  tag: "conversation",
} as unknown as ChatSession;

beforeEach(() => {
  panel = undefined;
  mockEnding = undefined;
  mockCorrections = {
    beginResend: jest.fn(),
    byMessageId: {},
    confirmResend: jest.fn(),
    receive: jest.fn(),
    resent: {},
    seenPatterns: () => [],
  };
  mockOpenAsk.mockClear();
  mockOpenAskConversation.mockClear();
  mockSend.mockClear();
  mockSetDraft.mockClear();
  mockNextUp = {
    copy: "예고",
    episodeId: "11000000-0000-4000-8000-000000000003",
    number: 3,
    title: "자리를 맡아 둔 사이에",
  };
  mockOpenedRuns.mockClear();
  mockNavigationDispatch.mockClear();
  preventedRemoval = undefined;
  isRemovalPrevented = false;
  conversation.isBusy = false;
  mockUseHeaderHeight.mockReturnValue(96);
  mockUseAuthSession.mockReturnValue({
    session: { access_token: "token-1" } as Session,
    status: "signedIn",
  } as ReturnType<typeof useAuthSession>);
  mockUseConversation.mockReturnValue(conversation);
  mockUsePreventRemove.mockImplementation((prevent, callback) => {
    isRemovalPrevented = prevent;
    preventedRemoval = callback as typeof preventedRemoval;
  });
});

test("화면에 들어오면 그 자리에서 에피소드를 연다", async () => {
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(mockOpenedRuns).toHaveBeenCalledWith(
    "token-1",
    PLAYING.episodeId,
    0,
    false
  );
  expect(panel?.chat).toMatchObject({ tag: "conversation" });
  expect(panel?.topInset).toBe(96);
  expect(panel?.placeholder).toBe("영어로 말해 보세요");
});

// 물어보는 자리로 들어가는 길은 교정 카드 하나뿐이다. 템플릿의 텍스트 선택
// 진입과 메시지 하나에 거는 동작은 에피소드에 붙이지 않는다.
test("텍스트 선택 진입과 메시지 동작을 두지 않는다", async () => {
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(panel?.onAskInSideChat).toBeUndefined();
  expect(panel?.onOpenSideChat).toBeUndefined();
  expect(panel?.sideChats).toBeUndefined();
  expect(panel?.hasMessageActions).toBe(false);
});

test("교정이 없는 메시지에는 아무것도 붙지 않는다", async () => {
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(panel?.messageAddon).toBeDefined();
  expect(screen.queryByTestId("correction-line")).toBeNull();
});

test("몰랐던 표현이 있으면 그 말풍선 아래에 고친 문장 한 줄이 붙는다", async () => {
  mockCorrections.byMessageId = { m1: CORRECTION };

  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(screen.getByTestId("correction-line-fixed")).toHaveTextContent(
    "I think you gave me the wrong coffee."
  );
});

test("다시 보내기를 누르면 고친 문장이 입력창에 담긴다", async () => {
  mockCorrections.byMessageId = { m1: CORRECTION };
  const user = userEvent.setup();

  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  await user.press(screen.getByLabelText("배울 표현 보기"));
  await user.press(screen.getByTestId("correction-resend"));

  expect(mockSetDraft).toHaveBeenCalledWith(
    "I think you gave me the wrong coffee."
  );
  expect(mockCorrections.beginResend).toHaveBeenCalledWith("m1");
});

// 보내기 전까지는 아직 보낸 것이 아니다. 사용자는 담긴 문장을 고칠 수 있다.
test("보내야 그 배울 표현을 다시 보냈다고 적는다", async () => {
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(mockCorrections.confirmResend).not.toHaveBeenCalled();

  // 패널이 보내기를 부르는 자리를 그대로 부른다. 두 mock 말고는 아무것도
  // 바뀌지 않으므로 렌더를 기다릴 것이 없다.
  panel?.chat.send?.();

  expect(mockCorrections.confirmResend).toHaveBeenCalled();
  expect(mockSend).toHaveBeenCalled();
});

test("AI에게 물어보기를 누르면 그 말까지의 대화를 이어받은 자리를 연다", async () => {
  mockCorrections.byMessageId = { m1: CORRECTION };
  const user = userEvent.setup();

  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  await user.press(screen.getByLabelText("배울 표현 보기"));
  await user.press(screen.getByTestId("correction-ask"));

  expect(mockOpenAskConversation).toHaveBeenCalledWith({
    correction: CORRECTION,
    snapshot: [CORRECTED_MESSAGE],
  });
  expect(mockOpenAsk).toHaveBeenCalledWith("ask-m1");
});

test("사건이 진행 중이면 마무리를 두지 않는다", async () => {
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(panel?.closing).toBeUndefined();
});

// 상황 줄은 사건이 끝났는지와 무관하게 늘 같은 자리에 있어야 한다.
test("결말과 무관하게 상황 줄 배너를 채팅 패널에 넘긴다", async () => {
  mockEnding = { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." };
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(panel?.banner).toBeDefined();
  expect(screen.getByTestId("episode-situation-banner")).toBeOnTheScreen();
  expect(screen.getByText(PLAYING.situation)).toBeOnTheScreen();
});

test("결말이 오면 마무리가 입력 자리를 대신한다", async () => {
  const leave = jest.fn();
  const user = userEvent.setup();

  mockEnding = { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." };
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={leave} onStartNext={jest.fn()} />
  );

  expect(panel?.closing).toBeDefined();
  expect(screen.getByTestId("episode-closing-outcome")).toHaveTextContent(
    "원하던 커피를 새로 받아냈다."
  );
  expect(screen.queryByText("성공")).not.toBeOnTheScreen();

  await user.press(screen.getByRole("button", { name: "홈으로 가기" }));

  expect(leave).toHaveBeenCalledTimes(1);
});

test("장면 응답 중에도 중지와 나가기 동작을 열어 둔다", async () => {
  const leave = jest.fn();
  const startNext = jest.fn();
  const user = userEvent.setup();

  conversation.isBusy = true;
  mockEnding = { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." };
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={leave} onStartNext={startNext} />
  );

  expect(screen.getByRole("button", { name: "홈으로 가기" })).toHaveProp(
    "accessibilityState",
    { busy: false, disabled: false }
  );
  expect(screen.getByRole("button", { name: "3화 시작하기" })).toHaveProp(
    "accessibilityState",
    { busy: false, disabled: false }
  );

  await user.press(screen.getByRole("button", { name: "홈으로 가기" }));
  await user.press(screen.getByRole("button", { name: "3화 시작하기" }));

  expect(leave).toHaveBeenCalledTimes(1);
  expect(startNext).toHaveBeenCalledTimes(1);
});

// 저장하는 주체가 서버 하나가 되면서 화면이 붙잡을 이유가 사라졌다. 답변을
// 받는 중에 나가도 서버는 자기가 만든 데까지를 스스로 남긴다.
test("답변을 받는 중에도 나가기를 붙잡지 않는다", async () => {
  conversation.isBusy = true;

  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(isRemovalPrevented).toBe(false);
  expect(preventedRemoval).toBeUndefined();
  expect(mockNavigationDispatch).not.toHaveBeenCalled();
  expect(panel?.busyLabel).toBeUndefined();
});

// 다음 화로 넘어가는 것은 지난 에피소드를 이어 가는 것이 아니라 화면을 새로
// 여는 것이라, 이 화면은 알리기만 하고 경로가 연다.
test("다음 화 시작하기는 경로에 알린다", async () => {
  const startNext = jest.fn();
  const user = userEvent.setup();

  mockEnding = { kind: "실패", outcome: "그냥 들고 나왔다." };
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={startNext} />
  );

  await user.press(screen.getByRole("button", { name: "3화 시작하기" }));

  expect(startNext).toHaveBeenCalledTimes(1);
  expect(startNext).toHaveBeenCalledWith(
    "11000000-0000-4000-8000-000000000003"
  );
});

test("다음 화를 여는 동안 마무리의 두 길을 잠근다", async () => {
  mockEnding = { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." };

  await renderWithHeroUI(
    <EpisodeScreen
      {...PLAYING}
      isStartingNext
      onLeave={jest.fn()}
      onStartNext={jest.fn()}
    />
  );

  expect(screen.getByRole("button", { name: "3화 시작하기" })).toHaveProp(
    "accessibilityState",
    { busy: true, disabled: true }
  );
  expect(screen.getByRole("button", { name: "홈으로 가기" })).toBeDisabled();
});

test("끝난 대화는 입력 없이 읽기 전용으로 연다", async () => {
  mockEnding = { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." };

  await renderWithHeroUI(
    <EpisodeScreen
      {...PLAYING}
      initialMessages={[
        {
          id: "saved-1",
          parts: [{ text: "Done", type: "text" }],
          role: "user",
        },
      ]}
      onLeave={jest.fn()}
      onStartNext={jest.fn()}
      readOnly
    />
  );

  expect(mockOpenedRuns).toHaveBeenCalledWith(
    "token-1",
    PLAYING.episodeId,
    1,
    true
  );
  expect(panel?.closing).toBeDefined();
  expect(screen.getByTestId("episode-ending-mark")).toBeOnTheScreen();
  expect(screen.getByText("끝")).toBeOnTheScreen();
  expect(screen.queryByText("끝난 대화 기록")).not.toBeOnTheScreen();
  expect(
    screen.queryByRole("button", { name: "3화 시작하기" })
  ).not.toBeOnTheScreen();
});
