import { beforeEach, expect, jest, test } from "@jest/globals";
import { render, screen, userEvent } from "@testing-library/react-native";
import { router } from "expo-router";

import CreateStoryRoute from "../../../app/story/create";

const mockRefresh = jest.fn();

jest.mock("expo-router", () => ({
  router: { back: jest.fn(), push: jest.fn() },
}));

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: () => ({ session: { user: { id: "user-1" } } }),
}));

jest.mock("@/features/story/query/story", () => ({
  useStoryRefresh: () => mockRefresh,
}));

jest.mock("@/screens/story/create-story-screen", () => {
  const React = require("react") as typeof import("react");
  const { Pressable, View } =
    require("react-native") as typeof import("react-native");

  return {
    CreateStoryScreen: ({
      onMade,
    }: {
      onMade: (made: { episodeId: string; storyId: string }) => void;
    }) =>
      React.createElement(View, {
        children: React.createElement(Pressable, {
          accessibilityLabel: "만들기 끝",
          accessibilityRole: "button",
          onPress: () => onMade({ episodeId: "episode-1", storyId: "story-1" }),
        }),
      }),
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

/*
  1화 아래에 남는 것이 탐색뿐이어야 한다. 만들던 대화가 사이에 끼면 1화에서 뒤로
  갈 때 이미 끝난 대화로 돌아간다.
*/
test("저장이 끝나면 만들기 화면을 닫고 그 위에 1화를 연다", async () => {
  await render(<CreateStoryRoute />);
  const user = userEvent.setup();

  await user.press(screen.getByLabelText("만들기 끝"));

  expect(router.back).toHaveBeenCalled();
  expect(router.push).toHaveBeenCalledWith({
    params: { episodeId: "episode-1", storyId: "story-1" },
    pathname: "/episode",
  });
});

// 탐색으로 돌아왔을 때 방금 만든 스토리가 이미 목록에 있어야 한다.
test("목록을 먼저 무르게 만든다", async () => {
  await render(<CreateStoryRoute />);
  const user = userEvent.setup();

  await user.press(screen.getByLabelText("만들기 끝"));

  expect(mockRefresh).toHaveBeenCalled();
});
