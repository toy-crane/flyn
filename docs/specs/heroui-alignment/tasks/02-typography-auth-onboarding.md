# 02 — 텍스트 역할 이전: 인증과 온보딩

## Outcome

로그인 방법, 이메일, 코드, 닉네임, 아이디 화면과 세션 안내 화면의 글자가 HeroUI
`Typography` 역할로 그려진다. 화면 안 제목이 한 크기가 되고 화면 읽기에 헤더로
읽힌다. 문구, 색, 배치, 동작은 달라지지 않는다.

## Blockers

01 (`heroui-native` 1.0.9가 있어야 `Heading`과 `weight`의 굵기가 기기에서 그려진다)

## Acceptance criteria

- [x] 인증, 온보딩, 세션 화면 폴더에 `text-[Npx]`, `leading-[Npx]`가 없고, `Text`에 `text-*`(색 제외), `leading-*`, `font-*` 클래스가 없다. 제공자 로그인 버튼의 인라인 크기는 계약의 예외다.
- [x] 쓰인 `Typography` `type`이 모두 [모바일 타이포그래피](../../../decisions/mobile-typography.md) 대응표에 있고, 본문 계열은 `Paragraph`, 제목 계열은 `Heading`이다.
- [ ] 화면 안 제목이 접근성 트리에서 헤더 역할이다.
- [ ] iOS와 Android 기기에서 화면 안 제목(`h3`)과 `weight`가 붙은 소제목이 같은 화면의 본문보다 굵게 보인다.
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

- Verification: 코드 기준은 통과했다. 세 폴더 grep은 테스트 주석 한 줄 말고 0건이고, `bun run check`, `check-types`, 모바일 테스트 93개 묶음 682개가 통과했다. 헤더 역할은 jest의 `getByRole("header")`와 `text__root--type-h3` 검사로만 확인했다. `mobile-ui-consistency-reviewer`(범위 `259225d..237ec54`)는 PASS_WITH_GAPS다. 고칠 것은 없고, 제공자 로그인 버튼의 줄 높이 24와 `adjustsFontSizeToFit` 조합, 일곱 화면의 크기·모드 확인, 기기 접근성 트리를 UNVERIFIED로 남겼다. 기기 확인은 아래 막힘 때문에 시작하지 않았다.
- Blocker: HeroUI Native 1.0.8의 `Typography`는 굵기를 `font-family: var(--font-semibold)`처럼 글꼴 변수로만 준다. 앱은 계약대로 커스텀 폰트와 `--font-*` 변수를 두지 않으므로, Metro가 컴파일한 global.css에서 `text__root--type-h3`, `--type-h6`, `--weight-semibold`의 `fontFamily`가 정의되지 않은 변수를 읽고 `fontWeight`는 없다(`"--font-semibold":` 정의 0건). 그래서 `Heading`과 `weight`가 모두 보통 굵기로 그려진다. 2026-09-14 iOS 표현 돌아보기에서 `기억해 둘 표현`(h6)과 회차 줄(semibold)이 보통 굵기이고, 아직 크기 클래스를 쓰는 카드 문장만 굵게 보였다. 인증 제목은 30 bold에서 24 semibold가 아니라 24 보통 굵기가 된다. 대응표의 굵기 위계와 "Typography는 type마다 굵기를 정한다"는 계약 전제가 이 버전에서 성립하지 않는다. 1.0.9(2026-08-31)는 같은 자리를 `@apply font-semibold`로 바꿔 시스템 폰트에 숫자 굵기를 준다. 고치는 길(1.0.9로 올리기, global.css 세 번째 재정의, 보통 굵기 수용)이 모두 스펙의 재정의 둘 기준이나 1.0.8을 근거로 둔 계약을 바꾸므로 사용자 결정을 기다린다.
- Revision: 대응표에 세션 오류 화면을 화면 안 제목 행의 예로 더했다(ef5dc3b). 2026-09-14 스펙 개정(2fb26ed)으로 1.0.9 올리기가 01에 들어가, 위 막힘은 01의 막힘으로 옮기고 굵기 기준을 더했다. 코드 기준의 증거는 그대로 유효하다.
