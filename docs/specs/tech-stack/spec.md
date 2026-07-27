# 테크 스택

flyn의 기술 스택 결정. 제품 도메인은 이 스펙의 범위가 아니며, 여기서는 어떤
도구 위에서 만들 것인지만 확정한다.

## 확정 결정

논거는 **결정 기록**이 들고 있다 — 이 절은 무엇이 정해졌는지만 세운다. 뒤집으려면
해당 기록을 읽고 새 기록을 쓴다. 전체 색인은
[docs/decisions/README.md](../../decisions/README.md).

### 저장소·툴체인

- 모노레포는 Turborepo + bun, 설치는 hoisted 고정, Supabase 생성 타입은
  `packages/supabase` 한 곳에서만 —
  [turborepo-with-bun](../../decisions/turborepo-with-bun.md)

### 모바일

Expo 최신 SDK + Expo Router. 빌드·배포는 EAS Build / EAS Update.

- 타깃은 iOS 전용, Android·web 폴백 없음 — [ios-only](../../decisions/ios-only.md)
- 커스텀 디자인 시스템을 만들지 않고 Apple HIG를 따른다 —
  [apple-hig-not-a-design-system](../../decisions/apple-hig-not-a-design-system.md)
- 새 화면은 universal `@expo/ui`, 경계가 막는 화면만 RN —
  [expo-ui-by-default](../../decisions/expo-ui-by-default.md)
- 스타일링은 Uniwind(무료 범위로 충분), `Host` 바깥에서만 —
  [uniwind-for-styling](../../decisions/uniwind-for-styling.md)
- 색은 iOS 시맨틱 색만, `dark:`는 색에 쓰지 않는다 —
  [ios-semantic-colors](../../decisions/ios-semantic-colors.md)
- 개발 루프는 **dev build 기준**(03a부터). Expo Go는 포기했다 —
  [native-social-login](../../decisions/native-social-login.md)

### API·AI

- API는 Vercel 위의 Hono — [hono-on-vercel](../../decisions/hono-on-vercel.md)
- 모델 호출은 AI SDK로 하되 반드시 Vercel AI Gateway를 경유 —
  [ai-gateway-for-model-calls](../../decisions/ai-gateway-for-model-calls.md)

### 인증·데이터

- 소셜은 Apple + Google 네이티브 세트, 추가 소셜 미채택 —
  [native-social-login](../../decisions/native-social-login.md)
- 세 번째 수단은 이메일 6자리 코드, 매직링크 기각 —
  [email-otp-code](../../decisions/email-otp-code.md)
- 일반 CRUD는 앱이 Supabase에 직접 가고 RLS가 보안 경계, AI·서버 전용만 Hono —
  [hybrid-data-access](../../decisions/hybrid-data-access.md)
- 로그인 이후를 자동 검증하는 경로는 이메일 OTP 하나뿐 —
  [auth-verification](../../auth-verification.md)

### 결제·구독 — RevenueCat

인앱 구독·결제는 RevenueCat(`react-native-purchases`, Expo config plugin).
구독 상태의 서버 반영은 RevenueCat webhook → Hono → Supabase 기록을 기본값으로
한다. Expo Go에서 동작하지 않지만 네이티브 로그인과 같은 제약이라 추가 부담은
없다.

**기록을 따로 두지 않았다** — 착수 전이고 구독 상품이 제품 결정에 의존해서,
아직 저울질한 대안이 없다. 실제로 붙일 때 대안을 기각했다면 그때 기록을 만든다.

### 애널리틱스 — PostHog

앱 이벤트는 `posthog-react-native`. 서버 이벤트·AI 호출 관측이 필요해지면
`posthog-node`와 PostHog LLM Analytics를 추가한다. 위와 같은 이유로 기록을
두지 않았다.

## 가정 (기본값 — 반증 나오면 뒤집는다)

- TypeScript strict. 린트·포맷은 Biome + Ultracite 프리셋. ultracite v7에는
  bare `"ultracite"` config export가 없어 실제 값은
  `extends: ["ultracite/biome/core", "ultracite/biome/react", "ultracite/biome/jest"]`
  이다(태스크 01에서 확인). `ultracite init`은 대화형이라 에이전트 세션에서는
  `biome.jsonc`를 직접 쓰고 `@biomejs/biome`를 devDependency로 넣는다.
  규칙이 과하다고 판단되면 extends를 빼서 plain Biome으로 복귀(전환 비용 거의 없음).
- 클라이언트 서버상태는 TanStack Query.
- 앱 ↔ Hono 통신은 Hono RPC(`hc`)로 타입 공유.
- DB 마이그레이션은 supabase CLI(SQL 마이그레이션). 서버 측 쿼리도 우선
  `supabase-js`로 단순하게 가고, ORM(Drizzle 등)은 필요가 증명되면 재검토.
- 크래시 리포팅은 PostHog error tracking으로 시작(RN 지원, 도구 하나로
  analytics와 통합). 네이티브 심볼리케이션 깊이가 부족하면 Sentry 추가 재검토.
- 시크릿 규율: `EXPO_PUBLIC_*` 값은 앱 번들에 그대로 노출되므로 공개 가능한
  값(Supabase URL·anon key, PostHog key)만 둔다. AI Gateway 키 등 비밀은
  서버 측(Vercel env)에만 존재.
- AI 엔드포인트는 1일차부터 사용자별 rate limit을 두고, 유료 기능은
  RevenueCat entitlement로 게이팅한다. AI Gateway에는 지출 한도 설정.

## 환경 구성 (기본값 — 가정과 같은 지위)

3계층. 일상 개발은 전부 로컬에서 돌고, 호스티드 Supabase는 dev·prod
프로젝트 2개를 둔다.

| 레이어 | 모바일 | API(Hono) | Supabase |
| --- | --- | --- | --- |
| 로컬 개발 | Expo dev server | bun 로컬 실행 | `supabase start` 로컬 스택 |
| dev/preview | EAS preview 빌드(내부 배포) | Vercel preview | 호스티드 dev 프로젝트 |
| production | 스토어 빌드 | Vercel production | 호스티드 prod 프로젝트 |

- 호스티드 dev 프로젝트가 필요한 이유: EAS 빌드(실기기·TestFlight)와
  Vercel preview는 localhost의 로컬 스택에 접근할 수 없다.
- 마이그레이션 흐름: 로컬에서 작성(`supabase migration new`/`db diff`) →
  저장소 커밋 → dev 프로젝트에 `supabase db push`로 검증 → prod에 push.
  타입 생성(`packages/supabase`)도 로컬 스키마 기준.
- 환경 변수는 앱별 `.env.local`(로컬)과 EAS 프로필·Vercel 환경 변수
  (dev/prod)로 주입. EAS 프로필은 development/preview/production 3개.
- Supabase는 Pro 요금제 사용 중이라 브랜칭을 언제든 켤 수 있다. 다만
  EAS preview 빌드는 빌드 시점에 URL이 박혀 고정 타깃이 필요하므로 상시
  dev 프로젝트를 기본으로 유지하고, PR 단위 DB 격리가 실제로 필요해지면
  브랜칭(브랜치 가동 시간당 과금)을 도입한다.

## 테스트 전략 (기본값 — 가정과 같은 지위)

- **api·packages — `bun test`**: Hono는 `app.request()`로 서버 기동 없이
  핸들러를 직접 테스트한다. AI 로직은 AI SDK의 mock provider
  (`MockLanguageModelV4` — `ai/test`, `simulateReadableStream` — `ai`)로 모델
  호출 없이 결정적으로 검증. **`MockLanguageModelV2`라고 적혀 있었으나 그
  이름은 존재하지 않는다**(2026-07-25 정정. v3/v4만 있다).
  `app.request()`가 스트리밍 본문을 청크 단위로 돌려주는 것은 확인했으므로,
  "토큰이 쪼개져 온다"까지 단정하는 테스트가 가능하다.
- **RLS·스키마 — supabase 로컬 스택 + pgTAP**: `supabase test db`로 정책을
  검증한다. RLS가 보안 경계이므로 정책을 만들 때마다 테스트를 함께 작성
  — 이 아키텍처에서 가장 가치 높은 테스트.
- **mobile — jest-expo + React Native Testing Library**: bun test가 RN
  변환을 지원하지 않아 모바일만 Jest를 쓴다. 버전은 **29**다 — SDK 57의
  jest-expo가 babel-jest·@jest/globals·jest-environment-jsdom을 전부 29 계열로
  물고 있어 `expo install --check`가 `~29.7.0`을 요구한다(태스크 01에서 확인).
  러너 2개 공존은 turbo 태스크(`turbo run test`) 뒤로 감춘다.
- **E2E — Maestro**: Expo가 1순위로 지원(EAS Workflows 통합, Detox는 Expo와
  부적합). 화면이 생긴 뒤 핵심 플로우부터 도입.
- **CI — GitHub Actions**: `turbo run test`를 PR마다 실행. 캐시는 turbo 원격
  캐시(Vercel) 사용.

## 유보된 것

- 제품 도메인·스키마: flyn이 무엇인지는 이 세션에서 다루지 않았다. 도메인
  셰이핑이 선행되어야 스키마·RLS 설계가 가능.
- 푸시 알림: 제품 요구 확정 후 결정.

## 남은 리스크

- **Uniwind 성숙도**: 2025년 출시된 신생 라이브러리. 유료 범위 미확인 항목은
  태스크 01에서 해소됐고(무료로 충분), 문제가 생기면 NativeWind로 전환하는
  경로가 있다 — 근거와 탈출 경로는
  [uniwind-for-styling](../../decisions/uniwind-for-styling.md).
- ~~**AI SDK ↔ Expo 폴리필**~~ — **해소됨 (2026-07-25).** Expo 52 시절의 공식
  가이드가 `@ungap/structured-clone`·`@stardazed/streams-text-encoding` 수동
  폴리필을 요구하지만, **설치된 Expo 57은 winter 런타임이 이미 세 개를 다
  깔아준다** — `node_modules/expo/src/winter/runtime.native.ts`가
  `structuredClone`·`TextEncoderStream`·`TextDecoderStream`을 `install()`하고,
  `@ungap/structured-clone`은 이미 `expo`의 의존이다. `ReadableStream`은
  `expo/virtual/streams`로 들어온다. 이 런타임은 Metro의
  `getModulesRunBeforeMainModule`에 실려 앱 코드보다 먼저 돈다 —
  **폴리필 파일을 만들면 오히려 나중에 실행되는 죽은 코드다.**
  남는 요구사항은 `EXPO_PUBLIC_API_BASE_URL`을 프로덕션에서 명시하는 것 하나뿐이다.
- **RLS 의존**과 **`@supabase/server` 베타**: 둘 다 하이브리드 경계가 안고 가는
  대가다. 규율과 후퇴 경로는
  [hybrid-data-access](../../decisions/hybrid-data-access.md).
- **AI 비용 폭주**: 인증만 통과하면 호출되는 AI 엔드포인트는 소수 사용자가
  비용을 폭주시킬 수 있는 표면. 사용자별 rate limit·entitlement 쿼터·
  Gateway 지출 한도가 방어선(가정 참조).
- **스토어 리드타임**: Apple은 인앱 계정 삭제 기능과 개인정보처리방침 URL이
  심사 필수. 출시일에서 역산해 준비할 것. *(2023-11 이후 만든 Google Play 개인
  계정의 12명·14일 비공개 테스트 요건도 적어 뒀었다 —
  [ios-only](../../decisions/ios-only.md)이라 지금은 해당 없고, Android를
  채택하는 별도 결정이 나오면 되살아난다.)*
- **Supabase free 플랜은 prod 부적합**: 1주 미사용 시 프로젝트 pause.
  prod은 Pro 플랜 기준으로 비용 계획.
- **Vercel 함수 시간 한도**: 긴 AI 스트림·후처리는 `maxDuration` 확인 —
  수치는 [hono-on-vercel](../../decisions/hono-on-vercel.md).
