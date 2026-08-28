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

- [ ] 한 사람의 한 화 플레이가 시작 시각, 결말, 이야기 기억을 소유한다.
- [ ] 그 플레이에 속한 메시지가 안정된 식별자와 순서를 갖고, 화면에 보이던 part
      구성을 그대로 보존한다.
- [ ] 교정이 그것이 붙은 사용자 메시지에 딸린 행으로 들어가고, 한 메시지에 여러
      개가 붙는다.
- [ ] 자기 행에만 쓸 수 있고, 결말이 난 플레이에는 메시지를 더할 수 없다.
- [ ] 다른 계정의 플레이, 메시지, 교정에는 읽기도 쓰기도 닿지 않는다.
- [ ] 지금 플레이할 화가 맞는지와 결말이 한 번만 나는지만 함수가 판단하고, 값의
      모양은 제약과 외래키가 막는다.
- [ ] 각 테이블에 쓰기 함수를 따로 만들지 않는다.
- [ ] 생성한 TypeScript 타입에서 메시지의 part가 임의의 JSON이 아니라 좁혀진
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
pending

## Execution

<!-- Append concise evidence and preserve earlier entries when status changes.
Execution Blocker is the current impediment for an active task, not a declared
task dependency. In a superseded task, preserved entries are historical. -->
- Verification: —
- Blocker: —
- Revision: —
