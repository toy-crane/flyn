import { renderHook } from "@testing-library/react-native";

const CSS_VALUES: Record<string, string> = {
  "--app-background": "#010101",
  "--app-border": "#020202",
  "--app-danger": "#030303",
  "--app-disabled": "#040404",
  "--app-disabled-foreground": "#050505",
  "--app-foreground": "#060606",
  "--app-muted-foreground": "#070707",
  "--app-overlay": "rgba(0, 0, 0, 0.5)",
  "--app-placeholder": "#080808",
  "--app-primary": "#090909",
  "--app-primary-foreground": "#101010",
  "--app-success": "#111111",
  "--app-surface": "#121212",
};

jest.mock("uniwind", () => ({
  useCSSVariable: (names: string[]) => names.map((name) => CSS_VALUES[name]),
}));

import { useAppTheme } from "./app-theme";

describe("useAppTheme", () => {
  it("CSS 변수를 renderer가 쓰는 시맨틱 역할로 전달한다", async () => {
    const { result } = await renderHook(() => useAppTheme());

    expect(result.current).toEqual({
      background: "#010101",
      border: "#020202",
      danger: "#030303",
      disabled: "#040404",
      disabledForeground: "#050505",
      foreground: "#060606",
      mutedForeground: "#070707",
      overlay: "rgba(0, 0, 0, 0.5)",
      placeholder: "#080808",
      primary: "#090909",
      primaryForeground: "#101010",
      success: "#111111",
      surface: "#121212",
    });
  });
});
