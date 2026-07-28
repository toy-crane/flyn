# RN과 @expo/ui가 공유하는 iOS 시맨틱 앱 테마

## 목적

앱의 RN 화면과 `@expo/ui` 화면이 서로 다른 스타일 체계처럼 보이지 않게 한다.
한쪽을 다른 쪽처럼 흉내 내는 커스텀 디자인 시스템을 만들지 않고, 두 렌더러가
같은 iOS 시맨틱 역할과 시스템 appearance를 소비하게 한다.

이 스펙은 다음 확정 결정 위에 선다.

- [iOS 전용](../../decisions/ios-only.md)
- [Apple HIG를 따르고 커스텀 디자인 시스템을 만들지 않음](../../decisions/apple-hig-not-a-design-system.md)
- [새 화면은 @expo/ui가 기본](../../decisions/expo-ui-by-default.md)
- [Uniwind는 Host 밖의 레이아웃·간격·타이포만 담당](../../decisions/uniwind-for-styling.md)
- [공유 iOS 시맨틱 앱 테마](../../decisions/shared-ios-semantic-theme.md)

## 조사에서 확인한 것

### Expo SDK 57

- Expo Router `Color.ios.*`는 `PlatformColor`의 타입 안전 래퍼다. iOS의
  light/dark와 접근성 설정에 기기에서 반응한다.
- `@expo/ui@57.0.7`의 modifier `Color` 타입은 React Native `ColorValue`를
  받는다. 따라서 `Color.ios.*` 값 하나를 RN style뿐 아니라 SwiftUI
  `foregroundStyle`·`background`·`tint`에도 그대로 줄 수 있다.
- universal `Host`의 `seedColor`는 iOS에서 SwiftUI 환경의 tint가 되어 버튼,
  스위치, 슬라이더 같은 interactive control로 전파된다.
- `Host.colorScheme`을 생략하면 기기 설정을 따른다. 앱 전체를 감싸는
  `@expo/ui` provider는 없고, `Host`가 RN과 native UI toolkit의 경계다.

### 최근 공개 앱의 패턴

- Evan Bacon의 `chat-template`(2026-06-19 snapshot)은 Uniwind CSS 변수로
  브랜드 light/dark 색을 만들고, `useColorScheme`으로 React Navigation theme를
  고른다. 같은 앱의 SwiftUI header는 별도 light/dark hex를 계산한다. web과
  브랜드 팔레트가 있는 앱에는 맞지만 두 렌더러의 원본 값이 하나는 아니다.
- Evan Bacon의 `crispy`(2026-01-28 snapshot)는 `system | light | dark` 상태,
  `Appearance.setColorScheme`, web localStorage와 React Navigation provider를
  묶는다. 사용자가 appearance를 고르는 universal 앱의 해법이다.
- Evan Bacon의 `expo-ai`와 `expo-rsc-movies`(2025-12 snapshots)는
  `useColorScheme` + React Navigation provider를 쓴다. `expo-ai`는
  `@bacons/apple-colors`의 iOS 색을 navigation role에 대응시켰다.
- Galaxies.dev의 `expo-vega-example`(2026-05-04 snapshot)은 제품 전용 고정 dark
  palette를 한 파일에 두고 React Navigation theme로 연결한다. 브랜드가 theme를
  소유할 때의 단순한 형태다.

공통점은 **theme의 소유자가 하나**라는 점이다. 차이는 그 소유자가 브랜드
팔레트인지 OS인지다. flyn은 아직 브랜드가 없고 Apple HIG를 따르므로 OS가
소유한다.

## 확정한 앱 테마

`앱 테마`는 아래 의미 역할만 가진다. 이름은 사용 의도를 말하고, 값은 iOS
시스템 역할에 위임한다.

| 앱 역할 | iOS 원본 | 쓰임 |
| --- | --- | --- |
| `background` | `systemBackground` | 화면 바탕 |
| `surface` | `secondarySystemBackground` | 입력·카드처럼 배경에서 분리된 면 |
| `text.primary` | `label` | 제목·본문 |
| `text.secondary` | `secondaryLabel` | 설명·메타데이터 |
| `text.disabled` | `tertiaryLabel` | 비활성 라벨 |
| `text.placeholder` | `placeholderText` | 입력 placeholder |
| `separator` | `separator` | 경계·구분선 |
| `accent` | `systemBlue` | 기본 action·focus·interactive tint |
| `onAccent` | 흰색 | system blue로 채운 RN control의 라벨 |
| `disabledFill` | `systemGray5` | 비활성 RN control의 면 |
| `overlay` | `systemFill` | 콘텐츠를 덮는 상태 막 |
| `danger` | `systemRed` | 오류·파괴 action |
| `success` | `systemGreen` | 성공 상태 |

지금 쓰임이 없는 warning, brand, elevation, gradient 색은 미리 만들지 않는다.

## 두 렌더러의 계약

### React Native

- style의 `color`, `backgroundColor`, `borderColor`가 위 역할을 직접 소비한다.
- Uniwind class는 레이아웃·간격·타이포·비색상 상태(opacity 등)에만 쓴다.
- light/dark 값 두 벌, `dark:` 색 변형, Tailwind 팔레트 색을 앱 소유 화면에
  두지 않는다.

### @expo/ui

- native control의 기본 색이 이미 역할에 맞으면 명시하지 않는다.
- 명시가 필요한 색은 RN과 같은 역할 값을 modifier나 universal style에 쓴다.
  renderer 전용 hex 복제본을 만들지 않는다.
- 모든 `Host` subtree의 interactive accent는 같은 `accent`를 `seedColor`로
  받는다.
- `colorScheme`은 생략한다. SwiftUI 계층형 foreground가 더 정확한 곳은
  `primary`·`secondary` 같은 native hierarchical style을 우선한다.

### Navigation

- header·toolbar·back button은 iOS native 기본 appearance를 유지한다.
- 화면 content background처럼 명시가 필요한 navigation 값만 같은 앱 역할을
  쓴다.
- 브랜드 navigation palette나 별도 React Navigation `ThemeProvider`를 추가하지
  않는다.

## 예외

- Apple 로그인 버튼은 Apple이 허용한 style과 system appearance 대응을 유지한다.
- Google 로그인 버튼과 G mark는 Google branding 규격의 light/dark 색을 유지한다.
- 외부 브랜드 예외를 공통 앱 테마로 끌어올리거나 다른 화면에서 재사용하지 않는다.

## 적용 범위

모바일 앱의 현재 사용자 노출 표면 전체가 대상이다.

- 로그인, 이메일, 인증 코드
- launch·실패·프로필 누락 상태
- 온보딩과 설정
- walking skeleton의 화면 배경, 카드, 입력, 메모, health·stats 상태

walking skeleton이 throwaway 예시라는 사실은 색 불일치를 남길 이유가 아니다.
없어질 때까지는 같은 앱 테마를 따른다.

## 손대지 않는 것

- 어떤 화면을 RN 또는 `@expo/ui`로 만드는지에 대한 기존 경계
- 인증·데이터 흐름, 문구, 화면 구조와 interaction
- Apple·Google branding 값
- 컴포넌트별 크기·모서리·간격과 typography
- Android·web fallback
- 사용자가 고르는 appearance 설정
- 새 UI·theme dependency

## 완료 조건

1. 앱 소유 UI에 Tailwind 색상 utility와 `dark:` 색 변형이 남지 않는다.
2. 같은 의미 역할은 RN과 `@expo/ui`에서 같은 원본 값을 소비한다.
3. 앱 소유 light/dark hex 표나 React theme context가 새로 생기지 않는다.
4. 각 `Host`의 interactive control이 공통 accent를 상속한다.
5. system light와 dark에서 로그인(RN), 이메일(`@expo/ui`), 인증 코드(RN),
   설정(`@expo/ui`), walking skeleton(RN)을 확인했을 때 배경·본문·보조 문구·
   accent·danger가 같은 역할로 보인다.
6. Increase Contrast를 켰을 때 앱 소유 시맨틱 색이 OS 변화에 반응한다.
7. Apple·Google 로그인 버튼은 변경 전 branding과 appearance를 유지한다.
8. test, typecheck, lint가 통과한다.

## 근거

- [Expo Router Color](https://docs.expo.dev/router/reference/color/)
- [Expo UI universal Host](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/)
- [Expo UI SDK 57](https://docs.expo.dev/versions/v57.0.0/sdk/ui/)
- [Evan Bacon chat-template theme 연결](https://github.com/EvanBacon/chat-template/blob/40379fcbc8d57025e09eef77ae129b7b30b100c7/src/app/_layout.tsx)
- [Evan Bacon chat-template SwiftUI header](https://github.com/EvanBacon/chat-template/blob/40379fcbc8d57025e09eef77ae129b7b30b100c7/src/components/main-header.swiftui.tsx)
- [Evan Bacon crispy theme provider](https://github.com/EvanBacon/crispy/blob/c7943ace32de01c7bdde88e85697f1117a866d86/src/components/ui/theme-provider.tsx)
- [Galaxies.dev expo-vega-example palette](https://github.com/Galaxies-dev/expo-vega-example/blob/5faa7bc07d227d5f1f356bbaa841a1620faa738f/mobile/theme/devflix.ts)

## 가정과 남은 위험

- 제품 브랜드가 아직 없고 사용자가 appearance를 고를 요구도 없다는 기존 결정을
  유지한다. 둘 중 하나가 생기면 theme 소유자를 OS에서 앱으로 옮길지 다시 정한다.
- SDK 57 소스와 타입은 `ColorValue` 변환을 지원하지만, 구현 후 대표
  `background`·`tint`·`seedColor`를 시뮬레이터에서 확인해야 한다.
- `@expo/ui` API가 SDK와 함께 바뀌므로 Expo 업그레이드 때 설치된 타입을 다시
  확인한다. 이 스펙의 역할 계약은 유지하되 adapter는 버전에 맞춘다.
