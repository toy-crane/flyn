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

// 표현 돌아보기는 스토리와 화 제목을 위에 둔 채 그 아래 칸만 기다린다. 화면의
// 나머지가 살아 있으므로 무엇을 기다리는지 그 자리가 스스로 말한다.
test("한 칸만 기다리는 자리는 문구를 함께 보인다", async () => {
  jest.useFakeTimers();
  await renderWithHeroUI(
    <EpisodeLoadingScreen label="표현을 불러오고 있어요" />
  );
  await act(() => jest.advanceTimersByTime(1000));

  expect(screen.getByText("표현을 불러오고 있어요")).toBeOnTheScreen();
  expect(
    screen.getByRole("progressbar", { name: "표현을 불러오고 있어요" })
  ).toBeOnTheScreen();
});
