import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockUseChat = jest.fn();
const mockTransport = jest.fn((options) => ({ options }));
const mockInvalidateQueries = jest.fn();
const mockGetSession = jest.fn();

function MockDefaultChatTransport(options: unknown) {
  mockTransport(options);
}

jest.mock("@ai-sdk/react", () => ({
  useChat: (...args: unknown[]) => mockUseChat(...args),
}));
jest.mock("ai", () => ({
  DefaultChatTransport: MockDefaultChatTransport,
  isTextUIPart: (part: { type: string }) => part.type === "text",
}));
jest.mock("expo/fetch", () => ({ fetch: jest.fn() }));
jest.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: mockInvalidateQueries }),
}));
jest.mock("./supabase", () => ({
  supabase: { auth: { getSession: () => mockGetSession() } },
}));

import type { EpisodeMessage } from "./episodes";
import { useEpisodeConversation } from "./use-episode-conversation";

const sendMessage = jest.fn();
const regenerate = jest.fn();
const stop = jest.fn();
const clearError = jest.fn();

const STORED_MESSAGES: EpisodeMessage[] = [
  {
    content: "Could you recommend today's coffee?",
    created_at: "2026-08-05T01:00:00.000Z",
    id: "user-1",
    role: "user",
    status: "complete",
  },
  {
    content: "Today's single origin is a natural Ethiopian.",
    created_at: "2026-08-05T01:00:01.000Z",
    id: "assistant-1",
    role: "assistant",
    status: "complete",
  },
];

function chatState(overrides: Record<string, unknown> = {}) {
  return {
    clearError,
    error: undefined,
    messages: [],
    regenerate,
    sendMessage,
    status: "ready",
    stop,
    ...overrides,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  mockGetSession.mockResolvedValue({
    data: { session: { access_token: "access-token" } },
  });
  mockUseChat.mockReturnValue(chatState());
});

describe("에피소드 대화 transport", () => {
  it("저장된 대화를 초기 UI 상태로 복원한다", async () => {
    await renderHook(() =>
      useEpisodeConversation("episode-1", "account-1", STORED_MESSAGES)
    );

    const options = mockUseChat.mock.calls[0]?.[0];

    expect(options.id).toBe("episode-1");
    expect(options.messages).toEqual([
      {
        id: "user-1",
        metadata: { status: "complete" },
        parts: [{ text: "Could you recommend today's coffee?", type: "text" }],
        role: "user",
      },
      {
        id: "assistant-1",
        metadata: { status: "complete" },
        parts: [
          {
            text: "Today's single origin is a natural Ethiopian.",
            type: "text",
          },
        ],
        role: "assistant",
      },
    ]);
  });

  it("에피소드 경계에 마지막 사용자 메시지 ID와 본문만 보낸다", async () => {
    await renderHook(() =>
      useEpisodeConversation("episode/1", "account-1", STORED_MESSAGES)
    );

    const transportOptions = mockTransport.mock.calls[0]?.[0];
    const request = await transportOptions.prepareSendMessagesRequest({
      messages: [
        {
          id: "old-user",
          parts: [{ text: "과거", type: "text" }],
          role: "user",
        },
        {
          id: "new-user",
          parts: [{ text: "오늘 커피 뭐가 좋아요?", type: "text" }],
          role: "user",
        },
      ],
    });
    const headers = await transportOptions.headers();

    expect(transportOptions.api).toBe(
      "http://localhost:3000/episodes/episode%2F1/messages"
    );
    expect(request).toEqual({
      body: { content: "오늘 커피 뭐가 좋아요?", id: "new-user" },
    });
    expect(headers).toEqual({ Authorization: "Bearer access-token" });
  });
});

describe("말풍선에 남는 문장", () => {
  it("한글로 써도 전달된 영어가 말풍선에 남는다", async () => {
    const typed = {
      id: "new-user",
      parts: [{ text: "오늘 커피 뭐가 좋아요?", type: "text" }],
      role: "user",
    };
    mockUseChat.mockReturnValue(chatState({ messages: [typed] }));

    const { result } = await renderHook(() =>
      useEpisodeConversation("episode-1", "account-1", [])
    );
    const options = mockUseChat.mock.calls[0]?.[0];

    expect(result.current.messages[0]).toMatchObject({
      content: "오늘 커피 뭐가 좋아요?",
    });

    await act(() => {
      options.onData({
        data: {
          messageId: "new-user",
          text: "What do you recommend today?",
        },
        type: "data-delivered",
      });
    });

    expect(result.current.messages[0]).toMatchObject({
      content: "What do you recommend today?",
      id: "new-user",
      role: "user",
    });
  });

  it("영어로 쓰면 원문이 그대로 남는다", async () => {
    mockUseChat.mockReturnValue(
      chatState({
        messages: [
          {
            id: "new-user",
            parts: [{ text: "Sound good. make it oat milk?", type: "text" }],
            role: "user",
          },
        ],
      })
    );

    const { result } = await renderHook(() =>
      useEpisodeConversation("episode-1", "account-1", [])
    );
    const options = mockUseChat.mock.calls[0]?.[0];

    await act(() => {
      options.onData({
        data: {
          messageId: "new-user",
          text: "Sound good. make it oat milk?",
        },
        type: "data-delivered",
      });
    });

    expect(result.current.messages[0]).toMatchObject({
      content: "Sound good. make it oat milk?",
    });
  });
});

describe("에피소드 대화 controller", () => {
  it("입력을 정리해 보내고 composer를 비운다", async () => {
    const { result } = await renderHook(() =>
      useEpisodeConversation("episode-1", "account-1", STORED_MESSAGES)
    );

    await act(() => {
      result.current.setInput("  One oat latte please  ");
    });
    await act(() => {
      result.current.onSend();
    });

    expect(sendMessage).toHaveBeenCalledWith({ text: "One oat latte please" });
    expect(result.current.input).toBe("");
  });

  it("생성 중에는 streaming store만 갱신한다", async () => {
    mockUseChat.mockReturnValue(
      chatState({
        messages: [
          {
            id: "new-user",
            parts: [{ text: "Hi there", type: "text" }],
            role: "user",
          },
          {
            id: "new-assistant",
            parts: [{ text: "Welcome to", type: "text" }],
            role: "assistant",
          },
        ],
        status: "streaming",
      })
    );

    const { result } = await renderHook(() =>
      useEpisodeConversation("episode-1", "account-1", [])
    );

    await waitFor(() => {
      expect(result.current.streamingStore.get()).toBe("Welcome to");
    });
    expect(result.current.messages.at(-1)).toMatchObject({
      content: "",
      id: "new-assistant",
      role: "assistant",
    });
  });

  it("오류 상태를 유지한 채 재시도하고 생성 중단을 위임한다", async () => {
    mockUseChat.mockReturnValue(
      chatState({ error: new Error("failed"), status: "error" })
    );
    const { result } = await renderHook(() =>
      useEpisodeConversation("episode-1", "account-1", STORED_MESSAGES)
    );

    await act(() => {
      result.current.onRetry();
      result.current.stop();
    });

    expect(clearError).not.toHaveBeenCalled();
    expect(regenerate).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it("한 턴이 끝나면 저장된 대화와 홈 목록을 다시 읽는다", async () => {
    const assistant = {
      id: "new-assistant",
      parts: [{ text: "Sure thing.", type: "text" }],
      role: "assistant",
    };
    mockUseChat.mockReturnValue(chatState({ messages: [assistant] }));
    await renderHook(() =>
      useEpisodeConversation("episode-1", "account-1", [])
    );
    const options = mockUseChat.mock.calls[0]?.[0];

    await act(() => {
      options.onFinish({
        isAbort: false,
        isDisconnect: false,
        isError: false,
        message: assistant,
        messages: [assistant],
      });
    });

    expect(
      mockInvalidateQueries.mock.calls.map(([call]) => call.queryKey)
    ).toEqual([
      ["episode-messages", "episode-1"],
      ["episode", "episode-1"],
      ["episodes", "account-1"],
    ]);
  });
});
