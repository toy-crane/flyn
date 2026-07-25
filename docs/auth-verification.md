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

### E2E 도구로 provider UI를 몰아붙이는 것도 답이 아니다

Detox는 그레이박스라 앱 프로세스 밖의 시트를 건드릴 수 없다(메인테이너가
명시). Maestro는 가능하지만 iOS 26에서 웹뷰 인식이 깨졌다가 커뮤니티 패치로
복구된 전력이 있어 OS 업데이트에 취약하다. 무엇보다 Google은 자동화된
로그인을 봇으로 차단하고, 임베디드 웹뷰 OAuth를 `disallowed_useragent`로
막는다.

## 검증 범위

| 구간 | 자동 검증 |
| --- | --- |
| 네이티브 SDK → ID 토큰 교환 | **불가** — 실기기에서 사람이 한 번 확인 |
| 세션 발급·복원·만료 | 가능 (이메일 OTP) |
| RLS 경계 | 가능 |
| Hono JWT 게이트 | 가능 — `jose`로 토큰을 직접 서명한다(`apps/api/src/scratch-notes.route.test.ts`) |
| 로그아웃 | 가능 |
