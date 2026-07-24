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

## 가정 (기본값 — 반증 나오면 뒤집는다)

- TypeScript strict. 린트·포맷은 Biome.
- 클라이언트 서버상태는 TanStack Query.
- 앱 ↔ Hono 통신은 Hono RPC(`hc`)로 타입 공유.
- DB 마이그레이션은 supabase CLI(SQL 마이그레이션). 서버 측 쿼리도 우선
  `supabase-js`로 단순하게 가고, ORM(Drizzle 등)은 필요가 증명되면 재검토.
- 환경은 2단: Supabase dev/prod 프로젝트 분리, Vercel preview/production,
  EAS 프로필 development/preview/production.

## 유보된 것

- 제품 도메인·스키마: flyn이 무엇인지는 이 세션에서 다루지 않았다. 도메인
  셰이핑이 선행되어야 스키마·RLS 설계가 가능.
- 푸시 알림, 결제/구독(RevenueCat 등), 애널리틱스: 제품 요구 확정 후 결정.

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
