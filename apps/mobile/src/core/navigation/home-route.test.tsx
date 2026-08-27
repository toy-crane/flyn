import { beforeEach, expect, jest, test } from "@jest/globals";
import {
  render,
  screen,
  userEvent,
  within,
} from "@testing-library/react-native";
import { router } from "expo-router";

import HomeRoute from "../../../app/(tabs)/(home)/index";

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
        testID: `home-toolbar-${placement ?? "unknown"}`,
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
      View: ({ children }: { children?: import("react").ReactNode }) =>
        React.createElement(View, { children }),
    }
  );

  return {
    router: { push: jest.fn() },
    Stack: { Toolbar },
  };
});

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: () => ({
    session: { access_token: "token-1", user: { id: "user-1" } },
    status: "signedIn",
  }),
}));

// 홈이 시즌을 읽는 경로다. 진짜 QueryClient를 띄우면 타이머가 남으므로 읽기
// 자체를 세워 두고, 경로가 무엇을 넘기는지만 본다.
jest.mock("@/features/episode/query/season", () => ({
  useSeason: () => ({ data: { tag: "season" }, refetch: mockRefetch }),
}));

jest.mock("@/screens/home/home-screen", () => {
  const React = require("react") as typeof import("react");
  const { Pressable } =
    require("react-native") as typeof import("react-native");

  return {
    HomeScreen: ({
      onRetry,
      onStartEpisode,
      season,
    }: {
      onRetry: () => void;
      onStartEpisode: () => void;
      season: { tag?: string } | undefined;
    }) => {
      homeSeason = season;

      return React.createElement(
        React.Fragment,
        null,
        React.createElement(Pressable, {
          accessibilityLabel: "Home content",
          accessibilityRole: "button",
          onPress: onStartEpisode,
        }),
        React.createElement(Pressable, {
          accessibilityLabel: "Home retry",
          accessibilityRole: "button",
          onPress: onRetry,
        })
      );
    },
  };
});

jest.mock("@/screens/home/profile-avatar-button", () => {
  const React = require("react") as typeof import("react");
  const { Pressable } =
    require("react-native") as typeof import("react-native");

  return {
    ProfileAvatarButton: ({ onPress }: { onPress: () => void }) =>
      React.createElement(Pressable, {
        accessibilityLabel: "Open settings",
        accessibilityRole: "button",
        onPress,
      }),
  };
});

jest.mock("@/shared/ui/toolbar-icons", () => ({
  toolbarIcon: (name: string) => name,
}));

const mockPush = jest.mocked(router.push);
const mockRefetch = jest.fn();
let homeSeason: { tag?: string } | undefined;

beforeEach(() => {
  mockPush.mockClear();
  mockRefetch.mockClear();
  homeSeason = undefined;
});

test("새 대화는 왼쪽에서 채팅을 열고 프로필은 오른쪽에 둔다", async () => {
  const user = userEvent.setup();
  await render(<HomeRoute />);

  const leftToolbar = within(screen.getByTestId("home-toolbar-left"));
  const rightToolbar = within(screen.getByTestId("home-toolbar-right"));

  await user.press(leftToolbar.getByRole("button", { name: "새 대화" }));

  expect(mockPush).toHaveBeenCalledWith("/chat");
  expect(
    rightToolbar.getByRole("button", { name: "Open settings" })
  ).toBeOnTheScreen();
});

test("홈 본문의 시작하기는 에피소드를 연다", async () => {
  const user = userEvent.setup();
  await render(<HomeRoute />);

  await user.press(screen.getByRole("button", { name: "Home content" }));

  expect(mockPush).toHaveBeenCalledWith("/episode");
});

// 어떤 화를 보여 줄지는 화면이 아니라 계정의 진행이 정한다. 경로가 그것을
// 읽어 넘기고, 읽지 못했을 때 다시 읽는 길도 경로가 쥔다.
test("시즌 진행을 읽어 홈 본문에 넘기고 다시 읽는 길을 준다", async () => {
  const user = userEvent.setup();
  await render(<HomeRoute />);

  expect(homeSeason).toMatchObject({ tag: "season" });

  await user.press(screen.getByRole("button", { name: "Home retry" }));

  expect(mockRefetch).toHaveBeenCalledTimes(1);
});
