# React Native 스타일 파운데이션 전환

## 원하는 결과

RN custom surface는 React Native core `StyleSheet`와 TypeScript 원본으로 스타일을
표현한다. 색·간격·타이포는 앱 전체에서 같은 의미를 쓰고, 화면 layout과
`@expo/ui` native surface는 각 소유자가 결정한다. 현재 iOS의 native 관용을
유지하면서도 Android 추가 때 semantic layer를 다시 설계하지 않는다.

이 명세는 제품 화면을 새로 디자인하는 작업이 아니다. 현재 보이는 정보 구조와
renderer 경계를 유지한 채 styling 소유권만 바꾸는 migration 계약이다.

## 확정된 결정

- RN custom surface는 `StyleSheet`를 쓴다.
- 공유 파운데이션은 **색·간격·타이포**까지만 포함한다.
- flex, alignment, position, 화면 composition 같은 layout은 screen·component
  local style로 둔다.
- 임의의 크기와 모서리는 전역 token으로 만들지 않는다. 반복되는 제품 component
  variant가 생길 때 해당 component가 소유한다.
- `@expo/ui`의 `Form`·`List`·sheet·native control은 플랫폼의 기본 surface,
  spacing, typography, size와 interaction을 유지한다.
- iOS와 Android는 같은 semantic role을 쓰되 값은 중앙 platform resolver가
  native color로 해석한다.
- 앱은 시스템 light/dark를 따르며 별도 theme selector를 만들지 않는다.
- 실제 제품 accent가 생기기 전에는 `Host.seedColor`를 생략한다.

## 소유권 표

| 범위 | 소유자 | 예시 |
| --- | --- | --- |
| semantic color | 스타일 파운데이션 | background, surface, foreground, muted, danger, success |
| spacing rhythm | 스타일 파운데이션 | 반복되는 screen inset, stack gap, control 사이 간격 |
| RN typography role | 스타일 파운데이션 | title, body, label, caption에 해당하는 현재 반복 역할 |
| screen layout | 각 screen·component | flex 방향, 정렬, position, scroll·keyboard composition |
| 특별한 size·radius | 해당 component | composer 높이, OTP slot, bubble shape |
| native surface | iOS·Android | Form/List/sheet 배경, material, row metric, native text hierarchy |
| vendor surface | Apple·Google | 로그인 버튼 색, mark, label, pressed state |

공유한다는 것은 모든 값이 전역 token이어야 한다는 뜻이 아니다. 반복되는 의미가
있는 세 범주만 이름을 얻고, 구조를 설명하는 값은 사용하는 곳 가까이에 남는다.

## 색 계약

- token의 TypeScript 타입은 문자열이 아니라 React Native `ColorValue`를 보존한다.
- iOS system-owned role은 Expo Router `Color.ios`의 semantic value에 연결한다.
- Android system-owned role은 Expo Router `Color.android.dynamic`의 Material 3
  dynamic value를 우선하고, 지원되지 않는 환경에서는 Material static fallback을
  쓴다.
- foundation을 제공하는 hook은 `useColorScheme()`을 구독해 Android system theme가
  바뀌면 semantic color를 다시 해석한다. module load 때 계산한 상수로 고정하지
  않는다.
- platform resolver만 iOS·Android 차이를 안다. screen은 `Platform.OS`나 raw system
  color 이름을 직접 소비하지 않는다.
- danger·success처럼 OS가 flyn의 제품 의미를 알 수 없는 role은 explicit 앱 값을
  가질 수 있다. 이 값은 light/dark 실제 배경에서 접근성 대비를 검증한다.
- Navigation과 RN custom surface는 같은 semantic color 결과를 소비한다.
- native label·separator·material은 의미를 OS가 이미 알면 색 prop을 생략한다.

## 간격 계약

- 초기 scale은 현재 RN 화면에서 실제로 반복되는 간격을 합쳐 작게 만든다. migration
  때문에 새 visual rhythm을 발명하지 않는다.
- token은 의미 있는 반복에만 쓴다. 화면 구조상 한 번만 필요한 inset이나 offset은
  local style이어도 된다.
- native `Form`·`List`·control의 내부 padding, row height와 section spacing을 RN
  scale로 덮어쓰지 않는다.

정확한 token 이름과 수치는 구현 중 현재 값의 빈도를 확인해 정한다. 이는 제품
결정이 아니라 쉽게 바꿀 수 있는 구현 세부다.

## 타이포 계약

- RN role은 시스템 글꼴을 사용하고 사용자 font scaling을 막지 않는다.
- 현재 반복되는 텍스트 위계만 role로 만든다. 사용하지 않는 display·overline 같은
  role을 미리 추가하지 않는다.
- line height, weight와 letter spacing은 role 안에서 함께 정의하되, 한 화면의 특수한
  숫자 표기처럼 반복 의미가 없으면 local style로 둔다.
- native Expo UI text는 SwiftUI·Compose의 native text style과 Dynamic Type/font
  scaling을 유지한다. RN typography 수치를 전달해 픽셀 단위로 맞추지 않는다.

## 플랫폼 동작

### iOS

- 현재 구현·runtime acceptance의 기준 플랫폼이다.
- semantic system color, Dynamic Type, Increase Contrast와 native control tint의
  기본 동작을 유지한다.
- 제품 accent가 없으면 `Host` subtree는 system tint를 따른다.

### Android

- semantic color resolver와 공개 token 계약은 migration 때부터 포함한다.
- Material 3 dynamic color를 사용할 수 있는 기기에서는 사용자 wallpaper·system
  theme에 맞게 해석되고, 그렇지 않으면 static Material role로 fallback한다.
- Expo UI native surface는 Compose 기본 metric과 typography를 유지한다.
- 실제 Android screen acceptance와 screenshot 기준은 Android 제품 구현이 시작될
  때 추가한다. 검증되지 않은 screen fallback을 이번 migration에서 만들지 않는다.

## migration 범위

- TypeScript 색·간격·타이포 원본과 platform color resolver를 둔다.
- RN의 색 `className`뿐 아니라 layout·spacing·typography `className`도 component
  local `StyleSheet` 또는 공유 foundation role로 옮긴다.
- Navigation, system UI와 color prop의 CSS variable bridge를 semantic color
  resolver로 바꾼다.
- `Host.seedColor`는 명시적 제품 accent가 없으면 제거한다.
- 모든 callsite가 이동한 뒤 Uniwind, Tailwind config, `global.css`, 생성 type과
  Metro 연동을 제거한다.
- renderer 선택, 화면 정보 구조, product copy와 data flow는 바꾸지 않는다.

한 번에 일부 색만 옮겨 CSS와 TypeScript가 장기간 두 개의 원본이 되는 상태는 완료로
보지 않는다. 다만 작업 중간 커밋은 앱이 동작하고 다음 migration 경계가 명확해야
한다.

## 완료 조건

- RN production code에 Uniwind import, styling `className`, CSS variable 조회와
  `global.css` 의존이 없다.
- Uniwind·Tailwind 관련 dependency, config, generated type과 Metro 설정이 없다.
- 공유 token은 색·간격·타이포 범주에만 있고 layout·전역 size·radius scale이 없다.
- iOS·Android resolver가 모든 semantic color role을 빠짐없이 반환하고 TypeScript
  수준에서 `ColorValue`를 유지한다.
- iOS light/dark에서 Navigation, RN background/text, 제품 상태와 native surface
  경계가 자연스럽다.
- 제품 상태의 explicit foreground/background pair는 기존 contrast regression을
  통과한다.
- Dynamic Type에서 RN 주요 텍스트가 잘리거나 겹치지 않고 native text는 platform
  scaling을 유지한다.
- 현재 test, typecheck와 lint가 모두 통과한다.

## 검증 증거

- 자동 검증: semantic role completeness, Android fallback, 제품 색 contrast,
  forbidden Uniwind artifacts, 기존 unit·integration suite.
- iOS runtime: 주요 RN·Universal 경계의 light/dark, keyboard, Dynamic Type,
  Increase Contrast와 native tint 기본값.
- Android runtime: 제품 지원 시작 전까지 deferred다. TypeScript resolver 검증을
  실제 native UI acceptance로 과장하지 않는다.

## 가정

- migration 직전의 현재 시각 값과 정보 위계를 baseline으로 삼는다.
- 현재 화면에서 반복되는 간격·타이포 역할만으로 초기 foundation이 충분하다.
- Expo Router `Color`가 지원 SDK에서 iOS semantic color와 Android Material
  dynamic/static color를 계속 `ColorValue`로 제공한다.

가정이 틀려도 색·간격·타이포라는 파운데이션 범위는 자동으로 넓어지지 않는다.

## 하지 않는 것

- 제품 redesign이나 새 브랜드 팔레트 만들기.
- RN과 native surface의 배경·row height·글자 크기를 픽셀 단위로 통일하기.
- 전역 layout utility, size·radius scale 또는 범용 component library 만들기.
- renderer를 RN에서 Expo UI로, 또는 Expo UI에서 RN으로 옮기기.
- 앱 안의 light/dark selector 만들기.
- 이번 migration에서 검증되지 않은 Android 화면을 완성했다고 간주하기.

## 위험과 완화

- utility class 제거 범위가 넓어 layout 회귀가 생길 수 있다. 화면 단위로
  StyleSheet를 옮기고 현재 screenshot과 접근성 tree를 비교한다.
- CSS와 TypeScript 원본이 잠시 공존하면 잘못된 쪽을 새 코드가 참조할 수 있다.
  migration 완료 조건으로 잔존 artifact를 자동 검사한다.
- RN typography 값은 SwiftUI·Compose native text style과 같은 API가 아니다.
  의미 위계만 맞추고 scaling과 잘림을 플랫폼별로 검증한다.
- Android 값은 runtime 검증 전까지 source-level 준비다. Android 지원 단계에서
  실제 기기 Material behavior를 별도 acceptance로 닫는다.
- StyleSheet가 className보다 길어질 수 있다. 반복되는 의미만 foundation으로
  추출하고 화면 layout은 가까이 둬 탐색 비용을 제한한다.

## 관련 계약과 근거

- [React Native 스타일 파운데이션 결정](../../decisions/uniwind-css-theme.md)
- [지원 플랫폼](../../decisions/ios-only.md)
- [네이티브 관용과 스타일 파운데이션](../../decisions/apple-hig-with-app-theme.md)
- [React Native와 Expo UI의 화면 경계](../../decisions/self-contained-native-ui-boundaries.md)
- [2026-08-04 native interface audit](../native-interface-consistency/spec.md)
- [Expo Router Color](https://docs.expo.dev/router/reference/color/)
- [Expo UI Host](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/)
- [React Native StyleSheet](https://reactnative.dev/docs/stylesheet)
- [React Native PlatformColor](https://reactnative.dev/docs/platformcolor)
- [React Native DynamicColorIOS](https://reactnative.dev/docs/dynamiccolorios)
