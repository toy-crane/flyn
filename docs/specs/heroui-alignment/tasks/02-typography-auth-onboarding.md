# 02 — 텍스트 역할 이전: 인증과 온보딩

## Outcome

로그인 방법, 이메일, 코드, 닉네임, 아이디 화면과 세션 안내 화면의 글자가 HeroUI
`Typography` 역할로 그려진다. 화면 안 제목이 한 크기가 되고 화면 읽기에 헤더로
읽힌다. 문구, 색, 배치, 동작은 달라지지 않는다.

## Blockers

None.

## Acceptance criteria

- [ ] 인증, 온보딩, 세션 화면 폴더에 `text-[Npx]`, `leading-[Npx]`가 없고, `Text`에 `text-*`(색 제외), `leading-*`, `font-*` 클래스가 없다. 제공자 로그인 버튼의 인라인 크기는 계약의 예외다.
- [ ] 쓰인 `Typography` `type`이 모두 [모바일 타이포그래피](../../../decisions/mobile-typography.md) 대응표에 있고, 본문 계열은 `Paragraph`, 제목 계열은 `Heading`이다.
- [ ] 화면 안 제목이 접근성 트리에서 헤더 역할이다.
- [ ] 다섯 인증·온보딩 화면과 세션 안내 화면 두 개(프로필을 불러오지 못한 화면, 설정이 필요한 화면)를 계약의 절차로 기본 크기와 최대 글자 크기, 밝은 화면과 어두운 화면으로 열어 잘림과 겹침이 없다.

## Constraints

- 이 task는 인증(`screens/auth`, `features/auth`), 온보딩(`screens/onboarding`), 세션(`screens/session`) 화면만 다룬다. 저장소 전체 0건 주장은 04가 한다.
- `Typography`의 값을 global.css에서 재정의하지 않는다. 어색한 값이 보이면 Execution에 적고 계약의 재검토로 넘긴다.
- 제공자 로그인 버튼의 확대 상한과 인라인 크기는 그대로 두되 기준값을 대응표의 값으로 맞춘다.

## Verification

- 위 세 폴더에 대한 `grep -rnE "text-\[|text-(xs|sm|base|lg|[0-9]?xl)|leading-\[|leading-[0-9]|font-[a-z]"`가 로그인 버튼의 예외를 빼고 0건이다.
- `bun run check`와 모바일 `bun run test`가 통과하고, 크기 클래스를 검사하던 테스트는 역할 `type`을 검사한다.
- 기기 확인: `xcrun simctl ui <udid> content_size accessibility-extra-extra-extra-large`(iOS)와 `adb shell settings put system font_scale 2.0`(Android)로 바꾼 뒤 앱을 완전히 닫고 다시 시작해 일곱 화면(로그인 방법, 이메일, 코드, 닉네임, 아이디, 프로필을 불러오지 못한 화면, 설정이 필요한 화면)을 밝은·어두운 모드로 찍는다. 통과 조건은 잘림과 겹침이 없는 것이다.
- `agent-device` 접근성 트리에서 화면 안 제목이 헤더 역할이다.
- 변경을 `mobile-ui-consistency-reviewer`로 검토한다.

## Review checkpoint

None.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
