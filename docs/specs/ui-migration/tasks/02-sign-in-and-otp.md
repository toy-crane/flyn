# 02. 로그인과 인증 코드가 HeroUI로 그려진다

## 전달되는 행동

미로그인 사용자가 보는 세 화면 — 루트 로그인, 이메일 입력, 인증 코드 — 이
HeroUI로 그려진다. Apple·Google 버튼은 HeroUI `Button` 기반이지만 각 브랜드
지침의 로고·문구·최소 크기·대비를 지키고, 이메일 OTP 6자리 입력은 SMS
AutoFill·붙여넣기·연속 입력까지 이전과 똑같이 동작한다. 로그인 성공 뒤 홈 또는
온보딩으로 가는 흐름은 변하지 않는다.

## Blockers

- **01** — HeroUI 화면은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [ ] 루트 로그인의 provider 버튼이 HeroUI `Button` 기반으로 브랜드 지침을
      지키고, [social-sign-in-presentation](../../../decisions/social-sign-in-presentation.md)의
      위계·pending 표현이 유지된다
- [ ] 이메일 입력이 HeroUI `TextField`로 동작하고 검증·제출·오류 문구가 이전과
      같다
- [ ] OTP가 HeroUI `InputOTP`로 SMS AutoFill·붙여넣기·연속 입력·slot 피드백을
      통과했거나, 실패 증거와 함께 HeroUI 토큰 위 커스텀으로 대체됐다
- [ ] 재전송 쿨다운·haptic·오류 상태가 회귀 없다
- [ ] `bun run auth:session` 경로로 이메일 OTP 로그인 완주가 재현된다
- [ ] 기존 email-form·code-input·google-button이 제거됐다

## 제약

- InputOTP 판정 결과를
  [screen-renderer-boundaries](../../../decisions/self-contained-native-ui-boundaries.md)
  표에 반영한다 — 채택 확정이든 커스텀 대체든 표가 현재 상태를 말해야 한다.
- OTP slot의 짧은 피드백·AutoFill 즉시 표시 규칙은
  [native-motion](../../../decisions/native-motion.md)이 소유한다.
- 소셜 로그인은 자동 검증하지 않는다 — 수동 확인 절차는
  [auth-verification](../../../auth-verification.md)을 따른다.

## Status

pending

## Execution

- Base commit: —
- Task checkpoint commit: —
- Verification: —
- Task review: —
- Task correction rounds: 0
- Blocker: —
