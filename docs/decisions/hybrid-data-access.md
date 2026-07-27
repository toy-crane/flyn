# 데이터 접근은 하이브리드 — RLS가 보안 경계고, Hono는 AI·서버 전용만 맡는다

인증과 데이터는 Supabase(Auth + Postgres)를 쓴다. 앱이 DB에 닿는 경로는 두
갈래인데, **어느 쪽이 보안 경계인지가 이 결정의 핵심**이다.

- **일반 CRUD는 모바일에서 `supabase-js`로 직접 접근하고, RLS가 보안 경계다.**
- **AI·서버 전용 로직만 Hono API를 거친다.**

## 전부 Hono를 경유하는 안은 기각했다

API 서버를 유일한 관문으로 두는 쪽이 통상적인 형태지만, 초기 속도가 느려지고
Supabase의 강점(RLS, 실시간)을 버리게 된다. 모든 테이블마다 CRUD 엔드포인트를
손으로 쓰는 비용을 지불하면서 정작 RLS는 그대로 필요하다.

## Hono 쪽 게이트 구성

Hono의 JWT 검증·클라이언트 구성은 공식 `@supabase/server`의 Hono 어댑터를
기본값으로 쓴다. `withSupabase({ auth: 'user' })` 미들웨어가 검증·CORS를
처리하고, RLS가 적용된 user 클라이언트와 admin 클라이언트를 컨텍스트로
주입한다. 이 패키지는 신형 API 키(publishable/secret) 전제이므로 **키 관리도
legacy anon/service_role 대신 신형 키를 쓴다.**

`@supabase/server`는 2026-05 발표된 퍼블릭 베타라 API가 바뀔 수 있다. 문제가
생기면 **jose 기반 수동 JWT 검증으로 되돌리는 경로**가 있다.

## 대가 — RLS 실수가 곧 데이터 노출이다

보안 경계를 DB 안으로 밀어 넣었으므로 정책 하나를 잘못 쓰면 그것이 그대로
노출이다. 그래서 **RLS 정책은 테이블 생성과 동시에 작성하고 pgTAP 테스트를
함께 쓴다**(`bun run db:test`). 이 아키텍처에서 가장 가치 높은 테스트다.
