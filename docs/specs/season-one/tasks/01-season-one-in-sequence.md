# 01 — 시즌 1의 다섯 화를 차례로 끝낸다

## Outcome

사용자가 1화를 결말까지 끝내면 마무리에서 결말과 다음 화 예고를 보고, 그 자리에서
다음 화를 열거나 홈으로 돌아간다. 홈은 시작 전, 진행 중, 완주 세 상태를 보여 주고,
진행 중에는 다음 화 예고 카드와 시즌 진행 표시, 끝낸 화 목록을 함께 보여 준다. 끝난
화는 다시 열리지 않고, 시즌 진행은 계정에 남아 기기를 바꿔도 이어진다. 5화를 끝내면
홈이 완주 상태가 되고 새로 시작할 화가 없다.

## Blockers

None.

## Acceptance criteria

- [ ] 1화를 결말까지 끝내면 마무리에 결말과 2화 예고가 보이고 입력이 닫힌다.
- [ ] 마무리의 "다음 화 시작하기"를 누르면 2화가 각본의 첫 장면부터 열린다.
- [ ] 앱을 껐다 켜도 홈에 2화 예고 카드가 남고, 누르면 2화가 열린다.
- [ ] 마무리 화면을 보지 않고 앱을 꺼도 그 화는 끝난 것으로 남고 다시 열리지 않는다.
- [ ] 에피소드 중간에 나갔다 들어오면 같은 화가 처음부터 시작하고, 끝낸 화의 진행은
      남는다.
- [ ] 다른 기기에서 같은 계정으로 로그인하면 같은 다음 화가 보인다.
- [ ] 홈의 진행 중 상태에 시즌 진행 표시와 끝낸 화 목록이 결말과 함께 있다.
- [ ] 5화의 마무리는 예고 대신 시즌 완주 안내와 "홈으로 가기"만 보여 준다.
- [ ] 5화를 끝내면 홈이 완주 카드와 다섯 화의 기록을 보여 주고 새로 시작할 화가 없다.
- [ ] 에피소드와 마무리 어디에도 "다시 시작하기"가 없다.
- [ ] 홈과 마무리 화면의 구조가 승인한 프로토타입을 따른다.

## Constraints

- 1화는 기존 카페 에피소드를 승격한다. 2–5화의 무대와 예고문 초안은 확정 전에
  사용자에게 보여 주고 승인을 받는다.
- 무대와 예고는 사람이 각본으로 쓴다. 모델이 만들지 않는다.
- 진행 중인 에피소드는 저장하지 않는다. 서버는 끝난 화의 사실만 남긴다.
- 결말은 성공, 타협, 실패 세 낱말을 화면에도 그대로 쓴다.
- 화면 문구는 프로토타입에서 시작하고
  [화면 문구 한국어 말투](../../../decisions/korean-ui-writing.md)를 따른다.
- 서버가 시즌 상태를 갖게 되므로
  [AI 에피소드 프로토콜](../../../decisions/ai-episode-protocol.md)의 재검토 조건이
  열린다. 바뀐 경로와 저장 경계를 그 계약에 반영한다.

## Verification

- 저장소 루트에서 `bun run check`와 `bun run check-types`가 통과한다.
- `bun run test`의 `apps/api` 테스트가 화마다 그 화의 첫 장면을 열고, 진행과 맞지
  않는 화를 여는 요청을 거절한다.
- `bun run db:test`의 pgTAP이 다른 계정의 시즌 진행을 읽거나 쓸 수 없고, 화를 건너뛴
  기록을 남길 수 없음을 확인한다.
- `bun run test`의 `apps/mobile` 테스트가 홈 세 상태와 마무리의 예고형·완주형을 각각
  그린다.
- `agent-device`로 1화 결말부터 2화 열기, 앱 재시작, 홈 복귀까지 한 번 플레이하고
  관찰을 남긴다.

## Review checkpoint

Required after this task. 누적 범위는 새로 생기는 계정 데이터(시즌 진행, 끝낸 화,
결말)와 그 접근 권한, 서버가 진행을 쓰는 경로, 다섯 화의 각본 전체다. 권한이
어긋나면 다른 계정의 시즌이 보이거나 결말 확정이 우회되고, 각본의 사건 품질과 난이도
일관성은 결정적 검사로 걸러지지 않는다. 02의 기억 회수 검증이 이 콘텐츠 위에서
이뤄진다.

## Status

<!-- Current values: `pending`, `in-progress`, `completed`, `blocked`, or
`superseded`.
`completed` is valid only while all acceptance criteria and focused
verification pass. Use `superseded` only after an approved replacement of a
task with recorded completion history. Preserve its Execution evidence and name
the replacement and reason under Revision; it is then terminal for that approved
breakdown and outside the current delivery map. -->
in-progress

## Execution

<!-- Append concise evidence and preserve earlier entries when status changes.
Execution Blocker is the current impediment for an active task, not a declared
task dependency. In a superseded task, preserved entries are historical. -->
- Verification: 스키마·서버·앱을 만들고 `bun run check-types`(5/5), `apps/api`
  `bun test`(43/43), `bun run db:test`(pgTAP 139/139), `apps/mobile`
  `bun run test`(435/435), `apps/mobile` `ultracite check`를 통과했다. 실제 기기
  플레이는 각본 승인 뒤에 한다.
- Blocker: 2–5화의 무대와 예고문 초안을 사용자에게 보여 주고 승인을 기다린다.
  루트 `bun run check`는 `expo install --check`의 기존 실패로 여전히 멈춘다.
  원인과 다음 단계는 `docs/follow-ups/mobile-expo-dependencies-outdated.md`에
  이미 있다.
- Revision: —
