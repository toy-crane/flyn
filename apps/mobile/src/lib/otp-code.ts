export const CODE_LENGTH = 6;

const NON_DIGITS = /\D/g;

/**
 * 붙여넣기에는 "코드: 448183"처럼 숫자가 아닌 문자가 섞여 온다. maxLength가 앞에서
 * 잘라버리면 6자로 보이지만 검증은 실패하므로, 숫자만 남기고 나서 자른다.
 */
export function normalizeCode(input: string): string {
  return input.replace(NON_DIGITS, "").slice(0, CODE_LENGTH);
}

export function isCodeComplete(code: string): boolean {
  return code.length === CODE_LENGTH;
}

/**
 * 서버가 진짜 검증을 하므로 여기서는 제출 버튼을 열지 말지만 정한다.
 * 정규식으로 더 조이면 유효한 주소를 막는 쪽의 실수가 더 비싸다.
 */
export function isEmailSubmittable(email: string): boolean {
  return email.trim().includes("@");
}
