/** 입력칸이 막는 길이. 네이티브가 사람이 세는 단위(grapheme)로 센다. */
export const DISPLAY_NAME_MAX = 50;

/**
 * 앞뒤에서 잘라낼 "보이지 않는" 문자 — 제어 문자, 유니코드 공백류, zero-width.
 *
 * **DB의 `profiles_normalize`와 같은 집합이어야 한다.** 한쪽만 바뀌면 앱이
 * 막는 이름을 DB가 받거나 그 반대가 된다. 실제로 어긋나 있었다: `btrim`은
 * 인자가 하나면 ASCII 스페이스만 지우고, JS `.trim()`은 zero-width를 못 지운다.
 * 그래서 제로폭 공백 하나를 붙여넣으면 **양쪽을 다 통과해** 보이지 않는 이름이
 * 저장됐고, `display_name`이 null이 아니니 다시 묻지도 않았다.
 *
 * 잘라내는 것은 **양 끝뿐이다.** 가운데는 두는데, U+200D(ZWJ)가 이모지를 잇는
 * 문자라 걷어내면 👨‍👩‍👧가 쪼개지기 때문이다.
 */
const INVISIBLE =
  "\\u0000-\\u0020\\u007f-\\u009f\\u00a0\\u1680\\u2000-\\u200d\\u2028\\u2029\\u202f\\u205f\\u3000\\ufeff";
const INVISIBLE_EDGES = new RegExp(`^[${INVISIBLE}]+|[${INVISIBLE}]+$`, "g");

/**
 * 저장 값은 앞뒤를 잘라낸 값이다. DB 트리거가 같은 일을 하지만, 여기서도 해야
 * 제출 직전의 값과 저장될 값이 같아진다.
 */
export function normalizeDisplayName(raw: string): string {
  return raw.replace(INVISIBLE_EDGES, "");
}

/**
 * **길이는 여기서 보지 않는다.** 입력칸의 `maxLength`가 이미 사람이 세는
 * 단위(grapheme)로 막고 있어서, 여기서 다시 세면 단위가 어긋난다 — Swift는
 * grapheme, `char_length`는 코드 포인트라 NFD 한글이나 ZWJ 이모지에서 입력은
 * 되는데 버튼만 이유 없이 죽었다. 세는 곳을 하나로 줄여 그 자리를 없앤다.
 *
 * DB의 상한은 UX 규칙이 아니라 남용 방지 backstop이다.
 */
export function isDisplayNameSubmittable(raw: string): boolean {
  return normalizeDisplayName(raw).length > 0;
}
