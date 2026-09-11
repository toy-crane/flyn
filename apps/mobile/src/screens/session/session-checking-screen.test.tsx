import { afterEach, expect, jest, test } from "@jest/globals";
import { act, screen } from "@testing-library/react-native";
import { hide as hideSplashScreen } from "expo-splash-screen";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { SessionCheckingScreen } from "./session-checking-screen";

jest.mock("expo-splash-screen", () => ({ hide: jest.fn() }));

/** 화면에 보이는 글자라면 무엇이든. */
const ANY_TEXT = /./;

test("로그인 상태를 확인하는 동안 테마 배경으로 화면을 채운다", async () => {
  await renderWithHeroUI(<SessionCheckingScreen />);

  const screenView = screen.getByTestId("session-checking");

  expect(screenView.props.accessibilityLabel).toBe("로그인 상태 확인 중");
  expect(screenView.props.className).toBe("flex-1 bg-background");
  expect(screenView.props.style).toBeUndefined();
});

afterEach(() => {
  jest.useRealTimers();
  jest.clearAllMocks();
});

test("진입 대기가 1초를 넘을 때만 글자 없이 진행 표시를 보여 준다", async () => {
  jest.useFakeTimers();
  await renderWithHeroUI(<SessionCheckingScreen />);
  await act(() => jest.advanceTimersByTime(999));
  expect(screen.queryByRole("progressbar")).toBeNull();
  expect(hideSplashScreen).not.toHaveBeenCalled();
  await act(() => jest.advanceTimersByTime(1));
  expect(
    screen.getByRole("progressbar", { name: "로그인 상태 확인 중" })
  ).toHaveProp("accessibilityState", { busy: true });
  expect(screen.queryAllByText(ANY_TEXT)).toHaveLength(0);
  expect(hideSplashScreen).toHaveBeenCalledTimes(1);
});

test("로그인에서 프로필 확인으로 넘어가도 진입 대기를 다시 세지 않는다", async () => {
  jest.useFakeTimers();
  const rendered = await renderWithHeroUI(
    <SessionCheckingScreen phase="session" />
  );
  await act(() => jest.advanceTimersByTime(700));
  await rendered.rerender(<SessionCheckingScreen phase="profile" />);
  await act(() => jest.advanceTimersByTime(300));
  expect(
    screen.getByRole("progressbar", { name: "프로필 확인 중" })
  ).toBeOnTheScreen();
});
