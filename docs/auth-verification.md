# 인증이 걸린 경로를 자동으로 검증하는 법

로그인 이후 화면·API를 검증하려면 세션이 있어야 한다. **소셜 로그인은 사람 손
없이 세션을 얻을 수 없으므로**, 자동 검증은 전부 이메일 OTP 경로로 한다.

```bash
bun run auth:session                  # 임의 주소로 새 유저 → access_token
bun run auth:session me@example.test  # 주소 지정 — 다시 부르면 같은 유저
bun run auth:session --json           # 리프레시 토큰까지
```

로컬 스택이 떠 있어야 한다(`bun run db:start`). 메일은 Mailpit(54324)에만
쌓이고, 스크립트가 거기서 코드를 읽어 교환한다. 원격 URL이면 거부한다.

앱 UI까지 검증할 때는 시뮬레이터에서 이메일을 입력하고, Mailpit에서 코드를
읽어 그대로 입력하면 된다. 딥링크를 다룰 필요가 없다.

## 소셜 로그인을 자동화하려 하지 말 것

아래는 전부 **실제로 시도해서 막힌 것**들이다. 재조사 비용이 크니 근거를 함께
남긴다. 상황이 바뀌었는지 판단하려면 근거 쪽을 먼저 확인하라.

### Google — ID 토큰을 위조할 수 없다 (2026-07 확인)

`signInWithIdToken`은 로컬 스택에서도 Google의 실제 JWKS로 서명을 검증한다.
직접 서명한 RS256 토큰을 넣으면 `400 Bad ID token`으로 거부된다.

`[auth.external.google].url`로 발급자를 로컬 목으로 돌리는 것도 안 된다.
GoTrue가 Google provider의 issuer를 하드코딩하고, `url`이 설정돼 있으면
무시한다는 경고를 남긴다(`internal/api/provider/google.go`).

`skip_nonce_check`는 무관하다 — nonce 클레임 비교만 건너뛸 뿐 서명 검증은
그대로다.

### keycloak 슬롯을 이용한 모의 OIDC — CLI가 막는다 (2026-07 확인)

GoTrue 소스상 `keycloak`은 발급자 URL을 설정에서 읽는 유일한 provider라
모의 OIDC 서버를 붙일 수 있어 보인다. 실제로 모의 발급자를 세우고
`[auth.external.keycloak]`을 `enabled = true`로 넣어봤지만,
**Supabase CLI 2.109.1이 keycloak 설정을 컨테이너에 전달하지 않는다.**
GoTrue 환경변수에는 apple·google만 들어가고, 토큰 교환은
`provider_disabled (issuer "")`로 떨어진다.

CLI를 올릴 때 다시 확인해볼 가치는 있다. 확인 방법:

```bash
docker inspect supabase_auth_flyn --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -i keycloak
```

### Apple — 2FA 때문에 헤드리스로는 원천 불가

Sign in with Apple은 2FA가 켜진 Apple ID를 요구하는데, 자동화된 실행에는
2FA 챌린지에 답할 채널이 없다. App Store Connect의 Sandbox 테스터는 결제용이라
SIWA에 쓸 수 없고, XCTest에 이를 목으로 대체하는 API도 없다.

시뮬레이터에서 시도하면 Apple 계정이 로그인돼 있지 않은 한
`ERR_REQUEST_UNKNOWN`으로 떨어진다. 계정 로그인 여부는 이렇게 본다:

```bash
sqlite3 ~/Library/Developer/CoreSimulator/Devices/<UDID>/data/Library/Accounts/Accounts3.sqlite \
  "select ZUSERNAME from ZACCOUNT;"
```

**단 이 조회는 계정이 살아 있는지까지는 말해주지 않는다.** 행이 남아 있어도
자격증명이 만료돼 재인증 대기 상태면 SIWA 시트가 아예 뜨지 않고 버튼이
무반응이 된다(앱 쪽 로그도 남지 않는다). 그때 OS 로그에 나오는 서명은 이것이다:

```
AuthKit continuation-key token is missing!
Passwordless auth failed: AKAuthenticationError Code=-7075
Silent auth did not provide results. Interactive auth not allowed.
→ AKAuthenticationError Code=-7013
```

푸는 법은 아래 "사람이 직접 확인할 때"의 2번을 보라.

### E2E 도구로 provider UI를 몰아붙이는 것도 답이 아니다

Detox는 그레이박스라 앱 프로세스 밖의 시트를 건드릴 수 없다(메인테이너가
명시). Maestro는 가능하지만 iOS 26에서 웹뷰 인식이 깨졌다가 커뮤니티 패치로
복구된 전력이 있어 OS 업데이트에 취약하다. 무엇보다 Google은 자동화된
로그인을 봇으로 차단하고, 임베디드 웹뷰 OAuth를 `disallowed_useragent`로
막는다.

## 사람이 직접 확인할 때 — 시뮬레이터 준비물

소셜 로그인은 결국 사람이 한 번 눌러 확인해야 한다. 그 전에 아래 둘이 갖춰져
있어야 하는데, **둘 다 조용히 실패해서 원인을 Supabase 설정에서 찾게 만든다.**
2026-07-27에 실제로 여기서 반나절을 썼다.

### 1. 유효한 Apple 개발 인증서 — 없으면 빌드조차 안 된다

`usesAppleSignIn: true`가 넣는 `com.apple.developer.applesignin` 엔타이틀먼트
때문에 **Expo는 시뮬레이터 빌드에도 유효한 서명 인증서를 요구한다.** 근거는
`@expo/cli`의 `run/ios/codeSigning/simulatorCodeSigning.js`이고, 같은 목록에
`com.apple.developer.associated-domains`도 들어 있다.

인증서가 만료면 빌드가 `CommandError: No code signing certificates are
available to use.`로 죽는다. 확인은 이렇게 한다:

```bash
security find-identity -v -p codesigning
```

`0 valid identities found`면 만료다. **프로비저닝 프로파일 유효기간과 인증서
유효기간은 별개다** — 프로파일이 2026-10까지 살아 있어도 그 안에 박힌 인증서가
죽어 있을 수 있고, Xcode·포털에서는 프로파일만 초록불로 보여 착각하기 쉽다.

갱신은 Xcode → Settings → Accounts → **유료 팀** → Manage Certificates →
`+` → Apple Development. SIWA는 유료 팀 전용이라 Personal Team으로는 안 된다.

만료된 인증서로 만들어진 앱이 이미 깔려 있으면, 실행 시점에 스폰이 거부된다:

```
[app<com.odd.flyn>] Now flagged as pending exit for reason: Bootstrap failed
RBSRequestErrorDomain code 5 "Launch failed" / NSPOSIXErrorDomain 163
```

번들 구조·코드서명·아키텍처·Info.plist·프레임워크 의존성이 전부 정상이어도
이렇게 된다. 시뮬레이터를 바꾸거나 재설치해도 낫지 않으니, 이 로그가 보이면
인증서부터 보라.

### 2. 시뮬레이터 Apple 계정의 재인증

위 "Apple" 절에 적은 `AKAuthenticationError -7075 / -7013` 상태다. 앱에서
Sign in with Apple을 누르면 나오는 시트의 **Continue with Password**로 비밀번호를
넣으면 로그인과 재인증을 한 번에 끝낼 수 있다. Settings 앱을 따로 갈 필요는 없다.

### 어디서 죽었는지는 GoTrue 로그가 가른다

네이티브 단계에서 죽은 것과 Supabase가 거절한 것은 이 한 줄로 즉시 갈린다:

```bash
docker logs supabase_auth_flyn --since 20m 2>&1 | grep id_token
```

요청 자체가 없으면 앱·Apple 쪽 문제고, 있는데 실패면 Supabase 쪽 문제다.
**요청이 없는데 Supabase 설정을 뒤지는 것이 가장 흔한 낭비다.**

### 2026-07-27 통과 기록

Apple·Google 둘 다 시뮬레이터(iPhone 17, iOS 26.5)에서 사람이 눌러 통과했다.
성공하면 GoTrue에 `path=/token grant_type=id_token status=200`과
`login_method=oidc`가 남고, `auth.identities`에 해당 provider 행이 생긴다.

Apple은 `fullName`을 **최초 로그인 1회만** 주므로, 이 경로가 실제로 동작하는지는
재시도로 확인할 수 없다. 이때 `auth.users.raw_user_meta_data.full_name`이 채워졌는지
같이 확인해두면 좋다.

## 검증 범위

| 구간 | 자동 검증 |
| --- | --- |
| 네이티브 SDK → ID 토큰 교환 | **불가** — 사람이 한 번 확인 (Apple·Google 모두 2026-07-27 시뮬레이터에서 통과) |
| 세션 발급·복원·만료 | 가능 (이메일 OTP) |
| RLS 경계 | 가능 |
| Hono JWT 게이트 | 가능 — `jose`로 토큰을 직접 서명한다(`apps/api/src/scratch-notes.route.test.ts`) |
| 로그아웃 | 가능 |
