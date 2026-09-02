# 모바일 색상 시맨틱

## 결정

- React Native UI의 런타임 색상 원본은 Uniwind가 읽는 전역 CSS 한 곳에 둔다.
- 앱은 HeroUI Native의 시맨틱 변수 문법을 공식 색상 이름으로 사용한다. 기본 역할은 `background`, `foreground`, `surface`, `surface-foreground`이며 필요한 역할은 HeroUI Native의 시맨틱 변수 집합 안에서 추가한다.
- React Native UI와 HeroUI Native 컴포넌트는 `bg-background`, `text-foreground`, `bg-surface` 같은 Uniwind 클래스를 사용한다. 별도의 TypeScript 색상 팔레트나 같은 의미의 프로젝트 전용 토큰 계층은 두지 않는다.
- 기본 팔레트가 필요하면 전역 CSS 안의 구현 세부사항으로 둔다. 화면과 컴포넌트는 기본 색상이나 HEX 값이 아니라 시맨틱 클래스 또는 변수를 사용한다.
- 화면 모드는 `라이트`, `다크`, `시스템 설정` 셋이다. 저장된 값이 없는 새 설치와 기존 설치는 `시스템 설정`으로 시작한다.
- 화면 모드는 고르는 즉시 앱 전체에 적용하고 이 기기에 저장한다. 앱을 다시 열거나 같은 기기에서 계정을 바꿔도 마지막 선택을 유지하며 다른 기기나 계정 설정과 동기화하지 않는다. `시스템 설정`은 앱이 열린 동안의 운영체제 화면 모드 변경도 따른다.
- 화면 모드의 선택값과 그것을 바꾸는 함수는 테마 브리지가 소유하고 `useAppTheme`로 내보낸다. 화면과 컴포넌트는 브리지에서 받은 값을 쓰고 React Native의 `useColorScheme`를 직접 읽지 않는다. 적용은 Uniwind의 `setTheme`로 하며, `시스템 설정`은 Uniwind의 system 값을 넘겨 운영체제 변경 추종을 Uniwind에 맡긴다.
- 선택값은 세션 저장에 이미 쓰는 `expo-sqlite/kv-store`에 이 기기 단위로 저장한다. 앱 시작 시 동기로 읽어 첫 프레임부터 저장된 모드로 그리고, 읽은 값이 세 값 중 하나가 아니거나 읽을 수 없으면 `시스템 설정`으로 본다.
- 초기 색상값은 다음과 같다.

| 역할 | Light | Dark |
| --- | --- | --- |
| `background` | `#F4F4F6` | `#0B0B0D` |
| `foreground` | `#111114` | `#FFFFFF` |
| `surface` | `#FFFFFF` | `#1A1A1E` |
| `learn` | `oklch(0.55 0.19 300)` | `oklch(0.78 0.15 300)` |
| `learn-foreground` | `oklch(0.9911 0 0)` | `oklch(0.21 0.03 300)` |
| `learn-surface` | `oklch(0.945 0.022 300)` | `oklch(0.27 0.045 300)` |

- HeroUI의 시맨틱 집합으로 뜻을 표현할 수 없는 제품 역할은 전역 CSS에 직접 등재한다. 지금 여기에 해당하는 것은 교정 채널의 `learn`, `learn-foreground`, `learn-surface` 셋뿐이다. 값은 다른 역할과 같은 자리에서 Light와 Dark를 함께 정의하고, `@theme inline`으로 `bg-learn`, `text-learn` 같은 클래스를 만든다.
- 등재한 이름이 HeroUI의 `useThemeColor`가 아는 목록에 없으므로, 클래스를 쓸 수 없는 자리는 Uniwind의 CSS 변수 읽기로 같은 값을 얻는다. 이름은 `--color-` 접두사 없이 등재한 이름 그대로다.
- 클래스를 사용할 수 없는 Expo Router, 네이티브 Stack 옵션과 루트 창에는 얇은 테마 브리지가 Uniwind 변숫값을 전달한다. 이 브리지는 색상을 정의하지 않는다.
- Expo Router 내비게이션 테마의 `background`와 `card`는 HeroUI의 `background`에 연결하고, `text`는 `foreground`에 연결한다. 기본 내비게이션 테마의 시스템 폰트는 덮어쓰지 않는다.
- 네이티브 루트 창의 배경도 HeroUI의 `background`와 동기화한다. 상태 표시줄 스타일은 사용자가 고른 화면 모드를 따르고 `시스템 설정`에서는 운영체제 화면 모드를 따른다.

## 경계

- HeroUI의 `background`, `foreground`와 `surface`는 React Native UI의 공식 역할명이다. 같은 역할을 `background.canvas`, `text.primary` 같은 별도 이름으로 다시 정의하지 않는다.
- `background`는 앱과 라우트 컨테이너의 가장 바깥 배경을 뜻한다. `surface`는 카드와 패널 같은 콘텐츠 표면을 뜻한다. `surface-foreground`, `accent-foreground`처럼 특정 배경 위의 대비색은 독립된 역할로 관리한다.
- 특정 컴포넌트나 제품 도메인 전용 토큰은 HeroUI의 공통 역할과 상태로 의미를 표현할 수 없다는 것이 실제 화면에서 확인된 경우에만 추가한다. 교정 채널이 그런 경우다. 파랑 `accent`와 나란히 두어도 다른 채널이라는 것이 보여야 하는데 HeroUI에는 그 뜻을 가진 역할이 없고, 비교 렌더로 보라를 확인한 뒤 등재했다.
- React Navigation의 `card`는 라이브러리가 정한 필드명이며 앱 콘텐츠의 `surface`를 뜻하지 않는다. 최초 셸에서는 네이티브 내비게이션 표면이 화면 바탕과 이어지도록 `background`에 연결한다.
- 플랫폼 UI가 소유하는 컨트롤 내부 색상과 상태는 해당 플랫폼의 기본 시맨틱 표현을 유지한다. 앱 팔레트를 모든 네이티브 요소에 강제로 주입하지 않는다.
- iOS 설정 폼의 배경은 위 규칙의 예외다. SwiftUI Form이 까는 시스템 grouped 배경은 라이트 `#F2F2F7`, 다크 순수 검정이라 `background` 토큰과 값이 달라 push 전환과 투명 헤더 아래에서 이음새가 보인다. 그래서 폼의 시스템 배경을 감추고 페이지는 `background`, 그룹 안쪽 행은 `surface`를 준다. 행 배경은 행 단위 modifier라 `Form`이 아니라 각 `FieldGroup.Section`에 건다. Android는 Material 행 표면이 배경을 이미 소유하므로 이 modifier를 주지 않는다.
- Uniwind CSS 변수는 `@expo/ui`의 `Host` 안에 자동 전파되지 않는다. 설정 계층의 `Host`는 사용자가 고른 화면 모드를 `colorScheme`으로 받고, `시스템 설정`이면 넘기지 않아 운영체제를 따르게 둔다. 브랜드 연결이 실제로 필요할 때만 `accent`를 `seedColor` 같은 지원 API로 명시적으로 전달한다.
- 네이티브 시작 화면은 런타임 CSS를 읽지 못한다. 따라서 앱 설정에 Light/Dark `background`의 빌드 시점 스냅샷을 둘 수 있다. 이 예외는 런타임 색상 원본을 하나 더 만드는 근거가 되지 않는다.
- 이 결정은 `accent`, `critical`, `success` 같은 제품 상태 색상의 실제 값을 확정하지 않는다.
- 화면 모드는 기기 환경 설정이다. 사용자 프로필이나 서버 데이터로 저장하지 않는다.

## 이유

HeroUI Native가 이미 제공하는 시맨틱 문법을 앱의 공식 이름으로 사용하면 React Native UI가 Uniwind 클래스와 컴포넌트 기본 스타일을 같은 값에서 얻는다. 별도 TypeScript 팔레트와 토큰 번역을 제거하면서도 색상값이 아니라 역할로 스타일을 선택할 수 있다. 클래스를 사용할 수 없는 네이티브 셸에는 같은 CSS 값을 읽는 단방향 브리지만 둔다. 이 브리지는 화면 전환과 경계 너머 스크롤 중에 다른 배경이 노출되는 일을 막는다. 호스팅된 SwiftUI와 Compose는 CSS 구현을 공유하지 않는다. 같은 화면 모드와 필요한 브랜드 의도만 플랫폼 API로 전달받는다.

## 재검토 조건

- HeroUI Native와 Uniwind가 React Native UI의 기본 스타일 기반이 아니게 된다.
- 실제 제품 역할을 HeroUI 시맨틱 변수로 표현할 수 없어 반복적인 오용이나 양방향 변환이 생긴다.
- 사용자가 화면 모드를 계정이나 여러 기기 사이에서 동기화해야 할 때
- 운영체제가 앱별 화면 모드를 직접 저장하고 앱에 같은 선택 UI를 제공할 때

## 계속 제외하는 대안

- TypeScript 시맨틱 팔레트를 별도 원본으로 유지: Uniwind와 값 및 화면 모드를 동기화해야 하므로 원본이 두 개 생긴다. CSS 클래스를 사용할 수 없는 소비처는 CSS 값을 읽는 단방향 브리지로 해결한다.
- `background.canvas`, `text.primary` 같은 프로젝트 전용 문법을 HeroUI 변수 위에 유지: 현재 역할이 1:1로 대응하는데도 두 이름을 계속 번역해야 한다. HeroUI 문법이 실제 제품 의미를 표현하지 못한다는 증거가 생기면 다시 검토한다.
- 운영체제 화면 모드만 따르기: 사용자가 앱 안에서 읽기 편한 모드를 고를 수 없다. 화면 모드 선택이 실제로 혼란을 만든다는 증거가 생길 때 다시 검토한다.
- 화면이 React Native `useColorScheme`를 직접 읽기: 운영체제 모드를 읽는 것이라 사용자가 `다크`를 골라도 그 화면만 라이트로 남는다. 로그인 버튼이 실제로 그랬다.
- 설정 폼의 배경 문제를 React Native 레이어를 덧대어 해결하기: 한 화면에 주 렌더러가 둘이 된다. `@expo/ui` 표면의 배경은 SwiftUI modifier로 준다.

## 보존할 근거

- 화면 모드의 원본·저장·`Host` 전달과 iOS 설정 폼 배경 규칙은 2026-09-02에 `toy-crane/dearly@0438e47`의 `docs/decisions/mobile-ui-foundation.md`를 기준으로 맞췄다. dearly는 `@react-native-async-storage/async-storage`에 비동기로 저장하고 읽을 때까지 첫 프레임을 비워 두지만, 이 앱은 동기로 읽을 수 있는 `expo-sqlite/kv-store`가 이미 있어 그 게이트를 두지 않는다.
- 설치된 `uniwind 1.10.1`의 `Uniwind.setTheme`는 dearly의 `1.11.0`과 같은 시그니처(`ThemeName | system`)다.
