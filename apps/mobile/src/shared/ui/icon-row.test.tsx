import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, fireEvent, screen } from "@testing-library/react-native";
import { setStringAsync } from "expo-clipboard";
import { impactAsync } from "expo-haptics";
import { StyleSheet } from "react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";

/** 그려진 아이콘과 그것을 감싼 버튼의 크기. 시안이 정한 값이다. */
const ICON_WIDTH = 16;
const BUTTON_WIDTH = 28;

import { Icon } from "./icon";
import {
  IconRow,
  IconRowButton,
  IconRowCopyButton,
  riseDelayMs,
} from "./icon-row";

jest.mock("expo-clipboard", () => ({
  setStringAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: { Light: "light" },
  impactAsync: jest.fn(() => Promise.resolve()),
}));

const mockCopy = jest.mocked(setStringAsync);
const mockHaptic = jest.mocked(impactAsync);

beforeEach(() => {
  jest.useFakeTimers();
  mockCopy.mockClear();
  mockHaptic.mockClear();
});

afterEach(() => {
  jest.useRealTimers();
});

test("복사를 누르면 아이콘이 체크로 바뀌었다가 1.5초 뒤 돌아온다", async () => {
  await renderWithHeroUI(
    <IconRow testID="row">
      <IconRowCopyButton label="표현 복사" text="I ordered a hot americano." />
    </IconRow>
  );

  expect(
    screen.getByTestId("icon-copy", { includeHiddenElements: true })
  ).toBeTruthy();
  expect(
    screen.queryByTestId("icon-check", { includeHiddenElements: true })
  ).toBeNull();

  await act(() => {
    fireEvent.press(screen.getByLabelText("표현 복사"));
  });

  expect(mockCopy).toHaveBeenCalledWith("I ordered a hot americano.");
  expect(
    screen.getByTestId("icon-check", { includeHiddenElements: true })
  ).toBeTruthy();
  expect(
    screen.queryByTestId("icon-copy", { includeHiddenElements: true })
  ).toBeNull();

  await act(() => {
    jest.advanceTimersByTime(1499);
  });

  expect(
    screen.getByTestId("icon-check", { includeHiddenElements: true })
  ).toBeTruthy();

  await act(() => {
    jest.advanceTimersByTime(1);
  });

  expect(
    screen.getByTestId("icon-copy", { includeHiddenElements: true })
  ).toBeTruthy();
  expect(
    screen.queryByTestId("icon-check", { includeHiddenElements: true })
  ).toBeNull();
});

test("누르는 순간 가벼운 햅틱이 한 번 온다", async () => {
  await renderWithHeroUI(
    <IconRow testID="row">
      <IconRowButton label="표현 저장" onPress={jest.fn()}>
        <Icon name="bookmark" size="sm" tone="muted" />
      </IconRowButton>
    </IconRow>
  );

  await act(() => {
    fireEvent.press(screen.getByLabelText("표현 저장"));
  });

  expect(mockHaptic).toHaveBeenCalledTimes(1);
});

test("누르는 동안 버튼 뒤에 배경을 그리지 않는다", async () => {
  await renderWithHeroUI(
    <IconRow testID="row">
      <IconRowButton label="표현 저장" onPress={jest.fn()}>
        <Icon name="bookmark" size="sm" tone="muted" />
      </IconRowButton>
    </IconRow>
  );

  // iOS의 하이라이트 원과 Android의 물결을 둘 다 두지 않는다. 눌렀다는 답은
  // 아이콘 자신이 한다.
  expect(screen.queryByTestId("icon-row-highlight")).toBeNull();
  expect(screen.queryByTestId("icon-row-ripple")).toBeNull();
});

test("아이콘의 그림과 그림 사이가 8pt다", async () => {
  await renderWithHeroUI(
    <IconRow testID="row">
      <IconRowCopyButton label="표현 복사" text="복사할 글" />
      <IconRowButton label="표현 저장" onPress={jest.fn()}>
        <Icon name="bookmark" size="sm" tone="muted" />
      </IconRowButton>
    </IconRow>
  );

  // 그려진 아이콘은 16pt, 버튼은 28pt이므로 버튼끼리 붙이면 그림 사이가 12pt다.
  // 좌우로 2pt씩 겹쳐 8pt로 좁힌다.
  const overlap = StyleSheet.flatten(
    screen.getByLabelText("표현 저장").props.style
  ).marginHorizontal;

  expect(overlap).toBe(-2);
  expect(BUTTON_WIDTH - ICON_WIDTH + overlap * 2).toBe(8);
});

test("누르는 범위는 가로 28pt 세로 40pt다", async () => {
  await renderWithHeroUI(
    <IconRow testID="row">
      <IconRowButton label="표현 저장" onPress={jest.fn()}>
        <Icon name="bookmark" size="sm" tone="muted" />
      </IconRowButton>
    </IconRow>
  );

  // 가로로는 넓히지 않는다. 넓히면 옆 버튼에게서 손가락을 더 빼앗는다.
  const button = screen.getByLabelText("표현 저장");

  expect(button.props.hitSlop).toEqual({ bottom: 6, top: 6 });
  expect(BUTTON_WIDTH + 6 + 6).toBe(40);
});

test("이미 서 있는 줄은 애니메이션 없이 나타난다", async () => {
  await renderWithHeroUI(
    <IconRow riseIndex={0} testID="row">
      <IconRowButton label="표현 저장" onPress={jest.fn()}>
        <Icon name="bookmark" size="sm" tone="muted" />
      </IconRowButton>
    </IconRow>
  );

  // 대화 기록을 열거나 다른 화면에서 돌아온 경우다. 처음부터 서 있어야 한다.
  expect(
    screen.getByTestId("row-content", { includeHiddenElements: true }).props
      .entering
  ).toBeUndefined();
});

test("흐르는 동안에는 줄이 보이지 않다가 끝나면 떠오른다", async () => {
  const view = await renderWithHeroUI(
    <IconRow isVisible={false} riseIndex={2} testID="row">
      <IconRowButton label="표현 저장" onPress={jest.fn()}>
        <Icon name="bookmark" size="sm" tone="muted" />
      </IconRowButton>
    </IconRow>
  );

  // 자리는 지키되 아무것도 그리지 않는다. 말풍선이 밀리지 않는 이유다.
  expect(
    StyleSheet.flatten(
      screen.getByTestId("row", { includeHiddenElements: true }).props.style
    ).opacity
  ).toBe(0);
  expect(
    screen.getByTestId("row-content", { includeHiddenElements: true }).props
      .entering
  ).toBeUndefined();

  await act(() => {
    view.rerender(
      <IconRow isVisible riseIndex={2} testID="row">
        <IconRowButton label="표현 저장" onPress={jest.fn()}>
          <Icon name="bookmark" size="sm" tone="muted" />
        </IconRowButton>
      </IconRow>
    );
  });

  expect(
    StyleSheet.flatten(
      screen.getByTestId("row", { includeHiddenElements: true }).props.style
    ).opacity
  ).toBe(1);

  expect(
    screen.getByTestId("row-content", { includeHiddenElements: true }).props
      .entering
  ).toBeDefined();
});

test("대사마다 40ms씩 늦게 떠오른다", () => {
  // 첫 대사는 곧바로, 그다음부터 한 대사에 40ms씩 밀린다.
  expect(riseDelayMs(0)).toBe(0);
  expect(riseDelayMs(1)).toBe(40);
  expect(riseDelayMs(2)).toBe(80);
});
