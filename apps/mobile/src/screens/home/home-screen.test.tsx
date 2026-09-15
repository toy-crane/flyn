import { expect, jest, test } from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";

import type {
  SpokenDays,
  StreakSummary,
} from "@/features/streak/api/learning-record";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { HomeScreen } from "./home-screen";

const SEPTEMBER_13 = new Date(2026, 8, 13);

async function renderHome(
  overrides: Partial<Parameters<typeof HomeScreen>[0]> = {}
) {
  const onOpenStreak = jest.fn();
  const summary: StreakSummary = { firstDay: "2026-09-02", streak: 12 };
  const spokenDays: SpokenDays = { "2026-09-08": 2, "2026-09-12": 6 };
  const rendered = await renderWithHeroUI(
    <HomeScreen
      isLoading={false}
      isRetrying={false}
      onOpenStreak={onOpenStreak}
      onRetry={jest.fn()}
      spokenDays={spokenDays}
      summary={summary}
      today={SEPTEMBER_13}
      {...overrides}
    />
  );
  return { onOpenStreak, rendered };
}

test("9월 13일의 홈은 연속 기록과 7일부터 13일까지의 9월 2주차를 보여 준다", async () => {
  await renderHome();

  expect(screen.getByText("12일 연속")).toBeOnTheScreen();
  expect(screen.getByText("9월 2주차")).toBeOnTheScreen();
  for (const date of [7, 8, 9, 10, 11]) {
    expect(
      screen.getByLabelText(new RegExp(`^9월 ${date}일, `))
    ).toBeOnTheScreen();
  }
  expect(
    screen.getByLabelText("9월 12일, 영어로 6번 말했어요")
  ).toBeOnTheScreen();
  expect(screen.getByLabelText("9월 13일, 기록 없음, 오늘")).toBeOnTheScreen();
});

/*
  툴팁은 눈으로 보는 사람을 위한 것이다. 같은 내용을 칸의 접근성 이름이 이미
  읽으므로 화면 읽기에는 숨겨 두었고, 그래서 숨긴 요소까지 찾아서 확인한다.
*/
const VISIBLE_ONLY_TO_SIGHT = { includeHiddenElements: true };

test("날짜 칸을 누르면 그날 영어로 말한 횟수가 뜨고, 다시 누르면 닫힌다", async () => {
  await renderHome();
  const twelfth = () => screen.getByLabelText("9월 12일, 영어로 6번 말했어요");

  await fireEvent.press(twelfth());
  expect(
    screen.getByText("영어로 6번 말했어요", VISIBLE_ONLY_TO_SIGHT)
  ).toBeOnTheScreen();
  expect(twelfth()).toBeSelected();

  await fireEvent.press(twelfth());
  expect(
    screen.queryByText("영어로 6번 말했어요", VISIBLE_ONLY_TO_SIGHT)
  ).toBeNull();
  expect(twelfth()).not.toBeSelected();
});

test("영어로 말하지 않은 날을 누르면 기록 없음이 뜬다", async () => {
  await renderHome();

  await fireEvent.press(screen.getByLabelText("9월 10일, 기록 없음"));

  expect(
    screen.getByText("기록 없음", VISIBLE_ONLY_TO_SIGHT)
  ).toBeOnTheScreen();
});

test("아직 오지 않은 날은 테두리만 있는 잠긴 칸이라 눌러도 툴팁이 뜨지 않는다", async () => {
  await renderHome({ spokenDays: {}, today: new Date(2026, 8, 14) });

  expect(screen.getByLabelText("9월 14일, 기록 없음, 오늘")).toBeEnabled();
  for (const date of [15, 16, 17, 18, 19, 20]) {
    const future = screen.getByLabelText(`9월 ${date}일, 아직 오지 않은 날`);
    expect(future).toBeDisabled();
    // biome-ignore lint/performance/noAwaitInLoops: 칸마다 차례로 눌러 본다.
    await fireEvent.press(future);
  }

  expect(screen.queryByTestId("day-tooltip", VISIBLE_ONLY_TO_SIGHT)).toBeNull();
});

test("다른 칸을 누르면 툴팁이 그 칸으로 옮겨 가 한 번에 하나만 뜬다", async () => {
  await renderHome();

  await fireEvent.press(screen.getByLabelText("9월 12일, 영어로 6번 말했어요"));
  await fireEvent.press(screen.getByLabelText("9월 8일, 영어로 2번 말했어요"));

  expect(
    screen.getAllByTestId("day-tooltip", VISIBLE_ONLY_TO_SIGHT)
  ).toHaveLength(1);
  expect(
    screen.getByText("영어로 2번 말했어요", VISIBLE_ONLY_TO_SIGHT)
  ).toBeOnTheScreen();
  expect(
    screen.getByLabelText("9월 12일, 영어로 6번 말했어요")
  ).not.toBeSelected();
});

test("칸이 아닌 곳을 누르면 툴팁이 닫힌다", async () => {
  await renderHome();
  await fireEvent.press(screen.getByLabelText("9월 12일, 영어로 6번 말했어요"));

  const home = screen.getByTestId("home-scroll");
  await fireEvent(home, "touchStart");
  await fireEvent(home, "touchEnd");

  expect(screen.queryByTestId("day-tooltip", VISIBLE_ONLY_TO_SIGHT)).toBeNull();
});

test("홈을 떠나면 열려 있던 툴팁이 닫힌다", async () => {
  const { rendered } = await renderHome();
  await fireEvent.press(screen.getByLabelText("9월 12일, 영어로 6번 말했어요"));

  await rendered.rerender(
    <HomeScreen
      isFocused={false}
      isLoading={false}
      isRetrying={false}
      onOpenStreak={jest.fn()}
      onRetry={jest.fn()}
      spokenDays={{ "2026-09-12": 6 }}
      summary={{ firstDay: "2026-09-02", streak: 12 }}
      today={SEPTEMBER_13}
    />
  );

  expect(screen.queryByTestId("day-tooltip", VISIBLE_ONLY_TO_SIGHT)).toBeNull();
});

test("제목 오른쪽의 연속 기록이 연속 기록 화면을 연다", async () => {
  const { onOpenStreak } = await renderHome();

  await fireEvent.press(screen.getByRole("button", { name: "연속 기록" }));

  expect(onOpenStreak).toHaveBeenCalledTimes(1);
});

test("기록이 없는 계정은 0일 연속과 빈 칸의 이번 주를 본다", async () => {
  await renderHome({
    spokenDays: {},
    summary: { firstDay: null, streak: 0 },
  });

  expect(screen.getByText("0일 연속")).toBeOnTheScreen();
  expect(screen.getByLabelText("9월 7일, 기록 없음")).toBeOnTheScreen();
});

test("기록을 읽는 동안에는 0일 연속으로 보이지 않는다", async () => {
  await renderHome({
    isLoading: true,
    spokenDays: undefined,
    summary: undefined,
  });

  expect(screen.queryByTestId("streak-line")).toBeNull();
  expect(screen.queryByTestId("week-card")).toBeNull();
});

test("기록을 읽지 못하면 다시 시도할 수 있다", async () => {
  const onRetry = jest.fn();
  await renderHome({
    isLoading: false,
    onRetry,
    spokenDays: undefined,
    summary: undefined,
  });

  expect(screen.getByText("연속 기록을 불러오지 못했어요")).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole("button", { name: "다시 시도하기" }));
  expect(onRetry).toHaveBeenCalledTimes(1);
});

test("오늘 칸을 고르면 오늘 표시는 그대로 두고 선택 테두리를 더한다", async () => {
  await renderHome();

  await fireEvent.press(screen.getByLabelText("9월 13일, 기록 없음, 오늘"));

  expect(
    screen.getByTestId("day-today-2026-09-13", VISIBLE_ONLY_TO_SIGHT)
  ).toBeOnTheScreen();
  expect(
    screen.getByTestId("day-selected-2026-09-13", VISIBLE_ONLY_TO_SIGHT)
  ).toBeOnTheScreen();
});
