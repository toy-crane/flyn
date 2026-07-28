# 앱 테마는 iOS 시맨틱 역할 한 벌을 RN과 @expo/ui가 공유한다

앱 테마의 원본은 별도 light/dark 팔레트나 React context가 아니라 iOS 시맨틱
색을 앱의 의미 역할에 대응시킨 한 벌이다. RN 컴포넌트와 `@expo/ui` 컴포넌트는
같은 `ColorValue`를 소비하고, `@expo/ui`의 `Host`는 같은 accent를 `seedColor`로
받는다. `colorScheme`은 지정하지 않아 시스템 appearance를 그대로 따른다.

이 기록은 [ios-semantic-colors](ios-semantic-colors.md)를 대체한다. 그 기록의
방향 — iOS 시스템 색을 쓰고 색에 `dark:`를 쓰지 않는 것 — 은 유지한다. 다만
"토큰은 RN 전용이고 SwiftUI의 `background`·`tint`는 hex만 받는다"는 SDK 57
이전 전제는 더 이상 맞지 않는다. 설치된 `@expo/ui@57.0.7`의 `Color` 타입은
React Native `ColorValue`를 받고, `foregroundStyle`·`background`·`tint`와
`Host.seedColor`가 이를 네이티브 `Color`로 변환한다.

## 경계

- native 기본 표현이 이미 의미를 아는 곳에서는 색을 지정하지 않는다. 공통
  토큰은 RN과 SwiftUI의 기본값만으로 역할이 드러나지 않을 때 쓴다.
- 앱은 사용자 선택 theme를 제공하지 않는다. 따라서 `ThemeProvider`,
  `Appearance.setColorScheme`, 별도 light/dark 표는 만들지 않는다.
- Uniwind는 계속 레이아웃·간격·타이포만 맡는다. 앱 소유 색에 Tailwind 팔레트나
  `dark:` 색 변형을 쓰지 않는다.
- Apple·Google 로그인처럼 외부 브랜드가 규격을 소유한 표면은 앱 테마의
  예외다. 벤더가 정한 색과 appearance 대응을 유지한다.
- 공통 앱 테마는 디자인 시스템이 아니다. 컴포넌트별 크기·모서리·간격과
  타이포 스케일을 전역 토큰으로 승격하지 않는다.

## 기각한 대안

Evan Bacon의 최신 공개 예제처럼 Uniwind CSS 변수와 React Navigation
`ThemeProvider`를 결합하는 방식은 web을 포함한 브랜드 팔레트와 사용자가 고르는
theme에 적합하다. flyn은 iOS 전용이고 Apple HIG를 따르며 브랜드 팔레트와 theme
선택이 없어서, 같은 기계를 넣으면 시스템이 이미 하는 일을 중복한다.

RN과 `@expo/ui`에 서로 다른 토큰을 두고 이름만 맞추는 안도 기각한다. SDK 57은
두 렌더러가 같은 `ColorValue`를 직접 받을 수 있으므로 값이 갈라질 이유가 없다.

브랜드 정체성이나 앱 안의 appearance 선택이 제품 요구가 되면 이 결정을 다시
연다. 그전에는 시스템 appearance가 유일한 theme mode다.
