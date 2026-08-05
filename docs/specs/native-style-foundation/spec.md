# React Native 스타일 파운데이션 전환

## 원하는 결과

RN custom surface는 React Native core `StyleSheet`와 TypeScript 원본으로 스타일을
표현한다. 색·간격·타이포는 앱 전체에서 같은 의미를 쓰고, 화면 layout과
`@expo/ui` native surface는 각 소유자가 결정한다. 현재 iOS의 native 관용을
유지하면서도 Android 추가 때 semantic layer를 다시 설계하지 않는다. Expo
Router의 header, tab bar와 기본 screen background도 이 색 원본에서 파생한다.

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
- app theme provider와 React Navigation `ThemeProvider`는 서로 다른 역할로 root에
  둔다. 전자는 RN consumer에 theme를 제공하고 후자는 navigation chrome을
  연결한다.
- 앱은 시스템 light/dark를 따르며 별도 theme selector를 만들지 않는다.
- 실제 제품 accent가 생기기 전에는 `Host.seedColor`를 생략한다.

## 소유권 표

| 범위 | 소유자 | 예시 |
| --- | --- | --- |
| semantic color | 스타일 파운데이션 | system, action, 제품·상태 색 역할 |
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

### 초기 색 역할

| 분류 | 역할 | 의미 |
| --- | --- | --- |
| system | `background` | grouped content가 아닌 기본 screen canvas |
| system | `groupedBackground` | grouped content가 화면의 주 surface인 canvas |
| system | `surface` | RN이 소유하는 card·input·composer surface |
| system | `text` | 기본 foreground text와 icon |
| system | `secondaryText` | 보조 설명과 낮은 위계 text |
| system | `separator` | system list·navigation 경계와 hairline |
| system | `border` | RN input·app surface의 명시적 outline |
| system | `link` | OS가 제공하는 link·inline action |
| action | `primary`, `onPrimary` | 주요 action과 그 위 foreground |
| action | `accent`, `onAccent` | tint·selection·active navigation과 그 위 foreground |
| state | `disabled`, `disabledText` | 비활성 surface와 foreground |
| state | `placeholder` | input placeholder |
| state | `overlay` | modal·scrim overlay |
| state | `danger` | 오류·파괴적 상태 |
| state | `success` | 완료·가용 상태 |
| product | `userBubble`, `onUserBubble` | 사용자 chat bubble과 그 위 foreground |

`onDanger`, `onSuccess`처럼 filled 상태 surface 위에 foreground가 실제로 놓일 때
필요한 pair는 사용처가 생길 때 추가한다. raw palette 이름, renderer 이름이나
사용되지 않는 warning·elevation·gradient 역할은 초기 목록에 넣지 않는다.

iOS는 `background → systemBackground`,
`groupedBackground → systemGroupedBackground`,
`surface → secondarySystemBackground`로 연결한다. Android는 각각 Material
`background`, `surfaceContainer`, `surfaceContainerHigh`를 사용한다.

제품 accent가 없더라도 action 역할 자체는 유지한다. 이때 iOS는 system action/link,
Android는 Material dynamic primary·onPrimary를 사용하고 임의의 brand hex를 넣지
않는다. 제품 accent가 확정되면 `primary`·`accent` 계열만 product 값으로 pin할 수
있다. `Host.seedColor`는 system action color를 쓴다는 이유만으로 전달하지 않는다.

### theme 접근 경계

- root의 app theme provider가 `useColorScheme()`을 한 번 구독하고 system·action·
  제품 색을 resolve한다.
- RN component는 `useColors()`로 색만, `useTheme()`으로 colors·spacing·typography를
  읽는다. screen이 platform resolver를 직접 부르지 않는다.
- React 밖에서 색이 필요한 adapter는 color scheme을 명시적으로 받아 non-hook
  resolver를 호출한다. module load 때 resolved color를 상수로 고정하지 않는다.
- foundation의 공개 색 타입은 끝까지 `ColorValue`다. 외부 library가 `string`으로
  좁힌 type을 요구하면 adapter에서만 type을 맞추며 실제 값을 hex나 `String()`으로
  정규화하지 않는다.

### Navigation과 tab bar

app theme provider와 Expo Router/React Navigation `ThemeProvider`는 역할이 다르다.
app provider는 RN consumer를, Navigation provider는 header·tab bar·기본 screen
background를 소유한다. root에 둘 다 연결한다.

| React Navigation theme | 스타일 파운데이션 |
| --- | --- |
| `primary` | `accent` |
| `background` | `background` |
| `card` | `background` |
| `text` | `text` |
| `border` | `separator` |
| `notification` | `accent` |

`getNavigationTheme()`은 현재 light/dark의 React Navigation base theme 위에 이
색만 덮는다. 일반 Stack header와 기본 screen content는 같은 plain `background`를
쓴다. Settings처럼 grouped content가 화면의 주 surface인 route만 공식
`headerStyle.backgroundColor`에 `groupedBackground`를 연결한다. 특정 navigation
component가 public theme를 소비하지 않는 경우에만 같은 semantic role을 해당 공식
color prop에 연결한다. active·inactive 상태를 새 raw 색으로 만들지 않는다.

navigation chrome의 높이, blur/material, icon placement, back gesture, press·focus
interaction은 플랫폼과 navigation renderer가 계속 소유한다. 색을 공유한다는 것이
header나 tab bar를 RN custom component로 다시 만든다는 뜻은 아니다.

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

- TypeScript 색·간격·타이포 원본과 platform color resolver, app theme provider,
  `useColors()`·`useTheme()`를 둔다.
- RN의 색 `className`뿐 아니라 layout·spacing·typography `className`도 component
  local `StyleSheet` 또는 공유 foundation role로 옮긴다.
- root의 React Navigation `ThemeProvider`는 app provider 아래에서
  `getNavigationTheme()`를 받아 header·tab bar·screen background를 연결한다.
  Navigation, system UI와 color prop의 CSS variable bridge를 semantic color
  resolver로 바꾼다.
- `Host.seedColor`는 명시적 제품 accent가 없으면 제거한다.
- 모든 callsite가 이동한 뒤 Uniwind, Tailwind config, `global.css`, 생성 type과
  Metro 연동을 제거한다.
- renderer 선택, 화면 정보 구조, product copy와 data flow는 바꾸지 않는다.

한 번에 일부 색만 옮겨 CSS와 TypeScript가 장기간 두 개의 원본이 되는 상태는 완료로
보지 않는다. 다만 작업 중간 커밋은 앱이 동작하고 다음 migration 경계가 명확해야
한다.

색만 TypeScript로 옮기고 layout·spacing·typography `className`을 남기는 상태도
완료가 아니다. 이 hybrid는 component마다 `style`과 `className`의 우선순위를
판단하게 하고 CSS·Tailwind·Metro·generated type을 계속 유지시킨다. 화면 단위의
일시적 migration 단계로는 허용하지만 장기 구조로 남기지 않는다.

## 완료 조건

- RN production code에 Uniwind import, styling `className`, CSS variable 조회와
  `global.css` 의존이 없다.
- Uniwind·Tailwind 관련 dependency, config, generated type과 Metro 설정이 없다.
- 공유 token은 색·간격·타이포 범주에만 있고 layout·전역 size·radius scale이 없다.
- iOS·Android resolver가 모든 semantic color role을 빠짐없이 반환하고 TypeScript
  수준에서 `ColorValue`를 유지한다.
- app theme provider가 system appearance 변경에 다시 render되고 모든 consumer가
  같은 resolved colors를 받는다.
- Navigation theme의 primary·background·card·text·border·notification이 mapping
  계약과 일치한다.
- iOS light/dark에서 Stack header, RN background/text, 제품 상태와 native surface
  경계가 자연스럽다. tab bar가 생기면 별도 raw 색 없이 같은 theme를 소비한다.
- 제품 상태의 explicit foreground/background pair는 기존 contrast regression을
  통과한다.
- Dynamic Type에서 RN 주요 텍스트가 잘리거나 겹치지 않고 native text는 platform
  scaling을 유지한다.
- 현재 test, typecheck와 lint가 모두 통과한다.

## 검증 증거

- 자동 검증: semantic role completeness, `useColorScheme()` re-render, navigation
  mapping, Android fallback, 제품 색 contrast, forbidden Uniwind artifacts, 기존
  unit·integration suite.
- iOS runtime: 주요 RN·Universal 경계와 Stack header의 light/dark, keyboard,
  Dynamic Type, Increase Contrast와 native tint 기본값. tab bar 도입 시 active·
  inactive·badge와 background도 같은 matrix에 추가한다.
- Android runtime: 제품 지원 시작 전까지 deferred다. TypeScript resolver 검증을
  실제 native UI acceptance로 과장하지 않는다.

## 가정

- migration 직전의 정보 위계와 layout을 baseline으로 삼는다. screen canvas는 이후
  승인된 plain/grouped 의미 구분을 따른다.
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
- Uniwind의 짧은 className과 빠른 layout·spacing 작성 속도를 잃고 StyleSheet 코드가
  길어진다. 반복되는 색·간격·타이포만 foundation으로 추출하고 screen layout은
  가까이 두어 탐색과 중복 비용을 제한한다.
- CSS와 TypeScript 원본이 잠시 공존하면 잘못된 쪽을 새 코드가 참조할 수 있다.
  migration 완료 조건으로 잔존 artifact를 자동 검사한다.
- RN typography 값은 SwiftUI·Compose native text style과 같은 API가 아니다.
  의미 위계만 맞추고 scaling과 잘림을 플랫폼별로 검증한다.
- Android 값은 runtime 검증 전까지 source-level 준비다. Android 지원 단계에서
  실제 기기 Material behavior를 별도 acceptance로 닫는다.
- Uniwind가 향후 native `ColorValue`를 보존하는 stable API를 낼 수 있다. 현재
  공개 계약만으로 영구 불가능을 단정하지 않고, 결정 계약의 재검토 조건으로 둔다.

## 관련 계약과 근거

- [React Native 스타일 파운데이션 결정](../../decisions/uniwind-css-theme.md)
- [지원 플랫폼](../../decisions/ios-only.md)
- [네이티브 관용과 스타일 파운데이션](../../decisions/apple-hig-with-app-theme.md)
- [React Native와 Expo UI의 화면 경계](../../decisions/self-contained-native-ui-boundaries.md)
- [2026-08-04 native interface audit](../native-interface-consistency/spec.md)
- [Expo Router Color](https://docs.expo.dev/router/reference/color/)
- [Expo UI Host](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/)
- [Uniwind runtime CSS variables](https://docs.uniwind.dev/theming/update-css-variables)
- [Uniwind official repository](https://github.com/uni-stack/uniwind)
- [React Native StyleSheet](https://reactnative.dev/docs/stylesheet)
- [React Native PlatformColor](https://reactnative.dev/docs/platformcolor)
- [React Native DynamicColorIOS](https://reactnative.dev/docs/dynamiccolorios)
- [CWB Expo Unified Theming](https://github.com/Code-with-Beto/skills/blob/main/plugins/cwb-theming/README.md)
- [CWB theming skill](https://github.com/Code-with-Beto/skills/blob/main/plugins/cwb-theming/skills/theming/SKILL.md)
- [CWB theme config](https://github.com/Code-with-Beto/skills/blob/main/plugins/cwb-theming/skills/theming/assets/config.ts)
- [CWB color and navigation resolver](https://github.com/Code-with-Beto/skills/blob/main/plugins/cwb-theming/skills/theming/assets/colors.ts)
