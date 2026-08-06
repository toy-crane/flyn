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

in-progress

## Execution

- Base commit: 61b28d73ae2208ec78b4042c88e0a9a99e99dff9
- Task checkpoint commit: 263ff617dd3364f54d6c15d9c8770911186dd322
- Verification: `bun run check --force` — 8/8 tasks, 0 cached, jest 424/424 (52 suites), lint·typecheck 통과
- Task review: —
- Task correction rounds: 0
- Blocker: task-review — (1) `self-contained-native-ui-boundaries.md:65-67`이 InputOTP의 `maxLength` 고정을 "밖에서 풀 수 없다"고 적었으나 사실이 아니다. `input-otp.tsx:307`의 `maxLength` 뒤에 `:327`의 `{...textInputProps}`가 와서 런타임에는 덮인다(배포 번들도 같은 순서). 막는 것은 공개 타입의 `Omit`뿐이다. 기각 자체는 타당하나(문서화되지 않은 spread 순서 의존), 기록된 근거와 `Reconsider when`의 재채택 조건이 영영 발동하지 않는 형태다. (2) `social-sign-in-presentation.md:9`가 "17pt muted text action"을 유지하는데 코드는 HeroUI `body`(16px)로 그린다 — 리뷰 판정은 코드가 옳고 문서가 낡았다. (3) `code.tsx:147`·`:158`의 "보내는 중…"·"확인 중…" 스피너가 `useThemeColor("accent")`라 파란 action tint다. 태스크 01에서 같은 계약(`neutral-loading-indicators`)으로 교정한 것과 어긋난다 — 최소한 버튼이 없는 "확인 중…"은 수동형이다. (4) 이메일 화면 테스트가 잃은 가드 3개: `.trim()` 단언(제거해도 통과한다), `autoComplete="email"`, 보이는 `<Label>`.
