import { beforeEach, expect, jest, test } from "@jest/globals";
import {
  act,
  render,
  screen,
  userEvent,
  waitFor,
} from "@testing-library/react-native";
import { useTheme } from "expo-router";
import Storage from "expo-sqlite/kv-store";
import { setBackgroundColorAsync } from "expo-system-ui";
import { useCallback } from "react";
import { Pressable, Text } from "react-native";
import { Uniwind } from "uniwind";

import { AppThemeBridge, useAppTheme } from "./app-theme-bridge";

jest.mock("heroui-native/hooks", () => ({
  // Answers by token name rather than by position: the bridge asks for a
  // different set as the app grows, and a fixed array silently hands back the
  // wrong colours the moment that list changes.
  useThemeColor: (tokens: string[]) =>
    tokens.map(
      (token) =>
        ({
          accent: "#0A84FF",
          background: "#0B0B0D",
          danger: "#FF453A",
          foreground: "#FFFFFF",
          surface: "#1A1A1E",
        })[token] ?? "#000000"
    ),
}));

jest.mock("uniwind", () => ({
  Uniwind: { setTheme: jest.fn() },
  useUniwind: () => ({ hasAdaptiveThemes: true, theme: "dark" }),
}));

jest.mock("expo-system-ui", () => ({
  setBackgroundColorAsync: jest.fn(async () => undefined),
}));

const mockSetBackgroundColorAsync = jest.mocked(setBackgroundColorAsync);
const mockSetTheme = jest.mocked(Uniwind.setTheme);

beforeEach(() => {
  Storage.clearSync?.();
  mockSetTheme.mockClear();
});

function ThemeProbe() {
  const { background, foreground, setThemePreference, themePreference } =
    useAppTheme();
  const navigationTheme = useTheme();
  const pickLight = useCallback(() => {
    setThemePreference("light");
  }, [setThemePreference]);

  return (
    <>
      <Text>{foreground}</Text>
      <Text>{background}</Text>
      <Text>{String(navigationTheme.colors.background)}</Text>
      <Text testID="theme-preference">{themePreference}</Text>
      <Pressable onPress={pickLight} testID="pick-light">
        <Text>라이트</Text>
      </Pressable>
    </>
  );
}

test("useAppTheme은 AppThemeBridge 밖에서 사용하면 명확히 실패한다", async () => {
  await expect(render(<ThemeProbe />)).rejects.toThrow(
    "useAppTheme must be used within AppThemeBridge"
  );
});

test("AppThemeBridge는 CSS 토큰을 navigation과 native root에 연결한다", async () => {
  await render(
    <AppThemeBridge>
      <ThemeProbe />
    </AppThemeBridge>
  );

  expect(screen.getByText("#FFFFFF")).toBeOnTheScreen();
  expect(screen.getAllByText("#0B0B0D")).toHaveLength(2);
  await waitFor(() => {
    expect(mockSetBackgroundColorAsync).toHaveBeenCalledWith("#0B0B0D");
  });
});

test("저장된 값이 없으면 시스템 설정으로 시작한다", async () => {
  await render(
    <AppThemeBridge>
      <ThemeProbe />
    </AppThemeBridge>
  );

  expect(screen.getByTestId("theme-preference")).toHaveTextContent("system");
});

test("화면 모드를 고르면 바로 적용하고 기기에 남긴다", async () => {
  const user = userEvent.setup();

  await render(
    <AppThemeBridge>
      <ThemeProbe />
    </AppThemeBridge>
  );

  await act(async () => {
    await user.press(screen.getByTestId("pick-light"));
  });

  // Applied through Uniwind rather than by resolving the mode here, so
  // 시스템 설정 keeps following the OS without the bridge watching it.
  expect(mockSetTheme).toHaveBeenCalledWith("light");
  expect(screen.getByTestId("theme-preference")).toHaveTextContent("light");
  // Written synchronously, which is what the next launch reads before its
  // first frame.
  expect(Storage.getItemSync("theme-preference")).toBe("light");
});
