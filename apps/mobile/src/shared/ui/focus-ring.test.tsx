import { afterEach, expect, jest, test } from "@jest/globals";
import { act, render, screen } from "@testing-library/react-native";
import { AccessibilityInfo, StyleSheet } from "react-native";

import { FocusRing } from "./focus-ring";

/** 테두리는 꾸밈이라 화면 읽기에서 빠진다. 그래도 그려졌는지는 본다. */
const HIDDEN = { includeHiddenElements: true };

afterEach(() => {
  jest.useRealTimers();
  jest.restoreAllMocks();
});

test("짚는 것의 가장자리 안쪽에 2pt 파란 테두리로 겹쳐 그려 이웃과 배치, 손가락에 끼어들지 않는다", async () => {
  await render(<FocusRing className="rounded-2xl" onEnd={jest.fn()} />);

  const ring = screen.getByTestId("focus-ring", HIDDEN);

  expect(StyleSheet.flatten(ring.props.style)).toMatchObject({
    borderWidth: 2,
    bottom: 0,
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  });
  expect(ring.props.className).toContain("border-accent");
  expect(ring.props.pointerEvents).toBe("none");
  expect(ring.props.accessibilityElementsHidden).toBe(true);
});

test("동작 줄이기에서는 전환 없이 2초 동안 서 있다가 끝을 알린다", async () => {
  jest.useFakeTimers();
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(true);
  const onEnd = jest.fn();

  await render(<FocusRing className="rounded-2xl" onEnd={onEnd} />);
  await act(async () => {
    await Promise.resolve();
  });

  await act(() => {
    jest.advanceTimersByTime(1999);
  });
  expect(onEnd).not.toHaveBeenCalled();
  expect(
    StyleSheet.flatten(screen.getByTestId("focus-ring", HIDDEN).props.style)
      .opacity
  ).toBe(1);

  await act(() => {
    jest.advanceTimersByTime(1);
  });
  expect(onEnd).toHaveBeenCalledTimes(1);
});
