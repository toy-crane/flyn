/** 세 자리마다 쉼표를 넣을 자리. */
const THOUSANDS = /\B(?=(\d{3})+(?!\d))/g;

/** 연속 기록과 이번 주 카드가 쓰는 문구. */
export const streakLabels = {
  dayLabel: (date: Date) => `${date.getMonth() + 1}월 ${date.getDate()}일`,
  days: (count: number) => `${count}일 연속`,
  future: "아직 오지 않은 날",
  monthTitle: (year: number, month: number) => `${year}년 ${month}월`,
  /** 달력 아래 줄의 이름과 그달의 합계. */
  monthTotal: "영어로 말한 횟수",
  monthTotalValue: (count: number) =>
    `${String(count).replace(THOUSANDS, ",")}번`,
  nextMonth: "다음 달",
  previousMonth: "이전 달",
  spoken: (count: number) =>
    count === 0 ? "기록 없음" : `영어로 ${count}번 말했어요`,
  /** 홈의 이번 주 카드에서 연속 기록 화면을 여는 링크이자 그 화면의 제목. */
  streak: "연속 기록",
  today: "오늘",
  unavailable: "연속 기록을 불러오지 못했어요",
  weekdays: ["월", "화", "수", "목", "금", "토", "일"],
  weekTitle: (month: number, week: number) => `${month}월 ${week}주차`,
};
