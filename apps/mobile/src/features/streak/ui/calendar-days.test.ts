import { describe, expect, test } from "@jest/globals";

import { monthOf, weekOf } from "./calendar-days";
import { spokenLevel } from "./day-grid";

describe("영어로 말한 횟수의 색 단계", () => {
  test("0번은 빈 칸이고 1–3, 4–7, 8–12, 13번 이상이 차례로 진해진다", () => {
    expect(
      [0, 1, 3, 4, 7, 8, 12, 13, 40].map((count) => spokenLevel(count))
    ).toEqual([0, 1, 1, 2, 2, 3, 3, 4, 4]);
  });
});

function day(year: number, month: number, date: number) {
  return new Date(year, month - 1, date);
}

describe("연속 기록 달력의 달", () => {
  test("2026년 9월은 화요일에 시작해 월요일 자리를 비우고 30일까지 채운다", () => {
    const month = monthOf(day(2026, 9, 1));

    expect(month.title).toBe("2026년 9월");
    expect(month.days[0]).toBeNull();
    expect(month.days[1]).toEqual(day(2026, 9, 1));
    expect(month.days.at(-1)).toEqual(day(2026, 9, 30));
    expect(month.days).toHaveLength(31);
  });

  test("월요일에 시작하는 달은 빈자리가 없다", () => {
    expect(monthOf(day(2026, 6, 1)).days[0]).toEqual(day(2026, 6, 1));
  });

  test("일요일에 시작하는 달은 월요일부터 토요일까지 비운다", () => {
    const march = monthOf(day(2026, 3, 1));

    expect(march.days.slice(0, 6)).toEqual([
      null,
      null,
      null,
      null,
      null,
      null,
    ]);
    expect(march.days[6]).toEqual(day(2026, 3, 1));
  });
});

describe("이번 주 카드의 주", () => {
  test("9월 13일 일요일은 7일 월요일부터 시작하는 9월 2주차다", () => {
    const week = weekOf(day(2026, 9, 13));

    expect(week.title).toBe("9월 2주차");
    expect(week.days.map((date) => date.getDate())).toEqual([
      7, 8, 9, 10, 11, 12, 13,
    ]);
  });

  test("8월 31일 월요일부터 9월 6일까지는 목요일이 속한 9월의 1주차다", () => {
    const week = weekOf(day(2026, 9, 2));

    expect(week.title).toBe("9월 1주차");
    expect(week.days[0]).toEqual(day(2026, 8, 31));
    expect(week.days[6]).toEqual(day(2026, 9, 6));
  });

  test("목요일이 다음 달이면 월요일이 이번 달이어도 다음 달의 1주차다", () => {
    expect(weekOf(day(2026, 9, 28)).title).toBe("10월 1주차");
  });

  test("해를 넘는 주는 목요일이 속한 12월의 마지막 주차다", () => {
    expect(weekOf(day(2027, 1, 2)).title).toBe("12월 5주차");
  });
});
