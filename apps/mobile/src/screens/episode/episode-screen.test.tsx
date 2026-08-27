import { beforeEach, expect, jest, test } from "@jest/globals";
import type { Session } from "@supabase/supabase-js";
import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import {
  useHeaderHeight,
  usePreventRemove,
} from "expo-router/react-navigation";
import type { ReactNode } from "react";

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
let mockIsSaving = false;
let mockNextUp: EpisodeNextUp | undefined;
const mockStopAndSave = jest.fn<() => Promise<void>>(() => Promise.resolve());

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
        ending: mockEnding,
        isSaving: mockIsSaving,
        nextUp: mockNextUp,
        open: jest.fn(),
        stopAndSave: mockStopAndSave,
      };
    },
  };
});

/** The episode the route says this screen is playing. */
const PLAYING = {
  episodeId: "11000000-0000-4000-8000-000000000002",
  initialMessages: [],
  onSettlingChange: jest.fn(),
  readOnly: false,
  situation: "다른 방법을 찾아 계산을 끝내 보세요",
  situationEmoji: "💳",
};

interface PanelProps {
  banner?: ReactNode;
  busyLabel?: string;
  canStop?: boolean;
  chat: { isBusy?: boolean; stop?: () => Promise<void>; tag?: string };
  closing?: ReactNode;
  hasMessageActions?: boolean;
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

      return React.createElement(
        View,
        { accessibilityLabel: "episode panel" },
        props.banner,
        props.closing
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

const conversation = {
  isBusy: false,
  messages: [],
  retry: jest.fn(),
  tag: "conversation",
} as unknown as ChatSession;

beforeEach(() => {
  panel = undefined;
  mockEnding = undefined;
  mockIsSaving = false;
  mockNextUp = {
    copy: "예고",
    episodeId: "11000000-0000-4000-8000-000000000003",
    number: 3,
    title: "자리를 맡아 둔 사이에",
  };
  mockOpenedRuns.mockClear();
  mockNavigationDispatch.mockClear();
  mockStopAndSave.mockReset();
  mockStopAndSave.mockResolvedValue();
  PLAYING.onSettlingChange.mockClear();
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
  expect(panel?.canStop).toBe(true);
  expect(panel?.topInset).toBe(96);
  expect(panel?.placeholder).toBe("영어로 말해 보세요");
});

// 잠깐 물어보기는 다음 단위다. 템플릿의 Side chat이 그 자리를 미리 차지하지
// 않도록 진입을 아예 넘기지 않는다.
test("Side chat으로 들어가는 길과 메시지 동작을 두지 않는다", async () => {
  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(panel?.onAskInSideChat).toBeUndefined();
  expect(panel?.onOpenSideChat).toBeUndefined();
  expect(panel?.sideChats).toBeUndefined();
  expect(panel?.hasMessageActions).toBe(false);
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
  expect(screen.getByTestId("episode-closing-kind")).toHaveTextContent("성공");

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

  expect(PLAYING.onSettlingChange).toHaveBeenLastCalledWith(false);
  expect(panel?.canStop).toBe(true);
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

test("중지한 장면을 저장하는 동안에만 동작을 잠근다", async () => {
  mockIsSaving = true;
  mockEnding = { kind: "성공", outcome: "원하던 커피를 새로 받아냈다." };

  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(PLAYING.onSettlingChange).toHaveBeenLastCalledWith(true);
  expect(panel?.canStop).toBe(false);
  expect(panel?.busyLabel).toBe("진행을 저장하고 있어요");
  expect(panel?.chat).toMatchObject({
    isBusy: true,
    stop: mockStopAndSave,
  });
  expect(screen.getByRole("button", { name: "홈으로 가기" })).toHaveProp(
    "accessibilityState",
    { busy: false, disabled: true }
  );
});

test("iOS 뒤로 스와이프는 중지 저장 뒤 같은 POP 동작을 한 번만 이어 간다", async () => {
  let finishSave: (() => void) | undefined;
  mockStopAndSave.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishSave = resolve;
      })
  );
  conversation.isBusy = true;

  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  expect(isRemovalPrevented).toBe(true);
  const action = { type: "POP" };
  await act(() => {
    preventedRemoval?.({ data: { action } });
    preventedRemoval?.({ data: { action } });

    return Promise.resolve();
  });

  expect(mockStopAndSave).toHaveBeenCalledTimes(1);
  expect(mockNavigationDispatch).not.toHaveBeenCalled();

  await act(() => {
    finishSave?.();

    return Promise.resolve();
  });

  await waitFor(() => {
    expect(isRemovalPrevented).toBe(false);
    expect(mockNavigationDispatch).toHaveBeenCalledTimes(1);
    expect(mockNavigationDispatch).toHaveBeenCalledWith(action);
  });
});

test("Android 시스템 뒤로 가기는 저장 실패 뒤에도 이어 간다", async () => {
  mockStopAndSave.mockRejectedValueOnce(new Error("offline"));
  conversation.isBusy = true;

  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  const action = { type: "GO_BACK" };
  await act(() => {
    preventedRemoval?.({ data: { action } });

    return Promise.resolve();
  });

  await waitFor(() => {
    expect(mockNavigationDispatch).toHaveBeenCalledWith(action);
  });
});

test("다음 화 replace도 저장 뒤 원래 동작을 이어 간다", async () => {
  conversation.isBusy = true;

  await renderWithHeroUI(
    <EpisodeScreen {...PLAYING} onLeave={jest.fn()} onStartNext={jest.fn()} />
  );

  const action = { type: "REPLACE" };
  await act(() => {
    preventedRemoval?.({ data: { action } });

    return Promise.resolve();
  });

  await waitFor(() => {
    expect(mockStopAndSave).toHaveBeenCalledTimes(1);
    expect(mockNavigationDispatch).toHaveBeenCalledWith(action);
  });
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
  expect(screen.getByText("끝난 대화 기록")).toBeOnTheScreen();
  expect(
    screen.queryByRole("button", { name: "3화 시작하기" })
  ).not.toBeOnTheScreen();
});
