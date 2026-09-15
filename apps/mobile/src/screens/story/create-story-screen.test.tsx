import { beforeEach, expect, jest, test } from "@jest/globals";
import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import type { UIMessage } from "ai";
import { Alert } from "react-native";

import type { ChatSession } from "@/features/chat/state/use-conversation";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { CreateStoryScreen } from "./create-story-screen";

const mockOutline = {
  characters: [{ name: "Lena", position: 1, role: "호텔 프런트 직원." }],
  cover:
    "A woman in her thirties, dark bob, navy uniform, attentive, close-up, head tilted, teal background",
  episodes: [
    {
      cast: ["Lena"],
      details: "예약 확인 메일을 갖고 직원에게 방을 요청한다.",
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
  jest.fn<
    (
      token: string,
      outline: unknown,
      onProgress?: (stage: "script" | "cover" | "saving") => void
    ) => Promise<{ episodeId: string; storyId: string }>
  >();
const mockSendMessage = jest.fn<(message: { text: string }) => Promise<void>>();

jest.mock("@/features/story/api/create-story", () => {
  const actual = jest.requireActual(
    "@/features/story/api/create-story"
  ) as typeof import("@/features/story/api/create-story");

  return {
    ...actual,
    createStoryTransport: () => ({}),
    saveStory: (...args: Parameters<typeof mockSaveStory>) =>
      mockSaveStory(...args),
  };
});

jest.mock("@ai-sdk/react", () => ({
  useChat: () => ({
    clearError: jest.fn(),
    error: undefined,
    messages: mockMessages,
    regenerate: jest.fn(),
    sendMessage: mockSendMessage,
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

  줄은 메시지가 바뀔 때만 다시 그린다. 진짜 패널도 그렇다. 목록은 메시지와
  패널이 따로 알려 주는 것만 보고 줄을 다시 그리므로, 곁들일 것을 새로 만들어
  넘기는 것만으로는 이미 그려진 줄에 닿지 않는다.
*/
jest.mock("@/features/chat/ui/chat-panel", () => {
  const React = require("react") as typeof import("react");
  const { View, TextInput, Pressable, Text } =
    require("react-native") as typeof import("react-native");

  const Row = React.memo(
    ({
      addon: Addon,
      message,
    }: {
      addon: (props: { message: UIMessage }) => React.ReactNode;
      message: UIMessage;
    }) => React.createElement(Addon, { message }),
    () => true
  );

  return {
    ChatPanel: ({
      canCompose = true,
      chat,
      messageAddon,
    }: {
      canCompose?: boolean;
      chat: ChatSession;
      messageAddon?: (props: { message: UIMessage }) => React.ReactNode;
    }) =>
      React.createElement(
        View,
        { testID: "create-panel" },
        // 진짜 패널이 보내기 버튼을 켜는 조건. 전송 동작 자체의 잠금을 따로
        // 보려고 버튼은 끄지 않고 조건만 드러낸다.
        React.createElement(
          Text,
          { testID: "send-readiness" },
          canCompose && chat.canSend ? "보낼 수 있음" : "보낼 수 없음"
        ),
        React.createElement(TextInput, {
          accessibilityLabel: "메시지",
          onChangeText: chat.setDraft,
          value: chat.draft,
        }),
        React.createElement(
          Pressable,
          { accessibilityRole: "button", onPress: chat.send },
          React.createElement(Text, null, "보내기")
        ),
        messageAddon
          ? chat.messages.map((message) =>
              React.createElement(Row, {
                addon: messageAddon,
                key: message.id,
                message,
              })
            )
          : null
      ),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
  mockSendMessage.mockResolvedValue(undefined);
});

test.each(["스토리 만들기", "에피소드 추가하기"])(
  "메시지 전송 상태가 반영되기 전에 %s를 눌러도 요청을 겹치지 않는다",
  async (action) => {
    mockSendMessage.mockReturnValue(new Promise(() => undefined));
    mockSaveStory.mockReturnValue(new Promise(() => undefined));
    await renderWithHeroUI(<CreateStoryScreen onMade={jest.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("메시지"), "상대는 한 명이에요");
    // SDK 경계는 ready 상태를 유지해 전송 상태 반영 전의 버튼 동작을 재현한다.
    await user.press(screen.getByRole("button", { name: "보내기" }));
    await user.press(screen.getByRole("button", { name: action }));

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    expect(mockSaveStory).not.toHaveBeenCalled();
  }
);

test("에피소드 추가 요청이 정리될 때까지 보내기를 켜지 않는다", async () => {
  let finishAdding: (() => void) | undefined;
  mockSendMessage.mockReturnValue(
    new Promise<void>((resolve) => {
      finishAdding = resolve;
    })
  );
  await renderWithHeroUI(<CreateStoryScreen onMade={jest.fn()} />);
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("메시지"), "상대는 한 명이에요");
  expect(screen.getByTestId("send-readiness")).toHaveTextContent(
    "보낼 수 있음"
  );

  // SDK 경계는 ready 상태라, 답은 끝났지만 요청이 아직 정리 중인 순간이다.
  await user.press(screen.getByRole("button", { name: "에피소드 추가하기" }));
  expect(screen.getByTestId("send-readiness")).toHaveTextContent(
    "보낼 수 없음"
  );

  await act(async () => {
    finishAdding?.();
    await Promise.resolve();
  });
  await waitFor(() => {
    expect(screen.getByTestId("send-readiness")).toHaveTextContent(
      "보낼 수 있음"
    );
  });
  await user.press(screen.getByRole("button", { name: "보내기" }));
  expect(mockSendMessage).toHaveBeenLastCalledWith({
    messageId: undefined,
    text: "상대는 한 명이에요",
  });
});

test("추가 버튼은 의사만 보내고 새 카드가 나올 때까지 두 행동을 막는다", async () => {
  await renderWithHeroUI(<CreateStoryScreen onMade={jest.fn()} />);
  const user = userEvent.setup();
  await user.press(screen.getByRole("button", { name: "에피소드 추가하기" }));
  expect(mockSendMessage).toHaveBeenCalledWith({
    text: "에피소드를 하나 더 넣고 싶어요.",
  });
  expect(mockSaveStory).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "에피소드 추가하기" })
  ).toBeDisabled();
  expect(screen.getByRole("button", { name: "스토리 만들기" })).toBeDisabled();
});

test.each(["스토리 만들기", "에피소드 추가하기"])(
  "%s 요청 중에는 메시지를 보내지 않고 입력을 보존한다",
  async (action) => {
    mockSendMessage.mockReturnValue(new Promise(() => undefined));
    mockSaveStory.mockReturnValue(new Promise(() => undefined));
    await renderWithHeroUI(<CreateStoryScreen onMade={jest.fn()} />);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText("메시지"), "상대는 한 명이에요");
    await user.press(screen.getByRole("button", { name: action }));
    // 패널의 비활성 표시와 별개로 전송 동작 자체가 막혀야 한다.
    await user.press(screen.getByRole("button", { name: "보내기" }));

    expect(mockSendMessage).toHaveBeenCalledTimes(
      action === "에피소드 추가하기" ? 1 : 0
    );
    expect(screen.getByLabelText("메시지")).toHaveDisplayValue(
      "상대는 한 명이에요"
    );
  }
);

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
  expect(screen.getByRole("button", { name: "스토리 만들기" })).toBeEnabled();
  expect(
    screen.getByText("바꾸고 싶은 부분이 있으면 말해 주세요.")
  ).toBeOnTheScreen();
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

test.each([
  { label: "대본을 쓰고 있어요", stage: "script" },
  { label: "표지를 그리고 있어요", stage: "cover" },
  { label: "거의 다 됐어요", stage: "saving" },
] as const)("$stage 단계는 버튼 안에만 표시한다", async ({ stage, label }) => {
  mockSaveStory.mockImplementation((_token, _outline, progress) => {
    progress?.(stage);
    return new Promise(() => undefined);
  });
  await renderWithHeroUI(<CreateStoryScreen onMade={jest.fn()} />);
  await userEvent
    .setup()
    .press(screen.getByRole("button", { name: "스토리 만들기" }));
  const button = screen.getByRole("button", { name: label });
  expect(button).toBeBusy();
  expect(button).toBeDisabled();
  expect(button).toContainElement(screen.getByText(label));
  expect(
    screen.queryByText("바꾸고 싶은 부분이 있으면 말해 주세요.")
  ).not.toBeOnTheScreen();
});

test("만드는 동안 버튼이 진행 중임을 알린다", async () => {
  mockSaveStory.mockImplementation((_token, _outline, progress) => {
    progress?.("cover");
    return new Promise(() => undefined);
  });

  await renderWithHeroUI(<CreateStoryScreen onMade={jest.fn()} />);

  const user = userEvent.setup();

  await user.press(screen.getByTestId("story-outline-start"));

  await waitFor(() => {
    expect(
      screen.getByRole("button", { name: "표지를 그리고 있어요" })
    ).toBeBusy();
  });
  expect(screen.getByText("표지를 그리고 있어요")).toBeOnTheScreen();
  expect(
    screen.queryByText("바꾸고 싶은 부분이 있으면 말해 주세요.")
  ).not.toBeOnTheScreen();
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

test("생성 중 화면을 나가면 늦게 도착한 결과로 이동하지 않는다", async () => {
  let complete!: (made: { episodeId: string; storyId: string }) => void;
  mockSaveStory.mockReturnValue(
    new Promise((resolve) => {
      complete = resolve;
    })
  );
  const onMade = jest.fn();
  const view = await renderWithHeroUI(<CreateStoryScreen onMade={onMade} />);
  await userEvent.setup().press(screen.getByTestId("story-outline-start"));
  await view.unmount();
  await act(() => {
    complete({ episodeId: "episode-1", storyId: "story-1" });
  });
  expect(onMade).not.toHaveBeenCalled();
});
