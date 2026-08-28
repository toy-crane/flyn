# 02 — 대화를 새 구조 위로 옮기고 옛 구조를 지운다

## Outcome

사용자가 에피소드를 첫 장면부터 결말까지 진행하고, 앱을 껐다 켜서 이어 하고,
답변을 중지하고, 다시 받고, 끝난 화를 읽는 모든 흐름이 메시지 단위 구조 위에서
돈다. 앱은 새로 쓴 말만 실어 보내고 저장은 서버 한 곳이 맡는다. 옛 대화 저장
구조와 그 위에 서 있던 장치가 저장소에서 사라진다.

## Blockers

01 — 메시지와 플레이 기록이 들어갈 자리가 없으면 옮길 대상이 없다.

## Acceptance criteria

- [x] 대화 중간에 앱을 껐다 켜면 마지막 장면까지 그대로 이어진다.
- [x] 답변을 받는 중에 화면을 나갔다 돌아오면 서버가 만든 데까지 남아 있다.
- [x] 다시 받기를 하면 그 답변과 뒤가 사라지고 새 답변이 그 자리에 온다. 같은 화를
      다시 열어도 사라진 답변은 보이지 않는다.
- [x] 사용자 메시지를 수정해 다시 보내면 그 메시지부터 대화가 다시 시작한다.
- [x] 결말이 난 화를 다시 열면 읽기 전용으로 보이고 더 이상 바뀌지 않는다.
- [x] 요청 크기가 대화 길이에 비례해 커지지 않는다.
- [x] 앱이 지난 장면을 고쳐 보내도 서버의 기록이 바뀌지 않는다.
- [x] 한 계정이 특정 화에서 쓴 문장 전체를 한 번의 조회로 꺼낼 수 있다.
- [x] 명세의 "근거를 잃어 없어지는 것" 목록이 저장소에 남아 있지 않다.

## Constraints

- 앱은 저장을 요청하지 않는다. 중지와 화면 이탈에서도 저장은 서버가 한다.
- 화면 동작은 지금 그대로다.
  [모바일 채팅 메시지 동작](../../../decisions/mobile-chat-message-actions.md)이
  정한 중지, 다시 받기, 수정의 겉모습을 바꾸지 않는다.
- [AI 에피소드 프로토콜](../../../decisions/ai-episode-protocol.md)이 소유한 저장
  규칙과 중지 저장 규칙을 이 작업의 결과에 맞게 갱신한다. 결말이 난 뒤에는 그
  플레이에 메시지를 더할 수 없으므로, 닫는 장면을 먼저 남기고 결말을 기록하는
  순서를 그 계약에 못박는다. 01이 세운 구조는 그 순서를 강제하지 않고, 뒤집으면
  결말을 담은 장면이 저장되지 않는다.
- 교정을 실제로 만들어 넣는 일은 이 작업이 하지 않는다.
  [대화 중 교정](../../episode-correction/spec.md)이 소유한다.

## Verification

- `bun run check-types`가 통과한다.
- `bun run test`의 `apps/api` 테스트가 새 메시지만 받아 저장하는 경로와, 클라이언트가
  끊긴 뒤에도 저장이 일어나는 것을 확인한다.
- `bun run test`의 `apps/mobile` 테스트가 앱이 저장을 요청하지 않고 새 메시지만
  보내는 것을 확인한다.
- `bun run db:test`가 통과한다.
- `agent-device`로 한 계정에서 1화를 첫 장면부터 결말까지 진행하며 앱 재시작으로
  이어 하기, 답변 중 중지, 다시 받기를 각각 확인하고, 끝난 화를 다시 열어 읽기
  전용인 것까지 같은 세션에서 본다.

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
completed

## Execution

<!-- Append concise evidence and preserve earlier entries when status changes.
Execution Blocker is the current impediment for an active task, not a declared
task dependency. In a superseded task, preserved entries are historical. -->
- Verification: `bun run check-types` 통과. `bun run test`가 `apps/api` 70개,
  `apps/mobile` 464개, `scripts` 158개를 통과한다. 서버 테스트가 새 말 하나만
  받는 경로, 앱이 고쳐 보낸 지난 장면을 거절하는 것, `keepThrough`가 뒤를 지우는
  것, 저장이 실패해도 플레이가 이어지는 것, 닫는 장면이 결말보다 먼저 저장되는
  것을 각각 고정한다. `bun run db:test` pgTAP 239개 통과.

  `agent-device` 한 세션에서 slot 3 기기로 확인했다. 새 계정으로 로그인해 1화를
  첫 장면부터 결말까지 진행했고, 다음을 각각 데이터베이스로 대조했다. 첫 장면과
  사용자 메시지와 상대 장면이 `position` 0, 1, 2에 한 행씩 남았다. 앱을 껐다
  켜면 그 자리에서 이어졌다. 답변이 흐르는 중에 앱을 강제로 내렸을 때 서버가
  스트림을 끝까지 소비해 완성된 장면을 남겼다(명세의 첫 번째 남은 위험 해소).
  결말이 나자 닫는 장면이 저장된 뒤 결말이 기록됐고, 그 장면에 `data-ending`
  part가 없다. 끝난 화를 다시 열면 입력창 없이 "끝난 대화 기록"으로 보이고,
  서버가 세션에 실어 보낸 결말과 예고로 마무리가 그려진다. 마지막에 로그아웃까지
  같은 세션에서 확인했다.

  다시 받기와 수정 두 가지는 기기로 확인하지 못했다. 에피소드 화면이
  `hasMessageActions={false}`로 그 버튼을 두지 않기 때문이고, 이는 이 작업이
  만든 상태가 아니라 원래 그렇다. 대신 서버 테스트가 그 경로를 고정한다. 기준
  메시지 뒤를 지우는 것, 남길 것이 없다고 하면 처음부터 다시 여는 것, 앱이
  서버가 모르는 메시지를 대면 아무것도 지우지 않는 것 셋이다. 교정의 "고쳐서
  다시 보내기"가 그 버튼을 여는 첫 화면이 된다.
- Blocker: —
- Revision: 01의 검토가 순서 함정 하나를 드러내 제약에 적었다. `finish_episode`가
  `finished_at`을 채우면 그 플레이의 메시지 insert가 정책에 막히는데, PostgREST는
  두 요청을 한 트랜잭션으로 묶지 못한다. 닫는 장면을 먼저 남기고 결말을 기록해야
  한다. 다른 경계와 수용 기준은 그대로다.
