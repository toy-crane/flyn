# UI Migration — HeroUI Native 채택과 surface 단위 이전

## 확정 결정

계약으로 승격된 내용은 각 파일이 원본이다. 이 스펙은 이전 작업의 범위만 담는다.

- 스타일 엔진·토큰:
  [heroui-uniwind-style-foundation](../../decisions/uniwind-css-theme.md) —
  RN 표면 전체 Uniwind, CSS `@theme` 단일 토큰 원본, TS `theme/` 폐기.
- 층 구조: [native-shell-with-heroui-content](../../decisions/apple-hig-with-app-theme.md)
  — 네이티브 셸 + HeroUI 브랜드 층, surface당 주 renderer 하나.
- surface 배정: [screen-renderer-boundaries](../../decisions/self-contained-native-ui-boundaries.md)
  — 배정 표 포함. `@expo/ui`를 유지하는 화면은 Settings(grouped `Form`) 하나이고,
  launch·온보딩은 배정 표의 행에 따라 HeroUI로 이전한다. 프로필 게이트는 표에
  행이 없다 — "그 외 RN이 그리는 모든 화면의 기본 renderer는 HeroUI Native다"는
  같은 계약의 catch-all이 근거다.
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
  hosted-loading-indicator, launch 화면, code-input, google-button, email-form,
  onboarding-form, `forms/` 입력 세트, nickname·username-edit-form 본문,
  episode 카드·dock·sheet 류)가 저장소에 남지 않는다. bridge가 대체하는
  navigation-theme만 새 형태로 존속하며, 이전이 끝나면 `@expo/ui` 사용처는
  Settings 화면과 그 전용 컴포넌트(profile-avatar·native-symbol)뿐이다 —
  아바타는 Settings의 `Host` subtree 안에 서는 SwiftUI 노드라 HeroUI로 바꾸면
  그 화면이 깨진다.

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
- **InputOTP — 해소(2026-08-06 sign-in 태스크 판정)**: 연속 입력·hit
  testing·오류 상태는 통과했지만 붙여넣기에서 탈락했다. primitive가 밑단
  `TextInput`에 `maxLength`를 박고 공개 API에서 그 키를 빼 두어 장식 섞인 코드가
  `pasteTransformer` 이전에 잘린다. HeroUI 토큰 위 커스텀 `OtpInput`을 유지하며,
  근거와 재채택 조건은 screen-renderer-boundaries 계약에 있다.
- **Dynamic Type — 해소(2026-08-06 기반 태스크 확인)**: HeroUI의 `Text`는
  `Typography`로 이름이 바뀌었고(구 이름은 deprecated alias), 내부적으로 RN
  `Text`를 쓰므로 `allowFontScaling` 기본값을 그대로 따른다.
  `Typography.Paragraph`·`Typography.Heading`은 type에 맞는 iOS Dynamic Type
  ramp(`body`·`largeTitle` 등)까지 함께 건다. iPhone 17e에서 content size를
  `extra-small`에서 `accessibility-extra-extra-extra-large`까지 바꾸며 설정 오류
  화면 문구가 잘림 없이 줄바꿈으로 커지는 것을 확인했다. 다만 상한
  (`maxFontSizeMultiplier`)이 없고 launch 화면에는 스크롤이 없다 — 문구가 지금보다
  길어지면 최대 크기에서 넘칠 수 있다.
- **기본 대비 — HeroUI 기본 팔레트가 기준에 못 미치는 자리 여덟**: 사람이
  HeroUI 기본값 유지를 결정했으므로 값은 지금 바꾸지 않는다. 대신
  `scripts/style-foundation.test.ts`의 `앱이 소유하는 색 대비`가 미달 수치를
  **측정값 그대로 고정**한다 — 아래 수치를 움직이는 변경은 문단이 아니라
  실패하는 테스트로 먼저 나타난다. 기준은 둘이고 자리마다 다르다: 글자는 WCAG
  1.4.3의 4.5:1, 뜻을 나르는 아이콘·도형은 1.4.11의 3:1이다.

  | 자리 | 역할 | 기준 | light | dark |
  | --- | --- | --- | --- | --- |
  | `components/chat/chat-conversation.tsx:218` — `text-success` | 본문 글자 | 4.5 | 2.01 | 9.26 |
  | `components/chat/message-mark.tsx:38-43` — 맨 `checkmark` | 아이콘 단독("그대로 잘 통했어요") | 3 | 2.01 | 9.26 |
  | `components/profile/username-edit-form.tsx:123-128` — `checkmark-circle` | 아이콘 단독(가용) | 3 | 2.19 | 8.08 |
  | `app/onboarding/username.tsx:224-229` — 같은 아이콘 | 아이콘 단독(가용) | 3 | 2.19 | 8.08 |
  | `app/sign-in/code.tsx:201/208/214` — `text-danger` | 본문 글자 | 4.5 | 3.27 | 4.55 |
  | `app/settings/index.tsx:213` — `계정 삭제` | 본문 글자 | 4.5 | 3.57 | 3.97 |
  | `app/episodes/new.tsx:102`·`app/episodes/result.tsx:170`·`:360`·`app/episodes/feedback.tsx:128`·`app/sign-in/code.tsx:142`·`components/chat/chat-markdown.tsx:64`·`components/profile/profile-unavailable.tsx:62` — `text-accent` | 본문 글자 | 4.5 | 3.38 | 5.51 |
  | `app/index.tsx:103` — 카드 안 `text-accent` | 본문 글자 | 4.5 | 3.68 | 4.81 |

  미달 칸은 light 여덟과 dark 하나다. danger 쪽 셋(code.tsx light, `계정 삭제`
  light·dark)은 3:1을 넘으므로 **아이콘이었다면 통과**하고 글자이기 때문에
  떨어진다. accent 쪽 둘(표의 아래 두 행, 모두 light)도 같은 이유다 —
  3.38·3.68로 도형 기준은 넘고 글자라서 떨어진다. success 쪽 넷(표의 위 네 행,
  모두 light)은 두 기준 모두 미달이다. `계정 삭제`는 이번 이전에서 5.38 → 3.57로 **후퇴**했다 —
  폐기된 TS `product-colors`가 4.5:1이 나오는 값(#D70015·#1F7A35)을 고르고
  `scripts/theme-contrast.test.ts`가 그것을 지켰는데, HeroUI 기본값은 light
  `danger` #FF383C, light `success` #17C964다.

  화면 하나에 매이지 않아 표에 없지만 같이 올려야 하는 것: light `muted`(#71717a)를
  `background`(#f5f5f5) 위에 놓으면 4.43:1로 본문 기준에 살짝 못 미친다. 자리가
  특정 화면이 아니라 header subtitle·launch 사유·프로필 게이트 등 보조 설명
  전반이라 토큰 수준으로 적는다(dark `muted`는 7.72:1, `foreground`는 light
  16.25:1로 여유가 있다). 가드는 이것도 함께 고정한다.

  실패가 **아닌** 자리: `components/episode/goal-dock.tsx:38`,
  `app/episodes/result.tsx:79`, `components/chat/chat-conversation.tsx:205`는
  success를 **채움**으로 쓰고 그 위에 `success-foreground` 글리프를 얹어
  8.08:1이며, 채워짐/비어 있음이라는 모양이 상태를 따로 나른다. 아이디 필드의
  중복 아이콘(danger on field)도 3.57·3.97로 아이콘 기준을 넘는다. accent를
  **도형**으로 쓰는 자리도 마찬가지다 — `app/index.tsx:159`의 점,
  `components/episode/goal-dock.tsx:57`의 링, `app/episodes/new.tsx:133`의 선택
  외곽선, `components/sign-in/otp-input.tsx:53`의 활성 칸 테두리는 같은 3.38·3.68로
  1.4.11의 3:1을 넘는다. 위 표에 accent가 오르는 것은 **글자로 칠할 때**뿐이다.

  색과 모양만으로 뜻을 나르지 않는 규칙이 살아 있어 정보는 잃지 않지만 대비
  기준은 미달이다. 아래 이연 항목의 브랜드 팔레트 값을 확정할 때 `global.css`
  한 곳에서 올리고, 그때 가드에 고정된 수치를 함께 갱신한다.
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
