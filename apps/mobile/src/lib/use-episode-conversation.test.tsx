import { act, renderHook, waitFor } from "@testing-library/react-native";

const mockUseChat = jest.fn();
const mockTransport = jest.fn((options) => ({ options }));
const mockInvalidateQueries = jest.fn();
const mockSetQueryData = jest.fn();
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
  useQueryClient: () => ({
    invalidateQueries: mockInvalidateQueries,
    setQueryData: mockSetQueryData,
  }),
}));
jest.mock("./supabase", () => ({
  supabase: { auth: { getSession: () => mockGetSession() } },
}));

import type { Episode, EpisodeGoal, EpisodeMessage } from "./episodes";
import type { MessageFeedback } from "./message-feedback";
import { useEpisodeConversation } from "./use-episode-conversation";

/** 저장된 판정이 없는 상태가 기본이다 — 그때는 표시도 없다. */
const FEEDBACK: MessageFeedback[] = [];

const sendMessage = jest.fn();
const regenerate = jest.fn();
const stop = jest.fn();
const clearError = jest.fn();

const GOALS: EpisodeGoal[] = [
  {
    achieved_at: null,
    achieved_message_id: null,
    position: 1,
    sentence: "오늘의 원두 추천 받기",
  },
  {
    achieved_at: null,
    achieved_message_id: null,
    position: 2,
    sentence: "우유를 오트밀크로 바꿔 주문하기",
  },
  {
    achieved_at: null,
    achieved_message_id: null,
    position: 3,
    sentence: "근처 가볼 만한 곳 물어보기",
  },
];

function episode(overrides: Partial<Episode> = {}): Episode {
  return {
    created_at: "2026-08-05T00:00:00.000Z",
    episode_goals: GOALS,
    id: "episode-1",
    partner_role: "바리스타 Maya",
    scenario_description: "여행 중 들어간 작은 카페예요.",
    scenario_title: "포틀랜드 카페에서 첫 주문",
    status: "active",
    summary: null,
    turn_limit: 20,
    updated_at: "2026-08-05T00:00:00.000Z",
    user_role: "처음 방문한 여행객",
    ...overrides,
  };
}

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

const STORED_UI_MESSAGES = [
  {
    id: "user-1",
    parts: [{ text: "Could you recommend today's coffee?", type: "text" }],
    role: "user",
  },
  {
    id: "assistant-1",
    parts: [
      { text: "Today's single origin is a natural Ethiopian.", type: "text" },
    ],
    role: "assistant",
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
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, FEEDBACK)
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
      useEpisodeConversation(
        episode({ id: "episode/1" }),
        "account-1",
        STORED_MESSAGES,
        FEEDBACK
      )
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
      useEpisodeConversation(episode(), "account-1", [], FEEDBACK)
    );
    const options = mockUseChat.mock.calls[0]?.[0];

    expect(result.current.chat.messages[0]).toMatchObject({
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

    expect(result.current.chat.messages[0]).toMatchObject({
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
      useEpisodeConversation(episode(), "account-1", [], FEEDBACK)
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

    expect(result.current.chat.messages[0]).toMatchObject({
      content: "Sound good. make it oat milk?",
    });
  });
});

describe("말풍선의 세 표시", () => {
  const JUDGED: MessageFeedback[] = [
    {
      delivered: "Could you recommend today's coffee?",
      improvedSentence: null,
      messageId: "user-1",
      reasons: [],
      // 한글로 썼으므로 내가 쓴 말과 전달된 문장이 다르다.
      sourceText: "오늘 커피 뭐가 좋아요?",
      verdict: "clear",
    },
    {
      delivered: "Sound good. make it oat milk?",
      improvedSentence: "Sounds good. Can you make it with oat milk?",
      messageId: "user-2",
      reasons: ["Sound good은 Sounds good이 자연스러워요."],
      sourceText: null,
      verdict: "improvable",
    },
    {
      delivered: "That's all, thanks!",
      improvedSentence: null,
      messageId: "user-3",
      reasons: [],
      sourceText: null,
      verdict: "clear",
    },
  ];

  function userMessage(id: string, text: string) {
    return { id, parts: [{ text, type: "text" }], role: "user" };
  }

  it("판정 결과대로 번역·교정·통과 표시가 갈린다", async () => {
    mockUseChat.mockReturnValue(
      chatState({
        messages: [
          userMessage("user-1", "Could you recommend today's coffee?"),
          userMessage("user-2", "Sound good. make it oat milk?"),
          userMessage("user-3", "That's all, thanks!"),
        ],
      })
    );

    const { result } = await renderHook(() =>
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, JUDGED)
    );

    expect(
      result.current.chat.messages.map((item) =>
        item.kind === "message" ? item.mark : null
      )
    ).toEqual(["translated", "improvable", "clear"]);
  });

  it("판정이 아직 없는 발화에는 표시가 없다", async () => {
    mockUseChat.mockReturnValue(
      chatState({
        messages: [
          userMessage("user-1", "Could you recommend today's coffee?"),
          userMessage("user-9", "Anything else?"),
        ],
      })
    );

    const { result } = await renderHook(() =>
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, JUDGED)
    );
    const [, pending] = result.current.chat.messages;

    expect(pending).toEqual(
      expect.objectContaining({ id: "user-9", role: "user" })
    );
    expect(pending && "mark" in pending).toBe(false);
  });

  it("도착한 판정을 시트가 읽는 자리에 얹는다", async () => {
    mockUseChat.mockReturnValue(chatState({ messages: STORED_UI_MESSAGES }));
    await renderHook(() =>
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, JUDGED)
    );
    const options = mockUseChat.mock.calls[0]?.[0];
    const arrived = {
      delivered: "One oat latte please",
      improvedSentence: null,
      messageId: "user-4",
      reasons: [],
      sourceText: null,
      verdict: "clear" as const,
    };

    await act(() => {
      options.onData({
        data: { goals: [], sentences: [arrived] },
        type: "data-judgment",
      });
    });

    const [key, update] = mockSetQueryData.mock.calls[0] ?? [];

    expect(key).toEqual(["episode-feedback", "episode-1"]);
    // 저장에서 읽은 판정 위에 얹히고, 같은 발화가 두 번 오면 먼저 것을 둔다.
    expect(update(JUDGED.slice(0, 1))).toEqual([JUDGED[0], arrived]);
    expect(update([...JUDGED, arrived])).toEqual([...JUDGED, arrived]);
  });
});

describe("대화 종료", () => {
  it("저장된 상태가 곧 끝난 이유다", async () => {
    const { result } = await renderHook(() =>
      useEpisodeConversation(
        episode({ status: "turns_exhausted" }),
        "account-1",
        STORED_MESSAGES,
        FEEDBACK
      )
    );

    expect(result.current.ending).toBe("turns_exhausted");
  });

  it("진행 중이면 끝난 이유가 없다", async () => {
    const { result } = await renderHook(() =>
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, FEEDBACK)
    );

    expect(result.current.ending).toBe(null);
  });

  it("스트림이 알려 온 종료는 저장을 다시 읽기 전에 자리를 메운다", async () => {
    const { result } = await renderHook(() =>
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, FEEDBACK)
    );
    const options = mockUseChat.mock.calls[0]?.[0];

    expect(result.current.ending).toBe(null);

    await act(() => {
      options.onData({ data: { reason: "goals_met" }, type: "data-ending" });
    });

    expect(result.current.ending).toBe("goals_met");
  });
});

describe("목표 달성 기록", () => {
  it("판정이 도착하면 완료 줄이 그 발화의 턴 끝에 서고 목표가 넘어간다", async () => {
    mockUseChat.mockReturnValue(chatState({ messages: STORED_UI_MESSAGES }));

    const { result } = await renderHook(() =>
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, FEEDBACK)
    );
    const options = mockUseChat.mock.calls[0]?.[0];

    expect(result.current.chat.messages.map((item) => item.id)).toEqual([
      "user-1",
      "assistant-1",
    ]);

    await act(() => {
      options.onData({
        data: {
          goals: [
            {
              achievedAt: "2026-08-05T01:00:02.000Z",
              messageId: "user-1",
              position: 1,
            },
          ],
          sentences: [],
        },
        type: "data-judgment",
      });
    });

    expect(result.current.chat.messages).toEqual([
      expect.objectContaining({ id: "user-1" }),
      expect.objectContaining({ id: "assistant-1" }),
      { id: "goal-1", kind: "note", text: "오늘의 원두 추천 받기 완료" },
    ]);
    expect(result.current.goals[0]).toEqual(
      expect.objectContaining({
        achieved_at: "2026-08-05T01:00:02.000Z",
        achieved_message_id: "user-1",
        position: 1,
      })
    );
  });

  it("저장된 목표만으로도 같은 자리에 완료 줄이 선다", async () => {
    mockUseChat.mockReturnValue(
      chatState({
        messages: [
          ...STORED_UI_MESSAGES,
          {
            id: "user-2",
            parts: [{ text: "One oat latte please", type: "text" }],
            role: "user",
          },
        ],
      })
    );

    const { result } = await renderHook(() =>
      useEpisodeConversation(
        episode({
          episode_goals: [
            {
              achieved_at: "2026-08-05T01:00:02.000Z",
              achieved_message_id: "user-1",
              position: 1,
              sentence: "오늘의 원두 추천 받기",
            },
            ...GOALS.slice(1),
          ],
        }),
        "account-1",
        STORED_MESSAGES,
        FEEDBACK
      )
    );

    expect(result.current.chat.messages.map((item) => item.id)).toEqual([
      "user-1",
      "assistant-1",
      "goal-1",
      "user-2",
    ]);
  });

  it("판정이 오지 않으면 완료 줄도 없고 첫 목표가 그대로 남는다", async () => {
    mockUseChat.mockReturnValue(chatState({ messages: STORED_UI_MESSAGES }));

    const { result } = await renderHook(() =>
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, FEEDBACK)
    );

    expect(
      result.current.chat.messages.some((item) => item.kind === "note")
    ).toBe(false);
    expect(
      result.current.goals.every((goal) => goal.achieved_at === null)
    ).toBe(true);
  });
});

describe("에피소드 대화 controller", () => {
  it("입력을 정리해 보내고 composer를 비운다", async () => {
    const { result } = await renderHook(() =>
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, FEEDBACK)
    );

    await act(() => {
      result.current.chat.setInput("  One oat latte please  ");
    });
    await act(() => {
      result.current.chat.onSend();
    });

    expect(sendMessage).toHaveBeenCalledWith({ text: "One oat latte please" });
    expect(result.current.chat.input).toBe("");
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
      useEpisodeConversation(episode(), "account-1", [], FEEDBACK)
    );

    await waitFor(() => {
      expect(result.current.chat.streamingStore.get()).toBe("Welcome to");
    });
    expect(result.current.chat.messages.at(-1)).toMatchObject({
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
      useEpisodeConversation(episode(), "account-1", STORED_MESSAGES, FEEDBACK)
    );

    await act(() => {
      result.current.chat.onRetry();
      result.current.chat.stop();
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
      useEpisodeConversation(episode(), "account-1", [], FEEDBACK)
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
      ["episode-feedback", "episode-1"],
      ["episode", "episode-1"],
      ["episodes", "account-1"],
    ]);
  });
});
