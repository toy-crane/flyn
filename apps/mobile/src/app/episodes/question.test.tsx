import { render, screen, within } from "@testing-library/react-native";

jest.mock("uniwind", () =>
  require("../../test-support/heroui").uniwindThemeMock()
);
jest.mock("react-native-safe-area-context", () => ({
  // HeroUI provider가 이 모듈에서 함께 가져다 쓴다 — 통째로 대체하면 provider가
  // 렌더되지 않는다.
  SafeAreaListener: ({ children }: { children: unknown }) => children,
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));
jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
jest.mock("../../components/chat/chat-conversation", () => {
  const ReactRuntime = require("react");
  const { Text, View } = require("react-native");

  return {
    ChatConversation: ({
      chat,
      listHeader,
      placeholder,
    }: {
      chat: { messages: { content: string; id: string }[] };
      listHeader: unknown;
      placeholder: string;
    }) =>
      ReactRuntime.createElement(
        View,
        null,
        ReactRuntime.createElement(
          View,
          { testID: "surface-list-header" },
          listHeader
        ),
        ...chat.messages.map((message) =>
          ReactRuntime.createElement(
            Text,
            { key: message.id, testID: "surface-message" },
            message.content
          )
        ),
        ReactRuntime.createElement(
          Text,
          { testID: "surface-placeholder" },
          placeholder
        )
      ),
  };
});
jest.mock("../../lib/use-episodes", () => ({
  useEpisode: jest.fn(),
  useEpisodeMessages: jest.fn(),
}));
jest.mock("../../lib/sentence-question", () => ({
  useSentenceQuestion: jest.fn(),
}));
jest.mock("../../lib/use-sentence-question", () => ({
  useSentenceQuestion: jest.fn(),
}));

import type { SentenceQuestionMessage } from "../../lib/sentence-question";
import { useSentenceQuestion as useStoredSentenceQuestion } from "../../lib/sentence-question";
import { useEpisode, useEpisodeMessages } from "../../lib/use-episodes";
import { useSentenceQuestion } from "../../lib/use-sentence-question";
import { setSearchParams } from "../../test-support/expo-router";
import { HeroUIWrapper } from "../../test-support/heroui";
import SentenceQuestionScreen from "./question";

/** HeroUI 컴포넌트는 provider 아래에서만 선다. */
function renderQuestion() {
  return render(<SentenceQuestionScreen />, { wrapper: HeroUIWrapper });
}

const mockUseEpisode = useEpisode as jest.Mock;
const mockUseEpisodeMessages = useEpisodeMessages as jest.Mock;
const mockUseStoredSentenceQuestion = useStoredSentenceQuestion as jest.Mock;
const mockUseSentenceQuestion = useSentenceQuestion as jest.Mock;

const EPISODE = {
  created_at: "2026-08-05T00:00:00.000Z",
  episode_goals: [],
  id: "episode-1",
  partner_role: "바리스타 Maya",
  scenario_description: "여행 중 들어간 작은 카페예요.",
  scenario_title: "포틀랜드 카페에서 첫 주문",
  status: "active",
  turn_limit: 20,
  updated_at: "2026-08-05T00:00:00.000Z",
  user_role: "처음 방문한 여행객",
};

const MESSAGES = [
  {
    content: "Sound good. Can you make it oat milk?",
    created_at: "2026-08-05T01:00:00.000Z",
    id: "user-2",
    role: "user",
    status: "complete",
  },
  {
    content: "Of course.",
    created_at: "2026-08-05T01:00:01.000Z",
    id: "assistant-2",
    role: "assistant",
    status: "complete",
  },
];

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

function query(overrides: Record<string, unknown> = {}) {
  return {
    data: undefined,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
    ...overrides,
  };
}

function chatWith(messages: SentenceQuestionMessage[]) {
  return {
    chat: {
      error: null,
      input: "",
      messages: messages.map((message) => ({
        content: message.content,
        id: message.id,
        kind: "message" as const,
        role: message.role as "assistant" | "user",
        status: "complete" as const,
      })),
      onRetry: jest.fn(),
      onSend: jest.fn(),
      setInput: jest.fn(),
      status: "ready" as const,
      stop: jest.fn(),
      streamingStore: { get: jest.fn(), set: jest.fn(), subscribe: jest.fn() },
    },
  };
}

beforeEach(() => {
  jest.clearAllMocks();
  setSearchParams({ episodeId: "episode-1", messageId: "user-2" });
  mockUseEpisode.mockReturnValue(query({ data: EPISODE }));
  mockUseEpisodeMessages.mockReturnValue(query({ data: MESSAGES }));
  mockUseStoredSentenceQuestion.mockReturnValue(query({ data: STORED }));
  mockUseSentenceQuestion.mockReturnValue(chatWith(STORED));
});

describe("문장 질문 화면", () => {
  it("대상 문장을 대화 목록 바깥의 인용 카드에 고정한다", async () => {
    await renderQuestion();

    expect(screen.getByTestId("quoted-sentence")).toHaveTextContent(
      "Sound good. Can you make it oat milk?"
    );
    // 목록 머리에 있으면 스크롤과 함께 사라진다. 카드는 목록 밖에 선다.
    expect(
      within(screen.getByTestId("surface-list-header")).queryByTestId(
        "quoted-sentence-card"
      )
    ).toBeNull();
    // 인용 카드 반지름은 12pt다 — HeroUI 스케일의 `--radius-xl`. 클래스가 없으면
    // `Surface` 기본값(`--radius-3xl`, 24pt)이 그대로 나간다.
    expect(
      screen.getByTestId("quoted-sentence-surface").props.className
    ).toContain("rounded-xl");
  });

  it("헤더 서브타이틀이 원래 에피소드 이름을 나른다", async () => {
    await renderQuestion();

    expect(screen.getByText("문장 이야기")).toBeTruthy();
    expect(screen.getByText("포틀랜드 카페에서 첫 주문")).toBeTruthy();
  });

  it("나갔다 다시 열면 지난 내용이 이어서 나온다", async () => {
    await renderQuestion();

    expect(mockUseStoredSentenceQuestion).toHaveBeenCalledWith(
      "episode-1",
      "user-2"
    );
    expect(mockUseSentenceQuestion).toHaveBeenCalledWith(
      "episode-1",
      "user-2",
      STORED
    );
    expect(
      screen
        .getAllByTestId("surface-message")
        .map((node) => node.props.children)
    ).toEqual([
      "with 빼고 말하면 진짜 못 알아들어요?",
      "대부분 알아듣긴 해요.",
    ]);
  });

  it("다른 문장에서 열면 그 문장의 자리를 본다", async () => {
    setSearchParams({ episodeId: "episode-1", messageId: "user-9" });
    mockUseStoredSentenceQuestion.mockReturnValue(query({ data: [] }));
    mockUseSentenceQuestion.mockReturnValue(chatWith([]));

    await renderQuestion();

    expect(mockUseStoredSentenceQuestion).toHaveBeenCalledWith(
      "episode-1",
      "user-9"
    );
    // 그 문장이 대화에 없으면 지난 내용을 빌려 오지 않고 돌려보낸다.
    expect(screen.getByText("문장을 찾을 수 없어요.")).toBeTruthy();
    expect(screen.queryByTestId("surface-message")).toBeNull();
  });

  it("롤플레잉이 아니라 학습 질문이라 한국어도 앞길이다", async () => {
    await renderQuestion();

    expect(screen.getByTestId("surface-placeholder")).toHaveTextContent(
      "영어나 한국어로 써 보세요"
    );
  });

  it("지난 내용을 불러오지 못하면 다시 시도할 자리를 준다", async () => {
    mockUseStoredSentenceQuestion.mockReturnValue(query({ isError: true }));

    await renderQuestion();

    expect(screen.getByText("지난 내용을 불러오지 못했어요.")).toBeTruthy();
    expect(screen.queryByTestId("quoted-sentence")).toBeNull();
  });
});
