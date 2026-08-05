import { renderHook } from "@testing-library/react-native";

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

import type { SentenceQuestionMessage } from "./sentence-question";
import {
  toDisplayMessages,
  useSentenceQuestion,
} from "./use-sentence-question";

const sendMessage = jest.fn();
const regenerate = jest.fn();
const stop = jest.fn();
const clearError = jest.fn();

const STORED: SentenceQuestionMessage[] = [
  {
    content: "with 빼고 말하면 진짜 못 알아들어요?",
    created_at: "2026-08-05T02:00:00.000Z",
    id: "question-1",
    role: "user",
    status: "complete",
  },
  {
    content: "대부분 알아듣긴 해요.",
    created_at: "2026-08-05T02:00:01.000Z",
    id: "answer-1",
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

describe("문장 질문 transport", () => {
  it("문장마다 자리를 나눠 다른 문장의 질문과 섞이지 않는다", async () => {
    await renderHook(() => useSentenceQuestion("episode-1", "user-2", STORED));

    const options = mockUseChat.mock.calls[0]?.[0];
    const transportOptions = mockTransport.mock.calls[0]?.[0];

    expect(options.id).toBe("episode-1:user-2");
    expect(transportOptions.api).toBe(
      "http://localhost:3000/episodes/episode-1/messages/user-2/questions"
    );
  });

  it("나갔다 다시 열면 저장된 내용이 초기 상태로 들어온다", async () => {
    await renderHook(() => useSentenceQuestion("episode-1", "user-2", STORED));

    const options = mockUseChat.mock.calls[0]?.[0];

    expect(options.messages).toEqual([
      {
        id: "question-1",
        metadata: { status: "complete" },
        parts: [{ text: "with 빼고 말하면 진짜 못 알아들어요?", type: "text" }],
        role: "user",
      },
      {
        id: "answer-1",
        metadata: { status: "complete" },
        parts: [{ text: "대부분 알아듣긴 해요.", type: "text" }],
        role: "assistant",
      },
    ]);
  });

  it("경계에는 마지막 질문의 ID와 본문만 보낸다", async () => {
    await renderHook(() => useSentenceQuestion("episode/1", "user 2", STORED));

    const transportOptions = mockTransport.mock.calls[0]?.[0];
    const request = await transportOptions.prepareSendMessagesRequest({
      messages: [
        {
          id: "question-1",
          parts: [{ text: "지난 질문", type: "text" }],
          role: "user",
        },
        {
          id: "question-2",
          parts: [{ text: "그럼 이건요?", type: "text" }],
          role: "user",
        },
      ],
    });
    const headers = await transportOptions.headers();

    expect(transportOptions.api).toBe(
      "http://localhost:3000/episodes/episode%2F1/messages/user%202/questions"
    );
    expect(request).toEqual({
      body: { content: "그럼 이건요?", id: "question-2" },
    });
    expect(headers).toEqual({ Authorization: "Bearer access-token" });
  });
});

describe("문장 질문 목록", () => {
  it("저장된 질문과 답을 그대로 이어서 그린다", () => {
    const messages = toDisplayMessages({
      isGenerating: false,
      messages: [
        {
          id: "question-1",
          metadata: { status: "complete" as const },
          parts: [{ text: "왜 -s가 붙어요?", type: "text" as const }],
          role: "user" as const,
        },
        {
          id: "answer-1",
          metadata: { status: "complete" as const },
          parts: [{ text: "3인칭 주어라서요.", type: "text" as const }],
          role: "assistant" as const,
        },
      ],
      stoppedMessageIds: new Set<string>(),
      threadId: "episode-1:user-2",
    });

    expect(messages).toEqual([
      {
        content: "왜 -s가 붙어요?",
        id: "question-1",
        kind: "message",
        role: "user",
        status: "complete",
      },
      {
        content: "3인칭 주어라서요.",
        id: "answer-1",
        kind: "message",
        role: "assistant",
        status: "complete",
      },
    ]);
    // 첨삭 표시는 대화 화면의 몫이다. 여기서 오간 말은 판정 대상이 아니다.
    expect(messages.every((message) => !("mark" in message))).toBe(true);
  });

  it("답을 기다리는 동안 빈 자리를 하나 세운다", () => {
    const messages = toDisplayMessages({
      isGenerating: true,
      messages: [
        {
          id: "question-1",
          metadata: { status: "complete" as const },
          parts: [{ text: "왜요?", type: "text" as const }],
          role: "user" as const,
        },
      ],
      stoppedMessageIds: new Set<string>(),
      threadId: "episode-1:user-2",
    });

    expect(messages.at(-1)).toEqual({
      content: "",
      id: "pending-answer-question-1",
      kind: "message",
      role: "assistant",
      status: "complete",
    });
  });

  it("중단된 답은 중단으로 남는다", () => {
    const messages = toDisplayMessages({
      isGenerating: false,
      messages: [
        {
          id: "answer-1",
          metadata: { status: "stopped" as const },
          parts: [{ text: "여기까지 말하다 멈췄어요.", type: "text" as const }],
          role: "assistant" as const,
        },
      ],
      stoppedMessageIds: new Set<string>(),
      threadId: "episode-1:user-2",
    });

    expect(messages[0]).toMatchObject({ status: "stopped" });
  });
});
