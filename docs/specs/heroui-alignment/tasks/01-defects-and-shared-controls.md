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
버튼이 테마 브리지를 읽는다.

## Blockers

None.

## Acceptance criteria

- [ ] 전역 CSS에 `overlay`와 `field-background`가 Light·Dark 모두 `surface`와 같은 값으로 있고, iOS 다크 모드에서 메시지 메뉴, 인증 코드 칸, 카드의 표면 색이 같다.
- [ ] 저장소에 `!important`로 HeroUI 클래스를 덮는 코드와 `opacity-40` 비활성 표현이 없다. global.css의 HeroUI 재정의는 버튼 높이 하나뿐이다.
- [ ] 인증 코드를 틀렸을 때 칸의 무효 외곽선이 보이고, 칸은 HeroUI 기본 크기로 왼쪽에 모인다.
- [ ] 이메일, 닉네임, 아이디, 코드 화면의 오류 문구가 입력 아래 필드 오류로 보이고 접근성 트리에서 알림 역할이다. 로그인 방법 화면의 오류 문구는 대응표의 오류 역할이다.
- [ ] 아이디 화면에서 확인이 실패하면 오류 문구 옆 `다시 시도` 버튼이 보이고 누르면 다시 확인한다. 접근성 이름은 지금 값과 같다.
- [ ] 인증 화면의 `또는` 구분선이 HeroUI `Separator`이고 손으로 그린 `h-px`가 없다.
- [ ] 재시도 알약, 프로필 편집 알약, 편집 취소 버튼, 전송·중지·최신 메시지 버튼을 누르면 축소 반응이 있고, 비활성일 때 투명도 0.5로 보이며 눌리지 않는다.
- [ ] 공용 버튼의 진행 표시와 앞 아이콘이 라벨 왼쪽 줄 안에 서고, 진행 중에도 버튼 크기가 흔들리지 않는다. 하단 행동 버튼과 인증 버튼의 너비와 자리가 달라지지 않는다.
- [ ] 로그인, 대화, 프로필 편집 화면을 [모바일 타이포그래피](../../../decisions/mobile-typography.md)의 절차로 최대 글자 크기에서 열어 버튼, 알약, 필드 오류가 잘리거나 겹치지 않고 버튼이 라벨만큼 자란다.
- [ ] 앱의 토스트 설정에 HeroUI 토스트 항목이 없고, 로그인 버튼 코드가 `useColorScheme`를 읽지 않는다.

## Constraints

- [모바일 컴포넌트 선택](../../../decisions/mobile-component-selection.md)의 예외 목록에 새 예외를 더하지 않는다. 공용 아이콘 버튼은 목록에 있는 채팅 버튼 자리를 모으는 것이고, 실패 줄의 재시도 아이콘과 메시지 아래 아이콘 줄은 그대로 둔다.
- `overlay`, `field-background`의 등재 자리와 값은 [모바일 색상 시맨틱](../../../decisions/mobile-color-semantics.md)을 따른다.
- 로그인 버튼의 브랜드 모양과 진행 표시는 [모바일 작업 진행 표시](../../../decisions/mobile-action-progress.md)가 소유한다. 색을 읽는 경로만 바꾼다.
- 하단 행동 버튼의 배치는 [모바일 하단 CTA](../../../decisions/mobile-bottom-cta.md)를 따른다.
- 전송 버튼이 진행 표시로 바뀌는 규칙은 [모바일 채팅 메시지 동작](../../../decisions/mobile-chat-message-actions.md)을 따른다.

## Verification

- `grep -rnE "(h-auto|px-[^ ]+)!" apps/mobile/src`와 `grep -rn "opacity-40" apps/mobile/src`가 0건이다.
- `grep -n -E "overlay|field-background" apps/mobile/global.css`가 Light와 Dark 각각에 두 토큰을 보여 준다.
- `bun run check`와 모바일 `bun run test`가 통과한다. 공용 `Button` 테스트는 새 선행 슬롯 배치를, 공용 아이콘 버튼과 `FieldError` 테스트는 접근성 역할·이름·비활성 상태를 검사한다.
- 기기 확인: `xcrun simctl ui <udid> content_size accessibility-extra-extra-extra-large`로 바꾼 뒤 앱을 완전히 닫고 다시 시작해 로그인, 대화, 프로필 편집 화면을 찍는다. 통과 조건은 잘림과 겹침이 없고 버튼이 라벨만큼 자라는 것이다. 다크 모드 세 표면은 같은 화면 모드에서 찍어 색값이 같다.
- `agent-device` 접근성 트리에서 인증 오류 문구가 알림 역할이고, 공용 아이콘 버튼이 버튼 역할과 이름을 갖는다.
- 변경을 `mobile-ui-consistency-reviewer`로 검토하고 실행 증거가 없는 항목은 `UNVERIFIED`로 남긴다.

## Review checkpoint

None.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
