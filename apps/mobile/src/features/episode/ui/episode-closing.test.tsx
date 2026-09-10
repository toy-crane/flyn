import { afterEach, beforeEach, expect, jest, test } from "@jest/globals";
import { act, screen, userEvent } from "@testing-library/react-native";
import { impactAsync } from "expo-haptics";
import { AccessibilityInfo } from "react-native";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { EpisodeClosing } from "./episode-closing";

jest.mock("expo-haptics", () => ({
  ImpactFeedbackStyle: { Light: "light", Medium: "medium" },
  impactAsync: jest.fn(async () => undefined),
}));

beforeEach(() => {
  jest
    .spyOn(AccessibilityInfo, "isReduceMotionEnabled")
    .mockResolvedValue(false);
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.mocked(impactAsync).mockClear();
});

test("성공 결말은 고리 있는 마크와 세 색 조각을 재생하고 햅틱을 한 번 준다", async () => {
  await renderWithHeroUI(
    <EpisodeClosing
      animate
      ending={{ kind: "성공", outcome: "원하는 커피를 받았어요." }}
      onReview={jest.fn()}
    />
  );
  const mark = screen.getByTestId("episode-completion-mark", {
    includeHiddenElements: true,
  });
  expect(mark.props.source.nm).toBe("closing-mark");
  expect(mark.props.autoPlay).toBe(true);
  expect(mark.props.loop).toBe(false);
  const burst = screen.getByTestId("episode-celebration-burst", {
    includeHiddenElements: true,
  });
  expect(burst.props.source.nm).toBe("closing-burst");
  expect(burst.props.autoPlay).toBe(true);
  expect(screen.getByText("해냈어요!")).toBeOnTheScreen();
  expect(impactAsync).toHaveBeenCalledTimes(1);
});

test("마크와 조각의 색은 파일이 아니라 화면의 강조색과 채널 색을 따른다", async () => {
  await renderWithHeroUI(
    <EpisodeClosing
      animate
      ending={{ kind: "성공", outcome: "원하는 커피를 받았어요." }}
      onReview={jest.fn()}
    />
  );
  const recolored = (testID: string) =>
    (
      screen.getByTestId(testID, { includeHiddenElements: true }).props
        .colorFilters as { color: string; keypath: string }[]
    ).map((filter) => {
      expect(typeof filter.color).toBe("string");
      expect(filter.color).not.toBe("undefined");
      return filter.keypath;
    });
  expect(recolored("episode-completion-mark")).toEqual([
    "Disc",
    "Check",
    "Ring",
  ]);
  expect(recolored("episode-celebration-burst")).toEqual([
    "Accent",
    "Learn",
    "Expression",
  ]);
});

test("목표를 이루지 못한 결말은 고리 없는 마크와 절반 조각을 조용히 재생한다", async () => {
  await renderWithHeroUI(
    <EpisodeClosing
      animate
      ending={{ kind: "타협", outcome: "다른 음료로 바꿨어요." }}
      onReview={jest.fn()}
    />
  );
  expect(
    screen.getByTestId("episode-completion-mark", {
      includeHiddenElements: true,
    }).props.source.nm
  ).toBe("closing-mark-quiet");
  expect(
    screen.getByTestId("episode-celebration-burst", {
      includeHiddenElements: true,
    }).props.source.nm
  ).toBe("closing-burst-half");
  expect(screen.queryByText("해냈어요!")).toBeNull();
  expect(impactAsync).toHaveBeenCalledTimes(1);
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
    // 기록에서 다시 연 카드는 마지막 프레임에 멈춰 있고 조각도 햅틱도 없다.
    const mark = screen.getByTestId("episode-completion-mark", {
      includeHiddenElements: true,
    });
    expect(mark.props.source.nm).toBe("closing-mark-quiet");
    expect(mark.props.autoPlay).toBe(false);
    expect(mark.props.progress).toBe(1);
    expect(
      screen.queryByTestId("episode-celebration-burst", {
        includeHiddenElements: true,
      })
    ).toBeNull();
    expect(impactAsync).not.toHaveBeenCalled();
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
  const mark = screen.getByTestId("episode-completion-mark", {
    includeHiddenElements: true,
  });
  expect(mark.props.autoPlay).toBe(false);
  expect(mark.props.progress).toBe(1);
  expect(impactAsync).not.toHaveBeenCalled();
  expect(screen.getByRole("button", { name: "표현 돌아보기" })).toBeEnabled();
});
