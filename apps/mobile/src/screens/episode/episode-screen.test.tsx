import { beforeEach, expect, jest, test } from "@jest/globals";
import type { Session } from "@supabase/supabase-js";
import { act, screen, userEvent } from "@testing-library/react-native";
import type { UIMessage } from "ai";
import { usePreventRemove } from "expo-router/react-navigation";
import type { ComponentType, ReactNode } from "react";

import { useAuthSession } from "@/features/auth/state/auth-session";
import type { ChatSession } from "@/features/chat/state/use-conversation";
import { useConversation } from "@/features/chat/state/use-conversation";
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
  usePreventRemove: jest.fn(),
}));

jest.mock("@/features/chat/state/use-conversation", () => ({
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
const mockOpenedStoryPlays =
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
  review: {
    example: "This is the wrong bag.",
    exampleMeaning: "이건 다른 가방이에요.",
    meaning: "다른 커피인 것 같아요.",
    situation: "주문을 확인할 때",
  },
};

/** 교정 상태도 대화가 소유하므로 같은 스탠드인이 함께 돌려준다. */
let mockCorrections: {
  byMessageId: Record<string, typeof CORRECTION>;
  states: Record<
    string,
    import("@/features/episode/state/episode-corrections").ExpressionState
  >;
  retry: jest.Mock<(messageId: string) => void>;
};

/** 화면이 담기와 취소를 알려 오는 자리. 테스트가 그것을 대신 부른다. */
type SavedChanged = (isSaved: boolean) => void;
let mockSavedChanged: SavedChanged | undefined;

/** 담아 둔 표현의 상태도 같은 스탠드인이 함께 돌려준다. */
let mockSaved: {
  retain: jest.Mock<(messageIds: Set<string>) => void>;
  states: Record<string, never>;
  toggle: jest.Mock<(spot: unknown) => void>;
};

jest.mock("@/features/episode/state/use-episode-story-play", () => {
  const React = require("react") as typeof import("react");

  return {
    useEpisodeStoryPlay: (
      accessToken: string | undefined,
      episodeId: string,
      initialMessages: unknown[],
      readOnly: boolean,
      ..._rest: unknown[]
    ) => {
      // 담고 도로 놓았다고 알리는 자리. 화면이 마지막 인자로 넘긴다.
      mockSavedChanged = _rest.at(-1) as SavedChanged;
      React.useEffect(() => {
        mockOpenedStoryPlays(
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
        saved: mockSaved,
      };
    },
  };
});

const mockOpenAsk = jest.fn<(id: string) => void>();

/** The episode the route says this screen is playing. */
const PLAYING = {
  episodeId: "11000000-0000-4000-8000-000000000002",
  initialMessages: [],
  onOpenAsk: mockOpenAsk,
  onReview: jest.fn(),
  onStoryPlayStarted: jest.fn<(storyPlayId: string) => void>(),
  readOnly: false,
  situation: "다른 방법을 찾아 계산을 끝내 보세요",
  situationEmoji: "💳",
  storyId: "10000000-0000-4000-8000-000000000001",
  storyPlayId: "1a000000-0000-4000-8000-000000000001",
};

interface PanelProps {
  banner?: ReactNode;
  busyLabel?: string;
  canSaveUtterances?: boolean;
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
  placeholder?: string;
  toast?: ReactNode;
  topInset?: number;
  utteranceAddon?: ComponentType<{
    at: number;
    children: ReactNode;
    messageId: string;
  }>;
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
        props.toast,
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
    byMessageId: {},
    retry: jest.fn(),
    states: {},
  };
  mockSaved = { retain: jest.fn(), states: {}, toggle: jest.fn() };
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
  mockOpenedStoryPlays.mockClear();
  mockNavigationDispatch.mockClear();
  preventedRemoval = undefined;
  isRemovalPrevented = false;
  conversation.isBusy = false;
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
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  expect(mockOpenedStoryPlays).toHaveBeenCalledWith(
    "token-1",
    PLAYING.episodeId,
    0,
    false
  );
  expect(panel?.chat).toMatchObject({ tag: "conversation" });
  // 불투명 네이티브 헤더가 확보한 높이를 본문에 다시 더하지 않는다.
  expect(panel?.topInset).toBeUndefined();
  expect(panel?.placeholder).toBe("영어나 한국어로 적어 주세요.");
});

test("표현을 확인하거나 장면을 받는 중에도 화면 이탈을 막지 않는다", async () => {
  conversation.isBusy = true;
  mockCorrections.states = { m1: { retrying: false, status: "pending" } };
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);
  expect(isRemovalPrevented).toBe(false);
  expect(preventedRemoval).toBeUndefined();
});

// 메시지 하나에 거는 동작은 에피소드에 붙이지 않는다.
test("메시지 동작을 두지 않는다", async () => {
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  expect(panel?.hasMessageActions).toBe(false);
});

test("교정이 없는 메시지에는 아무것도 붙지 않는다", async () => {
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  expect(panel?.messageAddon).toBeDefined();
  expect(screen.queryByTestId("correction-line")).toBeNull();
});

test("몰랐던 표현이 있으면 그 말풍선 아래에 고친 문장 한 줄이 붙는다", async () => {
  mockCorrections.byMessageId = { m1: CORRECTION };

  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  expect(screen.getByTestId("correction-line-fixed")).toHaveTextContent(
    "I think you gave me the wrong coffee."
  );
});

test("교정 카드에 다시 보내기를 두지 않고 원래 입력을 유지한다", async () => {
  mockCorrections.byMessageId = { m1: CORRECTION };
  const user = userEvent.setup();
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);
  await user.press(screen.getByLabelText("더 자연스러운 영어 표현 보기"));
  expect(screen.queryByText("다시 보내기")).toBeNull();
  expect(mockSetDraft).not.toHaveBeenCalled();
});

test("AI에게 물어보기를 누르면 그 말까지의 대화를 이어받은 자리를 연다", async () => {
  mockCorrections.byMessageId = { m1: CORRECTION };
  const user = userEvent.setup();

  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  await user.press(screen.getByLabelText("더 자연스러운 영어 표현 보기"));
  await user.press(screen.getByTestId("correction-ask"));

  expect(mockOpenAskConversation).toHaveBeenCalledWith({
    correction: CORRECTION,
    snapshot: [CORRECTED_MESSAGE],
  });
  expect(mockOpenAsk).toHaveBeenCalledWith("ask-m1");
});

test("사건이 진행 중이면 마무리를 두지 않는다", async () => {
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  expect(panel?.closing).toBeUndefined();
});

// 상황 줄은 사건이 끝났는지와 무관하게 늘 같은 자리에 있어야 한다.
test("결말과 무관하게 상황 줄 배너를 채팅 패널에 넘긴다", async () => {
  mockEnding = { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." };
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  expect(panel?.banner).toBeDefined();
  expect(screen.getByTestId("episode-situation-banner")).toBeOnTheScreen();
  expect(screen.getByText(PLAYING.situation)).toBeOnTheScreen();
});

test("마지막 대사가 와도 앞선 메시지의 표현 확인이 남으면 종료 카드를 기다린다", async () => {
  mockEnding = { kind: "성공", outcome: "커피를 받았다." };
  mockCorrections.states = { earlier: { retrying: false, status: "pending" } };
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);
  expect(screen.getByTestId("episode-ending-checking")).toHaveTextContent(
    "표현을 확인하고 있어요."
  );
  expect(screen.queryByTestId("episode-closing")).toBeNull();
  expect(screen.queryByRole("button", { name: "표현 돌아보기" })).toBeNull();
  expect(panel?.closing).toBeDefined();
});

test("모든 확인이 실패로 끝나도 실제 결말과 표현 돌아보기를 표시한다", async () => {
  mockEnding = { kind: "타협", outcome: "다른 음료를 받았다." };
  mockCorrections.states = { m1: { status: "error" } };
  const onReview = jest.fn();
  const user = userEvent.setup();
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} onReview={onReview} />);
  expect(screen.getByText("다른 음료를 받았다")).toBeOnTheScreen();
  expect(screen.getByText("표현을 확인하지 못했어요.")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "표현 돌아보기" }));
  expect(onReview).toHaveBeenCalledWith(mockNextUp);
});

test("재시도가 끝나도 축하를 다시 재생하지 않는다", async () => {
  mockEnding = { kind: "성공", outcome: "커피를 받았다." };
  const view = await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);
  expect(
    screen.getByTestId("episode-celebration-burst", {
      includeHiddenElements: true,
    })
  ).toBeOnTheScreen();
  mockCorrections.states = { m1: { retrying: true, status: "pending" } };
  await view.rerender(<EpisodeScreen {...PLAYING} />);
  expect(screen.queryByTestId("episode-closing")).toBeNull();
  mockCorrections.states = { m1: { status: "natural" } };
  await view.rerender(<EpisodeScreen {...PLAYING} />);
  expect(screen.getByTestId("episode-closing")).toBeOnTheScreen();
  expect(
    screen.queryByTestId("episode-celebration-burst", {
      includeHiddenElements: true,
    })
  ).toBeNull();
});

test("기록에서도 같은 종료 카드와 교정을 보여 주고 축하는 반복하지 않는다", async () => {
  mockEnding = { kind: "성공", outcome: "커피를 받았다." };
  mockCorrections.byMessageId = { m1: CORRECTION };
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} readOnly recordedEnding={mockEnding} />
  );
  expect(screen.getByTestId("episode-closing")).toBeOnTheScreen();
  expect(screen.getByTestId("correction-line-fixed")).toBeOnTheScreen();
  expect(screen.queryByTestId("episode-celebration-burst")).toBeNull();
  expect(screen.queryByText("끝")).toBeNull();
});

test("인물 말풍선 곁에 담아 둘 자리를 함께 넘긴다", async () => {
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  expect(panel?.utteranceAddon).toBeDefined();
  // 아직 담은 것이 없으므로 알릴 것도 없다.
  expect(panel?.toast).toBeUndefined();
});

test("담으면 상황 줄 밑에 뜰 문구를 대화판에 넘긴다", async () => {
  await renderWithHeroUI(<EpisodeScreen {...PLAYING} />);

  await act(() => {
    mockSavedChanged?.(true);
  });

  expect(panel?.toast).toBeDefined();
  expect(screen.getByText("표현을 저장했어요.")).toBeOnTheScreen();

  await act(() => {
    mockSavedChanged?.(false);
  });

  expect(screen.getByText("저장을 취소했어요.")).toBeOnTheScreen();
  expect(screen.queryByText("표현을 저장했어요.")).toBeNull();
});

test("회차가 생기기 전에는 담아 둘 수 없다고 대화판에 알린다", async () => {
  const view = await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} storyPlayId={undefined} />
  );

  // 자리는 그대로 넘긴다. 복사는 회차 없이도 되는 동작이라 그동안에도 선다.
  expect(panel?.utteranceAddon).toBeDefined();
  expect(panel?.canSaveUtterances).toBe(false);

  await act(() => {
    view.rerender(<EpisodeScreen {...PLAYING} />);
  });

  expect(panel?.canSaveUtterances).toBe(true);
});
