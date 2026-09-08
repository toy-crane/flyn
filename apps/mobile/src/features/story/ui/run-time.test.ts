import { expect, test } from "@jest/globals";

import { formatRunStart } from "./run-time";

function localInstant(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number
): string {
  return new Date(year, month - 1, day, hour, minute).toISOString();
}

test("오후 시각을 12시간제 한국어로 쓴다", () => {
  expect(formatRunStart(localInstant(2026, 9, 8, 15, 42))).toBe(
    "9월 8일 오후 3:42"
  );
});

test("오전 시각과 한 자리 분을 두 자리로 쓴다", () => {
  expect(formatRunStart(localInstant(2026, 9, 8, 9, 5))).toBe(
    "9월 8일 오전 9:05"
  );
});

test("자정과 정오는 12로 쓴다", () => {
  expect(formatRunStart(localInstant(2026, 1, 1, 0, 0))).toBe(
    "1월 1일 오전 12:00"
  );
  expect(formatRunStart(localInstant(2026, 1, 1, 12, 0))).toBe(
    "1월 1일 오후 12:00"
  );
});

// 읽지 못한 값이 "NaN월 NaN일"로 화면에 나가지 않게 한다.
test("읽을 수 없는 시각은 빈 문자열이다", () => {
  expect(formatRunStart("not-a-date")).toBe("");
});
