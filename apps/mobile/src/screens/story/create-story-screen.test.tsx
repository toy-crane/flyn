import { beforeEach, expect, jest, test } from "@jest/globals";
import { screen, userEvent, waitFor } from "@testing-library/react-native";
import type { UIMessage } from "ai";
import { Alert } from "react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { CreateStoryScreen } from "./create-story-screen";

const mockOutline = {
  characters: [{ name: "Lena", position: 1, role: "호텔 프런트 직원." }],
  episodes: [
    {
      cast: ["Lena"],
      number: 1,
      preview: "밤늦게 도착했는데 제 예약이 없대요.",
      title: "예약이 없는 호텔",
    },
  ],
  hook: "다음 달 베를린 출장인데, 혼자 해내야 해요",
  title: "베를린 출장 일주일",
};

/** 카드 하나가 이미 놓인 대화. 그 카드에 `대화 시작하기`가 붙어 있다. */
const mockMessages = [
  {
    id: "creation-opening",
    parts: [{ text: "어떤 상황을 만들고 싶어요?", type: "text" }],
    role: "assistant",
  },
  {
    id: "card-1",
    parts: [
      {
        input: mockOutline,
        state: "output-available",
        toolCallId: "call-1",
        type: "tool-proposeStory",
      },
    ],
    role: "assistant",
  },
] as unknown as UIMessage[];

const mockSaveStory =
  jest.fn<() => Promise<{ episodeId: string; storyId: string }>>();

jest.mock("@/features/story/api/create-story", () => {
  const actual = jest.requireActual(
    "@/features/story/api/create-story"
  ) as typeof import("@/features/story/api/create-story");

  return {
    ...actual,
    createStoryTransport: () => ({}),
    saveStory: () => mockSaveStory(),
  };
});

jest.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    clearError: jest.fn(),
    error: undefined,
    messages: mockMessages,
    regenerate: jest.fn(),
    sendMessage: jest.fn(),
    setMessages: jest.fn(),
    status: "ready",
    stop: jest.fn(),
  }),
}));

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: () => ({ session: { access_token: "token" } }),
}));

jest.mock("expo-router/react-navigation", () => ({
  useHeaderHeight: () => 0,
}));

jest.mock("@/shared/navigation/use-screen-arrival", () => ({
  useFocusOnArrival: () => ({ current: null }),
}));

/*
  패널은 메시지마다 곁들일 것을 그린다. 여기서는 그 자리만 흉내 내어, 화면이
  넘긴 카드가 실제로 어떻게 그려지는지 그대로 본다.
*/
jest.mock("@/features/chat/ui/chat-panel", () => {
  const React = require("react") as typeof import("react");
  const { View } = require("react-native") as typeof import("react-native");

  return {
    ChatPanel: ({
      chat,
      messageAddon: Addon,
    }: {
      chat: { messages: UIMessage[] };
      messageAddon?: (props: { message: UIMessage }) => React.ReactNode;
    }) =>
      React.createElement(
        View,
        { testID: "create-panel" },
        Addon
          ? chat.messages.map((message) =>
              React.createElement(Addon, { key: message.id, message })
            )
          : null
      ),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

/*
  실패한 시도는 아무것도 남기지 않는다. 알림을 닫으면 카드와 대화가 그대로 남아
  같은 카드로 다시 시작할 수 있어야 한다.
*/
test("만들기에 실패하면 시작 실패와 같은 알림을 띄우고 카드를 남긴다", async () => {
  const alert = jest.spyOn(Alert, "alert").mockImplementation(() => undefined);

  mockSaveStory.mockRejectedValue(new Error("Making the story failed"));

  const onMade = jest.fn();

  await renderWithHeroUI(<CreateStoryScreen onMade={onMade} />);

  const user = userEvent.setup();

  await user.press(screen.getByTestId("story-outline-start"));

  await waitFor(() => {
    expect(alert).toHaveBeenCalledWith(
      "스토리를 만들지 못했어요",
      undefined,
      expect.arrayContaining([
        expect.objectContaining({ text: "닫기" }),
        expect.objectContaining({ text: "다시 시도" }),
      ])
    );
  });

  expect(onMade).not.toHaveBeenCalled();
  expect(screen.getByTestId("story-outline-card")).toBeOnTheScreen();
  expect(screen.getByText("베를린 출장 일주일")).toBeOnTheScreen();
  expect(screen.getByTestId("story-outline-start")).toBeOnTheScreen();
});

// 두 번 눌러도 스토리가 둘 만들어지지 않는다.
test("만드는 동안 다시 눌러도 한 번만 저장한다", async () => {
  mockSaveStory.mockReturnValue(new Promise(() => undefined));

  await renderWithHeroUI(<CreateStoryScreen onMade={jest.fn()} />);

  const user = userEvent.setup();
  const start = screen.getByTestId("story-outline-start");

  await user.press(start);
  await user.press(start);

  expect(mockSaveStory).toHaveBeenCalledTimes(1);
});

test("만드는 동안 버튼이 진행 중임을 알린다", async () => {
  mockSaveStory.mockReturnValue(new Promise(() => undefined));

  await renderWithHeroUI(<CreateStoryScreen onMade={jest.fn()} />);

  const user = userEvent.setup();

  await user.press(screen.getByTestId("story-outline-start"));

  await waitFor(() => {
    expect(screen.getByText("만드는 중")).toBeOnTheScreen();
  });
});

test("저장이 끝나면 만든 스토리를 넘긴다", async () => {
  mockSaveStory.mockResolvedValue({
    episodeId: "episode-1",
    storyId: "story-1",
  });

  const onMade = jest.fn();

  await renderWithHeroUI(<CreateStoryScreen onMade={onMade} />);

  const user = userEvent.setup();

  await user.press(screen.getByTestId("story-outline-start"));

  await waitFor(() => {
    expect(onMade).toHaveBeenCalledWith({
      episodeId: "episode-1",
      storyId: "story-1",
    });
  });
});
