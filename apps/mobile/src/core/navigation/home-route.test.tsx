import { beforeEach, expect, jest, test } from "@jest/globals";
import { render, screen, userEvent } from "@testing-library/react-native";
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

jest.mock("@/screens/home/profile-avatar-button", () => {
  const React = require("react") as typeof import("react");
  const { Pressable } =
    require("react-native") as typeof import("react-native");

  return {
    ProfileAvatarButton: ({ onPress }: { onPress: () => void }) =>
      React.createElement(Pressable, {
        accessibilityLabel: "설정 열기",
        accessibilityRole: "button",
        onPress,
      }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

/*
  홈은 영어 학습이 들어올 자리로 남겨 두었다. 이어 하기 카드도, 진행을 읽는
  조회도 여기 없다. 진행을 잇는 일은 대화 기록이 회차마다 맡는다.
*/
test("홈은 본문에 아무 진행도 그리지 않는다", async () => {
  await render(<HomeRoute />);

  expect(screen.getByTestId("home-scroll")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-continue-card")).toBeNull();
  expect(screen.queryByTestId("story-progress")).toBeNull();
});

test("헤더의 프로필 버튼이 설정을 연다", async () => {
  await render(<HomeRoute />);
  const user = userEvent.setup();

  await user.press(screen.getByLabelText("설정 열기"));

  expect(router.push).toHaveBeenCalledWith("/settings");
});
