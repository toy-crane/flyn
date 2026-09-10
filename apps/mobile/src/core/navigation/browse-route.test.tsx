import { beforeEach, expect, jest, test } from "@jest/globals";
import { render, screen, userEvent } from "@testing-library/react-native";
import { router } from "expo-router";

import BrowseRoute from "../../../app/(tabs)/(browse)/browse";

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
        testID: `browse-toolbar-${placement ?? "unknown"}`,
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

jest.mock("@/screens/browse/browse-screen", () => {
  const React = require("react") as typeof import("react");
  const { Pressable, View } =
    require("react-native") as typeof import("react-native");

  return {
    BrowseScreen: ({ onCreateStory }: { onCreateStory: () => void }) =>
      React.createElement(View, {
        children: React.createElement(Pressable, {
          accessibilityLabel: "빈 상태의 스토리 만들기",
          accessibilityRole: "button",
          onPress: onCreateStory,
        }),
        testID: "browse-screen",
      }),
  };
});

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: () => ({ session: null }),
}));

jest.mock("@/features/story/query/story", () => ({
  useStories: () => ({ data: undefined, isPending: false, refetch: jest.fn() }),
}));

jest.mock("@/shared/query/use-visible-retry", () => ({
  useVisibleRetry: () => ({ isRetrying: false, retry: jest.fn() }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

/*
  버튼은 아이콘만 그린다. 무엇을 하는 자리인지는 화면 읽기 기능이 이 이름으로
  읽어 준다.
*/
test("헤더의 + 버튼이 스토리 만들기를 연다", async () => {
  await render(<BrowseRoute />);
  const user = userEvent.setup();

  await user.press(screen.getByLabelText("스토리 만들기"));

  expect(router.push).toHaveBeenCalledWith("/story/create");
});

// 빈 상태의 버튼과 헤더의 버튼이 같은 화면을 연다.
test("빈 상태의 버튼도 같은 화면을 연다", async () => {
  await render(<BrowseRoute />);
  const user = userEvent.setup();

  await user.press(screen.getByLabelText("빈 상태의 스토리 만들기"));

  expect(router.push).toHaveBeenCalledWith("/story/create");
});
