import { beforeEach, expect, jest, test } from "@jest/globals";
import { render, screen, userEvent } from "@testing-library/react-native";
import { router } from "expo-router";

import EpisodeRoute from "../../../app/episode";

jest.mock("expo-router", () => {
  const React = require("react") as typeof import("react");
  const { Pressable, View } =
    require("react-native") as typeof import("react-native");

  const Toolbar = Object.assign(
    ({
      children,
      placement,
    }: {
      children?: import("react").ReactNode;
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

// 어떤 화를 여는지는 계정의 진행이 정한다. 진짜 QueryClient를 띄우면 타이머가
// 남으므로 읽기 자체를 세워 두고, 경로가 그 답으로 무엇을 하는지만 본다.
jest.mock("@/features/episode/query/season", () => ({
  useSeason: () => ({ data: { next: mockNext } }),
  useSeasonRefresh: () => mockRefresh,
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
      episode,
      onLeave,
      onStartNext,
      situation,
    }: {
      episode: number | undefined;
      onLeave: () => void;
      onStartNext: () => void;
      situation: string | undefined;
    }) => {
      playing = { episode, situation };

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
          onPress: onStartNext,
        })
      );
    },
  };
});

const mockBack = jest.mocked(router.back);
const mockReplace = jest.mocked(router.replace);
const mockRefresh = jest.fn(() => Promise.resolve());
const NEXT_EPISODE = {
  episode: 2,
  preview: "계산대 앞에서 카드가 자꾸 튕겨요.",
  situation: "다른 방법을 찾아 계산을 끝내 보세요",
  situationEmoji: "💳",
  title: "계산이 꼬인 아침",
};
let mockNext: typeof NEXT_EPISODE | null = NEXT_EPISODE;
let playing: { episode?: number; situation?: string } | undefined;

beforeEach(() => {
  mockBack.mockClear();
  mockReplace.mockClear();
  mockRefresh.mockClear();
  mockNext = NEXT_EPISODE;
  playing = undefined;
});

// 헤더의 이름도 상황 줄도 각본의 것이라, 진행이 가리키는 화에서 온다.
test("진행이 가리키는 화의 이름을 헤더에 걸고 뒤로 가기로 나간다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  expect(screen.getByLabelText("header 계산이 꼬인 아침")).toBeOnTheScreen();
  expect(playing).toEqual({ episode: 2, situation: NEXT_EPISODE.situation });

  await user.press(screen.getByRole("button", { name: "뒤로 가기" }));

  expect(mockBack).toHaveBeenCalledTimes(1);
});

// 자리에서 상태만 되돌리면 지난 화의 목록 위치가 남는다. 경로를 갈아 끼워야
// 홈에서 처음 열 때와 같은 길을 지난다. 진행을 먼저 다시 읽어야 새 화면이
// 방금 끝낸 화를 한 번 더 열지 않는다.
test("다음 화로 넘어갈 때 진행을 다시 읽고 같은 경로를 새로 연다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  await user.press(screen.getByRole("button", { name: "start next" }));

  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(mockReplace).toHaveBeenCalledWith("/episode");
});

test("마무리에서 홈으로 가기는 진행을 다시 읽고 왔던 자리로 돌아간다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  await user.press(screen.getByRole("button", { name: "leave" }));

  expect(mockRefresh).toHaveBeenCalledTimes(1);
  expect(mockBack).toHaveBeenCalledTimes(1);
});

// 시즌을 아직 읽지 못했으면 열 화가 없다. 아무 화나 열지 않고 기다린다.
test("열 화가 정해지기 전에는 아무 화도 넘기지 않는다", async () => {
  mockNext = null;
  await render(<EpisodeRoute />);

  expect(playing).toEqual({ episode: undefined, situation: undefined });
});
