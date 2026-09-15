import { streakLabels } from "./streak-labels";

const DAYS_IN_WEEK = 7;
/** `Date.getDay()`의 목요일. */
const THURSDAY = 4;

/** 기기의 현지 날짜를 `YYYY-MM-DD`로 쓴다. 데이터베이스가 돌려주는 날의 표기다. */
export function dayKey(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function addDays(date: Date, amount: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
}

/** 그 날이 속한 주의 월요일. 일요일은 앞의 월요일에 붙는다. */
function mondayOf(date: Date): Date {
  return addDays(date, -((date.getDay() + 6) % DAYS_IN_WEEK));
}

function monthNumber(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

/**
 * 달력이 넘길 수 있는 범위.
 *
 * 다음 달은 오늘이 속한 달에서 멈추고, 이전 달은 기록이 있는 가장 이른 달에서
 * 멈춘다. 기록이 없는 계정은 이번 달만 보인다.
 */
export function monthSteps(month: Date, today: Date, firstDay: string | null) {
  const earliest = firstDay
    ? Number(firstDay.slice(0, 4)) * 12 + Number(firstDay.slice(5, 7)) - 1
    : monthNumber(today);

  return {
    canShowNext: monthNumber(month) < monthNumber(today),
    canShowPrevious: monthNumber(month) > earliest,
    next: new Date(month.getFullYear(), month.getMonth() + 1, 1),
    previous: new Date(month.getFullYear(), month.getMonth() - 1, 1),
  };
}

/**
 * 달력에 채울 한 달. 월요일에 시작하는 줄에 맞춰 첫날 앞 자리를 null로 비운다.
 *
 * `month`는 그달의 아무 날이어도 된다.
 */
export function monthOf(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const length = new Date(
    month.getFullYear(),
    month.getMonth() + 1,
    0
  ).getDate();
  const blanks = (first.getDay() + 6) % DAYS_IN_WEEK;

  return {
    days: [
      ...Array.from({ length: blanks }, () => null),
      ...Array.from({ length }, (_, index) => addDays(first, index)),
    ],
    first,
    last: addDays(first, length - 1),
    title: streakLabels.monthTitle(first.getFullYear(), first.getMonth() + 1),
  };
}

/**
 * 오늘이 속한 월요일부터 일요일까지의 7일과 그 주의 이름.
 *
 * 주차는 그 주의 목요일이 속한 달로 센다. 달력 앱들이 쓰는 규칙이라, 달의
 * 첫 목요일이 든 주가 1주차다. 날짜는 기기의 현지 자정으로 만든다.
 */
export function weekOf(today: Date) {
  const monday = mondayOf(today);
  const days = Array.from({ length: DAYS_IN_WEEK }, (_, index) =>
    addDays(monday, index)
  );
  const thursday = days[THURSDAY - 1] as Date;
  const week = Math.floor((thursday.getDate() - 1) / DAYS_IN_WEEK) + 1;

  return {
    days,
    title: streakLabels.weekTitle(thursday.getMonth() + 1, week),
  };
}
