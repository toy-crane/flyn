# 미니멀 테마와 네이티브 앱 셸

## 상태

- 이 문서는 구현 스펙이다.
- 앱 코드와 데이터베이스는 이 스펙에서 변경하지 않는다.
- 첨부된 네 장의 화면은 **시각적 방향**만 참조한다. Slate의 일기·음성·리뷰
  기능과 문구는 Flyn에 복사하지 않는다.

## 목적

현재 인증·프로필·계정 흐름은 유지하면서 앱 전체를 다음 인상으로 통일한다.

- 검정에 가까운 배경과 한 단계 밝은 중립 surface
- 흰색 주요 글자와 회색 보조 글자의 분명한 위계
- 얇고 낮은 대비의 경계
- 큰 여백, 적은 장식, 한 화면에 적은 정보
- 앱이 흉내 낸 iOS가 아니라 실제 iOS navigation과 control

테마 값은 기존 결정대로 Uniwind CSS가 한 번만 소유한다. React Native 화면,
Expo Router navigation, `@expo/ui`가 각각 다른 팔레트를 만들지 않는다.

이 스펙은 다음 결정 위에 선다.

- [iOS 전용](../../decisions/ios-only.md)
- [Apple HIG와 앱 소유 테마](../../decisions/apple-hig-with-app-theme.md)
- [새 화면은 @expo/ui가 기본](../../decisions/expo-ui-by-default.md)
- [Uniwind CSS 앱 테마](../../decisions/uniwind-css-theme.md)
- [Uniwind CSS 테마 스펙](../uniwind-css-theme/spec.md)

## 용어

이 문서에서 상단 navigation은 다음 용어를 쓴다.

| 맥락 | 사용할 용어 | 뜻 |
| --- | --- | --- |
| 제품·디자인 | native navigation bar | iOS가 제공하는 상단 navigation 영역 |
| iOS 구현 | `UINavigationBar` | 실제 UIKit navigation bar |
| Expo Router 구현 | native stack header | `Stack`이 만드는 네이티브 header |
| 우측 action | native toolbar item | `Stack.Toolbar`에 등록하는 네이티브 버튼 |

`custom header`, `custom navigation bar`는 RN `View`로 상단을 직접 그릴 때만 쓴다.
이번 앱 셸에는 custom header를 만들지 않는다.

## 전체 구조

```text
Expo Router native stack header
  ├─ system back button + edge-swipe gesture
  ├─ native inline title
  └─ native toolbar action

Screen content
  ├─ RN       → Uniwind semantic className
  └─ @expo/ui → native defaults + CSS variable bridge

Single color source
  └─ global.css의 --app-* light/dark variables
```

상단 header와 본문은 같은 배경·foreground 값을 쓰지만 책임은 나뉜다. header의
레이아웃·back button·gesture·Liquid Glass 표현은 iOS가 소유하고, 앱은 title과
시맨틱 색만 전달한다.

## 시각 원칙

### 색

dark mode가 첨부 화면의 기준 표현이다. light mode는 같은 역할을 반전한 중립
표현이며, 앱 안에 appearance 선택기는 만들지 않고 시스템 설정을 따른다.

| 역할 | light 제안값 | dark 제안값 | 용도 |
| --- | --- | --- | --- |
| background | `#F7F7F5` | `#000000` | 화면과 native header |
| surface | `#FFFFFF` | `#1C1C1E` | grouped row, 입력, 강조 영역 |
| foreground | `#171719` | `#F5F5F7` | 제목, 본문, 주요 값 |
| muted foreground | `#6E6E73` | `#98989D` | 설명, metadata, section title |
| disabled foreground | `#8E8E93` | `#636366` | 비활성 라벨 |
| placeholder | `#8E8E93` | `#636366` | 입력 placeholder |
| border | `#D1D1D6` | `#38383A` | card 경계, separator |
| primary | `#171719` | `#FFFFFF` | focus, tint, 주요 action |
| primary foreground | `#FFFFFF` | `#000000` | 채운 action의 라벨 |
| disabled surface | `#E5E5EA` | `#2C2C2E` | 비활성 custom control |
| overlay | `rgba(0,0,0,.18)` | `rgba(0,0,0,.62)` | 처리 중 화면 막 |
| danger | `#D70015` | `#FF453A` | 오류와 파괴 action |
| success | `#248A3D` | `#32D74B` | 성공 상태가 꼭 필요할 때 |

구현 전에 WCAG 대비를 다시 계산한다. 수치가 실패하면 역할과 인상은 유지하되
값을 조정한다.

### 타이포그래피

- 시스템 폰트만 쓴다.
- native header title은 inline 크기와 medium 수준의 무게를 유지한다.
- 화면의 가장 큰 제목은 34pt 안팎, `semibold`, 촘촘한 자간을 기준으로 한다.
- 본문은 17pt, 보조 문구는 13–15pt를 기준으로 한다.
- section title은 보조색을 쓰되 모두 대문자로 만들거나 과한 letter spacing을
  주지 않는다.
- Dynamic Type에서 글자가 잘리지 않고 행 높이가 늘어나야 한다.

### 면과 경계

- 한 화면에서 surface 계층은 background와 surface 두 단계만 쓴다.
- card는 필요한 정보 묶음에만 사용한다. 장식용 빈 card를 만들지 않는다.
- 일반 card radius는 20–24pt, input과 작은 control은 12–16pt를 기준으로 한다.
- border는 1 physical pixel 수준의 낮은 대비만 사용한다.
- 그림자는 기본적으로 쓰지 않는다. 깊이는 여백, surface, native material로
  표현한다.
- 화면 좌우 여백은 20–24pt, 큰 섹션 간격은 28–36pt를 기준으로 한다.

## native stack header 계약

### 공통

- 모든 push 화면은 Expo Router `Stack`의 native stack header를 사용한다.
- 직접 그린 원형 back button, 상단 `View`, absolute title을 만들지 않는다.
- 뒤로가기는 system back button과 edge-swipe gesture를 그대로 제공한다.
- header hairline은 숨기고 header background는 화면 background와 연결한다.
- header tint와 title foreground는 CSS 테마에서 읽는다.
- iOS가 제공하는 Liquid Glass와 scroll-edge 전환을 앱이 복제하거나 덮지 않는다.
- 우측 설정 같은 action은 RN 버튼을 header에 얹지 않고 `Stack.Toolbar`의 native
  toolbar item으로 등록한다.

### 라우트별

| 라우트 | header | title | leading | trailing |
| --- | --- | --- | --- | --- |
| `/` | 표시 | `flyn` | 없음 | native 설정 action |
| `/settings` | 표시 | `설정` | system back | 없음 |
| `/settings/display-name` | 표시 | `표시 이름` | system back | 없음 |
| `/onboarding` | 표시 | `이름 정하기` | 없음 | 필요할 때만 text action |
| `/sign-in` | 숨김 | 본문 wordmark 사용 | 없음 | 없음 |
| `/sign-in/email` | 표시 | `이메일` | system back | 없음 |
| `/sign-in/code` | 표시 | `인증 코드` | system back | 없음 |

root sign-in에서 header를 숨기는 이유는 돌아갈 화면과 toolbar action이 없기
때문이다. 나머지 화면에서 header를 숨기고 본문에 유사 navigation을 다시 그리는
것은 허용하지 않는다.

## 화면별 적용

### 홈

- walking skeleton 설명, API health, `scratch_notes`, server stats card를 제거한다.
- 제품 도메인이 확정되지 않은 상태에서 첨부 화면의 일기 데이터를 모방하지 않는다.
- 이번 단계의 홈은 표시 이름을 사용한 짧은 인사와 최소한의 빈 상태까지만 둔다.
- 설정 진입은 header 우측 native toolbar item 하나로 제공한다.
- 본문은 큰 제목, 짧은 보조 문구, 넓은 빈 공간을 유지한다.

### 로그인

- header 없는 root 화면에 `flyn` wordmark와 한 줄 설명만 둔다.
- Apple과 Google 버튼은 각 브랜드가 허용한 appearance를 유지한다.
- 이메일 진입은 두 소셜 버튼과 경쟁하는 별도 card로 만들지 않는다.
- 로딩은 기존 라벨을 바꾸지 않고 interaction을 막는 최소 overlay로 표현한다.

### 이메일과 인증 코드

- push 화면이므로 native stack header와 system back을 사용한다.
- 설명 → 입력 → 오류 → primary action 순서의 한 열 구조를 유지한다.
- 인증 코드 slot은 surface, border, primary, danger 역할만 사용한다.
- 비활성 primary action은 opacity가 아니라 disabled surface와 disabled
  foreground로 표현한다.

### 온보딩과 표시 이름

- 같은 `DisplayNameForm`을 계속 공유한다.
- `@expo/ui`의 TextInput과 Button은 native 크기·상태·Dynamic Type을 유지한다.
- background와 interactive tint만 공통 CSS 테마에서 전달한다.
- 장식용 card나 별도 custom input을 만들지 않는다.

### 설정

- 첨부 화면의 visual grammar만 사용하고 Reminder·Transcription·Subscription
  항목은 복사하지 않는다.
- 현재 실제 기능인 표시 이름, 이메일, 로그아웃, 계정 삭제만 유지한다.
- `@expo/ui`의 native grouped form과 section을 사용한다.
- section title은 muted foreground, 행의 주요 label은 foreground, trailing
  value는 muted foreground로 구분한다.
- 계정 삭제만 danger 역할을 사용하고, 확인은 native alert로 유지한다.

### launch와 오류 상태

- background 위 중앙 정렬된 native progress 또는 짧은 오류 문구만 둔다.
- 프로필 조회 실패·누락 상태의 복구 action은 유지한다.
- 새 illustration, 로고 animation, 별도 card를 추가하지 않는다.

## renderer별 테마 적용

### React Native

- 앱 소유 색은 `bg-background`, `bg-surface`, `text-foreground`,
  `text-muted-foreground`, `border-border` 같은 시맨틱 class만 사용한다.
- `slate`, `gray`, `sky`, `rose`, `emerald`처럼 색상값을 암시하는 utility와
  앱 색을 위한 화면별 `dark:` 분기를 남기지 않는다.
- `style={{ color: ... }}`는 class color prop이 없는 native API 경계에서만 쓴다.

### Expo Router

- `contentStyle`, `headerStyle`, `headerTintColor`, React Navigation theme가
  필요로 하는 값은 `useCSSVariable()`로 `--app-*`를 읽는다.
- JS에 별도 light/dark palette를 만들지 않는다.
- header 옵션은 root layout 한 곳에서 기본값을 정하고, route는 title과 표시
  여부 같은 차이만 선언한다.

### `@expo/ui`

- native 기본색과 계층 표현이 역할을 충족하면 명시하지 않는다.
- `Host`의 background, `seedColor`, 명시적인 danger foreground처럼 필요한
  값만 `useCSSVariable()`로 전달한다.
- `Host.colorScheme`은 강제하지 않고 시스템 appearance를 따른다.
- `Host` subtree 안에서 Uniwind `className`이 적용된다고 가정하지 않는다.

## 테스트용 기능 제거 범위

구현 단계에서 다음 walking skeleton 표면을 함께 제거한다.

- 모바일의 `HealthStatus`, `ScratchNotes`, `ServerStats`, 공용 test card
- 위 컴포넌트의 단위 테스트와 query key
- `/server/scratch-notes/stats` API와 해당 route test
- `scratch_notes` 선언적 schema, RLS test, seed fixture, 생성 타입
- 이미 적용된 환경을 위한 `scratch_notes` drop migration
- README와 glossary의 현재 기능처럼 읽히는 walking skeleton 설명

다음은 테스트용 기능이 아니므로 유지한다.

- API 운영 확인용 `/health` endpoint
- Apple·Google·이메일 인증
- 비공개 프로필과 표시 이름 온보딩
- 로그아웃과 계정 삭제
- auth/profile의 오류·복구 화면

## 접근성

- 모든 tappable target은 최소 44×44pt다.
- icon-only toolbar item에는 한국어 accessibility label을 준다.
- Dynamic Type의 큰 접근성 크기에서 title, form, setting row를 확인한다.
- VoiceOver 순서는 header → 설명 → 입력/행 → action 순이어야 한다.
- 색만으로 오류·비활성·파괴 action을 구분하지 않는다.
- Reduce Motion과 Increase Contrast에서 native control의 기본 대응을 막지 않는다.
- 앱이 직접 소유하는 foreground/background 조합은 WCAG AA를 만족해야 한다.

## 검증 매트릭스

구현 완료 판정에는 정적 검사와 실제 iOS 시뮬레이터 확인이 모두 필요하다.

| 상태 | 확인할 화면 |
| --- | --- |
| light | sign-in, email, code, onboarding, home, settings, display name |
| dark | sign-in, email, code, onboarding, home, settings, display name |
| navigation | home → settings → display name의 back button과 edge swipe |
| keyboard | email, code, display name의 focus·inset·return action |
| accessibility | 큰 Dynamic Type, VoiceOver label, 44pt target |
| loading/error | launch, auth failure, profile failure, account deletion overlay |

시각 검증에서는 다음을 별도로 본다.

1. native header와 본문 background 사이에 색 띠나 hairline이 없는가.
2. 커스텀 back button이 남아 있지 않은가.
3. dark mode에서 surface가 검정에 묻히지 않고 border가 과하게 밝지 않은가.
4. light mode가 단순한 색 반전이 아니라 같은 정보 위계를 유지하는가.
5. Apple·Google branding이 앱의 흑백 팔레트로 오염되지 않았는가.

## 완료 조건

1. 모든 실제 화면이 같은 semantic theme을 소비한다.
2. push 화면의 상단은 native stack header이고 custom header가 없다.
3. 홈의 설정 action은 native toolbar item이다.
4. `@expo/ui`와 RN 화면의 background·foreground·action 역할이 일치한다.
5. 첨부 화면의 미니멀한 밀도와 위계를 따르되 Slate 기능과 문구를 복사하지 않는다.
6. walking skeleton UI, API, DB surface가 제거되고 실제 인증·프로필 기능은 남는다.
7. light/dark와 접근성 검증을 통과한다.
8. `bun run check`, Supabase reset·RLS test, iOS development build가 통과한다.

## 범위 밖

- 일기, 음성 녹음, 주간 리뷰 같은 새 제품 기능
- 첨부 화면의 정보 구조와 문구 복제
- 앱 내부 appearance 선택기
- Android와 web 대응
- 자체 navigation bar나 디자인 시스템 컴포넌트 라이브러리
- Apple·Google 브랜드 버튼 재디자인

## 구현 순서

1. `global.css`에 시맨틱 light/dark 값을 정의하고 navigation·`@expo/ui` 브리지를
   만든다.
2. root layout의 native stack header 기본값과 route별 title을 정리한다.
3. walking skeleton UI와 backend·DB 표면을 제거한다.
4. 홈을 최소 상태로 교체하고 실제 화면을 renderer 계약에 맞춰 마이그레이션한다.
5. 정적 검사 뒤 시뮬레이터에서 검증 매트릭스를 수행한다.

각 단계는 별도 논리 커밋으로 남기며, 이 스펙 승인 전에는 구현하지 않는다.
