import { renderHook } from "@testing-library/react-native";
import type { ReactNode } from "react";

let mockColorScheme: "dark" | "light" = "light";

jest.unmock("./app-theme");

jest.mock("react-native", () => {
  const actual = jest.requireActual("react-native");

  Object.defineProperty(actual, "useColorScheme", {
    configurable: true,
    value: () => mockColorScheme,
  });

  return actual;
});

import { AppThemeProvider, useColors, useTheme } from "./app-theme";

function ThemeWrapper({ children }: { children: ReactNode }) {
  return <AppThemeProvider>{children}</AppThemeProvider>;
}

describe("AppThemeProvider", () => {
  it("같은 resolved color를 두 공개 hook에 제공하고 system appearance 변경을 반영한다", async () => {
    mockColorScheme = "light";
    const { rerender, result } = await renderHook(
      () => ({ colors: useColors(), theme: useTheme() }),
      { wrapper: ThemeWrapper }
    );

    const lightColors = result.current.colors;
    expect(result.current.theme.colorScheme).toBe("light");
    expect(result.current.theme.colors).toBe(lightColors);

    mockColorScheme = "dark";
    await rerender({});

    expect(result.current.theme.colorScheme).toBe("dark");
    expect(result.current.theme.colors).toBe(result.current.colors);
    expect(result.current.colors).not.toBe(lightColors);
  });

  it("provider 밖의 theme 소비를 즉시 거부한다", async () => {
    const consoleError = jest.spyOn(console, "error").mockImplementation();

    try {
      await expect(renderHook(() => useTheme())).rejects.toThrow(
        "useTheme must be used within AppThemeProvider."
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});
