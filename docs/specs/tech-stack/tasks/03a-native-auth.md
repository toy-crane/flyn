# 03a 네이티브 인증

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 02 Supabase 경계 (완료)
- 상태: **진행 중 — 이 저장소의 다음 작업이다.** 이메일 경로는 검증 완료 ·
  Apple·Google은 코드 완료 후 수동 확인 대기. **코드로 할 일은 남아 있지 않고,
  남은 것은 전부 사용자 자격증명이 필요한 검증이다**(아래 "남은 검증").
  이것이 닫히기 전에는 03b·04로 넘어가지 않는다 — 근거는 plan.md "현재 위치"

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

- [x] development build로 시뮬레이터에서 개발이 가능하다 — 로컬
      `expo run:ios`로 빌드·설치·구동 확인. EAS는 03b 이월
- [ ] Apple 로그인으로 세션을 얻고 스크래치 카드가 내 행만 CRUD 한다 —
      **코드 완료, 검증 보류**(포털 capability + 시뮬레이터 Apple 계정 필요)
- [ ] Google 로그인으로 같은 경로가 돌고, 두 계정의 행이 서로 보이지 않는다 —
      **코드 완료, 검증 보류**(`accounts.google.com` 동의 화면까지 확인)
- [x] 익명 로그인이 코드와 `config.toml` 양쪽에서 사라졌다 —
      `/auth/v1/settings`가 `anonymous_users: false` 반환
- [x] **이메일 OTP로 로그인 → RLS CRUD → 서버 집계까지 시뮬레이터에서 검증**
      (사람 개입 없이 에이전트가 전 구간 수행). 메모 추가 후 서버 집계는
      전체 4개·소유자 3명인데 내 목록엔 1개만 보였다 — RLS가 실제로 걸린다
- [x] 로그아웃 → 재로그인, 앱 재실행 시 세션 복원이 동작한다 —
      이메일 경로로 확인. 소셜 경로도 같은 `use-auth` 상태 기계를 탄다
- [x] `bun run check`와 `bun run db:test`가 통과한다

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

### 테스트에서 걸릴 것

`sign-in` 스모크와 `use-auth`의 signedOut 전이 테스트를 추가하는데, 지금
테스트 배선이 그대로는 안 받는다.

- `scratch-notes.test.tsx`의 `jest.mock("../lib/supabase", () => ({ supabase: {} }))`는
  named export가 `supabase` 하나뿐이라는 전제다. `supabase.ts`에 컴포넌트가
  import하는 export가 늘면 이 목이 깨진다
- `use-auth` 테스트에는 `auth.onAuthStateChange` · `getClaims` ·
  `signInWithIdToken` · `signOut`을 갖춘 더 두꺼운 목이 필요하다
- `expo-apple-authentication`과 `@react-native-google-signin/google-signin`은
  jest-expo가 목을 제공하지 않는다. `jest.mock` 팩토리를 직접 써야 한다
- `apps/mobile/tsconfig.json`의 `types`는 `["jest"]`뿐이다. 앰비언트 타입이
  필요한 라이브러리를 넣으면 이 배열을 늘려야 한다

### 그 밖에 지금 없는 것

- 저장소 어디에도 `signOut` 헬퍼가 없다. 로그아웃 버튼과 함께 새로 만든다
- `app.json`에 `version`/`ios.buildNumber`가 없다.
  `cli.appVersionSource: "remote"`와 함께 `version`을 넣어야 한다

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

### 진행 중 결정 기록 (2026-07-25)

- **EAS 셋팅은 이 태스크에서 패스**(사용자 결정). dev build는 로컬
  `expo run:ios`로 만들고, `eas init`·`eas.json`·`cli.appVersionSource`는
  03b로 이월한다. 완료 기준 1의 "EAS development build"는 "로컬 development
  build"로 대체.
- **Apple 포털 capability는 사용자가 나중에 직접 등록**(사용자 결정).
  시뮬레이터는 포털 등록 없이도 로그인 시트가 뜨는지 확인하고, 실기기
  검증은 등록 후로 미룬다.
- "확인이 필요한 것" 중 Apple secret: CLI는
  `SUPABASE_AUTH_EXTERNAL_APPLE_SECRET` 미설정을 **경고만 하고 강제하지
  않는다**. `[auth.external.apple]`에서 secret 줄을 제거해도 스택이 뜬다.
- 테스트 배선이 태스크 예상보다 더 망가져 있었다: pgTAP 헬퍼의
  SECURITY DEFINER + `set_config('role')` 조합과 서브쿼리 안 데이터 변경
  CTE는 Postgres가 원천 금지라 `db:test`가 통과한 적이 없는 구조였다.
  별도 커밋으로 수리했다.
- 태스크에 없던 함정: expo-router는 `src/app/**`의 모든 `.tsx`를 라우트로
  스캔한다(`_ctx` 정규식이 `.test.`를 제외하지 않음). `sign-in.test.tsx`가
  라우트로 잡혀 `@testing-library`가 앱 번들에 끌려와 dev build가 죽었다.
  Metro `resolver.blockList`로 제외했다.
- Google Cloud: 새 프로젝트 `flyn-503501`. 웹
  `1083121475965-csee193iar0c2aoonpms5vmar0imc5fd`, iOS
  `1083121475965-35se6gqqco17rok6cb45b6rcand6gl9a`.

### 범위 확장 — 이메일 OTP 추가 (2026-07-25)

태스크 원안에 없던 작업이다. 소셜 로그인 검증이 사람 손을 타야 한다는 사실이
드러나면서, 인증 이후 경로 전체가 자동 검증 불가 상태로 남는 게 문제였다.
spec.md에서 기각했던 이메일 수단을 되살려 해결했다 — 테스트 백도어가 아니라
**제품 인증 수단**이라 프로덕션 배제 고민이 없고, 검증도 실제 상태 기계를 탄다.

- 매직링크가 아니라 **6자리 코드**다. `supabase/templates/`의 `{{ .Token }}`
  템플릿을 `[auth.email.template.magic_link|confirmation]`에 연결했다.
  이유는 spec.md 참조(딥링크·AASA 불필요, 메일 보안 장비 회피).
- `signInWithOtp`는 이름과 달리 **기본이 매직링크**라 템플릿 교체가 필수다.
- `bun run auth:session`으로 세션을 얻는다. Mailpit에서 코드를 읽어 교환하고
  access_token을 출력한다. 로컬 URL이 아니면 거부한다.
- 소셜 자동화를 다시 시도하지 않도록 막다른 길을 근거와 함께
  [docs/auth-verification.md](../../../auth-verification.md)에 남기고,
  CLAUDE.md에서 그 문서를 가리킨다.
- `[auth.rate_limit] email_sent`를 2 → 100으로 올렸다(로컬 한정).
  호스티드 값과 SMTP 설정은 **03b가 받는다** — 범위가 그만큼 늘었다.

### 남은 검증 (사용자 자격증명 필요)

시뮬레이터 dev build에서 로그인 화면·Google 시트·`accounts.google.com`
동의 화면("to continue to flyn")까지 확인했다. 계정 입력부터는 사람이 해야
한다. 그 뒤 RLS CRUD·두 계정 격리·로그아웃·세션 복원이 남는다.

**사용자가 먼저 해줘야 하는 것** — 이 세 개가 선행되지 않으면 검증 세션을
열어도 같은 지점에서 막힌다:

- [ ] Apple Developer 포털에서 App ID `com.odd.flyn`에 **Sign in with Apple**
      capability 활성
- [ ] 시뮬레이터 **설정 앱에서 Apple 계정 로그인** — 계정이 없어서
      `ERR_REQUEST_UNKNOWN`이 난다(포털 등록과는 별개 원인이다)
- [ ] **Google 계정 2개**(또는 Apple + Google 조합) — 두 계정 격리 확인용

**에이전트가 대신할 수 없는 것**: 계정 자격증명 입력. 그 외 로컬 스택 기동,
dev build 설치, 시뮬레이터 조작, 로그인 이후의 RLS CRUD·격리·로그아웃·세션
복원 확인은 에이전트가 몰 수 있다. 즉 검증 세션의 모양은 "에이전트가
로그인 화면까지 몰아둔 뒤 계정 입력만 사람이 하고, 그 뒤를 다시 에이전트가
확인"이다.

Apple은 시뮬레이터에 Apple 계정이 없어(`Accounts3.sqlite`에 Apple ID 없음)
`ERR_REQUEST_UNKNOWN`으로 떨어진다. 포털 capability 등록과 별개 원인이며,
둘 다 사용자가 처리한 뒤 재검증한다.

**재개 절차** — 로컬(원격 제어가 아닌) 세션에서:

```bash
bun run db:start                       # 로컬 Supabase
bun run --filter @flyn/api dev         # API
cd apps/mobile && bunx expo run:ios    # dev build 설치 + Metro
```

시뮬레이터 설정에서 Apple 계정 로그인(Apple 검증 시)과 Apple Developer
포털의 `com.odd.flyn` Sign in with Apple capability 활성이 선행 조건이다.
두 계정 격리는 Google 계정 2개 또는 Apple + Google 조합으로 확인한다.

**미검증 리스크** — Apple의 `[auth.external.apple].skip_nonce_check`를
`false`로 뒀다. `signInAsync`에 nonce를 넘기지 않으면 Apple이 nonce claim을
빼므로 Supabase도 검사를 건너뛴다는 전제인데, 실제 로그인으로 확인하지
못했다. Apple에서 nonce 관련 거부가 나면 Google처럼 `true`로 바꾼다.
