# Apple refresh token은 서버에 보관하고 계정 삭제 전에 취소한다

Supabase의 Apple `signInWithIdToken`은 flyn 세션을 만들지만, Apple 쪽 사용자
승인을 나중에 취소할 수 있는 refresh token을 flyn에 남기지 않는다. 그래서 Apple
로그인은 계정 생성 때 네이티브 credential의 authorization code도 서버로 보내고,
서버가 Apple token endpoint에서 검증·교환해 받은 refresh token을 보관한다.

계정 삭제는 이 token을 Apple에서 먼저 취소한 뒤 Supabase 사용자를 hard delete한다.
Apple 취소가 실패하면 로컬 계정을 먼저 지워 재시도 수단을 잃지 않고, 삭제를
중단해 사용자가 다시 시도할 수 있게 한다.

## 왜 별도 보관하는가

Apple은 계정 생성을 지원하는 앱이 앱 안에서 전체 계정 삭제를 시작하게 하고,
Sign in with Apple 사용자의 token도 취소하라고 요구한다. 2025년 기술 노트는
계정 생성 때 authorization code를 서버에서 검증하고 refresh token을 안전하게
보관해 미래의 취소에 쓰는 흐름을 명시한다.

- [앱에서 계정 삭제 기능 제공하기](https://developer.apple.com/kr/support/offering-account-deletion-in-your-app/)
- [TN3194: Handling account deletions and revoking tokens for Sign in with Apple](https://developer.apple.com/documentation/technotes/tn3194-handling-account-deletions-and-revoking-tokens-for-sign-in-with-apple)

## 기각한 대안

- **Supabase 사용자만 삭제**: Apple 승인이 남아 심사 요구를 충족하지 못한다.
- **삭제 시점에만 Apple 재인증**: 평소에는 token을 저장하지 않는 장점이 있지만,
  사용자가 취소하거나 다른 Apple 계정을 고르면 계정 삭제 자체가 막힌다. Apple이
  계정 생성 시 보관하는 흐름을 직접 권장하므로 따르지 않는다.
- **프로필에 token 저장**: `profiles`는 모바일 Data API에 노출되는 사용자 정보다.
  취소 token은 별도 서버 전용 저장소에 두고 모바일·RLS 클라이언트에는 내보내지
  않는다.

## 대가와 경계

- 민감한 refresh token을 다루므로 서버 전용 저장소와 최소 권한이 필요하다.
- Apple client secret 생성·token 교환·취소는 전부 Hono가 맡는다.
- token을 로그·에러 응답·PostHog에 남기지 않는다.
- 기존 사용자가 없으므로 token 없는 Apple 계정을 위한 이행 경로는 만들지 않는다.
