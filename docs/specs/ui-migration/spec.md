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
  peer(gesture-handler 신규, tailwind-variants·merge, BottomSheet용
  `@gorhom/bottom-sheet`·`react-native-screens`) 설치, `global.css`와 Metro 연결,
  루트 `GestureHandlerRootView` + `HeroUINativeProvider`, `@theme` 토큰 정의,
  navigation·`@expo/ui` bridge 연결. gesture-handler는 native 모듈이므로 dev
  build를 다시 만든다(`bun run ios`).
- surface 단위로 이전한다. 각 surface는 기존 라우팅·서버 상태·데이터 흐름을
  바꾸지 않고, 접근성(label·대비·Dynamic Type)·키보드·성능을 보존하며,
  agent-device 증거와 기존 jest 테스트로 검증한 뒤 이전 구현을 같은 태스크에서
  제거한다.
- 인증이 걸린 surface 검증은 `bun run auth:session`의 이메일 OTP 세션을 쓴다.
- 이전이 모두 끝나면 `theme/`(app-theme, colors, tokens, buttons,
  navigation-theme, product-colors)와 대체된 컴포넌트(loading-indicator,
  profile-avatar, code-input, google-button, email-form, episode 카드·dock·sheet
  류)가 저장소에 남지 않는다. bridge가 대체하는 navigation-theme만 새 형태로
  존속한다.

## 가정 (반증 나오면 뒤집는 기본값)

- 이전 순서: ① 기반+스파이크 ② sign-in·이메일·OTP ③ 홈·에피소드
  생성·결과·피드백 ④ 에피소드 대화·문장 질문 ⑤ 잔여 제거·정리.
- 채팅의 가상 목록은 `@legendapp/list`, 키보드는
  `react-native-keyboard-controller`를 유지하고 HeroUI로 대체하지 않는다.
- `components/symbols/`의 SF Symbol 래퍼는 native toolbar 쪽만 남기고, 브랜드 층
  아이콘은 HeroUI 관용을 따르며 surface 이전 때 개별 판정한다.

## 손대지 않는 것

- `@expo/ui` surface(Settings·프로필 편집 시트·온보딩·launch progress)와
  [settings-edits-use-native-form](../../decisions/settings-edits-use-native-form.md)
  계약 전체.
- 라우팅 구조, 서버 상태·데이터 흐름, API 계약, 인증 흐름.
- navigation chrome의 플랫폼 관용과 vendor 브랜드 외형 규격.

## 미결·리스크

- **worklets 충돌(최우선)**: 앱 0.10.0 vs HeroUI peer `^0.5.1`. Reanimated
  4.5는 0.10.0을 요구하므로 둘이 동시에 만족되지 않을 수 있다. 기반 태스크
  스파이크에서 확인하고, 실패하면 HeroUI 버전·Reanimated 하향·이슈 트래커를
  검토한 뒤 채택 여부를 다시 보고한다.
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
