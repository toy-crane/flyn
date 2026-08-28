# 01 — 대화와 교정이 들어갈 구조와 접근 규칙을 세운다

## Outcome

데이터베이스가 플레이 기록, 대화 메시지, 교정을 담는 구조를 갖는다. 한 사람의 한 화
플레이가 시작, 결말, 이야기 기억을 소유하고 그 아래 메시지가 순서를 갖고 쌓이며,
교정은 그것이 붙은 사용자 메시지에 딸린다. 누가 무엇에 쓸 수 있는지는 정책과 제약이
정하고, 함수에는 여러 행을 함께 봐야 판단할 수 있는 규칙만 남는다. 앱과 서버는 아직
옛 구조로 돌아 사용자에게 보이는 변화가 없다.

## Blockers

None.

## Acceptance criteria

- [x] 한 사람의 한 화 플레이가 시작 시각, 결말, 이야기 기억을 소유한다.
- [x] 그 플레이에 속한 메시지가 안정된 식별자와 순서를 갖고, 화면에 보이던 part
      구성을 그대로 보존한다.
- [x] 교정이 그것이 붙은 사용자 메시지에 딸린 행으로 들어가고, 한 메시지에 여러
      개가 붙는다.
- [x] 자기 행에만 쓸 수 있고, 결말이 난 플레이에는 메시지를 더할 수 없다.
- [x] 다른 계정의 플레이, 메시지, 교정에는 읽기도 쓰기도 닿지 않는다.
- [x] 지금 플레이할 화가 맞는지와 결말이 한 번만 나는지만 함수가 판단하고, 값의
      모양은 제약과 외래키가 막는다.
- [x] 각 테이블에 쓰기 함수를 따로 만들지 않는다.
- [x] 생성한 TypeScript 타입에서 메시지의 part가 임의의 JSON이 아니라 좁혀진
      타입으로 읽힌다.

## Constraints

- 옛 대화 저장 구조를 아직 지우지 않는다. 이 작업만 끝난 상태에서도 앱이 지금처럼
  돌아야 한다.
- 옮길 데이터가 없으므로 기존 대화를 행으로 푸는 이관을 만들지 않는다.
- 데이터베이스에서 JSON 스키마로 part 구조까지 검증하지 않는다. 그 검증은 런타임이
  라이브러리와 같은 버전으로 한다.

## Verification

- `bun run db:reset`이 마이그레이션 전체를 처음부터 재생하고 성공한다.
- `bun run db:test`의 pgTAP이 위 접근 규칙을 고정한다. 다른 계정의 플레이, 메시지,
  교정에 닿지 못하는 것과, 결말이 난 플레이에 메시지를 더하지 못하는 것을 각각
  확인한다.
- `bun run db:lint`가 경고 없이 통과한다.
- `bun run check-types`가 통과하고, 생성한 타입으로 메시지 part를 읽는 코드가
  타입 바꿔치기 없이 컴파일된다.

## Review checkpoint

One review pass after this task. 누적 범위는 선언형 스키마, 생성된 마이그레이션,
접근 정책과 함수, 그리고 그것을 고정하는 데이터베이스 테스트다. 마이그레이션은
앞으로만 가고 권한은 조용히 넓어지므로 되돌리기가 비싸며, 뒤따르는 서버와 앱 작업이
전부 이 구조 위에 선다. 검토는
[Supabase 스키마 작업 방식](../../../decisions/supabase-schema-workflow.md)이 정한
전용 검토 agent가 맡는다.

## Status

<!-- Current values: `pending`, `in-progress`, `completed`, `blocked`, or
`superseded`.
`completed` is valid only while all acceptance criteria and focused
verification pass. Use `superseded` only after an approved replacement of a
task with recorded completion history. Preserve its Execution evidence and name
the replacement and reason under Revision; it is then terminal for that approved
breakdown and outside the current delivery map. -->
completed

## Execution

<!-- Append concise evidence and preserve earlier entries when status changes.
Execution Blocker is the current impediment for an active task, not a declared
task dependency. In a superseded task, preserved entries are historical. -->
- Verification: `bun run db:reset`이 마이그레이션 셋을 처음부터 재생하고 통과한다
  (새 이력은 `20260828145912_episode_message_storage.sql`). `bun run db:test`가
  pgTAP 284개를 통과하고, 그중 `supabase/tests/episode_plays_test.sql` 53개와
  `supabase/tests/episode_messages_test.sql` 43개가 이 작업의 규칙을 고정한다.
  `bun run db:lint` 경고 없음, `bun run db:diff`가 "No schema changes found"로
  선언형과 이력의 일치를 확인한다. `bun run check-types`와 `bun run test`(api,
  mobile 472개, scripts 158개) 통과. 좁힌 타입은 임시 파일로 대조했다.
  `episode_messages.parts`는 `part.type === "text" ? part.text : undefined`가
  그대로 컴파일되고, 좁히지 않은 `episode_runs.messages`는 같은 코드가
  `Json`이라 인덱싱조차 되지 않는다.
- Blocker: —
- Revision: 검토가 P3 다섯 건을 냈고 네 건을 고쳤다. (가) `(play_id, position)`
  색인이 유니크 제약이 만드는 색인과 완전히 겹쳐 지웠다. (나) `Tables` 계열
  헬퍼가 생성 파일의 `Database`를 가리켜 좁힌 `parts`를 통과시키지 못했다.
  병합한 타입 위에서 다시 정의했다. (다) `episode_is_current`의 `security
  definer` 근거가 틀렸다. `invoker`로 바꿔 pgTAP 전체가 통과하는 것을 확인하고
  주석을 고쳤으며, `is_definer`/`isnt_definer`로 두 함수의 층을 고정했다.
  (라) 복합 외래키를 정확히 덮는 색인이 없다는 advisor INFO는
  `supabase db advisors --local`로 실제 보고를 확인한 뒤 색인을 더하지 않기로
  하고 근거를 스키마 주석에 남겼다. 부모 삭제가 도는 조회는 앞자리 색인을 타고,
  이 데이터베이스는 `retired_usernames`에서 같은 보고를 이미 받고 있다.
  나머지 한 건(결말을 닫은 뒤에는 메시지를 더할 수 없다)은 이 작업이 만든 구조가
  아니라 다음 작업의 순서 제약이라 02에 적었다.
