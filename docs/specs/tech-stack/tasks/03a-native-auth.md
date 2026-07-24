# 03a 네이티브 인증

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 02 Supabase 경계
- 상태: 대기

## 무엇을 만드는가

02의 익명 로그인을 실제 Apple·Google 세션으로 교체한다. 사용자는 앱을 열면
로그인 화면을 만나고, Apple 또는 Google로 로그인해 세션을 얻은 뒤 기존
스켈레톤 카드(RLS CRUD, Hono 인증 게이트)를 그대로 쓴다. 로그아웃하면 다시
로그인 화면으로 돌아온다.

검증은 **로컬 Supabase 스택** 기준이다. 호스티드 프로젝트·배포는 03b가 맡는다.

Google 네이티브 사인인이 Expo Go에서 동작하지 않으므로, 이 태스크에서 개발
루프가 Expo Go → **development build**로 이동한다. 01에 기록한 "Uniwind
무료 범위면 Expo Go를 유지한다"는 이점이 여기서 소멸하므로 spec.md에
회귀시킨다(무료 범위 결론 자체는 유효).

## 완료 기준

- [ ] EAS development build로 실기기/시뮬레이터에서 개발이 가능하다
- [ ] Apple 로그인으로 세션을 얻고 스크래치 카드가 내 행만 CRUD 한다
- [ ] Google 로그인으로 같은 경로가 돌고, 두 계정의 행이 서로 보이지 않는다
- [ ] 익명 로그인이 코드와 `config.toml` 양쪽에서 사라졌다
- [ ] 로그아웃 → 재로그인, 앱 재실행 시 세션 복원이 동작한다
- [ ] `bun run check`와 `bun run db:test`가 통과한다

## 구현 메모

### 확정된 것

- 앱 이름 `flyn`, 번들 ID `com.odd.flyn` (01에서 확정)
- Apple Developer Program 계정은 등록 완료 상태
- Google은 `@react-native-google-signin/google-signin` (Supabase 권장,
  네이티브 시트 UX). `expo-auth-session` 웹 플로우는 기각

### 순서

1. **dev build 전환** — `expo-dev-client` 설치, `eas init`으로
   `app.json`에 `extra.eas.projectId` 확보. `eas.json`에는 `development`
   프로필만 만든다(preview·production은 03b). `cli.appVersionSource: "remote"`를
   미리 넣어 03b에서 buildNumber를 EAS가 관리하게 한다.
2. **Apple** — `expo-apple-authentication` 설치, `app.json`에 플러그인 +
   `ios.usesAppleSignIn: true`. Apple Developer 포털에서 App ID
   `com.odd.flyn`에 Sign in with Apple capability 활성.
   `config.toml`의 `[auth.external.apple]`를 `enabled = true`,
   `client_id = "com.odd.flyn"` — 네이티브 전용이라 Services ID·서명키·Team
   ID는 필요 없다(웹 OAuth 전용). `signInAsync` →
   `signInWithIdToken({ provider: "apple", token: identityToken })`.
   Apple은 `fullName`을 최초 1회만 주므로 성공 직후 `updateUser`로 보관하고,
   `ERR_REQUEST_CANCELED`는 실패가 아니라 취소로 처리한다.
3. **Google** — Google Cloud에 OAuth 클라이언트 **2개**(iOS: 번들
   `com.odd.flyn`, Web). `app.json` 플러그인에 `iosUrlScheme`
   (reversed iOS client ID — 공개값이라 커밋 가능).
   `config.toml`에 `[auth.external.google]` 블록 신규 추가(현재 없다).
   대시보드 "Client IDs"는 **웹 먼저, iOS 뒤** 쉼표 구분.
   `GoogleSignin.configure({ webClientId, iosClientId })` → `signIn()` →
   `signInWithIdToken({ provider: "google", token: idToken })`.
   클라이언트 ID는 `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`·
   `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID`로 주입.
4. **익명 로그인 교체** — 핵심 변경은 `apps/mobile/src/lib/use-auth.ts`
   하나다. `AuthState`에 `signedOut`을 추가하고 `signInAnonymously()` 호출을
   제거한다. `getClaims()` 검증 폴백과 `INITIAL_SESSION`만 검증하는 최적화는
   유지. 세션 만료도 `failed`가 아니라 `signedOut`으로 떨어뜨린다.
   `src/app/sign-in.tsx`를 새로 두고 `_layout.tsx`를 `Slot` → `Stack`으로
   바꿔 리다이렉트한다. `config.toml`의 `enable_anonymous_sign_ins = false`.
5. **화면** — HIG 준수 방침대로 `AppleAuthenticationButton`과
   `GoogleSigninButton` 기본 컴포넌트를 그대로 쓰고 Uniwind는 레이아웃·간격만
   담당한다. `index.tsx`는 인증 분기를 덜어내고 카드 3종 + 로그아웃 버튼만
   남기며, 안내 문구("익명 로그인으로 세션을 얻고…")도 갱신한다.

### 건드리는 파일

`apps/mobile/app.json` · `apps/mobile/package.json` · `apps/mobile/eas.json`(신규) ·
`apps/mobile/.env.example` · `src/lib/use-auth.ts`(재작성) ·
`src/lib/auth/{apple,google}.ts`(신규) · `src/app/{_layout,index,sign-in}.tsx` ·
`supabase/config.toml` · `README.md` · `docs/specs/tech-stack/spec.md`

기존 모바일 테스트는 `../lib/supabase`를 통째로 목하고 있어 대부분 그대로
통과한다. `sign-in` 스모크와 `use-auth`의 signedOut 전이 테스트를 추가한다.

### 확인이 필요한 것

- 로컬 `config.toml`의 `[auth.external.google].client_id`가 대시보드처럼
  쉼표 구분 다중 값을 받는지. 안 되면 로컬은 웹 클라이언트만 두고 Google
  네이티브 검증을 03b의 호스티드 dev로 옮긴다(계획 갱신 사유로 기록).
- Apple provider가 네이티브 전용인데도 CLI가
  `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET`을 강제하는지.

### 실행 환경

**macOS + Xcode가 있는 로컬 세션에서 한다.** 완료 기준이 전부 "dev build에서
실제로 로그인된다"라서 Linux 원격 세션에서는 한 줄도 검증할 수 없고,
`config.toml`·`app.json`의 플러그인 값은 대시보드에서 나오는 실제 ID에 의존한다.

### 사람이 해야 하는 것

Apple Developer 포털 capability 설정 · Google Cloud OAuth 클라이언트 2개 생성 ·
`eas init` · dev build 설치와 실기기 로그인 확인. 여기서 나온 ID를 받아
파일 작업을 이어간다.
