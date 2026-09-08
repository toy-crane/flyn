/**
 * 회차 카드의 제목이 되는 시작 시각.
 *
 * 사용자의 날짜로 쓴다. 서버가 남긴 순간을 그 사람이 보고 있는 달력으로 옮기는
 * 것이라, 지역을 이름으로 말하지 않고 지역 Date 접근자로 읽는다. 계정 id 잠금
 * 날짜를 쓰는 자리와 같은 방식이다.
 *
 * 연도는 넣지 않는다. 카드가 하는 일은 여러 회차를 서로 구분하는 것이고, 같은
 * 스토리를 해가 바뀌도록 여러 번 진행하는 일은 아직 없다.
 */
export function formatRunStart(startedAt: string): string {
  const at = new Date(startedAt);

  if (Number.isNaN(at.getTime())) {
    return "";
  }

  const month = at.getMonth() + 1;
  const day = at.getDate();
  const hours = at.getHours();
  const meridiem = hours < 12 ? "오전" : "오후";
  const hour = hours % 12 === 0 ? 12 : hours % 12;
  const minute = at.getMinutes().toString().padStart(2, "0");

  return `${month}월 ${day}일 ${meridiem} ${hour}:${minute}`;
}
