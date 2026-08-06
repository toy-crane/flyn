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

- [x] 루트 로그인의 provider 버튼이 HeroUI `Button` 기반으로 브랜드 지침을
      지키고, [social-sign-in-presentation](../../../decisions/social-sign-in-presentation.md)의
      위계·pending 표현이 유지된다
- [x] 이메일 입력이 HeroUI `TextField`로 동작하고 검증·제출·오류 문구가 이전과
      같다
- [x] OTP가 HeroUI `InputOTP`로 SMS AutoFill·붙여넣기·연속 입력·slot 피드백을
      통과했거나, 실패 증거와 함께 HeroUI 토큰 위 커스텀으로 대체됐다
- [x] 재전송 쿨다운·haptic·오류 상태가 회귀 없다
- [x] `bun run auth:session` 경로로 이메일 OTP 로그인 완주가 재현된다
- [x] 기존 email-form·code-input·google-button이 제거됐다

## 제약

- InputOTP 판정 결과를
  [screen-renderer-boundaries](../../../decisions/self-contained-native-ui-boundaries.md)
  표에 반영한다 — 채택 확정이든 커스텀 대체든 표가 현재 상태를 말해야 한다.
- OTP slot의 짧은 피드백·AutoFill 즉시 표시 규칙은
  [native-motion](../../../decisions/native-motion.md)이 소유한다.
- 소셜 로그인은 자동 검증하지 않는다 — 수동 확인 절차는
  [auth-verification](../../../auth-verification.md)을 따른다.

## Status

completed

## Execution

- Base commit: 61b28d73ae2208ec78b4042c88e0a9a99e99dff9
- Task checkpoint commit: f14f489d55e1ce3384a4728ddcb2244521ad6e95
- Verification: `bun run check --force` — 8/8 tasks, 0 cached, jest 428/428 (52 suites), lint·typecheck 통과. 이메일 OTP 완주는 `bun run auth:session`으로 세션을 얻고 시뮬레이터에서 온보딩 진입까지 재현했다(작업자 보고, 증거는 세션 scratchpad의 `16-signed-in.png`·`23-crop.png` — 저장소 안에는 남지 않는다).
- Task review: 교정 1회로 닫았다. 리뷰가 결정 문서 두 개가 코드와 어긋나는 것을 블로킹으로 잡았고 — InputOTP의 `maxLength`는 "풀 수 없는" 것이 아니라 공개 타입이 `Omit`으로 닫은 키였고(런타임에는 뒤에 오는 `textInputProps` spread가 이긴다), `social-sign-in-presentation`은 코드가 버린 17pt를 계속 규정하고 있었다 — 둘 다 사실에 맞게 고쳤다. 기각 결론과 16px 코드는 유지했다. 여기에 `code.tsx`의 "확인 중…" 수동형 스피너가 accent로 남은 것과 이메일 테스트가 잃은 가드 3개(`.trim()`·`autoComplete`·보이는 `<Label>`)를 더해 함께 고쳤고, 각 가드는 대상을 지우면 실패하는 것을 확인했다. 다크 scrim이 HeroUI `backdrop` 20%로 떨어져 다크 배경(oklch 12%) 위에서 보이지 않던 것도 앱 토큰(라이트 18%·다크 62%)으로 되돌렸다.
- Task correction rounds: 1
- Blocker: resolved task-review — 결정 문서 두 개를 사실에 맞췄고, 수동형 스피너를 중립으로, 잃은 테스트 가드 3개를 복원했다.
