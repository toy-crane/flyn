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

import type { StoredChatMessage } from "./use-chat-rooms";
import { usePersistentChat } from "./use-persistent-chat";

const sendMessage = jest.fn();
const regenerate = jest.fn();
const stop = jest.fn();
const clearError = jest.fn();

const STORED_MESSAGES: StoredChatMessage[] = [
  {
    chat_room_id: "room-1",
    content: "기존 질문",
    created_at: "2026-07-28T01:00:00.000Z",
    id: "user-1",
    role: "user",
    status: "complete",
  },
  {
    chat_room_id: "room-1",
    content: "기존 답변",
    created_at: "2026-07-28T01:00:01.000Z",
    id: "assistant-1",
    role: "assistant",
    status: "stopped",
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

describe("영구 채팅 transport", () => {
  it("저장 메시지를 초기 UI 상태로 복원하고 중단 상태를 보존한다", async () => {
    await renderHook(() =>
      usePersistentChat("room-1", "account-1", STORED_MESSAGES)
    );

    const options = mockUseChat.mock.calls[0]?.[0];

    expect(options.messages).toEqual([
      {
        id: "user-1",
        metadata: { status: "complete" },
        parts: [{ text: "기존 질문", type: "text" }],
        role: "user",
      },
      {
        id: "assistant-1",
        metadata: { status: "stopped" },
        parts: [{ text: "기존 답변", type: "text" }],
        role: "assistant",
      },
    ]);
  });

  it("서버에는 마지막 사용자 메시지 ID와 본문만 보낸다", async () => {
    await renderHook(() =>
      usePersistentChat("room/1", "account-1", STORED_MESSAGES)
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
          parts: [{ text: "새 질문", type: "text" }],
          role: "user",
        },
      ],
    });
    const headers = await transportOptions.headers();

    expect(transportOptions.api).toBe(
      "http://localhost:3000/chats/room%2F1/messages"
    );
    expect(request).toEqual({
      body: { content: "새 질문", id: "new-user" },
    });
    expect(headers).toEqual({ Authorization: "Bearer access-token" });
  });
});

describe("영구 채팅 controller", () => {
  it("생성 중에는 streaming store만 갱신한다", async () => {
    const state = chatState({
      messages: [
        {
          id: "new-user",
          parts: [{ text: "새 질문", type: "text" }],
          role: "user",
        },
        {
          id: "new-assistant",
          parts: [{ text: "생성 중", type: "text" }],
          role: "assistant",
        },
      ],
      status: "streaming",
    });
    mockUseChat.mockReturnValue(state);

    const { result } = await renderHook(() =>
      usePersistentChat("room-1", "account-1", STORED_MESSAGES)
    );

    await waitFor(() => {
      expect(result.current.streamingStore.get()).toBe("생성 중");
    });
    expect(result.current.messages.at(-1)).toMatchObject({
      content: "",
      id: "new-assistant",
      role: "assistant",
    });

    expect(sendMessage).not.toHaveBeenCalled();
  });

  it("입력을 정리해 보내고 composer를 비운다", async () => {
    mockUseChat.mockReturnValue(chatState());
    const { result } = await renderHook(() =>
      usePersistentChat("room-1", "account-1", STORED_MESSAGES)
    );

    await act(() => {
      result.current.setInput("  보낼 질문  ");
    });
    await act(() => {
      result.current.onSend();
    });

    expect(sendMessage).toHaveBeenCalledWith({ text: "보낼 질문" });
    expect(result.current.input).toBe("");
  });

  it("오류 상태를 유지한 채 재시도하고 생성 중단을 위임한다", async () => {
    mockUseChat.mockReturnValue(
      chatState({ error: new Error("failed"), status: "error" })
    );
    const { result } = await renderHook(() =>
      usePersistentChat("room-1", "account-1", STORED_MESSAGES)
    );

    await act(() => {
      result.current.onRetry();
      result.current.stop();
    });

    expect(clearError).not.toHaveBeenCalled();
    expect(regenerate).toHaveBeenCalled();
    expect(stop).toHaveBeenCalled();
  });

  it("abort된 부분 응답은 화면에서도 중단 상태로 남긴다", async () => {
    const assistant = {
      id: "new-assistant",
      parts: [{ text: "여기까지", type: "text" }],
      role: "assistant",
    };
    let state = chatState({
      messages: [assistant],
      status: "streaming",
    });
    mockUseChat.mockImplementation(() => state);
    const { rerender, result } = await renderHook(() =>
      usePersistentChat("room-1", "account-1", STORED_MESSAGES)
    );
    const options = mockUseChat.mock.calls[0]?.[0];

    await act(async () => {
      options.onFinish({
        isAbort: true,
        isDisconnect: false,
        isError: false,
        message: assistant,
        messages: [assistant],
      });
      state = chatState({ messages: [assistant], status: "ready" });
      await rerender({});
    });

    expect(result.current.messages[0]).toMatchObject({
      content: "여기까지",
      status: "stopped",
    });
    expect(mockInvalidateQueries).toHaveBeenCalled();
  });
});
