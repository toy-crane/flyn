# Supabase와 Hono의 데이터 접근 경계

## Decisions

- 인증과 데이터는 Supabase Auth와 Postgres를 사용한다.
- 일반 CRUD는 모바일이 `supabase-js`로 직접 수행하고 RLS가 보안 경계다.
- AI, server secret과 privileged transaction만 인증된 Hono API를 거친다.
- **AI가 만드는 데이터는 앱이 만들지 않는다.** 에피소드와 그 하위 기록은 조회만
  모바일이 RLS 안에서 하고, 생성과 갱신은 모두 Hono가 소유한다. 앱에 주는 쓰기
  권한은 자기 에피소드 삭제뿐이다.
- Hono가 소유권 확인, 사용자 메시지 멱등 저장, DB 기록 기반 모델 입력, AI 응답과
  곁가지 결과 저장을 한 경계에서 처리한다.
- Hono의 Supabase middleware는 검증된 user client와 admin client를 분리하고
  publishable/secret key 체계를 사용한다.

## Why

모든 테이블의 CRUD API를 손으로 복제하면 RLS는 여전히 필요하면서 Supabase의
직접 접근 장점을 잃는다. 반대로 AI가 만든 기록을 앱과 서버가 나눠 쓰면 DB와 모델
호출이 서로 다른 성공 상태를 만들고 assistant role 위조 방지도 복잡해진다.

에피소드는 첫 행부터 모델 호출의 산물이다. 앱이 빈 에피소드를 먼저 만들고 서버가
채우는 구조는 실패했을 때 절반만 있는 행을 남긴다. 생성 전체를 서버가 쥐면 그
상태가 아예 생기지 않는다.

## Boundaries

- RLS 정책은 테이블과 함께 작성하고 `bun run db:test`의 pgTAP으로 검증한다.
- 클라이언트가 과거 대화를 보내도 서버는 DB 기록만 모델 입력으로 신뢰한다.
- 메시지 작성은 API 가용성에 의존한다. 오프라인 작성 queue는 현재 없다.
- public table의 기본 ACL 이름만으로 anon/authenticated의 Data API 권한을
  추론하지 않고 실제 GRANT, RLS와 노출 route를 함께 검토한다. 다만 Data API에
  닿지 않는다고 남겨둬도 되는 것은 아니다 — 자동으로 붙는 잔여 권한을 어떻게
  회수하고 고정하는지는 [테이블 권한 계약](table-privileges.md)이 소유한다.
- 어떤 테이블이 있고 무엇을 담는지는 이 계약이 정하지 않는다. 해당 작업 단위
  문서가 소유한다.

## Reconsider when

오프라인 메시지 작성, 실시간 협업, server-only CRUD가 제품 요구가 되거나 현재
Supabase middleware가 안정적인 인증 경계를 제공하지 못하면 경로를 다시 나눈다.

## Still-rejected alternatives

- 모든 데이터 요청을 Hono로 통과시키기.
- 앱이 AI 산물의 빈 껍데기를 먼저 만들고 서버가 채우기.
- 모바일 role에 assistant 메시지 또는 AI가 만든 기록의 update/delete 권한 주기.

## Evidence worth preserving

메시지 쓰기를 한 Hono 경계에 두면 저장된 기록과 모델이 본 기록이 일치하고,
완료·중단 응답의 멱등 재시도를 서버가 판정할 수 있다. RLS와 GRANT의 양성·음성
대조는 pgTAP 테스트에 고정한다.
