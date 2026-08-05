import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
jest.mock("../../components/chat/chat-conversation", () => {
  const ReactRuntime = require("react");
  const { Pressable, Text, View } = require("react-native");

  return {
    ChatConversation: ({
      dock,
      listHeader,
      onMarkPress,
      placeholder,
    }: {
      dock: unknown;
      listHeader: unknown;
      onMarkPress?: (messageId: string) => void;
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
        ReactRuntime.createElement(View, { testID: "surface-dock" }, dock),
        ReactRuntime.createElement(Pressable, {
          onPress: () => onMarkPress?.("user-1"),
          testID: "surface-mark",
        }),
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
  useEpisodeFeedback: jest.fn(),
  useEpisodeMessages: jest.fn(),
}));
jest.mock("../../lib/use-episode-conversation", () => ({
  useEpisodeConversation: jest.fn(),
}));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "account-1" }));

import type { MessageFeedback } from "../../lib/message-feedback";
import { useEpisodeConversation } from "../../lib/use-episode-conversation";
import {
  useEpisode,
  useEpisodeFeedback,
  useEpisodeMessages,
} from "../../lib/use-episodes";
import { routerStub, setSearchParams } from "../../test-support/expo-router";
import EpisodeConversationScreen from "./[id]";

const mockUseEpisode = useEpisode as jest.Mock;
const mockUseEpisodeMessages = useEpisodeMessages as jest.Mock;
const mockUseEpisodeFeedback = useEpisodeFeedback as jest.Mock;
const mockUseEpisodeConversation = useEpisodeConversation as jest.Mock;
const retryEpisode = jest.fn();
const retryMessages = jest.fn();

const GOALS = [
  {
    achieved_at: null,
    achieved_message_id: null,
    position: 2,
    sentence: "우유를 오트밀크로 바꿔 주문하기",
  },
  {
    achieved_at: null,
    achieved_message_id: null,
    position: 1,
    sentence: "오늘의 원두 추천 받기",
  },
  {
    achieved_at: null,
    achieved_message_id: null,
    position: 3,
    sentence: "근처 가볼 만한 곳 물어보기",
  },
];

const EPISODE = {
  created_at: "2026-08-05T00:00:00.000Z",
  episode_goals: GOALS,
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
    content: "Could you recommend today's coffee?",
    created_at: "2026-08-05T00:00:01.000Z",
    id: "user-1",
    role: "user",
    status: "complete",
  },
  {
    content: "Today's single origin is a natural Ethiopian.",
    created_at: "2026-08-05T00:00:02.000Z",
    id: "assistant-1",
    role: "assistant",
    status: "complete",
  },
];

const FEEDBACK: MessageFeedback[] = [
  {
    delivered: "Could you recommend today's coffee?",
    improvedSentence: null,
    messageId: "user-1",
    reasons: [],
    sourceText: "오늘 커피 뭐가 좋아요?",
    verdict: "clear",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  setSearchParams({ id: "episode-1" });
  mockUseEpisode.mockReturnValue({
    data: EPISODE,
    isError: false,
    isPending: false,
    refetch: retryEpisode,
  });
  mockUseEpisodeMessages.mockReturnValue({
    data: MESSAGES,
    isError: false,
    isPending: false,
    refetch: retryMessages,
  });
  mockUseEpisodeFeedback.mockReturnValue({ data: FEEDBACK });
  // 목표 바가 보는 것은 저장된 목표가 아니라 판정이 얹힌 목표다.
  mockUseEpisodeConversation.mockReturnValue({
    chat: { messages: [] },
    goals: [...GOALS].sort((left, right) => left.position - right.position),
  });
});

describe("에피소드 대화 화면", () => {
  it("헤더가 시나리오 제목과 역할을 나른다", async () => {
    await render(<EpisodeConversationScreen />);

    expect(screen.getByText("포틀랜드 카페에서 첫 주문")).toBeTruthy();
    expect(screen.getByText("바리스타 Maya · 처음 방문한 여행객")).toBeTruthy();
    // 상황 설명은 상황 카드 하나만 말한다.
    expect(screen.queryByText("여행 중 들어간 작은 카페예요.")).toBeNull();
  });

  it("상황 카드가 대화 목록의 첫 요소다", async () => {
    await render(<EpisodeConversationScreen />);

    const listHeader = screen.getByTestId("surface-list-header");

    expect(within(listHeader).getByText("상황 자세히 보기")).toBeTruthy();

    await fireEvent.press(
      within(listHeader).getByTestId("episode-context-card")
    );

    expect(
      within(listHeader).getByTestId("episode-context-description")
    ).toHaveTextContent("여행 중 들어간 작은 카페예요.");
  });

  it("목표 바가 composer 바로 위에 탭 없이 항상 있다", async () => {
    await render(<EpisodeConversationScreen />);

    const dock = within(screen.getByTestId("surface-dock"));

    // 순서가 뒤섞여 저장돼도 지금 할 목표는 첫 목표다.
    expect(dock.getByTestId("goal-dock-now")).toHaveTextContent(
      "오늘의 원두 추천 받기"
    );
    expect(screen.queryByRole("button", { name: "목표" })).toBeNull();
  });

  it("펼친 목표 바가 사용자 메시지로 센 턴을 보여준다", async () => {
    await render(<EpisodeConversationScreen />);

    await fireEvent.press(screen.getByTestId("goal-dock"));

    expect(screen.getByTestId("goal-dock-turns")).toHaveTextContent("턴 1/20");
  });

  it("composer는 영어를 먼저 권한다", async () => {
    await render(<EpisodeConversationScreen />);

    expect(screen.getByTestId("surface-placeholder")).toHaveTextContent(
      "영어로 써 보세요"
    );
  });

  it("지난 대화와 저장된 판정을 그대로 controller에 넘긴다", async () => {
    await render(<EpisodeConversationScreen />);

    expect(mockUseEpisodeConversation).toHaveBeenCalledWith(
      EPISODE,
      "account-1",
      MESSAGES,
      FEEDBACK
    );
  });

  it("표시를 누르면 그 발화의 첨삭 시트가 열린다", async () => {
    await render(<EpisodeConversationScreen />);
    await fireEvent.press(screen.getByTestId("surface-mark"));

    expect(routerStub.push).toHaveBeenCalledWith({
      params: { episodeId: "episode-1", messageId: "user-1" },
      pathname: "/episodes/feedback",
    });
  });

  it("목표 바는 판정이 얹힌 목표를 본다", async () => {
    mockUseEpisodeConversation.mockReturnValue({
      chat: { messages: [] },
      goals: [
        {
          achieved_at: "2026-08-05T00:00:03.000Z",
          achieved_message_id: "user-1",
          position: 1,
          sentence: "오늘의 원두 추천 받기",
        },
        ...[...GOALS]
          .sort((left, right) => left.position - right.position)
          .slice(1),
      ],
    });

    await render(<EpisodeConversationScreen />);

    const dock = within(screen.getByTestId("surface-dock"));

    // 달성 즉시 다음 목표로 넘어간다.
    expect(dock.getByTestId("goal-dock-now")).toHaveTextContent(
      "우유를 오트밀크로 바꿔 주문하기"
    );
  });

  it("에피소드나 대화를 읽는 동안 loading을 보여준다", async () => {
    mockUseEpisodeMessages.mockReturnValue({
      data: undefined,
      isError: false,
      isPending: true,
      refetch: retryMessages,
    });

    await render(<EpisodeConversationScreen />);

    expect(screen.getByLabelText("대화 불러오는 중").props.color).toBe(
      "#777777"
    );
    expect(screen.queryByTestId("goal-dock")).toBeNull();
  });

  it("조회 실패는 에피소드와 대화를 함께 재시도한다", async () => {
    mockUseEpisode.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch: retryEpisode,
    });

    await render(<EpisodeConversationScreen />);
    await fireEvent.press(screen.getByRole("button", { name: "다시 시도" }));

    expect(retryEpisode).toHaveBeenCalled();
    expect(retryMessages).toHaveBeenCalled();
  });

  it("지워졌거나 남의 에피소드면 목록으로 돌아갈 수 있다", async () => {
    mockUseEpisode.mockReturnValue({
      data: null,
      isError: false,
      isPending: false,
      refetch: retryEpisode,
    });

    await render(<EpisodeConversationScreen />);

    expect(screen.getByText("에피소드를 찾을 수 없어요.")).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "에피소드 목록으로" })
    ).toBeTruthy();
  });
});
