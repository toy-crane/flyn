# React Native 스타일 파운데이션

## Decisions

- RN이 직접 그리는 surface는 React Native core `StyleSheet`를 쓴다. Uniwind,
  NativeWind와 Tailwind는 장기 runtime styling 계약에 두지 않는다.
- TypeScript 스타일 파운데이션은 아래 세 범주만 공유한다.
  - 의미 기반 `ColorValue` 색 역할
  - 반복되는 간격 역할
  - 시스템 글꼴을 쓰는 의미 기반 타이포 역할
- 색은 중앙 resolver가 플랫폼별 native 값을 같은 의미 이름에 연결한다. iOS는
  Expo Router의 iOS semantic color, Android는 Material 3 dynamic color와 정적
  fallback을 쓴다. Android의 시스템 light/dark 변경에는 `useColorScheme()`을
  구독해 다시 계산한다. screen과 일반 컴포넌트는 플랫폼을 직접 판별하지 않는다.
- 초기 색 역할은 system, action, 제품 역할로 나눈다.
  - system: background, groupedBackground, surface, inputFill, text,
    secondaryText, separator, border, link, loadingIndicator
  - action: primary, onPrimary, accent, onAccent
  - 제품·상태: disabled, disabledText, placeholder, overlay, danger, success,
    userBubble, onUserBubble
  `onDanger`처럼 색 위에 실제로 foreground를 놓을 때만 필요한 pair는 사용 증거가
  생길 때 추가한다.
- root의 app theme provider가 `useColorScheme()`을 한 번 구독하고 `useColors()`와
  `useTheme()`에 resolved `ColorValue`를 제공한다. React Navigation
  `ThemeProvider`는 별도 bridge로 두어 header, tab bar와 기본 screen background를
  같은 색 원본에 연결한다. 두 provider의 역할을 합치거나 하나를 생략하지 않는다.
- React Navigation 색은 `primary → accent`, `background → background`,
  `card → background`, `text → text`, `border → separator`,
  `notification → accent`로 연결한다. navigation component의 높이, material,
  gesture와 interaction은 플랫폼 기본값을 유지한다.
- plain screen canvas는 iOS `systemBackground`, 그 위 RN card surface는
  `secondarySystemBackground`를 쓴다. Android에서는 각각 Material `background`,
  `surfaceContainerHigh`에 연결한다.
- 입력 가능한 영역은 `inputFill`을 공유한다. iOS는 `tertiarySystemFill`, Android는
  dynamic `surfaceContainerHighest`와 같은 static Material fallback을 쓴다.
  universal `FormInput`, RN chat composer와 OTP slot은 이 색 역할만 공유하고,
  renderer·native state·keyboard/scroll 경계와 shape는 각 컴포넌트가 소유한다.
- `groupedBackground`는 grouped content가 화면의 주 surface일 때만 쓴다. iOS는
  `systemGroupedBackground`, Android는 `surfaceContainer`에 연결한다.
- grouped `Form` 자체가 화면의 주 surface인 Settings는 route의 native header에도
  `groupedBackground`를 사용한다. 이 화면 한정 연결은 grouped canvas의 연속성을
  표현하며 다른 route의 공통 `background` 색은 바꾸지 않는다.
- 화면 배치와 컴포넌트 구조를 이루는 flex, alignment, position, 특정 크기는
  화면·컴포넌트 가까이의 `StyleSheet`가 소유한다. 임의의 `rowBetween` 같은 전역
  layout utility로 승격하지 않는다.
- 크기와 모서리는 처음부터 전역 scale을 만들지 않는다. 같은 제품 컴포넌트의
  반복 variant라는 증거가 생기면 해당 컴포넌트 계약부터 만든다.
- Navigation과 RN surface는 같은 의미 색 resolver를 쓴다. `@expo/ui` native
  surface는 RN 간격·타이포·layout token을 받지 않고 플랫폼 기본값을 유지한다.
  사용자가 승인한 single-line `FormInput`의 52pt capsule은 입력 affordance에
  한정된 예외이며 Form/List/sheet 전체를 다시 칠하는 근거가 아니다.
- 제품 accent가 확정되지 않은 `Host`에는 `seedColor`를 전달하지 않는다. 실제
  제품 accent가 생기기 전 action 역할은 iOS system action/link와 Android Material
  dynamic primary에 연결하고 임의의 brand hex를 넣지 않는다. 실제 제품 accent가
  생기면 같은 의미 역할을 iOS tint와 Android accent에 연결한다.
- 화면에 독립적으로 나타나는 수동형 progress는 `loadingIndicator`를 쓴다. iOS는
  system gray, Android는 Material on-surface variant에 연결한다. native subtree에는
  해당 indicator에 한정된 `Host.seedColor`로 전달하고 전역 action tint는 바꾸지
  않는다. 버튼 안의 progress는 버튼 foreground를 따른다.
- 시스템 appearance가 light/dark를 고르며 앱 안에 theme selector를 만들지
  않는다.

## Why

native semantic color는 단순한 hex 문자열이 아니라 플랫폼이 light/dark와
접근성 설정에 따라 해석하는 `ColorValue`다. CSS 변수 bridge는 이를 string으로
평탄화하고, Uniwind·Tailwind의 compiler와 Metro 설정을 스타일 계약에 추가한다.
TypeScript와 StyleSheet는 native 값을 잃지 않으면서 React Native core API 안에
남는다.

Uniwind가 나쁜 도구라서 떠나는 것은 아니다. 짧은 `className`, 빠른 layout·spacing
작성, build-time style 계산, dark mode와 pseudo-class는 분명한 장점이다. 현재 코드를
옮기는 비용과 StyleSheet의 장황함도 감수해야 한다. flyn은 그 생산성보다 native
color fidelity, 한 가지 style 소유권, core API에 가까운 디버깅 경로와 compiler·
Metro 의존 감소를 장기적으로 더 중요하게 선택한다.

색만 StyleSheet로 옮기고 layout·spacing·typography는 Uniwind에 남기는 hybrid도
장기 계약으로 쓰지 않는다. 그러면 한 component가 `style`과 `className`을 함께
사용하고 token 위치, 조건부 style, 우선순위와 디버깅 경로가 둘로 갈린다. Tailwind
compiler, Metro 연동, generated type과 CSS 진입점도 제거할 수 없다. migration
비용은 줄지만 유지보수 단순화라는 선택의 목적을 달성하지 못한다.

반대로 모든 값을 화면에 흩어 두면 간격과 텍스트 위계가 서서히 갈라진다. 색·간격·
타이포까지만 공유하면 반복되는 시각 언어는 유지하면서, 화면 구조와 native control의
플랫폼 관용을 억지로 하나로 만들지 않는다.

## Boundaries

- Apple·Google vendor surface는 브랜드 규격의 색을 유지한다.
- 앱이 직접 소유하는 제품 상태 색은 explicit 값일 수 있다. 작은 일반 텍스트에
  쓰면 실제 배경과 4.5:1 이상 대비를 검증하고 색 외의 문구·아이콘도 함께 쓴다.
- native `Form`·`List`·sheet·navigation의 background, material, label, separator,
  기본 간격, 글자 위계와 control 크기는 플랫폼이 소유한다.
- Expo Router/React Navigation chrome에는 공개 `ThemeProvider`를 통해 semantic
  color만 전달한다. header·tab bar의 metric, blur/material과 native interaction을
  직접 다시 만들지는 않는다. 화면별 연결이 필요해도 앱의 semantic `ColorValue`만
  사용하고 raw 색을 route 옵션에 넣지 않는다.
- RN과 native의 일관성은 같은 의미와 위계로 읽히는지로 판단하며 픽셀 일치를
  요구하지 않는다.
- spacing·typography의 정확한 이름과 값은 현재 반복 사용을 근거로 작게 시작한다.
  제품 redesign을 위해 새 scale을 발명하지 않는다.

## Reconsider when

StyleSheet가 실제 개발 병목이라는 측정 가능한 증거가 생기거나, 사용자가 선택하는
appearance·확정된 브랜드 체계·반복 컴포넌트 라이브러리가 제품 요구가 되면 범위를
다시 결정한다. NativeWind가 native `ColorValue`를 손실 없이 받아들이는 안정판을
내거나, Uniwind가 native `ColorValue`를 CSS 원본으로 보존하는 공식 stable API와
migration 경로를 제공해 compiler 의존 비용보다 이익이 커져도 다시 평가할 수 있다.

## Still-rejected alternatives

- Uniwind CSS 변수를 색의 원본으로 유지해 native 색을 hex로 정규화하기.
- 색은 StyleSheet, layout·spacing·typography는 Uniwind로 나누는 영구 hybrid.
- Tailwind 3용 NativeWind v4에 장기 계약을 묶거나 NativeWind v5 preview를 생산
  기반으로 채택하기.
- raw 색, 화면별 `dark:` 분기와 TypeScript semantic resolver를 병행하기.
- 모든 flex 조합·크기·모서리를 전역 token이나 utility로 만들기.
- 모든 간격과 글자 값을 화면별 magic number로 남기기.
- native grouped surface를 RN background와 맞추기 위해 다시 칠하기.

## Evidence worth preserving

- Expo Router `Color`는 iOS semantic color와 Android Material dynamic color를
  `ColorValue`로 노출한다.
- Expo UI `Host.seedColor`는 iOS subtree의 tint와 Android Material theme seed가
  되므로, 브랜드 accent가 없을 때 생략하는 것이 플랫폼 기본값에 가깝다.
- Uniwind CSS 변수 API는 string·number를 다루며 native semantic color 객체를
  theme 원본으로 보존하지 못한다.
- Uniwind는 짧은 className, build-time 계산, theme·dark mode·pseudo-class를 공식
  장점으로 제공한다. 이 결정은 그 장점을 부정하지 않고 장기 소유 비용과 비교한다.
- 2026-08-05에 공식 문서와 공개 저장소를 검색했지만 `PlatformColor`·`ColorValue`
  객체를 CSS theme 원본으로 보존한다는 공개 roadmap이나 공식 계획은 확인하지
  못했다. 이는 향후 지원하지 않는다는 단정이 아니라 현재 공개 계약만으로 결정한
  시점 기록이다.
- NativeWind v5 공식 문서는 2026-08-05 기준 production에 권하지 않는 preview로
  표시한다.

근거:

- [Expo Router Color](https://docs.expo.dev/router/reference/color/)
- [Expo UI Host](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/)
- [Uniwind runtime CSS variables](https://docs.uniwind.dev/theming/update-css-variables)
- [Uniwind official repository](https://github.com/uni-stack/uniwind)
- [NativeWind v5 installation](https://www.nativewind.dev/v5/getting-started/installation)
- [Shopify Restyle fundamentals](https://shopify.github.io/restyle/fundamentals/)
- [CWB Expo Unified Theming](https://github.com/Code-with-Beto/skills/blob/main/plugins/cwb-theming/README.md)
- [CWB theme config](https://github.com/Code-with-Beto/skills/blob/main/plugins/cwb-theming/skills/theming/assets/config.ts)
- [CWB color and navigation resolver](https://github.com/Code-with-Beto/skills/blob/main/plugins/cwb-theming/skills/theming/assets/colors.ts)
