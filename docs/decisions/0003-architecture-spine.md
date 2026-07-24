---
status: accepted
---

# 아키텍처 스파인: 모바일→Supabase 직접, Hono는 AI 전용 서비스

백엔드의 대부분은 **Supabase가 직접 담당**한다: Expo 앱이 `supabase-js`로 Auth·DB(CRUD, **RLS로 인가**)·Realtime·Storage에 바로 붙는다. **Hono는 AI 기능 전용 서비스**(`apps/api`)로 존재하며, Vercel AI SDK로 LLM 호출·스트리밍 응답을 처리한다 — 프로바이더 API 키를 클라이언트에 내리지 않기 위해 서버가 필요한 지점이 정확히 여기다. AI SDK는 Hono를 API 서버로 공식 지원한다(cookbook: api-servers/hono).

## Consequences

- **모노레포 레이아웃 확정:** `apps/mobile`(Expo) + `apps/api`(Hono AI 서비스) + 공유 `packages/*`, 루트 `supabase/`(마이그레이션·config).
- **인증 흐름 확정:** 인증은 Supabase Auth 단일 소스. 모바일이 받은 **Supabase JWT를 AI 요청에 첨부**하고, Hono가 이를 검증한 뒤 AI 엔드포인트를 제공한다. Hono가 별도 세션·유저 저장소를 갖지 않는다.
- **경계 규칙:** 표준 CRUD·구독을 Hono로 감싸지 않는다(홉·중복 방지). 반대로 시크릿(LLM 키 등)이 필요한 로직을 클라이언트나 RLS 우회로 처리하지 않는다. AI 외 서버 로직(웹훅·결제 등)이 나중에 생기면 Hono에 추가할지 그때 결정한다.
- **런타임(가정, 이의 시 재검토):** Hono는 ADR 0001의 Bun 선택과 일관되게 **Bun 런타임의 독립 서비스**로 둔다. Supabase Edge Functions(Deno)는 Bun 일관성·장시간 스트리밍 제약 때문에 기본값에서 제외. **배포 호스트는 미정**(후속 결정).

## Considered Options

- **전부 Hono 경유(BFF)** — 단일 게이트웨이로 통제는 쉬우나 Supabase의 공짜 기능(자동 API·Realtime·Storage·RLS)을 재구현하게 되고 홉이 늘어남. AI만 서버가 필요한 현 요구에 과함.
- **Hono 없이 Supabase Edge Functions로 AI 처리** — 배포 단위는 줄지만 Deno 런타임(Bun 불일관)과 장시간 LLM 스트리밍에 제약. Hono+AI SDK의 공식 지원 경로가 더 곧다.
