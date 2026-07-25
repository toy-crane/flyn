# 테크 스택

flyn의 기술 스택 결정. 제품 도메인은 이 스펙의 범위가 아니며, 여기서는 어떤
도구 위에서 만들 것인지만 확정한다.

## 확정 결정

### 1. 모노레포 — Turborepo + bun

- bun은 패키지 매니저이자 로컬 런타임. 태스크 오케스트레이션은 Turborepo.
- 레이아웃:
  - `apps/mobile` — Expo 앱
  - `apps/api` — Hono API
  - `packages/supabase` — Supabase 생성 타입 공용 패키지
  - `packages/*` — 그 외 공유 코드(설정, 유틸)가 생기면 추가

### 2. 모바일 — Expo + Uniwind

- Expo 최신 SDK + Expo Router, 스타일링은 Uniwind(Tailwind v4 바인딩).
- 빌드·배포는 EAS Build / EAS Update.
- 개발 루프는 **development build 기준**(03a부터). Google 네이티브 로그인이
  Expo Go에서 동작하지 않아 Expo Go는 포기했다.
- **타깃은 iOS 전용.** Android는 목표가 아니며, 필요해지면 별도 결정으로
  다룬다(코드가 RN이라 전환 비용은 낮다).
- 웹은 목표가 아님. 웹이 필요해지면 모노레포에 Next.js 앱을
  추가하는 별도 결정으로 다룬다.
- **디자인은 Apple HIG(Human Interface Guidelines) 준수가 중심.** 커스텀
  디자인 시스템을 만들지 않고 iOS 네이티브 룩앤필을 따른다: 시스템
  컴포넌트·내비게이션 패턴, SF Symbols(`expo-symbols`)를 우선하고,
  SwiftUI 기반 `@expo/ui` 같은 네이티브 컴포넌트 활용을 우선 검토한다.
  Uniwind는 레이아웃·간격·타이포 등 스타일링 유틸리티 역할.

### 3. API — Hono on Vercel + AI SDK

- Hono 앱을 Vercel에 무설정 배포(Node 런타임, Fluid compute). 스트리밍 지원 확인됨.
- AI 기능은 AI SDK(v5)로 구현하고, 모델 호출은 **Vercel AI Gateway**를 통한다
  — 프로바이더 교체가 모델 문자열 변경 수준이 되고, 토큰 마진 없이 원가 과금.
- 모바일 스트리밍은 `@ai-sdk/react`의 `useChat` + `expo/fetch`(Expo 52+ 공식 지원).

### 4. 데이터·인증 — Supabase

- Supabase Auth + Postgres. 로그인은 **Apple + Google** 네이티브 플로우
  (iOS에서 소셜 로그인 제공 시 Apple 로그인이 심사 필수라 세트로 채택).
- **이메일 OTP를 세 번째 수단으로 채택한다**(03a에서 회귀 — 당초 "채택하지
  않음"이었다). 이유는 두 가지가 겹친다. 소셜 계정이 없는 사용자에게 경로를
  열어주고, **소셜 로그인은 자동 검증이 원천 불가**해서 이메일이 없으면
  로그인 이후 경로 전체를 사람 손 없이는 한 줄도 확인할 수 없다
  (근거: [docs/auth-verification.md](../../auth-verification.md)).
- 이메일은 **매직링크가 아니라 6자리 코드**다. 링크 방식은 딥링크 핸들러와
  AASA 호스팅을 요구하는데, 메일 보안 장비가 링크를 미리 열어 일회용 토큰을
  소모하고 URL을 자기 도메인으로 재작성해 **AASA 매칭 자체를 깨뜨린다**.
  같은 이유로 Magic·WorkOS·Clerk(Expo)·Auth0·Cognito가 모바일 매직링크를
  지원하지 않거나 폐기했다. 코드 방식은 이 실패 모드가 전부 없고 앱을
  떠나지도 않는다.
- 카카오 등 추가 소셜은 여전히 채택하지 않음(필요 시 별도 결정).
- 이메일을 넣어도 **Apple 4.8은 계속 적용된다.** 면제 조항이 "전적으로 자사
  계정 시스템만 사용"이라, Google을 쓰는 한 Sign in with Apple은 필수다.

### 5. 데이터 접근 경계 — 하이브리드

- 일반 CRUD는 모바일에서 `supabase-js`로 직접 접근하고 **RLS가 보안 경계**.
- AI·서버 전용 로직만 Hono API를 거친다. Hono의 JWT 검증·클라이언트
  구성은 공식 `@supabase/server`의 Hono 어댑터를 기본값으로 쓴다:
  `withSupabase({ auth: 'user' })` 미들웨어가 검증·CORS를 처리하고,
  RLS 적용 user 클라이언트와 admin 클라이언트를 컨텍스트로 주입한다.
  이 패키지는 신형 API 키(publishable/secret) 전제이므로 키 관리도
  legacy anon/service_role 대신 신형 키를 쓴다.
- 전부 Hono를 경유하는 안은 기각: 초기 속도가 느려지고 Supabase의 강점
  (RLS, 실시간)을 버리게 됨.

### 6. Supabase 타입 — 공용 패키지

- `supabase gen types typescript` 산출물을 `packages/supabase` 한 곳에만 생성,
  mobile·api 양쪽이 소비한다. 플랫폼별 생성은 드리프트 위험으로 기각.
- 클라이언트 초기화는 각 앱에 남긴다(모바일: AsyncStorage 세션 저장,
  서버: service-role 키).

### 7. 결제·구독 — RevenueCat

- 인앱 구독·결제는 RevenueCat(`react-native-purchases`, Expo config plugin).
- Expo Go에서는 동작하지 않으므로 development build 필요 — Apple/Google
  네이티브 로그인과 같은 제약이라 추가 부담은 없다.
- 구독 상태의 서버 반영은 RevenueCat webhook → Hono → Supabase 기록을
  기본값으로 한다.

### 8. 애널리틱스 — PostHog

- 앱 이벤트는 `posthog-react-native`. 서버 이벤트·AI 호출 관측이 필요해지면
  `posthog-node`와 PostHog LLM Analytics를 추가한다.

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
  (`MockLanguageModelV2`, `simulateReadableStream`)로 모델 호출 없이
  결정적으로 검증.
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

- **Uniwind 성숙도**: 2025년 출시된 신생 라이브러리. 문제가 생기면 같은
  className 모델인 NativeWind로 전환 경로가 있다.
  유료 범위 미확인 항목은 태스크 01에서 해소됐다 — **무료 범위로 충분하다.**
  무료는 MIT 라이선스에 프로젝트 제한이 없고 Tailwind v4 전체와 Expo Go를
  지원하며 공식 문서가 프로덕션 준비 상태라고 명시한다. Pro($99/seat/년부터)가
  더하는 것은 C++ 네이티브 엔진, 제로 리렌더 ShadowTree 갱신, Reanimated 4
  className 애니메이션, 네이티브 스레드 테마 전환, `group-active:*`
  변형이다. 전부 성능·애니메이션 계층이다. 당초 "Pro는 development build를
  요구해 Expo Go를 포기해야 한다"는 점도 반대 근거였으나, 03a에서 개발 루프가
  네이티브 로그인 때문에 이미 dev build로 이동해 이 이점은 소멸했다 —
  **무료 범위로 충분하다는 결론 자체는 유효하다.** 애니메이션 요구가
  실제로 생기면 그때 별도 결정으로 다룬다.
- **AI SDK ↔ Expo 폴리필**: 플랫폼에 따라 `@ungap/structured-clone`,
  `@stardazed/streams-text-encoding` 폴리필이 필요하고, 프로덕션에서는
  `EXPO_PUBLIC_API_BASE_URL`을 명시해야 한다.
- **RLS 의존**: 하이브리드 경계에서 RLS 정책 실수가 곧 데이터 노출.
  스키마 작업 시 RLS를 테이블 생성과 동시에 작성하는 규율 필요.
- **`@supabase/server` 베타**: 2026-05 발표된 퍼블릭 베타라 API가 바뀔 수
  있다. 문제가 생기면 jose 기반 수동 JWT 검증으로 되돌리는 경로가 있다.
- **AI 비용 폭주**: 인증만 통과하면 호출되는 AI 엔드포인트는 소수 사용자가
  비용을 폭주시킬 수 있는 표면. 사용자별 rate limit·entitlement 쿼터·
  Gateway 지출 한도가 방어선(가정 참조).
- **스토어 리드타임**: 2023-11 이후 만든 Google Play 개인 계정은 12명이
  14일 연속 참여하는 비공개 테스트를 통과해야 프로덕션 승격 신청 가능
  (사업자 계정은 면제). Apple은 인앱 계정 삭제 기능과 개인정보처리방침
  URL이 심사 필수. 출시일에서 역산해 준비할 것.
- **Supabase free 플랜은 prod 부적합**: 1주 미사용 시 프로젝트 pause.
  prod은 Pro 플랜 기준으로 비용 계획.
- **Vercel 함수 시간 한도**: Fluid 기본 300초(Hobby 최대 300초, Pro 800초).
  긴 AI 스트림·후처리는 `maxDuration` 설정 확인.
