import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import EpisodeRoute from "../../../app/episode";

const EPISODE_ID = "11000000-0000-4000-8000-000000000002";
const NEXT_EPISODE_ID = "11000000-0000-4000-8000-000000000003";
const STORY_PLAY_ID = "1a000000-0000-4000-8000-000000000001";
let headerOptions:
  | { headerBackButtonMenuEnabled?: boolean; title?: string }
  | undefined;

jest.mock("expo-router", () => {
  const React = require("react") as typeof import("react");
  const { Pressable, View } =
    require("react-native") as typeof import("react-native");

  const Toolbar = Object.assign(
    ({
      children,
      placement,
    }: {
      children?: React.ReactNode;
      placement?: string;
    }) =>
      React.createElement(View, {
        children,
        testID: `episode-toolbar-${placement ?? "unknown"}`,
      }),
    {
      Button: ({
        accessibilityLabel,
        disabled,
        onPress,
      }: {
        accessibilityLabel?: string;
        disabled?: boolean;
        onPress?: () => void;
      }) =>
        React.createElement(Pressable, {
          accessibilityLabel,
          accessibilityRole: "button",
          disabled,
          onPress,
        }),
    }
  );

  return {
    router: { back: jest.fn(), push: jest.fn(), replace: jest.fn() },
    Stack: {
      Screen: ({
        options,
      }: {
        options?: { headerBackButtonMenuEnabled?: boolean; title?: string };
      }) => {
        headerOptions = options;

        return React.createElement(View, {
          accessibilityLabel: `header ${options?.title ?? ""}`,
        });
      },
      Toolbar,
    },
    useLocalSearchParams: () => ({
      episodeId: EPISODE_ID,
      storyPlayId: STORY_PLAY_ID,
    }),
  };
});

jest.mock("@/core/theme/app-theme-bridge", () => ({
  useAppTheme: () => ({ background: "#000000" }),
}));

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: () => ({
    session: { access_token: "token-1", user: { id: "user-1" } },
    status: "signedIn",
  }),
}));

jest.mock("@/features/episode/query/episode-session", () => ({
  useEpisodeSession: () => mockEpisodeQuery,
}));

jest.mock("@/features/story/query/story", () => ({
  // 회차를 들고 온 화면은 저장된 대화를 읽는다. 상세는 새 대화에서만 쓰인다.
  useStoryDetail: () => ({
    data: undefined,
    isError: false,
    isPending: false,
    refetch: jest.fn(),
  }),
  useStoryRefresh: () => mockRefresh,
}));

jest.mock("@/shared/ui/toolbar-icons", () => ({
  toolbarIcon: (name: string) => name,
}));

const mockOpenReview = jest.fn();
jest.mock("@/features/episode/state/episode-review", () => ({
  useEpisodeReview: () => ({ openReview: mockOpenReview }),
}));
jest.mock("@/screens/episode/episode-screen", () => {
  const React = require("react") as typeof import("react");
  const { Pressable } =
    require("react-native") as typeof import("react-native");
  return {
    EpisodeScreen: (props: {
      episodeId: string;
      readOnly: boolean;
      savedResults?: readonly unknown[];
      situation: string;
      onReview: (next: unknown) => void;
    }) => {
      playing = {
        episodeId: props.episodeId,
        readOnly: props.readOnly,
        savedResults: props.savedResults,
        situation: props.situation,
      };
      return React.createElement(Pressable, {
        accessibilityLabel: "표현 돌아보기",
        accessibilityRole: "button",
        onPress: () =>
          props.onReview({
            copy: "예고",
            episodeId: NEXT_EPISODE_ID,
            number: 3,
            title: "다음 화",
          }),
      });
    },
  };
});

const NEXT_EPISODE = {
  episodeId: EPISODE_ID,
  number: 2,
  preview: "계산대 앞에서 카드가 자꾸 튕겨요.",
  situation: "다른 방법을 찾아 계산을 끝내 보세요",
  situationEmoji: "💳",
  title: "계산이 꼬인 아침",
};
const mockBack = jest.mocked(router.back);
const mockReplace = jest.mocked(router.replace);
const mockRefresh = jest.fn(() => Promise.resolve());
const mockEpisodeRefetch = jest.fn(() => Promise.resolve());
let mockSession:
  | {
      expressionResults?: readonly unknown[];
      story?: { id: string; title: string };
      episode: typeof NEXT_EPISODE;
      messages: never[];
      readOnly: boolean;
    }
  | undefined;
let mockEpisodeQuery: {
  data: typeof mockSession;
  isError: boolean;
  isFetching: boolean;
  isPending: boolean;
  refetch: typeof mockEpisodeRefetch;
};
let playing:
  | {
      episodeId: string;

      readOnly: boolean;
      savedResults?: readonly unknown[];
      situation: string;
    }
  | undefined;

beforeEach(() => {
  mockBack.mockClear();
  mockReplace.mockClear();
  mockRefresh.mockClear();
  mockEpisodeRefetch.mockClear();
  mockSession = { episode: NEXT_EPISODE, messages: [], readOnly: false };
  mockEpisodeQuery = {
    data: mockSession,
    isError: false,
    isFetching: false,
    isPending: false,
    refetch: mockEpisodeRefetch,
  };
  playing = undefined;
  mockOpenReview.mockClear();
  jest.mocked(router.push).mockClear();
  headerOptions = undefined;
});

afterEach(() => {
  jest.useRealTimers();
});

test("ID로 읽은 에피소드 이름을 헤더에 걸고 뒤로 가기로 나간다", async () => {
  const user = userEvent.setup();
  await renderWithHeroUI(<EpisodeRoute />);

  expect(screen.getByLabelText("header 계산이 꼬인 아침")).toBeOnTheScreen();
  expect(headerOptions?.headerBackButtonMenuEnabled).toBe(false);
  expect(playing).toEqual({
    episodeId: EPISODE_ID,
    readOnly: false,
    savedResults: undefined,
    situation: NEXT_EPISODE.situation,
  });

  await user.press(screen.getByRole("button", { name: "뒤로 가기" }));

  expect(mockBack).toHaveBeenCalledTimes(1);
});

test("끝난 화와 진행 중인 화 모두 저장된 완료 결과를 넘긴다", async () => {
  const saved = [
    {
      entries: [
        {
          fixed: "the wrong coffee",
          original: "wrong coffee",
          pattern: "article-the-specific",
          why: "그 하나를 짚을 때는 the를 붙여요.",
        },
      ],
      fixed: "I think you gave me the wrong coffee.",
      messageId: "m1",
      original: "I think this is wrong coffee.",
    },
  ];

  mockSession = {
    episode: NEXT_EPISODE,
    expressionResults: saved,
    messages: [],
    readOnly: true,
  };
  mockEpisodeQuery.data = mockSession;
  await renderWithHeroUI(<EpisodeRoute />);

  expect(playing?.readOnly).toBe(true);
  expect(playing?.savedResults).toEqual(saved);

  mockSession = {
    episode: NEXT_EPISODE,
    expressionResults: saved,
    messages: [],
    readOnly: false,
  };
  mockEpisodeQuery.data = mockSession;
  await renderWithHeroUI(<EpisodeRoute />);

  // 진행 중인 화에는 그대로 돌아온다.
  expect(playing?.savedResults).toEqual(saved);
});

test("표현 돌아보기는 같은 회차와 화의 문맥을 전달하고 대화 위에 연다", async () => {
  const user = userEvent.setup();
  mockSession = {
    episode: NEXT_EPISODE,
    messages: [],
    readOnly: true,
    story: { id: "story", title: "우리 동네 카페" },
  };
  mockEpisodeQuery.data = mockSession;
  await renderWithHeroUI(<EpisodeRoute />);
  await user.press(screen.getByRole("button", { name: "표현 돌아보기" }));
  expect(mockOpenReview).toHaveBeenCalledWith({
    episode: NEXT_EPISODE,
    nextUp: {
      copy: "예고",
      episodeId: NEXT_EPISODE_ID,
      number: 3,
      title: "다음 화",
    },
    story: mockSession.story,
    storyPlayId: STORY_PLAY_ID,
  });
  expect(router.push).toHaveBeenCalledWith({
    params: { episodeId: EPISODE_ID, storyPlayId: STORY_PLAY_ID },
    pathname: "/episode/review",
  });
});

test("어떤 길로 나가든 스토리 진행을 다시 읽는다", async () => {
  await renderWithHeroUI(<EpisodeRoute />);

  expect(mockRefresh).not.toHaveBeenCalled();

  await act(() => {
    screen.unmount();

    return Promise.resolve();
  });

  expect(mockRefresh).toHaveBeenCalledTimes(1);
});

test("서버 장면을 읽기 전에는 에피소드 화면을 그리지 않는다", async () => {
  mockSession = undefined;
  mockEpisodeQuery = { ...mockEpisodeQuery, data: undefined, isPending: true };
  await renderWithHeroUI(<EpisodeRoute />);

  expect(playing).toBeUndefined();
  expect(
    screen.queryByRole("button", { name: "표현 돌아보기" })
  ).not.toBeOnTheScreen();
});

test("서버 장면을 1초 넘게 읽으면 본문에서 진행 상태를 알린다", async () => {
  jest.useFakeTimers();
  mockSession = undefined;
  mockEpisodeQuery = { ...mockEpisodeQuery, data: undefined, isPending: true };
  await renderWithHeroUI(<EpisodeRoute />);

  expect(screen.queryByRole("progressbar")).not.toBeOnTheScreen();

  await act(() => {
    jest.advanceTimersByTime(1000);
  });

  expect(
    screen.getByRole("progressbar", { name: "대화를 불러오고 있어요" })
  ).toBeOnTheScreen();
});

test("서버 장면을 읽지 못하면 같은 화면에서 다시 시도한다", async () => {
  const user = userEvent.setup();
  mockSession = undefined;
  mockEpisodeQuery = {
    ...mockEpisodeQuery,
    data: undefined,
    isError: true,
  };
  await renderWithHeroUI(<EpisodeRoute />);

  expect(screen.getByText("대화를 불러오지 못했어요.")).toBeOnTheScreen();
  await user.press(screen.getByRole("button", { name: "다시 시도하기" }));

  expect(mockEpisodeRefetch).toHaveBeenCalledTimes(1);
});

test("실제 재조회가 pending으로 돌아가도 오류 카드와 버튼 자리를 지킨다", async () => {
  let finishRetry: (() => void) | undefined;
  mockSession = undefined;
  mockEpisodeQuery = {
    ...mockEpisodeQuery,
    data: undefined,
    isError: true,
  };
  mockEpisodeRefetch.mockImplementationOnce(() => {
    mockEpisodeQuery = {
      ...mockEpisodeQuery,
      isError: false,
      isFetching: true,
      isPending: true,
    };

    return new Promise<void>((resolve) => {
      finishRetry = resolve;
    });
  });
  const user = userEvent.setup();
  await renderWithHeroUI(<EpisodeRoute />);
  await user.press(screen.getByRole("button", { name: "다시 시도하기" }));

  await waitFor(() => {
    expect(screen.getByText("대화를 불러오지 못했어요.")).toBeOnTheScreen();
    expect(screen.getByRole("button", { name: "다시 시도하기" })).toHaveProp(
      "accessibilityState",
      { busy: true, disabled: true }
    );
  });

  await act(() => {
    mockSession = { episode: NEXT_EPISODE, messages: [], readOnly: false };
    mockEpisodeQuery = {
      ...mockEpisodeQuery,
      data: mockSession,
      isFetching: false,
      isPending: false,
    };
    finishRetry?.();

    return Promise.resolve();
  });

  await waitFor(() => {
    expect(
      screen.queryByText("대화를 불러오지 못했어요.")
    ).not.toBeOnTheScreen();
  });
});
