# 02 — 지난 화의 선택과 결과가 다음 화에 돌아온다

## Outcome

에피소드가 결말로 끝나면 서버가 그 대화에서 이야기 기억(사용자의 선택, 사건의 결과,
관계의 변화, 새로 열린 질문)과 언어 수준을 뽑아 저장한다. 다음 화를 열 때 지금까지의
이야기 기억이 프롬프트에 들어가고, 지난 일이 대사와 관계와 지문으로 돌아온다.

## Blockers

01 — 시즌과 화의 저장 구조, 그리고 다섯 화의 각본이 있어야 기억이 붙을 자리와 돌아올
자리가 생긴다.

## Acceptance criteria

- [ ] 1화를 결말까지 끝내면 이야기 기억 네 항목과 언어 수준이 계정에 저장된다.
- [ ] 마무리 화면을 보지 않고 앱을 꺼도 그 기억이 남는다.
- [ ] 이야기 기억은 시즌에, 언어 수준은 계정에 붙는다.
- [ ] 1화를 다르게 끝낸 두 계정에서 2화의 전개가 다르게 관찰되고, 지난 결말이나
      선택이 대사 또는 지문으로 돌아온다.
- [ ] 사건은 분기하지 않는다. 두 계정 모두 같은 첫 장면에서 시작한다.
- [ ] 기억을 뽑는 호출이 실패해도 다음 화는 열리고 끝까지 진행할 수 있다.

## Constraints

- 기억은 대사, 관계, 지문으로 돌아오고 사건을 바꾸지 않는다.
- 언어 수준은 저장까지만 한다. 난이도 조절은 각본 프롬프트의 기존 규칙을 유지한다.
- 끝난 화의 요약만 남기고 진행 중 대화는 저장하지 않는다.
- 한 요청이 여러 번의 모델 호출로 바뀌므로
  [AI 에피소드 프로토콜](../../../decisions/ai-episode-protocol.md)의 재검토 조건이
  다시 열린다. 바뀐 호출 구조를 그 계약에 반영한다.

## Verification

- 저장소 루트에서 `bun run check`와 `bun run check-types`가 통과한다.
- `bun run test`의 `apps/api` 테스트가 결말이 난 대화에서 기억 저장이 한 번
  일어나고, 추출 실패가 장면 스트림과 다음 화 열기를 막지 않음을 확인한다.
- `bun run db:test`의 pgTAP이 이야기 기억과 언어 수준을 다른 계정이 읽거나 쓸 수
  없음을 확인한다.
- `agent-device`로 두 계정에서 1화를 다르게 끝내고 2화의 첫 턴들을 비교해 회수를
  기록한다. 회수가 약하면
  [에피소드 콘텐츠 제작](../../../decisions/episode-authoring.md)의 재검토 조건으로
  보고한다.

## Review checkpoint

None.

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
