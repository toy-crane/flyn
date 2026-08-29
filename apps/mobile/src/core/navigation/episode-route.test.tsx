import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, screen, userEvent, waitFor } from "@testing-library/react-native";
import { router } from "expo-router";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import EpisodeRoute from "../../../app/episode";

const EPISODE_ID = "11000000-0000-4000-8000-000000000002";
const NEXT_EPISODE_ID = "11000000-0000-4000-8000-000000000003";
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
    router: { back: jest.fn(), replace: jest.fn() },
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
    useLocalSearchParams: () => ({ episodeId: EPISODE_ID }),
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
  useStoryRefresh: () => mockRefresh,
}));

jest.mock("@/shared/ui/toolbar-icons", () => ({
  toolbarIcon: (name: string) => name,
}));

jest.mock("@/screens/episode/episode-screen", () => {
  const React = require("react") as typeof import("react");
  const { Pressable } =
    require("react-native") as typeof import("react-native");

  return {
    EpisodeScreen: ({
      episodeId,
      isStartingNext,
      onLeave,
      onSettlingChange,
      onStartNext,
      readOnly,
      situation,
    }: {
      episodeId: string;
      isStartingNext: boolean;
      onLeave: () => void;
      onSettlingChange: (isSettling: boolean) => void;
      onStartNext: (episodeId: string) => void;
      readOnly: boolean;
      situation: string;
    }) => {
      playing = { episodeId, isStartingNext, readOnly, situation };
      setSettling = onSettlingChange;
      startNextFromScreen = () => onStartNext(NEXT_EPISODE_ID);

      return React.createElement(
        React.Fragment,
        null,
        React.createElement(Pressable, {
          accessibilityLabel: "leave",
          accessibilityRole: "button",
          onPress: onLeave,
        }),
        React.createElement(Pressable, {
          accessibilityLabel: "start next",
          accessibilityRole: "button",
          accessibilityState: {
            busy: isStartingNext,
            disabled: isStartingNext,
          },
          disabled: isStartingNext,
          onPress: () => onStartNext(NEXT_EPISODE_ID),
        })
      );
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
      isStartingNext: boolean;
      readOnly: boolean;
      situation: string;
    }
  | undefined;
let setSettling: ((isSettling: boolean) => void) | undefined;
let startNextFromScreen: (() => void) | undefined;

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
  setSettling = undefined;
  startNextFromScreen = undefined;
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
    isStartingNext: false,
    readOnly: false,
    situation: NEXT_EPISODE.situation,
  });

  await user.press(screen.getByRole("button", { name: "뒤로 가기" }));

  expect(mockBack).toHaveBeenCalledTimes(1);
});

test("다음 에피소드로 갈 때 진행을 다시 읽고 새 ID로 바꾼다", async () => {
  const user = userEvent.setup();
  await renderWithHeroUI(<EpisodeRoute />);

  await user.press(screen.getByRole("button", { name: "start next" }));

  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith({
    params: { episodeId: NEXT_EPISODE_ID },
    pathname: "/episode",
  });
});

test("다음 에피소드를 읽는 동안 같은 실행을 겹치지 않고 버튼에 알린다", async () => {
  let finishRefresh: (() => void) | undefined;
  mockRefresh.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishRefresh = resolve;
      })
  );
  await renderWithHeroUI(<EpisodeRoute />);

  await act(() => {
    startNextFromScreen?.();
    startNextFromScreen?.();

    return Promise.resolve();
  });

  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(playing?.isStartingNext).toBe(true);
  expect(screen.getByRole("button", { name: "start next" })).toHaveProp(
    "accessibilityState",
    { busy: true, disabled: true }
  );
  expect(screen.getByRole("button", { name: "뒤로 가기" })).toBeDisabled();

  await act(() => {
    finishRefresh?.();

    return Promise.resolve();
  });

  await waitFor(() => {
    expect(mockReplace).toHaveBeenCalledTimes(1);
  });
});

test("다음 에피소드를 읽는 중 화면을 떠나면 늦은 화면 전환을 취소한다", async () => {
  let finishRefresh: (() => void) | undefined;
  mockRefresh.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finishRefresh = resolve;
      })
  );
  await renderWithHeroUI(<EpisodeRoute />);

  await act(() => {
    startNextFromScreen?.();

    return Promise.resolve();
  });
  await act(() => {
    screen.unmount();

    return Promise.resolve();
  });
  await act(() => {
    finishRefresh?.();

    return Promise.resolve();
  });

  expect(mockReplace).not.toHaveBeenCalled();
});

test("마무리에서 홈으로 가기는 왔던 자리로 돌아간다", async () => {
  const user = userEvent.setup();
  await renderWithHeroUI(<EpisodeRoute />);

  await user.press(screen.getByRole("button", { name: "leave" }));

  expect(mockBack).toHaveBeenCalledTimes(1);
});

test("결말 기록을 저장하는 동안 헤더로도 나가지 못한다", async () => {
  const user = userEvent.setup();
  await renderWithHeroUI(<EpisodeRoute />);

  await act(() => {
    setSettling?.(true);

    return Promise.resolve();
  });

  const back = screen.getByRole("button", { name: "뒤로 가기" });

  expect(back).toBeDisabled();
  await user.press(back);
  expect(mockBack).not.toHaveBeenCalled();

  await act(() => {
    setSettling?.(false);

    return Promise.resolve();
  });
  await user.press(screen.getByRole("button", { name: "뒤로 가기" }));
  expect(mockBack).toHaveBeenCalledTimes(1);
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
  expect(screen.queryByRole("button", { name: "leave" })).not.toBeOnTheScreen();
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
