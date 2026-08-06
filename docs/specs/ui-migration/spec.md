# UI Migration — HeroUI Native 채택과 surface 단위 이전

## 확정 결정

계약으로 승격된 내용은 각 파일이 원본이다. 이 스펙은 이전 작업의 범위만 담는다.

- 스타일 엔진·토큰:
  [heroui-uniwind-style-foundation](../../decisions/uniwind-css-theme.md) —
  RN 표면 전체 Uniwind, CSS `@theme` 단일 토큰 원본, TS `theme/` 폐기.
- 층 구조: [native-shell-with-heroui-content](../../decisions/apple-hig-with-app-theme.md)
  — 네이티브 셸 + HeroUI 브랜드 층, surface당 주 renderer 하나.
- surface 배정: [screen-renderer-boundaries](../../decisions/self-contained-native-ui-boundaries.md)
  — 배정 표 포함. 설정·온보딩·launch는 `@expo/ui` 유지로 이번 이전 대상이 아니다.
- 직접 만든 UI는 전부 제거한다. 커스텀은 HeroUI에 없는 능력을 HeroUI
  primitive·토큰 위에 확장할 때만 남는다. 결정 이유: native와 자작 UI의 시각
  sync 유지비 제거.

## 필요한 행동

- 기반을 먼저 놓는다: `heroui-native`·`uniwind`·`tailwindcss`와 필수
  peer(gesture-handler·`expo-blur` 신규, tailwind-variants·merge,
  `@gorhom/bottom-sheet`·`react-native-screens` — 문서와 달리 blur와
  bottom-sheet도 배포된 peer 계약에 포함된 정식 의존성이다) 설치,
  `global.css`와 Metro 연결(`withUniwindConfig`를 가장 바깥 래퍼로, 모노레포
  호이스팅 때문에 `@source "../../node_modules/heroui-native/lib"` 필요),
  루트 `GestureHandlerRootView` + `HeroUINativeProvider`, `@theme` 토큰 정의,
  navigation·`@expo/ui` bridge 연결. gesture-handler는 native 모듈이므로 dev
  build를 다시 만든다(`bun run ios`).
- surface 단위로 이전한다. 각 surface는 기존 라우팅·서버 상태·데이터 흐름을
  바꾸지 않고, 접근성(label·대비·Dynamic Type)·키보드·성능을 보존하며,
  agent-device 증거와 기존 jest 테스트로 검증한 뒤 이전 구현을 같은 태스크에서
  제거한다.
- 인증이 걸린 surface 검증은 `bun run auth:session`의 이메일 OTP 세션을 쓴다.
- 이전이 모두 끝나면 `theme/`(app-theme, colors, tokens, buttons,
  navigation-theme, product-colors)와 대체된 컴포넌트(loading-indicator·
  hosted-loading-indicator, launch 화면, profile-avatar, code-input,
  google-button, email-form, onboarding-form, `forms/` 입력 세트,
  nickname·username-edit-form 본문, episode 카드·dock·sheet 류)가 저장소에 남지
  않는다. bridge가 대체하는 navigation-theme만 새 형태로 존속하며, 이전이 끝나면
  `@expo/ui` 사용처는 Settings 화면 하나다.

## 가정 (반증 나오면 뒤집는 기본값)

- 이전 순서: ① 기반+스파이크(launch 화면을 첫 검증 표면으로) ② sign-in·이메일·
  OTP·온보딩 ③ 홈·에피소드 생성·결과·피드백 ④ 에피소드 대화·문장 질문
  ⑤ 프로필 편집 시트 본문 ⑥ 잔여 제거·정리.
- 채팅의 가상 목록은 `@legendapp/list`, 키보드는
  `react-native-keyboard-controller`를 유지하고 HeroUI로 대체하지 않는다.
- `components/symbols/`의 SF Symbol 래퍼는 native toolbar 쪽만 남기고, 브랜드 층
  아이콘은 HeroUI 관용을 따르며 surface 이전 때 개별 판정한다.

## 손대지 않는 것

- Settings 화면(grouped `Form`)과 셸 chrome(navigation·`formSheet`·toolbar).
  [settings-edits-use-native-form](../../decisions/settings-edits-use-native-form.md)의
  편집 interaction 결정(폐기·저장·중복만 danger·toolbar 규칙)은 renderer와
  무관하게 유지된다.
- 라우팅 구조, 서버 상태·데이터 흐름, API 계약, 인증 흐름.
- navigation chrome의 플랫폼 관용과 vendor 브랜드 외형 규격.

## 미결·리스크

- **worklets 충돌 — 해소(2026-08-06 스파이크 검증)**: 문서의 `^0.5.1`과 달리
  npm 배포 peer는 `>=0.5.1`이라 앱의 0.10.0이 충족한다. iPhone 17 Pro dev
  build에서 heroui-native 1.0.8 + uniwind 1.10.1 + tailwindcss 4.3.3이 RN
  0.86·Expo 57·reanimated 4.5.0·worklets 0.10.0·gesture-handler 2.32.0과 함께
  빌드됐고, Button variant 렌더링·Spinner 애니메이션(Reanimated 런타임)·탭
  상호작용(gesture-handler)·앱 측 Tailwind 클래스·접근성 role 노출까지
  확인했다. 스파이크 코드는 되돌렸고 기반 태스크가 같은 구성을 정식으로
  재수행한다.
- **InputOTP 검증 조건부**: iOS SMS AutoFill·붙여넣기·연속 입력이 현재
  code-input과 동등해야 채택. 실패 시 HeroUI 토큰 위 커스텀 유지(계약에 명시).
- **Dynamic Type·접근성**: HeroUI `Text`의 Dynamic Type 반응과 기본 대비는 기반
  태스크에서 확인하고, 앱 토큰 정의 시 4.5:1 대비를 검증한다.
- **채팅 상호작용 회귀**: streaming 중 스크롤·키보드·오류 배너 동작은
  [ai-chat-experience](../../decisions/ai-chat-experience.md) 계약 기준으로
  surface ④에서 재검증한다.
- **고대비·elevated dark 상실**: 받아들인 제약(계약 참조). 사용자 불만이
  관측되면 계약의 reconsider 조건으로 되돌아온다.

## 이연된 항목

- 제품 accent 등 실제 브랜드 팔레트 값 확정 — HeroUI 기본 테마로 시작하고 토큰
  파일 한 곳에서 갈아끼운다.
- Android 대응 — [supported-platforms](../../decisions/ios-only.md)에 따라
  Android 구현 시작 시 Material 쪽 표현을 판정한다.
