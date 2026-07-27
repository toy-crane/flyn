export const DISPLAY_NAME_MAX = 50;

/**
 * 저장 값은 앞뒤 공백을 제거한 값이다. DB의 profiles_normalize 트리거가 같은 일을
 * 하지만, 여기서도 해야 제출 직전의 값과 저장될 값이 같아진다.
 */
export function normalizeDisplayName(raw: string): string {
  return raw.trim();
}

/**
 * DB의 check는 `char_length`, 즉 **문자 수**를 센다. JS의 `.length`는 UTF-16
 * 코드 유닛이라 이모지 하나를 2로 세고, 그러면 DB가 받아들이는 이름을 앱이 먼저
 * 막는다. 코드 포인트로 세면 두 경계가 정확히 겹친다.
 */
export function displayNameLength(raw: string): number {
  return Array.from(normalizeDisplayName(raw)).length;
}

/**
 * 진짜 경계는 DB의 profiles_display_name_length다. 여기서는 제출 버튼을 열지
 * 말지만 정한다 — 같은 규칙을 온보딩과 설정의 편집이 함께 쓴다.
 */
export function isDisplayNameSubmittable(raw: string): boolean {
  const length = displayNameLength(raw);

  return length >= 1 && length <= DISPLAY_NAME_MAX;
}
