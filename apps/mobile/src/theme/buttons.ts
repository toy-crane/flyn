/**
 * 소셜 버튼 규격. Apple 버튼은 우리가 스타일링할 수 없으므로(style의
 * backgroundColor·borderRadius는 동작하지 않고 App Store 가이드라인 위반이다)
 * **Apple이 기준이고 Google을 거기 맞춘다.**
 *
 * Apple은 수치를 문서로 주지 않고 "스타일을 바꿔도 콘텐츠가 이상적인 비율을
 * 유지한다"고만 한다. 그래서 시뮬레이터에서 실제로 렌더된
 * ASAuthorizationAppleIDButton을 3배율로 측정했다(312×48pt, iOS 26.5):
 *
 *   로고 글리프 높이 13.3pt = 높이의 27.8%
 *   라벨 캡 높이     13.3pt = 높이의 27.8%  ← 로고와 정확히 같다
 *   로고 → 라벨 간격  7.7pt = 높이의 16.0%
 *   로고+라벨 블록은 가운데 정렬(좌측 아님)
 *
 * 높이를 바꿔도 규칙이 따라오도록 절대값이 아니라 비율로 둔다.
 */

export const SOCIAL_BUTTON_HEIGHT = 52;
export const SOCIAL_BUTTON_RADIUS = 16;

/** 로고 높이와 라벨 캡 높이가 같은 지점 */
const GLYPH_RATIO = 0.278;
/** 그 캡 높이를 만드는 폰트 크기 (캡 ≈ 폰트 × 0.72) */
const FONT_RATIO = 0.386;
const GAP_RATIO = 0.16;

export const socialGlyphSize = (height = SOCIAL_BUTTON_HEIGHT) =>
  Math.round(height * GLYPH_RATIO);

export const socialFontSize = (height = SOCIAL_BUTTON_HEIGHT) =>
  Math.round(height * FONT_RATIO);

/**
 * 로고와 라벨 사이 간격. **컨테이너의 gap과 함께 쓰면 두 값이 더해져** Apple과
 * Google의 간격이 어긋난다(프로토타입에서 실제로 났던 버그: 12px vs 20px).
 * 컨테이너 gap은 0으로 두고 이 값 하나로만 간격을 만들 것.
 */
export const socialGapSize = (height = SOCIAL_BUTTON_HEIGHT) =>
  Math.round(height * GAP_RATIO);
