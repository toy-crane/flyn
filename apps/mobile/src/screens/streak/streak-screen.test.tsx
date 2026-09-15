import { expect, jest, test } from "@jest/globals";
import { fireEvent, screen } from "@testing-library/react-native";

import type { SpokenDays } from "@/features/streak/api/learning-record";
import { renderWithHeroUI } from "@/shared/test/render-with-heroui";
import { StreakScreen } from "./streak-screen";

const SEPTEMBER_13 = new Date(2026, 8, 13);
const SEPTEMBER = new Date(2026, 8, 1);
const AUGUST = new Date(2026, 7, 1);
const MARCH = new Date(2026, 2, 1);
/** 달력 아래 줄의 합계. `95번`처럼 숫자와 `번`이다. */
const MONTH_TOTAL = /^[\d,]+번$/;

/** 9월에 영어로 말한 날들. 합하면 95번이다. */
const SEPTEMBER_SPOKEN: SpokenDays = {
  "2026-09-01": 4,
  "2026-09-02": 8,
  "2026-09-03": 12,
  "2026-09-05": 3,
  "2026-09-07": 10,
  "2026-09-08": 6,
  "2026-09-09": 13,
  "2026-09-11": 9,
  "2026-09-12": 15,
  "2026-09-13": 15,
};

/*
  툴팁은 눈으로 보는 사람을 위한 것이다. 같은 내용을 칸의 접근성 이름이 이미
  읽으므로 화면 읽기에는 숨겨 두었고, 그래서 숨긴 요소까지 찾아서 확인한다.
*/
const VISIBLE_ONLY_TO_SIGHT = { includeHiddenElements: true };

function screenProps(
  overrides: Partial<Parameters<typeof StreakScreen>[0]> = {}
): Parameters<typeof StreakScreen>[0] {
  return {
    isLoading: false,
    isRetrying: false,
    month: SEPTEMBER,
    onRetry: jest.fn(),
    onShowMonth: jest.fn(),
    spokenDays: SEPTEMBER_SPOKEN,
    summary: { firstDay: "2026-03-04", streak: 12 },
    today: SEPTEMBER_13,
    ...overrides,
  };
}

test("위에 12일 연속, 아래에 2026년 9월 달력과 그달의 영어로 말한 횟수를 보여 준다", async () => {
  await renderWithHeroUI(<StreakScreen {...screenProps()} />);

  expect(screen.getByText("12일 연속")).toBeOnTheScreen();
  expect(screen.getByText("2026년 9월")).toBeOnTheScreen();
  expect(
    screen.getByLabelText("9월 1일, 영어로 4번 말했어요")
  ).toBeOnTheScreen();
  expect(
    screen.getByLabelText("9월 30일, 아직 오지 않은 날")
  ).toBeOnTheScreen();
  expect(screen.getByText("영어로 말한 횟수")).toBeOnTheScreen();
  expect(screen.getByText("95번")).toBeOnTheScreen();
});

test("달력에서 3을 누르면 그날 영어로 말한 횟수가 칸 아래에 뜬다", async () => {
  await renderWithHeroUI(<StreakScreen {...screenProps()} />);

  await fireEvent.press(screen.getByLabelText("9월 3일, 영어로 12번 말했어요"));

  expect(
    screen.getByText("영어로 12번 말했어요", VISIBLE_ONLY_TO_SIGHT)
  ).toBeOnTheScreen();
});

test("오늘 뒤의 14일부터 30일까지는 잠긴 칸이다", async () => {
  await renderWithHeroUI(<StreakScreen {...screenProps()} />);

  expect(
    screen.getByLabelText("9월 13일, 영어로 15번 말했어요, 오늘")
  ).toBeEnabled();
  for (let date = 14; date <= 30; date += 1) {
    expect(
      screen.getByLabelText(`9월 ${date}일, 아직 오지 않은 날`)
    ).toBeDisabled();
  }
});

test("이번 달에서는 다음 달이 잠기고, 이전 달을 누르면 8월을 보여 달라고 한다", async () => {
  const props = screenProps();
  await renderWithHeroUI(<StreakScreen {...props} />);

  expect(screen.getByRole("button", { name: "다음 달" })).toBeDisabled();
  await fireEvent.press(screen.getByRole("button", { name: "이전 달" }));

  expect(props.onShowMonth).toHaveBeenCalledWith(AUGUST);
});

test("이전 달로 넘기면 합계가 그달의 것으로 바뀌고 열린 툴팁은 닫힌다", async () => {
  const props = screenProps();
  const { rerender } = await renderWithHeroUI(<StreakScreen {...props} />);
  await fireEvent.press(screen.getByLabelText("9월 3일, 영어로 12번 말했어요"));

  await fireEvent.press(screen.getByRole("button", { name: "이전 달" }));
  await rerender(
    <StreakScreen
      {...props}
      month={AUGUST}
      spokenDays={{ "2026-08-10": 7, "2026-08-20": 20 }}
    />
  );

  expect(screen.getByText("2026년 8월")).toBeOnTheScreen();
  expect(screen.getByText("27번")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "다음 달" })).toBeEnabled();
  expect(screen.queryByTestId("day-tooltip", VISIBLE_ONLY_TO_SIGHT)).toBeNull();
});

test("기록이 3월부터 있으면 이전 달은 3월에서 잠긴다", async () => {
  await renderWithHeroUI(
    <StreakScreen {...screenProps({ month: MARCH, spokenDays: {} })} />
  );

  expect(screen.getByRole("button", { name: "이전 달" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "다음 달" })).toBeEnabled();
});

test("기록이 없는 새 계정은 이번 달만 보고 두 버튼이 모두 잠긴다", async () => {
  await renderWithHeroUI(
    <StreakScreen
      {...screenProps({
        spokenDays: {},
        summary: { firstDay: null, streak: 0 },
      })}
    />
  );

  expect(screen.getByText("0일 연속")).toBeOnTheScreen();
  expect(screen.getByText("0번")).toBeOnTheScreen();
  expect(screen.getByRole("button", { name: "이전 달" })).toBeDisabled();
  expect(screen.getByRole("button", { name: "다음 달" })).toBeDisabled();
});

test("넘긴 달의 기록을 읽는 동안에는 칸을 누를 수 없고 합계를 비운다", async () => {
  await renderWithHeroUI(
    <StreakScreen
      {...screenProps({
        isLoading: true,
        month: AUGUST,
        spokenDays: undefined,
      })}
    />
  );

  expect(screen.getByText("2026년 8월")).toBeOnTheScreen();
  expect(screen.getByLabelText("8월 10일")).toBeDisabled();
  expect(screen.queryByText(MONTH_TOTAL)).toBeNull();
});

test("연속 기록을 읽지 못하면 다시 시도할 수 있다", async () => {
  const props = screenProps({ spokenDays: undefined, summary: undefined });
  await renderWithHeroUI(<StreakScreen {...props} />);

  expect(screen.getByText("연속 기록을 불러오지 못했어요")).toBeOnTheScreen();
  await fireEvent.press(screen.getByRole("button", { name: "다시 시도하기" }));
  expect(props.onRetry).toHaveBeenCalledTimes(1);
});
