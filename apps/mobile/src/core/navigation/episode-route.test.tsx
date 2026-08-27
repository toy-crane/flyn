import { beforeEach, expect, jest, test } from "@jest/globals";
import { act, render, screen, userEvent } from "@testing-library/react-native";
import { router } from "expo-router";

import EpisodeRoute from "../../../app/episode";

const EPISODE_ID = "11000000-0000-4000-8000-000000000002";
const NEXT_EPISODE_ID = "11000000-0000-4000-8000-000000000003";

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
        onPress,
      }: {
        accessibilityLabel?: string;
        onPress?: () => void;
      }) =>
        React.createElement(Pressable, {
          accessibilityLabel,
          accessibilityRole: "button",
          onPress,
        }),
    }
  );

  return {
    router: { back: jest.fn(), replace: jest.fn() },
    Stack: {
      Screen: ({ options }: { options?: { title?: string } }) =>
        React.createElement(View, {
          accessibilityLabel: `header ${options?.title ?? ""}`,
        }),
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
  useEpisodeSession: () => ({ data: mockSession }),
}));

jest.mock("@/features/episode/query/story", () => ({
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
      onLeave,
      onStartNext,
      readOnly,
      situation,
    }: {
      episodeId: string;
      onLeave: () => void;
      onStartNext: (episodeId: string) => void;
      readOnly: boolean;
      situation: string;
    }) => {
      playing = { episodeId, readOnly, situation };

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
let mockSession:
  | {
      episode: typeof NEXT_EPISODE;
      messages: never[];
      readOnly: boolean;
    }
  | undefined;
let playing:
  | { episodeId: string; readOnly: boolean; situation: string }
  | undefined;

beforeEach(() => {
  mockBack.mockClear();
  mockReplace.mockClear();
  mockRefresh.mockClear();
  mockSession = { episode: NEXT_EPISODE, messages: [], readOnly: false };
  playing = undefined;
});

test("ID로 읽은 에피소드 이름을 헤더에 걸고 뒤로 가기로 나간다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  expect(screen.getByLabelText("header 계산이 꼬인 아침")).toBeOnTheScreen();
  expect(playing).toEqual({
    episodeId: EPISODE_ID,
    readOnly: false,
    situation: NEXT_EPISODE.situation,
  });

  await user.press(screen.getByRole("button", { name: "뒤로 가기" }));

  expect(mockBack).toHaveBeenCalledTimes(1);
});

test("다음 에피소드로 갈 때 진행을 다시 읽고 새 ID로 바꾼다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  await user.press(screen.getByRole("button", { name: "start next" }));

  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith({
    params: { episodeId: NEXT_EPISODE_ID },
    pathname: "/episode",
  });
});

test("마무리에서 홈으로 가기는 왔던 자리로 돌아간다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  await user.press(screen.getByRole("button", { name: "leave" }));

  expect(mockBack).toHaveBeenCalledTimes(1);
});

test("어떤 길로 나가든 스토리 진행을 다시 읽는다", async () => {
  await render(<EpisodeRoute />);

  expect(mockRefresh).not.toHaveBeenCalled();

  await act(() => {
    screen.unmount();

    return Promise.resolve();
  });

  expect(mockRefresh).toHaveBeenCalledTimes(1);
});

test("서버 장면을 읽기 전에는 에피소드 화면을 그리지 않는다", async () => {
  mockSession = undefined;
  await render(<EpisodeRoute />);

  expect(playing).toBeUndefined();
  expect(screen.queryByRole("button", { name: "leave" })).not.toBeOnTheScreen();
});
