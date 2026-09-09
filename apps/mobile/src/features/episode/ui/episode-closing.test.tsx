import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, screen, userEvent } from "@testing-library/react-native";
import { AccessibilityInfo } from "react-native";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeClosing } from "./episode-closing";

beforeEach(() => {
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
});
afterEach(() => {
  jest.restoreAllMocks();
});

test("목표 달성을 축하하고 사용자가 표현 돌아보기를 누를 때 이동한다", async () => {
  const onReview = jest.fn();
  const user = userEvent.setup();
  await renderWithHeroUI(
    <EpisodeClosing
      animate
      ending={{ kind: "성공", outcome: "원하는 커피를 받았어요." }}
      onReview={onReview}
    />
  );
  expect(screen.getByText("해냈어요!")).toBeOnTheScreen();
  expect(screen.getByText("원하는 커피를 받았어요")).toBeOnTheScreen();
  expect(onReview).not.toHaveBeenCalled();
  await user.press(screen.getByRole("button", { name: "표현 돌아보기" }));
  expect(onReview).toHaveBeenCalledTimes(1);
});

test.each(["타협", "실패"] as const)(
  "%s 결말도 완료 표시와 실제 결과를 보여 준다",
  async (kind) => {
    await renderWithHeroUI(
      <EpisodeClosing
        animate={false}
        ending={{ kind, outcome: "다른 음료로 바꿨어요." }}
        onReview={jest.fn()}
      />
    );
    expect(screen.getByText("다른 음료로 바꿨어요")).toBeOnTheScreen();
    expect(screen.queryByText("해냈어요!")).toBeNull();
    expect(screen.queryByText("끝")).toBeNull();
    expect(screen.getByRole("button", { name: "표현 돌아보기" })).toBeEnabled();
    expect(screen.getByTestId("episode-completion-mark")).toBeOnTheScreen();
    expect(screen.queryByTestId("episode-celebration-burst")).toBeNull();
  }
);

test("동작 줄이기로 멈춘 축하 연출은 설정을 다시 꺼도 재생하지 않는다", async () => {
  let changeMotion: ((enabled: boolean) => void) | undefined;
  // 이 테스트가 사용하는 OS 이벤트의 overload만 지정한다.
  const motionEvents: {
    addEventListener: (
      event: "reduceMotionChanged",
      listener: (enabled: boolean) => void
    ) => { remove: () => void };
  } = AccessibilityInfo;
  jest
    .spyOn(motionEvents, "addEventListener")
    .mockImplementation((_event, listener) => {
      changeMotion = listener;
      return { remove: jest.fn() };
    });
  await renderWithHeroUI(
    <EpisodeClosing
      animate
      ending={{ kind: "성공", outcome: "원하는 커피를 받았어요." }}
      onReview={jest.fn()}
    />
  );
  expect(
    screen.getByTestId("episode-celebration-burst", {
      includeHiddenElements: true,
    })
  ).toBeOnTheScreen();
  await act(() => changeMotion?.(true));
  expect(
    screen.queryByTestId("episode-celebration-burst", {
      includeHiddenElements: true,
    })
  ).toBeNull();
  await act(() => changeMotion?.(false));
  expect(
    screen.queryByTestId("episode-celebration-burst", {
      includeHiddenElements: true,
    })
  ).toBeNull();
  expect(screen.getByRole("button", { name: "표현 돌아보기" })).toBeEnabled();
});

test("앱 실행 뒤 동작 줄이기를 켰어도 종료 카드는 현재 설정을 따라 정지해 있다", async () => {
  jest.mocked(AccessibilityInfo.isReduceMotionEnabled).mockResolvedValue(true);
  await renderWithHeroUI(
    <EpisodeClosing
      animate
      ending={{ kind: "성공", outcome: "원하는 커피를 받았어요." }}
      onReview={jest.fn()}
    />
  );
  expect(
    screen.queryByTestId("episode-celebration-burst", {
      includeHiddenElements: true,
    })
  ).toBeNull();
  expect(screen.getByTestId("episode-completion-mark")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "표현 돌아보기" })).toBeEnabled();
});
