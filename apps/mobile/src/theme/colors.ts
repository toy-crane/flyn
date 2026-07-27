import { Color } from "expo-router";

/**
 * iOS 시맨틱 색. 토큰 표와 `dark:` 금지 규칙은
 * docs/decisions/ios-semantic-colors.md가 들고 있다.
 *
 * **이 모듈은 RN 화면 전용이다.** 값은 `PlatformColor` 핸들이라 RN `style`에는
 * 들어가지만 `@expo/ui`의 `Host` 안에서는 대부분 통하지 않는다 —
 * `background`·`tint`는 hex 문자열만 받는다. SwiftUI 화면은 색을 지정하지 말고
 * 네이티브 기본값에 맡길 것(기본 `Text`가 곧 `label`, 기본 배경이
 * `systemBackground`다). 글자 색이 정말 필요하면 `foregroundStyle`만이
 * `PlatformColor`와 계층 스타일(`'secondary'` 등)을 받는다.
 *
 * 벤더 문서는 토큰마다 `Platform.select`로 web 폴백을 감싸라고 하지만 이 저장소는
 * iOS 전용이라 그 분기를 만들지 않는다(docs/decisions/ios-only.md).
 */
export const colors = {
  label: Color.ios.label,
  placeholderText: Color.ios.placeholderText,
  secondaryLabel: Color.ios.secondaryLabel,
  secondarySystemBackground: Color.ios.secondarySystemBackground,
  separator: Color.ios.separator,
  systemBackground: Color.ios.systemBackground,
  systemBlue: Color.ios.systemBlue,
  systemGray5: Color.ios.systemGray5,
  systemRed: Color.ios.systemRed,
  tertiaryLabel: Color.ios.tertiaryLabel,
} as const;
