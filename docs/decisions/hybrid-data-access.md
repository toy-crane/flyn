# Supabase와 Hono의 데이터 접근 경계

## Decisions

- 인증과 데이터는 Supabase Auth와 Postgres를 사용한다.
- 일반 CRUD는 모바일이 `supabase-js`로 직접 수행하고 RLS가 보안 경계다.
- AI, server secret과 privileged transaction만 인증된 Hono API를 거친다.
- 채팅방 CRUD와 메시지 조회는 모바일이 RLS 안에서 직접 한다. 사용자·AI 메시지
  쓰기는 Hono 스트리밍 요청 하나가 소유하며 모바일 role에는 쓰기 권한을 주지
  않는다.
- Hono가 방 소유권 확인, 사용자 메시지 멱등 저장, DB 기록 기반 모델 입력과 AI
  응답 저장을 한 경계에서 처리한다.
- Hono의 Supabase middleware는 검증된 user client와 admin client를 분리하고
  publishable/secret key 체계를 사용한다.

## Why

모든 테이블의 CRUD API를 손으로 복제하면 RLS는 여전히 필요하면서 Supabase의
직접 접근 장점을 잃는다. 반대로 채팅 메시지를 앱과 stream이 나눠 쓰면 DB와 모델
호출이 서로 다른 성공 상태를 만들고 assistant role 위조 방지도 복잡해진다.

## Boundaries

- RLS 정책은 테이블과 함께 작성하고 `bun run db:test`의 pgTAP으로 검증한다.
- 클라이언트가 과거 대화를 보내도 서버는 DB 기록만 모델 입력으로 신뢰한다.
- 일반 메시지 작성은 API 가용성에 의존한다. 오프라인 작성 queue는 현재 없다.
- public table의 기본 ACL 이름만으로 anon/authenticated의 Data API 권한을
  추론하지 않고 실제 GRANT, RLS와 노출 route를 함께 검토한다.

## Reconsider when

오프라인 메시지 작성, 실시간 협업, server-only CRUD가 제품 요구가 되거나 현재
Supabase middleware가 안정적인 인증 경계를 제공하지 못하면 경로를 다시 나눈다.

## Still-rejected alternatives

- 모든 데이터 요청을 Hono로 통과시키기.
- 사용자 메시지를 앱이 먼저 저장하고 AI 응답만 API가 저장하기.
- 모바일 role에 assistant 메시지 또는 일반 메시지 update/delete 권한 주기.

## Evidence worth preserving

메시지 쓰기를 한 Hono 경계에 두면 저장된 기록과 모델이 본 기록이 일치하고,
완료·중단 응답의 멱등 재시도를 서버가 판정할 수 있다. RLS와 GRANT의 양성·음성
대조는 `supabase/tests/chat_rls.test.sql`에 고정돼 있다.
