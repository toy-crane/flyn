import { afterEach, expect, jest, test } from "@jest/globals";
import { act, screen } from "@testing-library/react-native";

import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeLoadingScreen } from "./episode-loading-screen";

/** 화면에 보이는 글자라면 무엇이든. */
const ANY_TEXT = /./;

afterEach(() => {
  jest.useRealTimers();
});

test("대화 읽기가 1초를 넘기면 글자 없이 진행 표시만 세우고 이름은 화면 읽기로 전한다", async () => {
  jest.useFakeTimers();
  await renderWithHeroUI(<EpisodeLoadingScreen />);
  await act(() => jest.advanceTimersByTime(999));
  expect(screen.queryByRole("progressbar")).not.toBeOnTheScreen();

  await act(() => jest.advanceTimersByTime(1));

  expect(
    screen.getByRole("progressbar", { name: "대화를 불러오고 있어요" })
  ).toHaveProp("accessibilityState", { busy: true });
  expect(screen.queryAllByText(ANY_TEXT)).toHaveLength(0);
});

// 표시가 1초 뒤에 붙으므로, 그 전에 다른 곳을 보던 화면 읽기에는 스스로 알려야 한다.
test("늦게 붙는 진행 표시는 화면 읽기에 스스로 알린다", async () => {
  jest.useFakeTimers();
  await renderWithHeroUI(<EpisodeLoadingScreen />);
  await act(() => jest.advanceTimersByTime(1000));

  expect(
    screen.getByRole("progressbar", { name: "대화를 불러오고 있어요" })
  ).toHaveProp("accessibilityLiveRegion", "polite");
});

// 표현 돌아보기의 본문은 문구 없이 기다리고 화면 읽기에만 이름을 알린다.
test("표현 목록의 1초 넘는 읽기는 이름을 화면 읽기에만 전한다", async () => {
  jest.useFakeTimers();
  await renderWithHeroUI(<EpisodeLoadingScreen label="표현을 불러오는 중" />);
  await act(() => jest.advanceTimersByTime(1000));

  expect(screen.queryAllByText(ANY_TEXT)).toHaveLength(0);
  expect(
    screen.getByRole("progressbar", { name: "표현을 불러오는 중" })
  ).toHaveProp("accessibilityState", { busy: true });
});
