/** 사람이 세는 단위(grapheme) 기준 상한. */
export const DISPLAY_NAME_MAX = 32;

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
const DISPLAY_NAME_CHARACTER = /^[\p{L}\p{M}\p{N} .'-]$/u;

interface Segmenter {
  segment: (input: string) => Iterable<{ segment: string }>;
}

type SegmenterConstructor = new (
  locales?: string | string[],
  options?: { granularity: "grapheme" }
) => Segmenter;

function graphemes(value: string): string[] {
  const SegmenterClass = (
    Intl as typeof Intl & { Segmenter?: SegmenterConstructor }
  ).Segmenter;

  if (SegmenterClass) {
    const segmenter = new SegmenterClass(undefined, {
      granularity: "grapheme",
    });
    return Array.from(segmenter.segment(value), ({ segment }) => segment);
  }

  // 지원 하한의 JavaScriptCore에는 Segmenter가 있지만, 테스트·도구 환경을 위한
  // 폴백은 NFC로 합칠 수 있는 결합 문자를 먼저 합친 뒤 코드 포인트로 센다.
  return Array.from(value.normalize("NFC"));
}

function isAllowedGrapheme(grapheme: string): boolean {
  return Array.from(grapheme).every((character) =>
    DISPLAY_NAME_CHARACTER.test(character)
  );
}

/**
 * 저장 값은 앞뒤를 잘라낸 값이다. DB 트리거가 같은 일을 하지만, 여기서도 해야
 * 제출 직전의 값과 저장될 값이 같아진다.
 */
export function normalizeDisplayName(raw: string): string {
  return raw.replace(INVISIBLE_EDGES, "");
}

/**
 * Provider가 준 이름은 사용자가 바로 고칠 수 있는 유효한 초깃값으로 다듬는다.
 * 직접 입력은 문자를 조용히 지우지 않지만, 자동 후보는 허용하지 않는 문자를
 * 걷어내고 상한에서 자른다.
 */
export function prepareDisplayNameCandidate(raw: string): string {
  const normalized = normalizeDisplayName(raw);
  const allowed = graphemes(normalized).filter(isAllowedGrapheme);
  return normalizeDisplayName(allowed.slice(0, DISPLAY_NAME_MAX).join(""));
}

export function isDisplayNameSubmittable(raw: string): boolean {
  const normalized = normalizeDisplayName(raw);
  const parts = graphemes(normalized);

  return (
    parts.length >= 1 &&
    parts.length <= DISPLAY_NAME_MAX &&
    parts.every(isAllowedGrapheme)
  );
}
