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

jest.mock("@/shared/ui/toolbar-icons", () => ({
  toolbarIcon: (name: string) => name,
}));

jest.mock("@/screens/episode/episode-screen", () => {
  const React = require("react") as typeof import("react");
  const { Pressable } =
    require("react-native") as typeof import("react-native");

  return {
    EpisodeScreen: ({
      onLeave,
      onRestart,
    }: {
      onLeave: () => void;
      onRestart: () => void;
    }) =>
      React.createElement(
        React.Fragment,
        null,
        React.createElement(Pressable, {
          accessibilityLabel: "leave",
          accessibilityRole: "button",
          onPress: onLeave,
        }),
        React.createElement(Pressable, {
          accessibilityLabel: "restart",
          accessibilityRole: "button",
          onPress: onRestart,
        })
      ),
  };
});

const mockBack = jest.mocked(router.back);
const mockReplace = jest.mocked(router.replace);

beforeEach(() => {
  mockBack.mockClear();
  mockReplace.mockClear();
});

test("에피소드의 이름을 헤더에 걸고 뒤로 가기로 나간다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  expect(screen.getByLabelText("header 카페에서 생긴 일")).toBeOnTheScreen();

  await user.press(screen.getByRole("button", { name: "뒤로 가기" }));

  expect(mockBack).toHaveBeenCalledTimes(1);
});

// 자리에서 상태만 되돌리면 지난 에피소드의 목록 위치가 남는다. 경로를 갈아
// 끼워야 홈에서 처음 열 때와 같은 길을 지난다.
test("다시 시작하면 같은 경로를 새로 연다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  await user.press(screen.getByRole("button", { name: "restart" }));

  expect(mockReplace).toHaveBeenCalledWith("/episode");
});

test("마무리에서 홈으로 가기는 왔던 자리로 돌아간다", async () => {
  const user = userEvent.setup();
  await render(<EpisodeRoute />);

  await user.press(screen.getByRole("button", { name: "leave" }));

  expect(mockBack).toHaveBeenCalledTimes(1);
});
