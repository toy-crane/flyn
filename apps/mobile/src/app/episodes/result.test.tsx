import {
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";

jest.mock("expo-router", () =>
  require("../../test-support/expo-router").expoRouterMock()
);
jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ bottom: 34, left: 0, right: 0, top: 59 }),
}));
jest.mock("../../lib/use-episodes", () => ({
  useEpisode: jest.fn(),
  useEpisodeFeedback: jest.fn(),
  useEpisodeMessages: jest.fn(),
}));
jest.mock("../../lib/use-episode-judgment", () => ({
  useRefillJudgment: jest.fn(),
}));
jest.mock("../../lib/use-episode-creation", () => ({
  useSaveEpisode: jest.fn(),
}));
jest.mock("../../lib/user-id", () => ({ useUserId: () => "account-1" }));

import type { Episode } from "../../lib/episodes";
import type { MessageFeedback } from "../../lib/message-feedback";
import { useSaveEpisode } from "../../lib/use-episode-creation";
import { useRefillJudgment } from "../../lib/use-episode-judgment";
import {
  useEpisode,
  useEpisodeFeedback,
  useEpisodeMessages,
} from "../../lib/use-episodes";
import { routerStub, setSearchParams } from "../../test-support/expo-router";
import EpisodeResultScreen from "./result";

/** 턴 수·문장 수를 요약하는 문장이 본문에 없는지 보는 자리다. */
const TURN_COUNT = /20턴/;
const SENTENCE_COUNT_SUMMARY = /문장 4개를/;

const mockUseEpisode = useEpisode as jest.Mock;
const mockUseEpisodeMessages = useEpisodeMessages as jest.Mock;
const mockUseEpisodeFeedback = useEpisodeFeedback as jest.Mock;
const mockUseRefillJudgment = useRefillJudgment as jest.Mock;
const mockUseSaveEpisode = useSaveEpisode as jest.Mock;
const refill = jest.fn();
const saveEpisode = jest.fn();
const retryEpisode = jest.fn();

const EPISODE: Episode = {
  created_at: "2026-08-05T00:00:00.000Z",
  episode_goals: [
    {
      achieved_at: "2026-08-05T00:01:00.000Z",
      achieved_message_id: "user-1",
      position: 1,
      sentence: "짐이 안 나왔다고 알리기",
    },
    {
      achieved_at: "2026-08-05T00:02:00.000Z",
      achieved_message_id: "user-2",
      position: 2,
      sentence: "가방 생김새 설명하기",
    },
    {
      achieved_at: null,
      achieved_message_id: null,
      position: 3,
      sentence: "연락받을 방법 정하기",
    },
  ],
  id: "episode-1",
  partner_role: "수하물 담당 David",
  scenario_description: "짐이 나오지 않은 공항이에요.",
  scenario_title: "공항에서 짐이 안 나왔을 때 항의하기",
  status: "turns_exhausted",
  summary: "상황을 설명하는 문장은 자연스러웠어요.",
  turn_limit: 20,
  updated_at: "2026-08-05T00:03:00.000Z",
  user_role: "짐을 잃은 여행객",
};

const MESSAGES = [
  {
    content: "My suitcase didn't come out.",
    created_at: "2026-08-05T00:00:01.000Z",
    id: "user-1",
    role: "user",
    status: "complete",
  },
  {
    content: "I'm sorry to hear that.",
    created_at: "2026-08-05T00:00:02.000Z",
    id: "assistant-1",
    role: "assistant",
    status: "complete",
  },
  {
    content: "It's a big black bag, have wheels.",
    created_at: "2026-08-05T00:00:03.000Z",
    id: "user-2",
    role: "user",
    status: "complete",
  },
  {
    content: "There's a red tag on the handle.",
    created_at: "2026-08-05T00:00:04.000Z",
    id: "user-3",
    role: "user",
    status: "complete",
  },
  {
    content: "Is the office open tomorrow morning?",
    created_at: "2026-08-05T00:00:05.000Z",
    id: "user-4",
    role: "user",
    status: "complete",
  },
];

const FEEDBACK: MessageFeedback[] = [
  {
    delivered: "My suitcase didn't come out.",
    improvedSentence: null,
    messageId: "user-1",
    reasons: [],
    sourceText: "제 가방이 안 나왔어요.",
    verdict: "clear",
  },
  {
    delivered: "It's a big black bag, have wheels.",
    improvedSentence: "It's a big black bag with wheels.",
    messageId: "user-2",
    reasons: ["동사를 이어 쓰지 않고 with로 이어요."],
    sourceText: null,
    verdict: "improvable",
  },
  {
    delivered: "There's a red tag on the handle.",
    improvedSentence: null,
    messageId: "user-3",
    reasons: [],
    sourceText: null,
    verdict: "clear",
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  setSearchParams({ episodeId: "episode-1" });
  mockUseEpisode.mockReturnValue({
    data: EPISODE,
    isError: false,
    isPending: false,
    refetch: retryEpisode,
  });
  mockUseEpisodeMessages.mockReturnValue({ data: MESSAGES });
  mockUseEpisodeFeedback.mockReturnValue({ data: FEEDBACK });
  mockUseRefillJudgment.mockReturnValue({ isPending: false, mutate: refill });
  mockUseSaveEpisode.mockReturnValue({ isPending: false, mutate: saveEpisode });
});

describe("에피소드 결과 화면", () => {
  it("헤더에는 `다시 하기`만 있고 시나리오 제목은 본문 첫 줄이다", async () => {
    await render(<EpisodeResultScreen />);

    expect(screen.getByRole("button", { name: "다시 하기" })).toBeTruthy();
    expect(screen.getByTestId("result-episode-name")).toHaveTextContent(
      "공항에서 짐이 안 나왔을 때 항의하기"
    );
    // 헤더 타이틀은 비어 있다 — 제목이 잘릴 자리가 없다.
    expect(screen.getByTestId("result-episode-name").props.numberOfLines).toBe(
      undefined
    );
  });

  it("헤드라인은 목표를 몇 개 해냈는지만 말한다", async () => {
    await render(<EpisodeResultScreen />);

    expect(screen.getByTestId("result-headline")).toHaveTextContent(
      "목표 3개 중 2개를 해냈어요"
    );
  });

  it("모두 해내면 헤드라인이 바뀐다", async () => {
    mockUseEpisode.mockReturnValue({
      data: {
        ...EPISODE,
        episode_goals: EPISODE.episode_goals.map((goal) => ({
          ...goal,
          achieved_at: "2026-08-05T00:02:00.000Z",
          achieved_message_id: "user-2",
        })),
        status: "goals_met",
      },
      isError: false,
      isPending: false,
      refetch: retryEpisode,
    });

    await render(<EpisodeResultScreen />);

    expect(screen.getByTestId("result-headline")).toHaveTextContent(
      "목표 3개를 모두 해냈어요"
    );
  });

  it("미달성 목표는 빈 원이고 X 표시는 어디에도 없다", async () => {
    await render(<EpisodeResultScreen />);

    expect(screen.getByTestId("goal-result-done-1")).toBeTruthy();
    expect(screen.getByTestId("goal-result-done-2")).toBeTruthy();
    expect(screen.getByTestId("goal-result-missed-3")).toBeTruthy();
    expect(screen.queryByText("✕")).toBeNull();
    expect(screen.queryByText("X")).toBeNull();
    expect(screen.queryByLabelText("미달성")).toBeNull();
  });

  it("이번 글쓰기는 저장된 총평을 읽기만 한다", async () => {
    await render(<EpisodeResultScreen />);

    expect(screen.getByTestId("result-summary")).toHaveTextContent(
      "상황을 설명하는 문장은 자연스러웠어요."
    );
  });

  it("문장 목록은 발화 전체이고 개수는 섹션 타이틀이 담는다", async () => {
    await render(<EpisodeResultScreen />);
    const list = within(screen.getByTestId("result-utterances"));

    expect(screen.getByText("내가 쓴 문장 4개")).toBeTruthy();
    // 첨삭이 있는 것만 추리지 않는다 — 그대로 통한 문장도 남는다.
    expect(list.getByText("There's a red tag on the handle.")).toBeTruthy();
    expect(list.getByText("My suitcase didn't come out.")).toBeTruthy();
    // 턴 수와 문장 수를 요약하는 문장은 두지 않는다.
    expect(screen.queryByText(TURN_COUNT)).toBeNull();
    expect(screen.queryByText(SENTENCE_COUNT_SUMMARY)).toBeNull();
  });

  it("표시는 대화 화면의 세 표시를 그대로 쓴다", async () => {
    await render(<EpisodeResultScreen />);

    // 한글로 쓴 문장은 번역, 고칠 여지가 있으면 info, 그대로 통했으면 체크다.
    expect(screen.getByTestId("message-mark-translated")).toBeTruthy();
    expect(screen.getByTestId("message-mark-improvable")).toBeTruthy();
    expect(screen.getByTestId("message-mark-clear")).toBeTruthy();
  });

  it("화살표가 있는 줄을 누르면 대화 중과 같은 시트가 열린다", async () => {
    await render(<EpisodeResultScreen />);

    await fireEvent.press(
      screen.getByRole("button", { name: "It's a big black bag, have wheels." })
    );

    expect(routerStub.push).toHaveBeenCalledWith({
      params: { episodeId: "episode-1", messageId: "user-2" },
      pathname: "/episodes/feedback",
    });
  });

  it("그대로 통한 문장에는 열 것이 없다", async () => {
    await render(<EpisodeResultScreen />);

    expect(
      screen.queryByRole("button", { name: "There's a red tag on the handle." })
    ).toBeNull();
  });

  it("끝까지 판정이 없는 문장에만 `다시 확인`이 있고 누르면 채운다", async () => {
    await render(<EpisodeResultScreen />);

    expect(screen.getByTestId("utterance-refill-user-4")).toBeTruthy();
    expect(screen.queryByTestId("utterance-refill-user-1")).toBeNull();
    expect(screen.queryByTestId("utterance-refill-user-2")).toBeNull();
    expect(screen.queryByTestId("utterance-refill-user-3")).toBeNull();

    await fireEvent.press(screen.getByTestId("utterance-refill-user-4"));

    expect(refill).toHaveBeenCalled();
  });

  it("판정이 채워지면 `다시 확인` 자리에 표시가 선다", async () => {
    const { rerender } = await render(<EpisodeResultScreen />);

    mockUseEpisodeFeedback.mockReturnValue({
      data: [
        ...FEEDBACK,
        {
          delivered: "Is the office open tomorrow morning?",
          improvedSentence: null,
          messageId: "user-4",
          reasons: [],
          sourceText: null,
          verdict: "clear" as const,
        },
      ],
    });
    await rerender(<EpisodeResultScreen />);

    expect(screen.queryByTestId("utterance-refill-user-4")).toBeNull();
    expect(screen.getAllByTestId("message-mark-clear")).toHaveLength(2);
  });

  it("하단 액션은 결과와 무관하게 같다", async () => {
    await render(<EpisodeResultScreen />);

    await fireEvent.press(
      screen.getByRole("button", { name: "새 에피소드 시작" })
    );

    expect(routerStub.push).toHaveBeenCalledWith("/episodes/new");

    await fireEvent.press(screen.getByRole("button", { name: "대화 보기" }));

    expect(routerStub.push).toHaveBeenCalledWith("/episodes/episode-1");
  });

  it("`다시 하기`는 같은 시나리오·역할·목표로 새 에피소드를 시작한다", async () => {
    saveEpisode.mockImplementation((_input, { onSuccess }) => {
      onSuccess({ id: "episode-2" });
    });

    await render(<EpisodeResultScreen />);
    await fireEvent.press(screen.getByRole("button", { name: "다시 하기" }));

    expect(saveEpisode).toHaveBeenCalledWith(
      {
        goals: [
          "짐이 안 나왔다고 알리기",
          "가방 생김새 설명하기",
          "연락받을 방법 정하기",
        ],
        roles: {
          partnerRole: "수하물 담당 David",
          userRole: "짐을 잃은 여행객",
        },
        scenario: {
          description: "짐이 나오지 않은 공항이에요.",
          title: "공항에서 짐이 안 나왔을 때 항의하기",
        },
      },
      expect.anything()
    );
    expect(routerStub.replace).toHaveBeenCalledWith("/episodes/episode-2");
  });

  it("총평이 없으면 없다고 말한다", async () => {
    mockUseEpisode.mockReturnValue({
      data: { ...EPISODE, summary: null },
      isError: false,
      isPending: false,
      refetch: retryEpisode,
    });

    await render(<EpisodeResultScreen />);

    expect(screen.getByTestId("result-summary")).toHaveTextContent(
      "이번 글쓰기 총평은 만들지 못했어요."
    );
  });

  it("결과를 읽지 못하면 다시 시도할 수 있다", async () => {
    mockUseEpisode.mockReturnValue({
      data: undefined,
      isError: true,
      isPending: false,
      refetch: retryEpisode,
    });

    await render(<EpisodeResultScreen />);
    await fireEvent.press(screen.getByRole("button", { name: "다시 시도" }));

    expect(retryEpisode).toHaveBeenCalled();
  });
});
