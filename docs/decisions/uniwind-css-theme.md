# HeroUI Native와 Uniwind 스타일 파운데이션

## Decisions

- RN이 직접 그리는 모든 표면의 스타일 엔진은 Uniwind(Tailwind v4)다. 채팅·OTP
  같은 고성능 커스텀 표면도 예외가 아니다. `StyleSheet`·inline style은
  Reanimated animated style처럼 style prop이 기술적으로 필요한 지점에만 남긴다.
- 브랜드 컴포넌트는 HeroUI Native가 소유한다. 화면은 HeroUI 컴포넌트와 variant를
  먼저 쓰고, 필요한 표현이 없으면 HeroUI primitive·토큰 위에서 확장한다. HeroUI에
  대응물이 아예 없는 능력만 raw RN으로 만들고, 그때도 Uniwind 토큰을 소비한다.
- semantic token의 원본은 `global.css`의 CSS `@theme` 하나다. HeroUI 테마
  변수(HSL)를 기본으로 하고 앱 확장 토큰(색·간격·타이포)을 같은 파일에 둔다.
  TypeScript 색 resolver와 `theme/` 토큰 모듈은 폐기한다.
- native 경계 — React Navigation theme, `@expo/ui` `Host`에 넘기는 seed·제품
  상태 색 — 는 CSS 토큰과 같은 의미를 최소 bridge로 연결한다. 방향은 항상 CSS가
  원본이고 bridge가 자체 팔레트를 갖지 않는다.
- RN 표면에서 iOS semantic color(native `ColorValue`)의 시스템 적응(고대비,
  elevated dark)은 포기하고 light/dark 두 모드의 HSL 값으로 고정한다.
  `@expo/ui`가 그리는 native 표면과 navigation chrome은 계속 플랫폼 기본값을
  유지한다.
- 시스템 appearance가 light/dark를 고르고 앱 안에 테마 셀렉터를 만들지 않는다.
  Uniwind 테마 전환은 시스템 colorScheme 구독으로만 일어난다.
- 앱이 직접 소유하는 foreground/background 조합은 접근성 대비를 검증한다.

## Why

이 주제는 세 번 결정됐다: Uniwind(최초) → StyleSheet + native
`ColorValue`(2026-08-05) → HeroUI Native + Uniwind(2026-08-06, 현재). 08-05
결정이 지킨 것은 native 색 fidelity였지만, 실제 비용의 원천은 스타일 엔진이
아니라 **컴포넌트 세트를 직접 유지하며 native 표면과 시각적 sync를 맞추는
일**이었다. 반복 컴포넌트 라이브러리가 제품 요구가 되면서(08-05 계약이 명시한
재론 조건) fidelity 이익은 그 유지비를 정당화하지 못했다. HeroUI Native는
Uniwind를 스타일 엔진으로 요구하므로 채택은 곧 Uniwind 복귀다. 이때 콘텐츠 층만
Uniwind이고 커스텀 층은 StyleSheet인 2-시스템 병행은 토큰 원본을 CSS/TS 둘로
갈라, 제거하려던 sync 비용을 재생산한다. 그래서 RN 표면 전체가 한 엔진과 한 토큰
원본을 쓴다.

## Boundaries

- Apple·Google처럼 외부 브랜드가 규격을 소유한 표면은 HeroUI로 렌더링해도 브랜드
  지침(로고·문구·최소 크기·대비)이 외형을 소유한다. 앱 토큰으로 다시 칠하지
  않는다.
- native `Form`·`List`·sheet·navigation·alert의 background, material, label,
  간격, 글자 위계와 control 크기는 플랫폼이 소유한다. CSS 토큰을 native 표면에
  강제로 칠하지 않는다.
- bridge 값은 route 옵션과 `Host` prop에 앱 semantic 토큰의 resolved 값만 쓰고
  raw hex를 화면 코드에 흩뿌리지 않는다.
- Tailwind 임의 값(`w-[13px]`)으로 토큰 체계를 우회하지 않는다. 반복되는 값은
  `@theme` 토큰으로 승격한다.

## Reconsider when

HeroUI Native 또는 Uniwind가 유지보수를 멈추거나 Expo SDK 업그레이드를 막을 때,
고대비 접근성 대응이 제품 요구가 되어 native semantic color가 다시 필요할 때,
또는 HeroUI 밖 커스텀 컴포넌트가 계속 늘어 라이브러리 채택의 이유가 사라질 때
다시 결정한다.

## Still-rejected alternatives

- StyleSheet + native `ColorValue` 전면 유지 — 2026-08-05에 결정했으나 컴포넌트
  자작 유지비가 fidelity 이익을 넘는 것을 하루 만에 확인했다.
- HeroUI 층만 Uniwind, 채팅·커스텀 층은 StyleSheet로 남기는 2-시스템 hybrid.
- 색은 TS resolver, 배치는 Uniwind로 가르는 hybrid.
- NativeWind(v4 고정 또는 v5 preview) 채택.
- HeroUI 없이 Uniwind만 쓰고 컴포넌트 세트를 계속 자작하기 — 이 유지비가 이번
  결정의 출발점이다.
- 앱 안 테마 셀렉터, raw 색 병행, 화면별 `dark:` 하드코딩.

## Evidence worth preserving

- HeroUI Native v1.0.x는 Uniwind + Tailwind v4를 필수로 요구한다. `global.css`의
  `@import 'tailwindcss'; @import 'uniwind'; @import 'heroui-native/styles';`와
  `@source` 등록, 루트의 `GestureHandlerRootView` + `HeroUINativeProvider`
  래핑이 설치 계약이다.
- 테마는 CSS 변수(HSL)다. Uniwind CSS 변수 API는 native `ColorValue`를 보존하지
  못한다(2026-08-05 확인). 이 제약은 이제 회피 대상이 아니라 받아들인 비용이다.
- 배포된 peer 계약(v1.0.8): `react-native-reanimated` ^4.1.1,
  `react-native-gesture-handler` ^2.28.0, `react-native-worklets` >=0.5.1,
  `expo-blur` >=14, `react-native-screens` >=4, `@gorhom/bottom-sheet` ^5.2.9,
  `react-native-safe-area-context`, `react-native-svg`, `tailwind-variants`,
  `tailwind-merge`. 문서 quick-start 표보다 넓거나 많다 — 계약은 npm 메타데이터가
  원본이다.
- 2026-08-06 스파이크: RN 0.86·Expo 57·reanimated 4.5.0·worklets
  0.10.0·gesture-handler 2.32.0 조합으로 dev build가 성공했고 Button
  variant·Spinner 애니메이션·탭·앱 측 Tailwind 클래스가 시뮬레이터에서
  동작했다. 모노레포 호이스팅은 `@source "../../node_modules/heroui-native/lib"`로
  해결한다.
- 컴포넌트 목록·문서·테마 변수는 설치된 `heroui-native` 스킬 스크립트로
  가져온다.

근거:

- [HeroUI Native quick start](https://heroui.com/docs/native/getting-started/quick-start)
- [HeroUI Native theming](https://heroui.com/docs/native/getting-started/theming)
- [heroui-inc/heroui-native](https://github.com/heroui-inc/heroui-native)
- [Uniwind 문서](https://docs.uniwind.dev/llms.txt)
