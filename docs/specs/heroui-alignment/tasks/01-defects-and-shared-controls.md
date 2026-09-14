# 01 — 결함과 공용 컴포넌트 정리

## Outcome

다크 모드에서 메시지 메뉴와 인증 코드 칸의 표면 색이 카드와 같아진다. 인증 코드
칸이 HeroUI 기본 크기로 왼쪽에 모이고 틀린 코드의 표시가 HeroUI 무효 상태
외곽선으로 바뀌며, 이메일·닉네임·아이디·코드 화면의 오류 문구가 입력에 붙은 필드
오류로 보이고 화면 읽기에 알림으로 읽힌다. 아이디 화면의 다시 시도는 오류 문구
옆의 작은 버튼이 맡고, 인증 화면의 `또는` 구분선은 HeroUI `Separator`다. 채팅의
재시도 알약, 편집 취소 버튼, 프로필 편집 알약, 채팅의 전송·중지·최신 메시지 버튼이
HeroUI 컴포넌트의 눌림 반응과 비활성 표현을 갖는다. 공용 버튼의 가로 여백이
HeroUI 기본값으로 돌아가고 진행 표시와 앞 아이콘이 라벨 옆 줄 안에 서며, 큰
글자에서 버튼이 자라는 것은 유지된다. 소비자가 없는 토스트 설정이 사라지고 로그인
버튼이 테마 브리지를 읽는다. `heroui-native`가 1.0.9로 올라가 HeroUI 컴포넌트
라벨과 `Typography`의 굵기가 커스텀 폰트 없이 기기에서 그려진다.

## Blockers

None.

## Acceptance criteria

- [x] 전역 CSS에 `overlay`와 `field-background`가 Light·Dark 모두 `surface`와 같은 값으로 있고, iOS 다크 모드에서 메시지 메뉴, 인증 코드 칸, 카드의 표면 색이 같다.
- [x] 저장소에 `!important`로 HeroUI 클래스를 덮는 코드와 `opacity-40` 비활성 표현이 없다. global.css의 HeroUI 재정의는 버튼 높이 하나뿐이다.
- [x] 인증 코드를 틀렸을 때 칸의 무효 외곽선이 보이고, 칸은 HeroUI 기본 크기로 왼쪽에 모인다.
- [x] 이메일, 닉네임, 아이디, 코드 화면의 오류 문구가 입력 아래 필드 오류로 보이고 접근성 트리에서 알림 역할이다. 로그인 방법 화면의 오류 문구는 대응표의 오류 역할이다.
- [x] 아이디 화면에서 확인이 실패하면 오류 문구 옆 `다시 시도` 버튼이 보이고 누르면 다시 확인한다. 접근성 이름은 지금 값과 같다.
- [x] 인증 화면의 `또는` 구분선이 HeroUI `Separator`이고 손으로 그린 `h-px`가 없다.
- [x] 재시도 알약, 프로필 편집 알약, 편집 취소 버튼, 전송·중지·최신 메시지 버튼을 누르면 축소 반응이 있고, 비활성일 때 투명도 0.5로 보이며 눌리지 않는다. 메시지 아래 아이콘 줄의 비활성 버튼도 같은 투명도 0.5이고, 진행 중인 버튼은 지금처럼 흐려지지 않는다.
- [x] 공용 버튼의 진행 표시와 앞 아이콘이 라벨 왼쪽 줄 안에 서고, 진행 중에도 버튼 크기가 흔들리지 않는다. 하단 행동 버튼과 인증 버튼의 너비와 자리가 달라지지 않는다.
- [x] 로그인, 대화, 프로필 편집 화면을 [모바일 타이포그래피](../../../decisions/mobile-typography.md)의 절차로 최대 글자 크기에서 열어 버튼, 알약, 필드 오류가 잘리거나 겹치지 않고 버튼이 라벨만큼 자란다.
- [x] 앱의 토스트 설정에 HeroUI 토스트 항목이 없고, 로그인 버튼 코드가 `useColorScheme`를 읽지 않는다.
- [x] 설치된 `heroui-native`가 1.0.9이고, iOS와 Android 기기에서 HeroUI 버튼 라벨과 `Typography.Heading`이 본문보다 굵게 그려진다.
- [x] 1.0.8을 근거로 적은 결정 계약의 줄이 1.0.9 소스와 맞게 고쳐져 있다.
- [x] 1.0.9에서 위 기준의 화면(공용 버튼, 공용 아이콘 버튼, 채팅 재시도 알약과 편집 취소, 인증 필드 오류와 코드 칸, 대사 뜻 아래 `AI에게 물어보기` 링크, 토스트)을 기본 크기와 최대 글자 크기, 밝은 화면과 어두운 화면으로 다시 열어 잘림과 겹침이 없다.

## Constraints

- [모바일 컴포넌트 선택](../../../decisions/mobile-component-selection.md)의 예외 목록에 새 예외를 더하지 않는다. 공용 아이콘 버튼은 목록에 있는 채팅 버튼 자리를 모으는 것이고, 실패 줄의 재시도 아이콘은 그대로 둔다. 메시지 아래 아이콘 줄은 구조를 그대로 두고 비활성 표현만 `opacity-40`에서 HeroUI `element-disabled`로 바꾼다. 진행 중인 버튼을 흐리게 두지 않는 규칙은 유지한다.
- `overlay`, `field-background`의 등재 자리와 값은 [모바일 색상 시맨틱](../../../decisions/mobile-color-semantics.md)을 따른다.
- 로그인 버튼의 브랜드 모양과 진행 표시는 [모바일 작업 진행 표시](../../../decisions/mobile-action-progress.md)가 소유한다. 색을 읽는 경로만 바꾼다.
- 하단 행동 버튼의 배치는 [모바일 하단 CTA](../../../decisions/mobile-bottom-cta.md)를 따른다.
- 전송 버튼이 진행 표시로 바뀌는 규칙은 [모바일 채팅 메시지 동작](../../../decisions/mobile-chat-message-actions.md)을 따른다.
- 굵기를 되살리려고 global.css 재정의나 `--font-*` 변수를 더하지 않는다. 버전 결정은 [모바일 컴포넌트 선택](../../../decisions/mobile-component-selection.md)이 소유한다.
- 올리기 전의 기기 증거는 지우지 않는다. 1.0.9 확인은 새 증거로 더한다.

## Verification

- `grep -rnE "(h-auto|px-[^ ]+)!" apps/mobile/src`와 `grep -rn "opacity-40" apps/mobile/src`가 0건이다.
- `grep -n -E "overlay|field-background" apps/mobile/global.css`가 Light와 Dark 각각에 두 토큰을 보여 준다.
- `bun run check`와 모바일 `bun run test`가 통과한다. 공용 `Button` 테스트는 새 선행 슬롯 배치를, 공용 아이콘 버튼과 `FieldError` 테스트는 접근성 역할·이름·비활성 상태를 검사한다.
- 기기 확인: `xcrun simctl ui <udid> content_size accessibility-extra-extra-extra-large`로 바꾼 뒤 앱을 완전히 닫고 다시 시작해 로그인, 대화, 프로필 편집 화면을 찍는다. 통과 조건은 잘림과 겹침이 없고 버튼이 라벨만큼 자라는 것이다. 다크 모드 세 표면은 같은 화면 모드에서 찍어 색값이 같다.
- `agent-device` 접근성 트리에서 인증 오류 문구가 알림 역할이고, 공용 아이콘 버튼이 버튼 역할과 이름을 갖는다.
- 변경을 `mobile-ui-consistency-reviewer`로 검토하고 실행 증거가 없는 항목은 `UNVERIFIED`로 남긴다.
- 1.0.9: `apps/mobile/node_modules/heroui-native/package.json`의 버전이 1.0.9이고, Metro가 컴파일한 global.css에서 `text__root--type-h6`와 `button__label`에 `fontWeight`가 있다. 기기 확인은 위 절차로 iOS와 Android에서 하고, 굵기는 같은 화면의 본문과 나란히 찍어 비교한다.

## Review checkpoint

None.

## Status

completed

## Execution

- Verification: 2026-09-14. `bun run check`, `check-types`, 모바일 `bun run test`(92개 묶음, 678개) 통과. `(h-auto|px-*)!`와 `opacity-40` grep 0건, `global.css`에 Light·Dark `overlay`와 `field-background`가 `surface`와 같은 값으로 있다. 로그인 버튼 코드에 `useColorScheme` 없음, 앱 설정에 HeroUI 토스트 항목 없음.
  - iOS 시뮬레이터 `accessibility-extra-extra-extra-large`, 앱 재시작, 밝은 화면: 로그인 방법의 `Separator`, 이메일·닉네임 필드 오류, 틀린 코드의 HeroUI 무효 외곽선과 기본 크기 칸 왼쪽 정렬, `59초 후 다시 받기`와 프로필 `편집` 버튼이 두 줄로 자라며 잘리지 않음, 대화의 비활성 보내기(0.5), 중지, 최신 메시지 버튼, 대화 오류 줄의 알약이 다음 줄로 내려감.
  - iOS 기본 크기, 어두운 화면: 메시지 메뉴 배경, 코드 칸 배경, 인물 대사 카드 표면이 모두 `rgb(26,26,30)`. 물어보기 시트에서 수정 그만두기 28pt 버튼이 수정을 끝내고, 비활성 답변 동작 아이콘이 흐려짐.
  - Android 에뮬레이터 200%: 네트워크를 끊어 아이디 확인 실패 뒤 필드 오류 옆 `다시 시도`가 보이고, 복구 뒤 누르면 `사용할 수 있는 아이디`가 된다. 오류 문구 노드는 `android.view.View`(알림 역할 적용), 일반 글자는 `TextView`. 내용 너비 `다시 시도하기`는 진행 중에도 알약 크기 그대로 한 줄 문구 왼쪽에 진행 표시가 선다(화면 녹화 프레임). 대화 오류 줄은 알약이 다음 줄로 내려간다.
  - Android 기본 크기: 대화 오류 줄이 한 줄로 서고, 프로필 `편집` 알약은 누르는 동안 폭 162→150px, 보내기 버튼은 132→118px로 줄어든다. 손을 떼면 중지 버튼이 투명도 없이 선다.
  - 1.0.9 확인(2026-09-14, e67ece1): `apps/mobile/node_modules/heroui-native/package.json`이 1.0.9이고, Metro가 컴파일한 global.css에서 `text__root--type-h6`, `text__root--weight-semibold`, `button__label`에 `fontWeight`가 생겼다(1.0.8에서는 정의되지 않은 `--font-*`를 읽는 `fontFamily`뿐이었다). 모바일 테스트 93개 묶음 682개와 `bun run check` 통과. 계약 줄은 1.0.9 소스(버튼 높이 40/48/56, `Spinner` mingcute 아이콘과 크기 16/24/32, 토스트 컨테이너 `absolute inset-0`, Avatar 1.4·InputOTP 1.6 상한)와 대조해 `mobile-action-progress`, `mobile-toast-placement`, `mobile-typography`의 버전 표기를 고쳤다.
  - 1.0.9 기기 확인: iOS 기본 크기와 `accessibility-extra-extra-extra-large`, Android 기본 크기와 200%를 각각 앱을 다시 시작해 밝은·어두운 화면으로 열었다. 버튼 라벨이 중간 굵기로 그려지고, 로그인 방법·이메일 오류·틀린 코드의 무효 외곽선, 대화 오류 줄의 `다시 시도하기` 알약, 보내기와 최신 메시지 버튼, 대사 뜻 아래 `AI에게 물어보기`가 잘리거나 겹치지 않았다. iOS 최대 크기에서 `AI에게 물어보기`는 두 줄로 줄바꿈된다.
  - 1.0.9 확인 중 발견: iOS 최대 글자 크기에서 토스트 문구 아래가 잘렸다. 인라인 줄 높이에 배율을 곱한 값에 React Native가 배율을 한 번 더 곱해서였고, 곱셈을 없애 고쳤다(5418ecd). 고친 뒤 iOS 최대 크기(밝은 화면)와 Android 200%(어두운 화면)에서 표현 돌아보기의 토스트를 다시 띄워 잘리지 않음을 봤다.
  - 1.0.9 뒤 UNVERIFIED(추가 리뷰가 짚음): 메시지 메뉴(`Menu`) 라벨과 아바타 대체 글자(`Avatar.Fallback`)가 중간 굵기로 바뀐 모습을 최대 글자 크기에서 보지 않았다. 마지막 전체 확인에서 본다. 키보드가 올라온 인증 화면에서 아래 버튼이 내용을 덮는 것은 이 변경 전부터 있던 배치라 [follow-up](../../../follow-ups/auth-footer-covers-content-with-keyboard-at-largest-text.md)으로 남겼다. 닉네임 오류는 입력칸 글자 수 제한 때문에 타이핑으로 만들 수 없어 1.0.9에서 다시 보지 못했다(1.0.8 증거만 있다).
  - 마지막 전체 확인(2026-09-14, 3a45c12): 위 UNVERIFIED 중 두 가지를 봤다. iOS `accessibility-extra-extra-extra-large`와 Android 200%에서 각각 앱을 다시 시작하고 `AI에게 물어보기` 시트의 내 말풍선을 길게 눌러, 밝은·어두운 화면 모두 `복사`와 `수정` 라벨이 중간 굵기로 잘리지 않고 메뉴 표면이 어두운 화면에서 카드와 같은 색임을 확인했다. 아바타 대체 글자는 05 기기 확인의 설정 화면(iOS 최대 크기 밝은 화면, Android 200% 어두운 화면)에서 원 안에 잘리지 않았다. iOS 시트에서 메뉴가 누른 말풍선을 덮는 것은 1.0.8 스크린샷에도 있어 [follow-up](../../../follow-ups/ios-ask-sheet-message-menu-covers-its-bubble.md)으로 남겼다.
  - `mobile-ui-consistency-reviewer`: FINDINGS 없음(PASS_WITH_GAPS). UNVERIFIED로 남은 것: iOS 최대 크기의 아이디 다시 시도 줄(시뮬레이터에서 네트워크 실패를 만들 수 없음), 전폭 버튼의 진행 중 모습, 최신 메시지 Glass 버튼을 누르는 동안의 모습, 밝은 화면 표면색 표본, VoiceOver·TalkBack 낭독. iOS 접근성 트리는 알림 역할을 드러내지 않는다(RN이 iOS 특성으로 옮기지 않음). 역할은 jest와 Android 노드 클래스로 확인했다.
- Blocker: —
- Revision: 기술 경로만 바꿨다. 기능이 `core`를 import할 수 없어 로그인 버튼은 경로 파일이 `useAppTheme`로 읽은 화면 모드를 prop으로 받는다. HeroUI 기본 여백에서는 내용 너비 버튼에 진행 표시가 들어올 자리가 없어, 진행 중에 문구 폭을 원래대로 고정해 줄이 버튼 좌우 여백으로 넘치게 했다. 최대 글자에서 대화 오류 문구가 한 글자 폭으로 눌리는 것을 기기에서 발견해 오류 줄을 `flex-wrap`으로 바꿨다. 문구에 줄어드는 성질을 주면 줄이 나뉘지 않는다. [모바일 작업 진행 표시](../../../decisions/mobile-action-progress.md)의 "문구 위치 유지" 문장은 줄 안 슬롯을 정한 [모바일 컴포넌트 선택](../../../decisions/mobile-component-selection.md)보다 오래된 표현이라 따로 기록한다.
  - 2026-09-14 스펙 개정(2fb26ed): 1.0.8이 시스템 폰트에서 굵기를 빠뜨려 사용자가 1.0.9로 올리기로 정했다. 이 작업이 01의 범위(결함과 시안 없이 되돌릴 수 있는 것)에 들어오고 01이 넘긴 버튼과 링크의 모습을 바꾸므로 01을 in-progress로 되돌렸다. 위 증거는 1.0.8 기준으로 남긴다.
