import { afterEach, expect, jest, test } from "@jest/globals";
import { screen } from "@testing-library/react-native";
import { Platform } from "react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { LoadingSpinner } from "./loading-spinner";

// The stand-in palette from src/shared/test/theme.ts, not the product colours.
const ACCENT = "#4285f4";
const ACCENT_FOREGROUND = "#ffffff";
const MUTED = "#6b7280";

afterEach(() => {
  jest.restoreAllMocks();
});

function indicator() {
  return screen.getByTestId("loading", { includeHiddenElements: true });
}

test("iOS는 시스템 진행 표시를 따라 회색으로 돈다", async () => {
  jest.replaceProperty(Platform, "OS", "ios");

  await renderWithHeroUI(<LoadingSpinner testID="loading" />);

  expect(indicator().props.color).toBe(MUTED);
});

// Material 앱의 진행 표시는 앱 색으로 돈다. 색을 넘기지 않을 때 나오는 AppCompat
// 기본 teal은 앱이 색을 주지 못한 결과이지 Android의 관례가 아니다.
test("Android는 Material 관례를 따라 앱 강조색으로 돈다", async () => {
  jest.replaceProperty(Platform, "OS", "android");

  await renderWithHeroUI(<LoadingSpinner testID="loading" />);

  expect(indicator().props.color).toBe(ACCENT);
});

test.each(["android", "ios"] as const)(
  "%s의 배경이 있는 컨트롤 안에서는 넘겨받은 대비색을 쓴다",
  async (os) => {
    jest.replaceProperty(Platform, "OS", os);

    await renderWithHeroUI(
      <LoadingSpinner color="accent-foreground" testID="loading" />
    );

    expect(indicator().props.color).toBe(ACCENT_FOREGROUND);
  }
);

// 이름은 언제나 감싸는 요소가 지닌다. 진행 표시가 스스로 읽히면 같은 자리가
// 이름 없는 요소로 한 번 더 읽힌다.
test("화면 읽기에서는 스스로 드러나지 않는다", async () => {
  await renderWithHeroUI(<LoadingSpinner testID="loading" />);

  const spinner = indicator();

  expect(spinner.props.accessible).toBe(false);
  expect(spinner.props.accessibilityElementsHidden).toBe(true);
  expect(spinner.props.importantForAccessibility).toBe("no-hide-descendants");
  expect(screen.queryByRole("progressbar")).not.toBeOnTheScreen();
});

test("크기는 한 줄에 서는 small 하나로 고정한다", async () => {
  await renderWithHeroUI(<LoadingSpinner testID="loading" />);

  expect(indicator().props.size).toBe("small");
});
