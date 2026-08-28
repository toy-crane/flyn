# db diff가 방금 지운 열의 권한을 회수하려 해 재생이 멈춘다

**Symptom**: 열 단위 grant가 걸린 열을 선언형 스키마에서 지우면, `supabase db diff`가
`DROP COLUMN` 뒤에 그 열 이름이 들어간 `REVOKE`를 적는다. 재생하면 그 문장에서
멈춘다.

```
ERROR: column "position" of relation "episode_messages" does not exist (SQLSTATE 42703)
At statement: 6
REVOKE INSERT ("position", id, parts, play_id, ROLE) ON public.episode_messages FROM authenticated
```

**Observed evidence**: 2026-08-29 `supabase/schemas/30-tables.sql`에서
`episode_messages.position`을 지우고 `bun run db:diff -f message_order_by_time`을
돌렸다. 생성된 `supabase/migrations/20260828162001_message_order_by_time.sql`이 이
순서로 나왔다.

```sql
ALTER TABLE public.episode_messages DROP COLUMN "position";
...
REVOKE INSERT ("position", id, parts, play_id, ROLE) ON public.episode_messages FROM authenticated;
```

`bun run db:reset`이 여섯 번째 문장에서 42703으로 멈춘다. CLI는 2.113.0, 엔진은
pg-delta다.

**Suspected cause**: pg-delta가 열 삭제와 권한 재계산을 각각 만들고 둘 사이의 의존을
보지 않는 것으로 본다. 열이 사라지면 그 열의 권한도 함께 사라지므로 REVOKE 자체가
필요 없는데, 삭제 전 상태의 grant 목록을 그대로 적는다.

**What was tried**: 생성물에서 `"position"` 이름만 빼고 나머지는 그대로 두었다.
[Supabase 스키마 작업 방식](../decisions/supabase-schema-workflow.md)은 생성된
마이그레이션을 권한을 이유로 손보지 말라고 하지만, 이것은 권한 취향이 아니라 재생이
멈추는 오류다. 고친 뒤 `bun run db:reset`, `bun run db:diff`(변경 없음),
`bun run db:test`가 모두 통과한다. 손댄 자리에는 이 문서를 가리키는 주석을 남겼다.

**Proposed next step**: 열 단위 grant가 걸린 열을 지우는 마이그레이션을 만들 때마다
같은 보정이 필요하다. 다음에 이 일이 또 생기면 CLI를 올려 고쳐졌는지 먼저 보고,
그대로면 Supabase에 이슈로 올린다. 재현은 열 단위 grant가 있는 열을 선언형에서 지우고
`db diff`를 돌리는 것으로 충분하다.
