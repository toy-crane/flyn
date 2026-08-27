# 02 — 지난 화의 선택과 결과가 다음 화에 돌아온다

## Outcome

에피소드가 결말로 끝나면 서버가 그 대화에서 이야기 기억(사용자의 선택, 사건의 결과,
관계의 변화, 새로 열린 질문)과 언어 수준을 뽑아 저장한다. 다음 화를 열 때 지금까지의
이야기 기억이 프롬프트에 들어가고, 지난 일이 대사와 관계와 지문으로 돌아온다.

## Blockers

01 — 시즌과 화의 저장 구조, 그리고 다섯 화의 각본이 있어야 기억이 붙을 자리와 돌아올
자리가 생긴다.

## Acceptance criteria

- [x] 1화를 결말까지 끝내면 이야기 기억 네 항목과 언어 수준이 계정에 저장된다.
- [x] 마무리 화면을 보지 않고 앱을 꺼도 그 기억이 남는다.
- [x] 이야기 기억은 시즌에, 언어 수준은 계정에 붙는다.
- [x] 1화를 다르게 끝낸 두 계정에서 2화의 전개가 다르게 관찰되고, 지난 결말이나
      선택이 대사 또는 지문으로 돌아온다.
- [x] 사건은 분기하지 않는다. 두 계정 모두 같은 첫 장면에서 시작한다.
- [x] 기억을 뽑는 호출이 실패해도 다음 화는 열리고 끝까지 진행할 수 있다.

## Constraints

- 기억은 대사, 관계, 지문으로 돌아오고 사건을 바꾸지 않는다.
- 언어 수준은 저장까지만 한다. 난이도 조절은 각본 프롬프트의 기존 규칙을 유지한다.
- 끝난 화의 요약만 남기고 진행 중 대화는 저장하지 않는다.
- 기억은 장면을 닫은 모델이 결말과 같은 출력에 함께 쓴다. 모델 호출을 늘리지 않는
  대신 장면 스트림에 화면 밖 기록 줄이 생기므로, 그 part 구조를
  [AI 에피소드 프로토콜](../../../decisions/ai-episode-protocol.md)에 반영한다.

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
completed

## Execution

<!-- Append concise evidence and preserve earlier entries when status changes.
Execution Blocker is the current impediment for an active task, not a declared
task dependency. In a superseded task, preserved entries are historical. -->
- Verification: `bun run check-types` 5/5, `apps/api` `bun test` 52/52,
  `bun run db:test` 148/148, `apps/mobile` `bun run test` 435/435,
  `ultracite check` 통과, `bun run db:lint` 무오류.
  실제 서버와 모델로 두 계정이 1화를 성공과 실패로 각각 끝냈다. 두 계정 모두
  네 항목이 서로 다른 내용으로 저장됐고 언어 수준도 계정마다 남았다. 2화의 첫
  장면은 두 계정이 글자까지 같았고, 같은 인사말에 대한 응답은 갈렸다. 성공으로
  끝낸 계정에는 "어제 일이 떠오른 듯 살짝 웃는다 / No hot latte today, right?"가,
  실패로 끝낸 계정에는 "어제 그 손님이라는 걸 알아본 눈치다 / Yeah, I remember
  you."가 왔다.
  iOS 시뮬레이터에서 그 계정으로 로그인해 2화를 결말까지 플레이했다. 기록 줄은
  장면에도 마무리에도 나타나지 않았고, 2화의 기억이 지난 화를 가리키며 저장됐다.
  앱 밖에서 진행한 1화가 기기에서 그대로 이어지는 것도 함께 확인했다.
- Blocker: 루트 `bun run check`는 `expo install --check`의 기존 실패로 여전히
  멈춘다. 이 단위와 무관한 의존성 표류이고 다음 단계는
  `docs/follow-ups/mobile-expo-dependencies-outdated.md`에 있다.
- Revision: 기억을 뽑는 별도 모델 호출을 두지 않고, 장면을 닫은 모델이 결말과
  같은 출력에 기록 줄을 쓰게 했다. 그래서 "한 요청이 여러 번의 모델 호출로
  바뀐다"는 기록을 명세와 이 작업의 제약에서 바로잡았다. 회수가 약해 프롬프트의
  "굳이 확인시키지 않는다"를 "첫 응답에 한 번은 묻어나게 한다"로 고쳤고, 그
  근거를 `docs/decisions/ai-episode-protocol.md`에 남겼다.
