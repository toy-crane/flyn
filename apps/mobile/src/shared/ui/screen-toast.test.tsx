import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import {
  act,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react-native";
import { useCallback } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Icon } from "./icon";
import { useScreenToast } from "./screen-toast";

/**
 * 토스트를 쓰는 화면과 같은 모양의 시험대.
 *
 * 화면은 고정된 위쪽 띠를 그리고 그 아래 자리에 토스트를 놓는다. 여기서도 같은
 * 순서로 둔다.
 */
function ToastHarness() {
  const { show, toast } = useScreenToast();
  const save = useCallback(
    () =>
      show({
        icon: <Icon filled name="bookmark" size="sm" tone="accent" />,
        text: "표현을 저장했어요",
      }),
    [show]
  );
  const unsave = useCallback(
    () =>
      show({
        icon: <Icon name="bookmark" size="sm" tone="muted" />,
        text: "저장을 취소했어요",
      }),
    [show]
  );

  return (
    <View>
      <View testID="top-strip">
        <Text>상황 줄</Text>
      </View>
      <View testID="below-strip">
        {toast}
        <Pressable onPress={save} testID="save">
          <Text>담기</Text>
        </Pressable>
        <Pressable onPress={unsave} testID="unsave">
          <Text>취소</Text>
        </Pressable>
      </View>
    </View>
  );
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.useRealTimers();
});

test("알리기 전에는 아무 문구도 서 있지 않는다", async () => {
  await render(<ToastHarness />);

  expect(screen.queryByTestId("screen-toast")).toBeNull();
});

test("알린 문구가 위쪽 띠 아래 자리에 선다", async () => {
  await render(<ToastHarness />);

  await act(() => {
    fireEvent.press(screen.getByTestId("save"));
  });

  expect(screen.getByText("표현을 저장했어요")).toBeTruthy();
  // 띠 아래 자리에 서고 띠 안에는 없다. 헤더와 상황 줄을 덮지 않는 것이 이 자리다.
  expect(
    within(screen.getByTestId("below-strip")).getByTestId("screen-toast")
  ).toBeTruthy();
  expect(
    within(screen.getByTestId("top-strip")).queryByTestId("screen-toast")
  ).toBeNull();
});

test("2.5초가 지나면 문구가 사라진다", async () => {
  await render(<ToastHarness />);

  await act(() => {
    fireEvent.press(screen.getByTestId("save"));
  });
  await act(() => {
    jest.advanceTimersByTime(2499);
  });

  expect(screen.queryByText("표현을 저장했어요")).toBeTruthy();

  await act(() => {
    jest.advanceTimersByTime(1);
  });

  expect(screen.queryByText("표현을 저장했어요")).toBeNull();
});

test("연달아 알리면 문구 하나만 서 있고 시간을 새로 센다", async () => {
  await render(<ToastHarness />);

  await act(() => {
    fireEvent.press(screen.getByTestId("save"));
  });
  await act(() => {
    jest.advanceTimersByTime(2000);
    fireEvent.press(screen.getByTestId("unsave"));
  });

  // 앞의 문구는 자리를 내주고 사라진다. 같은 줄이 둘 서지 않는다.
  expect(screen.queryByText("표현을 저장했어요")).toBeNull();
  expect(screen.getByText("저장을 취소했어요")).toBeTruthy();
  expect(screen.getAllByTestId("screen-toast")).toHaveLength(1);

  // 앞의 문구가 남긴 시간이 아니라 방금 선 문구의 시간을 센다.
  await act(() => {
    jest.advanceTimersByTime(2000);
  });

  expect(screen.getByText("저장을 취소했어요")).toBeTruthy();

  await act(() => {
    jest.advanceTimersByTime(500);
  });

  expect(screen.queryByText("저장을 취소했어요")).toBeNull();
});

test("화면 읽기가 뜬 문구를 읽는다", async () => {
  await render(<ToastHarness />);

  await act(() => {
    fireEvent.press(screen.getByTestId("save"));
  });

  // 알약은 손가락을 받지 않는다. 누를 동작이 없고, 받으면 그동안 알약이 덮은
  // 말풍선을 누르지 못한다.
  expect(screen.getByTestId("screen-toast").props.pointerEvents).toBe("none");
  expect(
    screen.getByText("표현을 저장했어요").parent?.props.accessibilityLiveRegion
  ).toBe("polite");
});

test("알약이 커지면 층도 그만큼 높아진다", async () => {
  await render(<ToastHarness />);

  await act(() => {
    fireEvent.press(screen.getByTestId("save"));
  });

  const layer = screen.getByTestId("screen-toast");
  const before = StyleSheet.flatten(layer.props.style).height;

  // 큰 접근성 글자에서 알약이 두 줄이 되는 경우다. 층이 따라 높아지지 않으면
  // 문구의 위아래가 잘린다.
  const pill = screen.getByTestId("screen-toast-pill");

  await act(() => {
    fireEvent(pill, "layout", {
      nativeEvent: { layout: { height: 96, width: 320, x: 0, y: 0 } },
    });
  });

  const after = StyleSheet.flatten(
    screen.getByTestId("screen-toast").props.style
  ).height;

  expect(after).toBeGreaterThan(before);
  expect(after).toBeGreaterThanOrEqual(96);
});
