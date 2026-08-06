# public 테이블 권한 선언

## Decisions

- `public`의 모든 테이블은 `revoke all ... from anon, authenticated`로 권한을 0으로
  만든 뒤 의도한 것만 명시적으로 부여한다. 권한을 열거해 회수하지 않는다.
- `revoke`는 그 테이블의 첫 `grant`보다 먼저 온다.
- 권한은 선언 스키마(`supabase/schemas/`)에 적고 마이그레이션은 `bun run db:diff`가
  만든다. 생성된 권한 줄은 사람이 확인한다.
- 결과 권한 집합은 테이블 이름을 열거하지 않는 pgTAP 불변식으로 고정한다
  (`supabase/tests/table_grants.test.sql`).

## Boundaries

- `revoke` 대상은 `anon`과 `authenticated`뿐이다. `service_role`과 소유자
  `postgres`는 건드리지 않는다 — 서버 경로와 마이그레이션·트리거가 그 권한으로 돈다.
- 열 단위 grant(`grant update (col)`)는 `db diff`가 잡지 않는 항목이라 따로 확인한다.
- 불변식은 "위험한 잔여 권한이 없다"만 말한다. 어떤 테이블이 **정확히 무엇을
  주는지**는 그 테이블의 RLS 테스트에서 `table_privs_are`로 따로 고정한다. 둘은
  대체 관계가 아니라 겹쳐 쓰는 것이다.
- 어떤 행을 누가 보는지는 RLS 정책과 [데이터 접근 경계](hybrid-data-access.md)가
  소유한다. 이 계약은 **테이블 단위 권한을 어떻게 선언하고 고정하는지**만 정한다.

## Why

RLS와 GRANT는 서로 다른 것을 막는다. 정책은 `select`·`insert`·`update`·`delete`의
**행**만 가르고, 테이블 전체에 적용되는 연산은 행 보안의 대상이 아니다(PostgreSQL
문서). 그래서 `truncate`는 정책을 그대로 지나간다 — 막는 것은 GRANT뿐이다.

그런데 `create table`은 `anon`·`authenticated`에 `Dxtm`(TRUNCATE·REFERENCES·
TRIGGER·MAINTAIN)을 자동으로 붙인다. Supabase가 2026년 기본 권한 변경에서 걷어낸
것은 `arwd`(CRUD)뿐이고, 공식 권장 revoke 문도 그 네 개만 열거해서 잔여 권한을
남긴다. 즉 이것은 옛 테이블의 잔재가 아니라 **새 테이블마다 반복되는 상태**다.

권한을 열거해 회수하면 지금 모르는 권한을 놓친다. `MAINTAIN`은 PG17에서 새로
생겼고, 열거식으로 적어둔 코드는 그 업그레이드에서 조용히 구멍이 하나 생겼다.
`revoke all`은 이름을 몰라도 회수한다.

## Reconsider when

Supabase가 `public`의 기본 권한에서 `Dxtm`까지 걷어내거나, `anon`·`authenticated`에
PostgREST 밖의 임의 SQL 경로가 열리면 범위를 다시 정한다.

## Still-rejected alternatives

- 권한을 열거해 회수하기 — 지금 모르는 권한을 놓친다; Postgres가 새 권한을 더는
  추가하지 않게 되면 다시 본다.
- `alter default privileges`로 기본 권한 자체를 차단하기 — 어느 스키마 파일에도
  보이지 않는 암묵 규칙이 되어 다음 사람이 같은 것을 또 잃는다; 선언 스키마를 쓰지
  않게 되면 다시 본다.
- 테이블마다 권한 검사를 적기 — 새 테이블은 검사 자체가 없어 그냥 통과한다.
- 권한 마이그레이션을 손으로 쓰기 — `db diff`가 정확히 만든다.

## Evidence worth preserving

- RLS 정책 6개가 걸린 `public.profiles`에서 `set role authenticated; truncate`가
  **성공했다.** revoke 후에는 `42501 permission denied`다.
- `db diff`는 `revoke all` 선언을 실제 ACL 차이로 풀어 정확한 마이그레이션을 만든다.
  공식 caveat "grant statements are duplicated from default privileges"는 출력에
  노이즈가 섞인다는 뜻이지 권한을 다루지 못한다는 뜻이 아니다.
- 불변식의 음성 대조: `grant truncate`를 되살리면 직접 탐지 2개 외에 검사 4개가 더
  깨진다 — truncate가 실제로 테이블을 비워 뒤따르는 검사들이 빈 결과를 본다.
- Supabase 공식 문서·에이전트 스킬·커뮤니티 어디에도 TRUNCATE 논의가 없다. 논점이
  줄곧 "Data API에 노출되는가"였고 PostgREST에는 truncate 동사가 없기 때문이다.
  탐지 경로가 없다는 뜻이므로, 이 계약이 없으면 재발해도 알 수 없다.
