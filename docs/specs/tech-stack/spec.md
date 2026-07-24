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
- 개발 중 Expo Go 사용 가능(Uniwind가 지원). 단 Apple/Google 네이티브
  로그인 테스트에는 development build가 필요.
- 웹은 목표가 아님(모바일 전용). 웹이 필요해지면 모노레포에 Next.js 앱을
  추가하는 별도 결정으로 다룬다.

### 3. API — Hono on Vercel + AI SDK

- Hono 앱을 Vercel에 무설정 배포(Node 런타임, Fluid compute). 스트리밍 지원 확인됨.
- AI 기능은 AI SDK(v5)로 구현하고, 모델 호출은 **Vercel AI Gateway**를 통한다
  — 프로바이더 교체가 모델 문자열 변경 수준이 되고, 토큰 마진 없이 원가 과금.
- 모바일 스트리밍은 `@ai-sdk/react`의 `useChat` + `expo/fetch`(Expo 52+ 공식 지원).

### 4. 데이터·인증 — Supabase

- Supabase Auth + Postgres. 로그인은 **Apple + Google** 네이티브 플로우
  (iOS에서 소셜 로그인 제공 시 Apple 로그인이 심사 필수라 세트로 채택).
- 이메일 OTP·카카오 등 추가 수단은 채택하지 않음(필요 시 별도 결정).

### 5. 데이터 접근 경계 — 하이브리드

- 일반 CRUD는 모바일에서 `supabase-js`로 직접 접근하고 **RLS가 보안 경계**.
- AI·서버 전용 로직만 Hono API를 거친다. Hono는 요청의 Supabase JWT를 검증.
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

- TypeScript strict. 린트·포맷은 Biome + Ultracite 프리셋(`biome.jsonc`에서
  `extends: ["ultracite"]`). 에이전트 규칙 파일·편집 후 자동 fix 훅까지
  `ultracite init`으로 생성한다. 규칙이 과하다고 판단되면 extends 한 줄을
  빼서 plain Biome으로 복귀(전환 비용 거의 없음).
- 클라이언트 서버상태는 TanStack Query.
- 앱 ↔ Hono 통신은 Hono RPC(`hc`)로 타입 공유.
- DB 마이그레이션은 supabase CLI(SQL 마이그레이션). 서버 측 쿼리도 우선
  `supabase-js`로 단순하게 가고, ORM(Drizzle 등)은 필요가 증명되면 재검토.
- 환경은 2단: Supabase dev/prod 프로젝트 분리, Vercel preview/production,
  EAS 프로필 development/preview/production.

## 테스트 전략 (기본값 — 가정과 같은 지위)

- **api·packages — `bun test`**: Hono는 `app.request()`로 서버 기동 없이
  핸들러를 직접 테스트한다. AI 로직은 AI SDK의 mock provider
  (`MockLanguageModelV2`, `simulateReadableStream`)로 모델 호출 없이
  결정적으로 검증.
- **RLS·스키마 — supabase 로컬 스택 + pgTAP**: `supabase test db`로 정책을
  검증한다. RLS가 보안 경계이므로 정책을 만들 때마다 테스트를 함께 작성
  — 이 아키텍처에서 가장 가치 높은 테스트.
- **mobile — jest-expo + React Native Testing Library**: bun test가 RN
  변환을 지원하지 않아 모바일만 Jest(30)를 쓴다. 러너 2개 공존은 turbo
  태스크(`turbo run test`) 뒤로 감춘다.
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
  className 모델인 NativeWind로 전환 경로가 있다. Uniwind Pro(유료)의 범위를
  확인하지 못했으므로(가격 페이지 접근 불가) 핵심 기능이 무료 범위인지
  셋업 시점에 확인할 것.
- **AI SDK ↔ Expo 폴리필**: 플랫폼에 따라 `@ungap/structured-clone`,
  `@stardazed/streams-text-encoding` 폴리필이 필요하고, 프로덕션에서는
  `EXPO_PUBLIC_API_BASE_URL`을 명시해야 한다.
- **RLS 의존**: 하이브리드 경계에서 RLS 정책 실수가 곧 데이터 노출.
  스키마 작업 시 RLS를 테이블 생성과 동시에 작성하는 규율 필요.
