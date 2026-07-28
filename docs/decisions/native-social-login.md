# 소셜 로그인은 Apple + Google 네이티브 플로우, 세트로 간다

로그인의 두 소셜 수단은 **Apple과 Google의 네이티브 플로우**
(`signInWithIdToken`)다. 둘은 한 세트로 채택된 것이지 각각 고른 것이 아니다 —
iOS에서 다른 소셜 로그인을 제공하면 **Sign in with Apple이 심사 필수**이기
때문이다(App Store 가이드라인 4.8).

- **이메일 수단을 넣어도 4.8은 계속 적용된다.** 면제 조항이 "전적으로 자사
  계정 시스템만 사용"이라, Google을 쓰는 한 Apple은 뺄 수 없다.
- **카카오 등 추가 소셜은 채택하지 않는다.** 한국어 앱이라 자연스러운
  제안이지만 지금은 넣지 않는다. 필요해지면 별도 결정으로 다룬다.
- 세 번째 수단인 이메일은 [email-otp-code](email-otp-code.md).

## 이 결정이 개발 루프를 바꿨다

Google 네이티브 사인인은 **Expo Go에서 동작하지 않는다.** 그래서 이 로그인을
도입하면서 개발 루프가 Expo Go → **development build**로 이동했다. 최초 1회,
그리고 네이티브 모듈·config plugin이 바뀔 때마다 `bunx expo run:ios`가 필요하다.

RevenueCat도 Expo Go에서 동작하지 않으므로, 나중에 붙일 때 추가 부담은 없다.

## 대가 — 자동 검증이 불가능해진다

소셜 로그인은 사람 손 없이 세션을 얻을 수 없다. ID 토큰 위조, 모의 OIDC
발급자, E2E 도구로 provider UI를 몰아붙이는 방법을 **전부 실제로 시도해서
막혔다.** 근거와 재조사 판단 기준은
[docs/auth-verification.md](../auth-verification.md)에 있고, 그 대가를 메우려고
이메일 경로를 채택했다.

Apple·Google 둘 다 2026-07-27 시뮬레이터(iPhone 17, iOS 26.5)에서 사람이 눌러
통과했다.
