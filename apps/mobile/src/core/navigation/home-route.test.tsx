import { beforeEach, expect, jest, test } from "@jest/globals";
import { screen, userEvent } from "@testing-library/react-native";
import { router } from "expo-router";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
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

jest.mock("@/features/auth/state/auth-session", () => ({
  useAuthSession: () => ({ session: { user: { id: "user-1" } } }),
}));

// 기기의 오늘과 기록 읽기는 시스템 경계라 고정한다. 세는 규칙은 데이터베이스
// 테스트가, 칸과 툴팁은 home-screen 테스트가 확인한다.
jest.mock("@/features/streak/state/use-device-today", () => ({
  useDeviceToday: () => ({ isFocused: true, today: new Date(2026, 8, 13) }),
}));

jest.mock("@/features/streak/query/learning-record", () => ({
  deviceTimeZone: () => "Asia/Seoul",
  useLearningRecordRefresh: () => () => undefined,
  useSpokenDays: () => ({
    data: { "2026-09-12": 6 },
    isPending: false,
    refetch: async () => undefined,
  }),
  useStreakSummary: () => ({
    data: { firstDay: "2026-09-02", streak: 12 },
    isPending: false,
    refetch: async () => undefined,
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

/*
  홈은 영어 학습 공간이다. 연속 기록 한 줄과 이번 주 카드를 두고, 이어 하기
  카드는 두지 않는다. 진행을 잇는 일은 대화 기록이 회차마다 맡는다.
*/
test("홈은 연속 기록과 이번 주 카드를 보여 주고 이어 하기 카드는 두지 않는다", async () => {
  await renderWithHeroUI(<HomeRoute />);

  expect(screen.getByText("12일 연속")).toBeOnTheScreen();
  expect(screen.getByText("9월 2주차")).toBeOnTheScreen();
  expect(screen.queryByTestId("home-continue-card")).toBeNull();
  expect(screen.queryByTestId("story-progress")).toBeNull();
});

test("이번 주 카드의 연속 기록이 연속 기록 화면을 연다", async () => {
  await renderWithHeroUI(<HomeRoute />);
  const user = userEvent.setup();

  await user.press(screen.getByRole("button", { name: "연속 기록" }));

  expect(router.push).toHaveBeenCalledWith("/streak");
});

test("헤더의 프로필 버튼이 설정을 연다", async () => {
  await renderWithHeroUI(<HomeRoute />);
  const user = userEvent.setup();

  await user.press(screen.getByLabelText("설정 열기"));

  expect(router.push).toHaveBeenCalledWith("/settings");
});
