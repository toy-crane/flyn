# 인증이 걸린 경로 검증

## 자동 세션

로그인 이후 화면·API 자동 검증은 이메일 OTP 세션을 사용한다.

```bash
bun run db:start
bun run auth:session                  # 임의 주소로 새 사용자와 access token
bun run auth:session me@example.test  # 지정 주소, 재호출하면 같은 사용자
bun run auth:session --json           # refresh token 포함
```

스크립트는 로컬 Supabase와 Mailpit에서 OTP를 읽어 교환하며 원격 URL이면 거부한다.
앱 UI는 이메일을 입력한 뒤 Mailpit의 6자리 코드를 그대로 입력한다.

## 소셜 로그인을 자동화하지 않는 이유

| 시도 | 막힌 경계 | 다시 볼 조건 |
| --- | --- | --- |
| 직접 서명한 Google ID token | GoTrue가 Google의 실제 JWKS로 서명을 검증한다 | Supabase가 test issuer를 공식 지원할 때 |
| Google issuer URL을 로컬 mock으로 교체 | provider issuer가 고정되고 설정이 무시된다 | provider 설정 API가 바뀔 때 |
| Keycloak slot을 mock OIDC로 사용 | local CLI가 provider 설정을 Auth container에 전달하지 않는다 | CLI 업그레이드 후 container env에 설정이 보일 때 |
| Apple headless 로그인 | 유효한 Apple ID의 2FA challenge에 답할 채널이 없다 | Apple이 공식 test identity나 XCTest seam을 제공할 때 |
| E2E로 provider UI 조작 | 시스템 UI·webview 경계와 provider bot 방지가 있다 | provider가 허용한 자동화 경로가 생길 때 |

`skip_nonce_check`는 nonce 비교만 건너뛰며 Google signature 검증을 끄지 않는다.
Keycloak 경로를 다시 확인하려면 Auth container에 실제 설정이 전달됐는지 먼저 본다.

```bash
docker inspect supabase_auth_flyn --format '{{range .Config.Env}}{{println .}}{{end}}' | grep -i keycloak
```

## 소셜 로그인을 사람이 확인할 때

### Apple code signing

`usesAppleSignIn: true`가 추가하는 entitlement 때문에 simulator build도 유효한 Apple
Development certificate가 필요하다.

```bash
security find-identity -v -p codesigning
```

`0 valid identities found`면 Xcode → Settings → Accounts → 유료 team → Manage
Certificates에서 Apple Development certificate를 갱신한다. provisioning profile과
그 안의 certificate 만료는 별개다.

만료된 서명의 앱은 설치돼 있어도 launch가 `Bootstrap failed`,
`RBSRequestErrorDomain code 5`, `NSPOSIXErrorDomain 163`으로 거부될 수 있다.
bundle·architecture를 조사하기 전에 certificate부터 확인한다.

### Apple 계정 재인증

Apple button이 무반응이고 OS log에 아래 조합이 보이면 simulator 계정의 credential이
만료된 상태다.

```text
AuthKit continuation-key token is missing
AKAuthenticationError -7075
Silent auth did not provide results
AKAuthenticationError -7013
```

Sign in with Apple sheet의 **Continue with Password**에서 계정을 재인증한다. 계정
DB에 username 행이 있다는 사실만으로 credential이 유효하다고 판단하지 않는다.

### native와 Supabase 실패 구분

```bash
docker logs supabase_auth_flyn --since 20m 2>&1 | grep id_token
```

요청이 없으면 native/provider 단계 문제이고, 요청이 있는데 실패하면 Supabase
설정·token 교환 문제다. 성공하면 `/token`, `grant_type=id_token`, status 200과
해당 `auth.identities` provider 행을 확인한다. Apple `fullName`은 최초 승인 때만
오므로 첫 통과에서 metadata도 확인한다.

## 검증 범위

| 구간 | 방법 |
| --- | --- |
| native SDK → provider ID token | 사람이 Apple·Google 각각 확인 |
| 세션 발급·복원·만료 | 이메일 OTP 자동 세션 |
| RLS | pgTAP과 앱 통합 테스트 |
| Hono JWT gate | `account.route.test.ts`, `roleplay.route.test.ts`의 `jose` 서명 token |
| 로그아웃·계정 삭제 | 이메일 OTP session 기반 자동 검증 |
