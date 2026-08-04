# 로그인 수단과 검증 경로

## Decisions

- 로그인 수단은 Apple·Google native `signInWithIdToken`과 이메일 6자리 OTP 세
  가지다.
- Apple과 Google은 한 세트다. Google을 제공하는 동안 Sign in with Apple을 함께
  유지하고 추가 소셜 provider는 넣지 않는다.
- 이메일은 링크가 아니라 앱에 직접 입력하는 6자리 코드다.
- 로그인 이후 자동 검증은 이메일 OTP로 세션을 얻어 수행한다. Apple·Google
  provider UI는 사람이 수동 확인한다.
- native module과 config plugin이 필요한 인증이므로 Expo Go가 아니라 development
  build를 일상 개발 경로로 사용한다.

## Why

소셜 계정이 없는 사용자에게도 경로가 필요하고, Apple·Google은 사람 손 없이
유효한 provider session을 만들 수 없다. 이메일 코드는 유일한 재현 가능한 자동
검증 경로이며, 매직링크의 선점·재작성·deep link 실패를 피한다.

## Boundaries

- provider 버튼과 root sign-in의 위계는
  [표현 계약](social-sign-in-presentation.md)이 소유한다.
- 자동 세션 발급과 소셜 수동 확인 절차는
  [인증 검증 가이드](../auth-verification.md)에 둔다.
- 로컬 이메일 템플릿은 `{{ .Token }}`을 사용하고 코드 입력은 one-time-code
  AutoFill과 자동 제출을 유지한다.

## Reconsider when

Apple 심사 규칙, provider API 또는 Supabase local Auth가 바뀌어 소셜 로그인을
안전하게 자동화할 수 있거나, 추가 provider가 명확한 제품 요구가 되면 다시
결정한다.

## Still-rejected alternatives

- Google을 유지하면서 Apple만 제거하기.
- 카카오 등 추가 소셜 provider를 근거 없이 미리 넣기.
- 이메일 경로를 제거해 소셜만 남기기.
- 이메일 매직링크와 AASA/deep link 흐름 사용하기.

## Evidence worth preserving

직접 서명한 Google ID token, 로컬 OIDC issuer와 provider UI E2E 자동화를 실제로
시도했지만 서명 검증·Supabase local 설정·2FA·bot 방지 경계에서 막혔다. 이
기계적 제약이 바뀌었는지는 가이드의 재조사 절차로 확인한다.
