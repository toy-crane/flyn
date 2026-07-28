# Uniwind CSS를 단일 원본으로 쓰는 앱 테마

## 목적

RN 화면의 색까지 Uniwind `className`으로 표현하면서 Navigation과 `@expo/ui`가
별도 팔레트를 소유하지 않게 한다. 앱 테마의 값은 CSS 한 곳에 있고 각 renderer는
자기 경계에 맞는 방법으로 그 값을 소비한다.

이 스펙은 다음 확정 결정 위에 선다.

- [iOS 전용](../../decisions/ios-only.md)
- [Apple HIG와 앱 소유 테마](../../decisions/apple-hig-with-app-theme.md)
- [새 화면은 @expo/ui가 기본](../../decisions/expo-ui-by-default.md)
- [Uniwind CSS 앱 테마](../../decisions/uniwind-css-theme.md)

## 구조

```text
global.css의 --app-* light/dark 값
                 |
        +--------+---------+
        |                  |
  @theme --color-*    useCSSVariable()
        |                  |
 RN className       Navigation / System UI
                    @expo/ui / vendor prop
```

CSS가 값을 소유하고 JavaScript 브리지는 변수 이름만 소유한다. React context나
TypeScript light/dark 값 표는 두지 않는다.

## 시맨틱 역할

| 앱 역할 | CSS 원본 | RN utility | 쓰임 |
| --- | --- | --- | --- |
| 화면 배경 | `--app-background` | `bg-background` | 화면 바탕 |
| 분리된 면 | `--app-surface` | `bg-surface` | 카드·입력 영역 |
| 주요 글자 | `--app-foreground` | `text-foreground` | 제목·본문 |
| 보조 글자 | `--app-muted-foreground` | `text-muted-foreground` | 설명·메타데이터 |
| 비활성 글자 | `--app-disabled-foreground` | `text-disabled-foreground` | 비활성 라벨 |
| placeholder | `--app-placeholder` | `placeholderTextColorClassName="accent-placeholder"` | 입력 placeholder |
| 경계 | `--app-border` | `border-border` | 테두리·구분선 |
| 주요 action | `--app-primary` | `bg-primary`, `text-primary` | action·focus·tint |
| action 위 글자 | `--app-primary-foreground` | `text-primary-foreground` | 채운 버튼 라벨 |
| 비활성 면 | `--app-disabled` | `bg-disabled` | 비활성 custom control |
| overlay | `--app-overlay` | `bg-overlay` | 콘텐츠 위 상태 막 |
| 위험 | `--app-danger` | `text-danger`, `bg-danger` | 오류·파괴 action |
| 성공 | `--app-success` | `text-success`, `bg-success` | 성공 상태 |

각 역할은 `:root`의 `@variant light`와 `@variant dark`에 모두 값을 가진다.
색상값은 OKLCH를 기본으로 하되 투명 overlay처럼 alpha가 중요한 값은 rgba를
허용한다. 이번 변경은 색 관리 방식의 교체이지 시각적 리디자인이 아니므로,
초기 값은 현재 light/dark 화면의 인상을 유지하는 중립 팔레트로 잡는다.

지금 쓰임이 없는 warning, brand, elevation, gradient 역할은 만들지 않는다.

## renderer 계약

### React Native

- 앱 소유 색은 시맨틱 Uniwind utility로 표현한다.
- `slate`·`gray`·`sky`·`rose`·`emerald`처럼 값이 이름에 드러나는 utility와
  앱 소유 색의 `dark:` 분기를 남기지 않는다.
- 레이아웃·간격·타이포와 색을 같은 `className`에서 조합한다.
- `placeholderTextColor`, spinner color처럼 `style` 밖의 color prop은
  `placeholderTextColorClassName="accent-placeholder"`·
  `colorClassName="accent-primary"` 같은 Uniwind color class prop을 우선하고,
  지원되지 않는 경계에서만 CSS 변수를 읽는다.

### Navigation과 System UI

- `useColorScheme()`은 현재 mode와 React Navigation의 `dark` 상태를 고르는 데만
  쓴다. 색상값을 선택하거나 `Appearance.setColorScheme()`을 호출하지 않는다.
- header·content·system background처럼 명시가 필요한 값은 CSS 변수에서 읽는다.
- React Navigation theme를 만들더라도 colors는 CSS 변수 값을 가리키며 별도
  상수 팔레트를 갖지 않는다.

### @expo/ui

- 네이티브 기본 표현이 이미 역할을 만족하면 색을 지정하지 않는다.
- 명시가 필요한 `background`·`foregroundStyle`·`tint`와 universal style은
  `useCSSVariable()`로 읽은 CSS 값을 받는다.
- 모든 `Host` subtree의 interactive accent는 `--app-primary`를 `seedColor`로
  받는다.
- `Host.colorScheme`은 생략해 시스템 appearance를 따른다.
- `Host` 안에서는 Uniwind `className`을 사용하지 않는다.

## 예외

- Apple 로그인 버튼은 Apple이 허용한 style과 appearance 대응을 유지한다.
- Google 로그인 버튼과 G mark는 Google branding 규격의 light/dark 값을 유지한다.
- 외부 브랜드 값을 앱 테마 역할로 승격하거나 다른 화면에서 재사용하지 않는다.

## 적용 범위

- 로그인, 이메일, 인증 코드
- launch·실패·프로필 누락 상태
- 온보딩과 설정
- walking skeleton의 화면 배경, 카드, 입력, 메모, health·stats 상태
- Expo Router navigation과 앱 system background

walking skeleton도 없어질 때까지 같은 테마를 소비한다.

## 손대지 않는 것

- 화면별 RN과 `@expo/ui` 경계
- 인증·데이터 흐름, 문구, 화면 구조와 interaction
- Apple·Google branding 값
- 컴포넌트 크기·모서리·간격과 typography
- Android·web fallback
- 사용자가 고르는 appearance 설정
- 새 UI·theme dependency

## 완료 조건

1. `global.css`가 모든 앱 역할의 light/dark 값을 한 번씩만 소유한다.
2. RN의 앱 소유 색은 시맨틱 `className`으로 표현되고 raw Tailwind 색과 색상용
   `dark:` utility가 남지 않는다.
3. Navigation·System UI·`@expo/ui`는 CSS 변수 값을 읽으며 별도 light/dark
   TypeScript 팔레트를 갖지 않는다.
4. 모든 `Host`의 interactive control이 공통 primary를 상속한다.
5. system light와 dark에서 로그인(RN), 이메일(`@expo/ui`), 인증 코드(RN),
   설정(`@expo/ui`), walking skeleton(RN)의 역할이 일관돼 보인다.
6. Apple·Google 로그인 버튼의 branding과 appearance가 유지된다.
7. 앱 소유 foreground/background 조합이 WCAG AA 대비를 만족한다.
8. test, typecheck, lint가 통과한다.

## 근거

- [Uniwind Global CSS](https://docs.uniwind.dev/theming/global-css)
- [Uniwind useCSSVariable](https://docs.uniwind.dev/api/use-css-variable)
- [Evan Bacon chat-template global.css](https://github.com/EvanBacon/chat-template/blob/40379fcbc8d57025e09eef77ae129b7b30b100c7/src/global.css)
- [Evan Bacon chat-template theme 연결](https://github.com/EvanBacon/chat-template/blob/40379fcbc8d57025e09eef77ae129b7b30b100c7/src/app/_layout.tsx)
- [Evan Bacon chat-template SwiftUI 경계](https://github.com/EvanBacon/chat-template/blob/40379fcbc8d57025e09eef77ae129b7b30b100c7/src/components/main-header.swiftui.tsx)
- [Apple HIG Color](https://developer.apple.com/design/human-interface-guidelines/color)

## 가정과 남은 위험

- Evan의 관리 구조만 따르고 그의 구체적인 palette나 web 요구는 복사하지 않는다.
- 제품 브랜드와 앱 안의 appearance 선택은 아직 없다.
- CSS 색은 `PlatformColor`가 아니므로 iOS 릴리스별 변화와 Increase Contrast에
  자동 대응하지 않는다. 이번 범위는 기본 light/dark의 WCAG AA 검증까지다.
- 일부 SwiftUI 기본 control 내부 색은 CSS로 대체할 수 없다. 그 표현은 네이티브
  기본값을 유지하고, 앱이 명시하는 surface·foreground·tint만 공유한다.
- `@expo/ui`와 Uniwind API가 SDK 업그레이드에서 바뀌면 브리지만 다시 검증한다.
