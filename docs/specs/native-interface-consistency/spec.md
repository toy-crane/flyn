# Native interface 일관성 정리와 전체 화면 UI audit

2026-08-04에 현재 HEAD `2271da4`를 iPhone 17 · iOS 26.5 시뮬레이터에서 직접
확인하고, 구현된 route와 guard state의 source를 함께 읽어 정리했다. 이 문서는
새 renderer migration을 제안하는 문서가 아니다. 이미 선택한 Universal-first
경계에서 **앱 의미와 iOS 표면의 소유권을 섞지 않고**, 실제로 손볼 UI만 고르는
문서다.

## 원하는 결과

- RN과 Universal이 같은 제품 의미를 쓰되 화면 종류가 다른 표면까지 같은 hex로
  강제하지 않는다.
- iOS가 아는 `Form`·`List`·sheet·navigation·alert는 native background,
  material, hierarchy와 interaction을 유지한다.
- iOS가 모르는 제품 상태와 RN canvas만 flyn의 semantic color를 쓴다.
- 구현된 모든 route와 중요한 상태가 light/dark, keyboard, Dynamic Type와
  accessibility setting에서 끊김 없이 이어진다.
- 현재 화면에서 확인한 문제와 이미 승인된
  [닉네임·아이디 스펙](../onboarding-nickname-and-id/spec.md)이 해결할 문제를
  중복 구현하지 않는다.

## B안: 소유권 경계

**flyn이 의미를 소유하고, iOS가 native surface를 소유한다.** 시각적 일관성은
모든 배경이 같은 색이라는 뜻이 아니라, 사용자가 같은 의미와 위계를 같은 방식으로
읽을 수 있다는 뜻이다.

| 자리 | 소유자 | 적용 |
| --- | --- | --- |
| RN background·surface·text·bubble | flyn | `global.css`의 `--app-*`를 semantic `className`으로 쓴다 |
| 앱 tint | flyn | `Host.seedColor={app.primary}`로 native control에 전달한다 |
| success·danger 같은 제품 상태 | flyn | iOS가 상태 의미를 모르는 자리에만 명시하고 아이콘·문구를 함께 둔다 |
| `Form`·`List`·sheet의 background와 material | iOS | 기본값을 유지하고 앱 background로 다시 칠하지 않는다 |
| native label·secondary label·separator | iOS | API가 의미를 아는 한 색 prop을 생략한다 |
| navigation·back gesture·alert·keyboard | iOS | native stack과 system presentation을 유지한다 |
| Apple·Google sign-in surface | 각 vendor | 공식 light/dark appearance와 label을 다시 만들지 않는다 |

따라서 아래처럼 판단한다.

- RN 채팅 목록의 `#F7F7F5`와 설정 `Form`의 grouped gray가 달라도 정상이다. 하나는
  콘텐츠 canvas이고 다른 하나는 설정 hierarchy다.
- RN의 전송 버튼과 Universal control은 `primary`라는 같은 의미를 공유할 수 있다.
  Universal 쪽 버튼 배경 모양과 pressed/disabled appearance는 iOS가 정한다.
- username availability는 제품이 만든 상태라 `success`를 넘길 수 있다. 반면
  평범한 `Form` label은 `foreground`를 넘겨 맞추지 않는다.
- `presentationBackground(app.background)`는 기술적으로 가능해도 native sheet를
  RN 화면과 맞추는 목적에는 쓰지 않는다.

이 경계의 장기 계약은
[Apple HIG와 앱 테마](../../decisions/apple-hig-with-app-theme.md), bridge 규칙은
[Uniwind와 앱 색](../../decisions/uniwind-css-theme.md)이 소유한다.

## audit 범위와 증거 수준

같은 화면 이름이라도 renderer와 상태가 다르므로 route만 세지 않았다.

- **runtime 확인**: simulator에서 실제 화면을 열고 light/dark와 keyboard 상태를
  확인했다.
- **source 확인**: 실패나 missing처럼 데이터를 깨뜨려야만 나오는 상태는 route,
  guard와 test를 읽었다. runtime 확인으로 과장하지 않는다.
- **예정 화면**: 아직 제품 코드가 없는 닉네임·아이디 설정 sheet는 승인된 spec과
  2026-08-04 spike evidence를 확인했다.

검수용 screenshot은 임시 evidence이며 제품 저장소에는 넣지 않는다.

## 전체 화면 판정

| 화면·상태 | renderer | 확인 | 판정과 조치 |
| --- | --- | --- | --- |
| launch session 확인·실패 | Universal | source·test | native progress와 짧은 복구 action을 유지한다. 별도 개선 없음 |
| profile 조회 실패·missing | RN | source·test | guard surface이고 renderer seam이 노출되지 않는다. 카피·action 구조 유지 |
| root sign-in | RN + vendor button | light/dark runtime | 하단 action hierarchy와 vendor appearance가 자연스럽다. Apple 영문 label은 primary OS language가 영어인 simulator의 공식 label이라 custom 한국어 button으로 바꾸지 않는다 |
| 이메일 입력 | Universal | light/dark·keyboard runtime | native field·keyboard·하단 submit은 자연스럽다. 다만 back button의 접근성 이름이 route 이름 `sign-in/index`로 노출된다 |
| OTP | RN | dark·numeric keyboard runtime | 6칸 input과 system keyboard가 자연스럽다. 긴 이메일이 안내 문장 중간에서 한 글자짜리 둘째 줄을 만들어 읽기 흐름이 나쁘다 |
| 현재 이름 온보딩 | Universal | light/dark·keyboard runtime | 시작 CTA와 keyboard는 안정적이다. 한 값만 받고 비공개라고 설명하는 현재 흐름은 닉네임·아이디 스펙이 교체하므로 별도 polish하지 않는다 |
| 채팅 목록 loading·error | RN | source·test | 기존 retry/refresh 상태를 유지한다. 장애를 만들기 위한 runtime state injection은 하지 않았다 |
| 채팅 목록 empty | RN | light runtime | native header 아래의 설명과 첫 action 위계가 명확하다. 개선 없음 |
| 채팅 목록 populated | RN | light/dark runtime | system header와 RN row가 하나의 목록처럼 읽힌다. 2줄 title 정책 유지 |
| 새 채팅 empty | RN | light runtime | 본문 empty copy와 material composer 경계가 자연스럽다. 개선 없음 |
| 채팅 상세 populated | RN | light runtime | full-width AI response, user bubble, system header가 일관된다. composer 아래로 이어지는 content inset은 keyboard·streaming 회귀 검수 대상으로 유지 |
| 채팅 상세 keyboard·맨 아래로 | RN | light runtime | keyboard 위 composer와 scroll-to-bottom affordance가 안정적이다. 개선 없음 |
| 채팅 상세 streaming·중단·실패 | RN | source·test | 기존 AI chat 결정 계약의 상태 구조를 유지한다. 이번 audit에서 runtime network failure는 만들지 않았다 |
| 설정 | Universal | light/dark runtime | grouped `Form`, native alert와 destructive hierarchy가 가장 iOS답다. header의 email 중복은 닉네임·아이디 스펙이 해결한다 |
| 현재 표시 이름 편집 | Universal | light·keyboard runtime | 하단 저장 CTA가 keyboard 뒤에 대부분 가려진다. 이 route는 승인된 스펙에서 삭제되고 native sheet toolbar로 교체되므로 현 route를 따로 고치지 않는다 |
| 로그아웃·계정 삭제 확인 | native alert | light runtime | material, hierarchy, destructive copy가 적절하다. 개선 없음 |
| 예정 닉네임·아이디 설정 sheet | Universal | spec·spike | 앱 background override를 제거하고 iOS grouped surface를 유지한다. dark·contrast·alert·Dynamic Type 검수가 필요하다 |

## 선택한 개선

### P0 — 예정 설정 sheet에서 native surface를 다시 칠하지 않는다

기존 닉네임·아이디 스펙은 `presentationBackground(app.background)`와
`scrollContentBackground('hidden')`으로 iOS `.systemGroupedBackground`를
`#F7F7F5`에 맞추도록 되어 있었다. 기술 spike는 modifier가 동작한다는 사실만
증명한다. B안에서는 그 차이가 renderer seam이 아니라 설정 hierarchy이므로 제품
구현에 넣지 않는다.

완료 조건:

- 닉네임·아이디 `BottomSheet`에 앱 background를 맞추기 위한 두 modifier가 없다.
- sheet와 `Form`은 light/dark의 native grouped background, section card,
  separator와 material을 유지한다.
- `Host.seedColor`는 control tint에만 연결되고 native surface 값의 복사본을
  `global.css`에 추가하지 않는다.
- success·danger는 username 상태처럼 iOS가 모르는 제품 의미에만 쓴다.

이 선택은 이미 닉네임·아이디 스펙과 관련 결정 계약에 반영했다.

### P1 — explicit success의 light 대비를 확보한다

현재 `--app-success: #248A3D`는 흰 surface에서 4.40:1, 앱 background에서
4.10:1이다. 향후 username 상태를 작은 텍스트로 표시하면 4.5:1 기준에 못 미친다.
dark `#32D74B`는 현재 surface에서 충분하다.

구현 동작:

- light success를 `#1F7A35`로 바꾼다. 흰 surface에서 5.39:1, 앱 background에서
  5.03:1이다.
- success를 작은 일반 텍스트로 쓰는 모든 foreground/background pair를 4.5:1
  이상으로 검증한다.
- username 가용성은 색만 쓰지 않고 `checkmark`와 접근성 문구를 같이 둔다.
- `danger`, muted text와 실제 입력 placeholder도 같은 검사 표에 넣는다. placeholder는
  유일한 label로 쓰지 않으며, Increase Contrast에서 읽을 수 있는지 별도로 본다.

완료 조건:

- semantic token test가 light/dark의 명시적 일반 텍스트 pair가 4.5:1 미만이면
  실패한다.
- 닉네임·아이디 sheet의 실제 native background 위에서 success·danger를 다시
  측정한다.

### P1 — native sheet를 상태별로 한 번씩 검수한다

현재 spike가 확인한 것은 iOS 26.5 light의 기본 구조와 keyboard 안정성이다. 아래는
구현 완료 전에 빠지면 안 되는 visual acceptance matrix다.

| 조건 | 닉네임 sheet | 아이디 sheet |
| --- | --- | --- |
| light·dark | grouped surface, field, footer, glass control | default·checking·available·duplicate·recommendation |
| keyboard | field와 toolbar가 가려지지 않음 | Latin keyboard, autocapitalization·autocorrection 꺼짐 |
| Dynamic Type | 긴 규칙 footer와 title이 잘리지 않음 | 긴 아이디·추천·상태 문구가 겹치지 않음 |
| Increase Contrast | native material은 system adaptation 유지 | explicit success·danger가 충분히 구분됨 |
| Reduce Transparency | toolbar control을 알아볼 수 있음 | 상태와 저장 가능 여부가 material에만 의존하지 않음 |
| presentation | pull-down·xmark는 입력 폐기 | 저장 중 progress, 저장 실패 alert, duplicate race |
| 지원 하한 iOS | circle glass fallback이 usable | 같은 기능과 hit target 유지 |

성공 기준은 RN background와 같은 색이 되는 것이 아니다. native hierarchy가 유지되고,
제품 상태만 light/dark 모두에서 분명한 것이다.

### P2 — 이메일 화면 back button의 접근성 이름을 `로그인`으로 고친다

시각적으로는 minimal chevron만 보이지만 accessibility tree에는 이전 route 이름인
`sign-in/index`가 button label로 노출된다. 구현은 native back gesture와 button을
그대로 유지하고, 이전 화면의 의미만 `로그인`으로 제공한다.

완료 조건:

- 이메일 화면의 back button을 VoiceOver가 `로그인, 뒤로 버튼`에 해당하는 의미로
  읽는다. route path를 읽지 않는다.
- OTP 화면은 현재처럼 `이메일`을 이전 화면으로 읽는다.
- minimal appearance와 swipe-back gesture는 바뀌지 않는다.

### P2 — OTP 안내에서 이메일을 문장과 분리한다

현재 `{email}로 보낸 6자리 코드를 입력해 주세요.` 한 문장은 긴 주소에서 마지막
조사가 한 글자짜리 둘째 줄로 밀린다. 이메일은 길이가 사용자 데이터라 줄 길이를
예측할 수 없다.

구현 동작:

- 첫 줄은 `6자리 코드를 입력해 주세요.`로 고정한다.
- 이메일 주소는 다음 줄에 별도 muted text로 놓고 자연스럽게 wrap한다. 주소를
  줄이거나 ellipsis로 숨기지 않는다.
- VoiceOver 순서는 안내 뒤 이메일이며, 전체 주소를 읽을 수 있다.
- resend, invalid code, pending 구조와 code input 위치는 유지한다.

완료 조건:

- 40자 이메일과 가장 큰 접근성 Dynamic Type에서 주소·코드 6칸·resend action이
  서로 겹치지 않는다.
- 작은 화면에서도 안내가 navigation title이나 code input 아래로 잘리지 않는다.

## 별도 작업으로 만들지 않는 것

- **현재 표시 이름 편집 CTA**: keyboard 뒤에 가려지지만 곧 삭제될 route다. 같은
  화면을 고친 뒤 버리는 대신 닉네임·아이디 native sheet toolbar를 검수한다.
- **설정 header의 email 중복과 `표시 이름` 용어**: 닉네임·아이디 스펙이 이미
  nickname + `@아이디`, email 한 행으로 교체한다.
- **현재 한 단계 온보딩**: 승인된 두 단계 흐름이 교체한다.
- **Apple button 영문 label**: 확인한 simulator의 primary OS language가
  `en-KR`이고 공식 system button이 그 locale을 따른 결과다. custom 한국어 Apple
  button을 만들지 않는다. 한국어가 primary인 실제 기기에서 공식 label을 한 번
  확인한다.
- **RN과 설정 Form의 배경 통일**: B안이 의도적으로 기각한다.
- **새 전역 spacing·typography·radius token**: 반복 문제 증거가 없고 앱 테마의
  범위가 아니다.
- **Swift 코드나 custom native module**: Universal API와 기존 RN 경계 안에서 모두
  해결 가능하다.

## 구현 순서

1. semantic success 대비와 contrast regression check를 넣는다.
2. 이메일 back 접근성 이름과 OTP 안내 layout을 고친다.
3. 닉네임·아이디 스펙을 구현할 때 B안 native surface 경계를 적용한다.
4. 위 상태 matrix를 실제 지원 하한 iOS와 iOS 26.5에서 확인한다.
5. current display-name route가 삭제된 뒤 route와 카피가 남지 않았는지 전체 screen
   pass를 한 번 더 한다.

각 단계는 독립적으로 검증 가능하다. 1·2는 현재 제품 화면 개선이고, 3·4·5는
닉네임·아이디 feature의 acceptance에 합쳐진다.

## 검증 방법

- unit: semantic token mapping, contrast pair, OTP long email wrapping 조건, native
  stack screen option의 back label.
- integration: email → OTP → onboarding, settings → nickname/username sheet,
  save success·failure·duplicate race.
- simulator: standard light/dark, Increase Contrast, Reduce Transparency, 가장 큰
  접근성 Dynamic Type, keyboard open/close, pull-down dismiss.
- manual: 한국어 primary locale의 Apple official button, iOS 지원 하한의 glass
  fallback과 VoiceOver 순서.

runtime screenshot만으로 실패·streaming·race를 통과했다고 판단하지 않는다. 그
상태는 기존 test와 feature 구현 뒤의 재현 가능한 integration check가 필요하다.

## 가정

- iOS가 주 플랫폼이고 Android·web parity는 이번 정리의 범위가 아니다.
- 현재 renderer map은 유지한다. RN이어야 하는 composite input·chat scroll과
  Universal이 잘하는 Form·List를 서로 옮기지 않는다.
- 닉네임·아이디 스펙은 다음 profile UI 변경의 source of truth다.
- system appearance를 따르며 앱 안에 theme selector를 넣지 않는다.

## 범위 밖

- 새 디자인 시스템 또는 component library.
- Swift 코드, custom native module, `@expo/ui` fork.
- login 방식, chat 정보구조, AI response layout의 재설계.
- username 검색·공개 profile 같은 새 제품 기능.
- 화면별 색을 픽셀 단위로 맞추는 visual redesign.

## 남은 위험

- `@expo/ui` native material의 iOS 지원 하한 fallback은 iOS 26.5 spike만으로 알 수
  없다.
- CSS fixed color는 Increase Contrast에 자동 적응하지 않는다. explicit app color가
  늘어날 때마다 pair 검증 범위도 늘려야 한다.
- VoiceOver와 가장 큰 Dynamic Type은 이번 runtime pass에서 켜지 않았다. 구현
  acceptance에서 반드시 실제로 확인한다.
- profile failure와 chat network failure는 source·test만 확인했다. 실제 error
  surface의 system alert/keyboard 조합은 별도 failure injection이 있어야 반복
  검증할 수 있다.

## 근거

- [Expo UI Universal](https://docs.expo.dev/versions/latest/sdk/ui/universal/)
- [Expo UI Host](https://docs.expo.dev/versions/latest/sdk/ui/universal/host/)
- [Apple HIG Color](https://developer.apple.com/design/human-interface-guidelines/color)
- [Apple HIG Materials](https://developer.apple.com/design/human-interface-guidelines/materials)
- [Apple HIG Accessibility](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple HIG Dark Mode](https://developer.apple.com/design/human-interface-guidelines/dark-mode)
