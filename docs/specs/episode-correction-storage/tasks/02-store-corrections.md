# 02 — 교정을 행으로 남기고 패턴 목록을 서버가 읽는다

## Outcome

배울 표현이 계정에 남는다. 진행 중인 화를 다시 열면 배울 표현이 같은 메시지에
그대로 있고, 이미 알려 준 규칙은 앱을 껐다 켜도 다시 붙지 않으며, 계정 전체
배울 표현을 한 번의 조회로 꺼낼 수 있다. 앱은 패턴 목록을 나르지 않는다.

## Blockers

01 — 교정을 만드는 판정과 그것이 실리는 응답 흐름이 합쳐진 결과 위에만 있다.

## Acceptance criteria

- [x] 배울 표현이 붙은 화를 껐다 켜고 다시 열면 같은 메시지에 같은 배울 표현이
      붙어 있고, 카드의 원문 표시, 고친 문장, 이유가 이번 세션에서 받았을 때와
      같다.
- [x] 같은 에피소드에서 이미 알려 준 패턴은 앱을 껐다 켜고 이어 해도 다시 붙지
      않고, 요청에 패턴 목록이 실리지 않는다.
- [x] 한 계정이 지금까지 받은 배울 표현 전체를 한 번의 조회로 꺼낼 수 있고, 각
      행에서 원문 조각, 고친 조각, 고친 문장, 이유를 읽을 수 있다.
- [x] 수정으로 버린 메시지의 배울 표현은 함께 사라지고, 다시 열어도 보이지
      않는다.
- [x] 에피소드를 끝내는 마지막 메시지의 배울 표현도 남는다. 결말 확정과 겹쳐도
      버려지지 않는다.
- [x] 상대 메시지에 교정을 붙이거나 남의 교정에 닿으려는 시도는 데이터베이스가
      거절한다.
- [x] 교정 저장이 실패해도 화면 표시와 이야기는 계속된다.

## Constraints

- 결말이 얼리는 것은 메시지까지다. 교정은 결말 뒤에도 그 플레이의 기존 사용자
  메시지에 붙고,
  [AI 에피소드 프로토콜](../../../decisions/ai-episode-protocol.md)의 "메시지도
  교정도" 문구를 이 규칙으로 갱신한다.
- AI에게 물어보기와 마무리 화면은 손대지 않는다. 끝난 화의 읽기 전용 복습에
  배울 표현을 표시하지 않는다.
- 다시 보냈다는 표시(✓ 고쳐서 다시 보냈어요)는 세션 안의 상태로 둔다.
- 저장된 대화(메시지 행)에 교정을 넣지 않는다. 교정은 자기 행에만 남는다.

## Verification

- `bun run db:test`의 pgTAP이 교정 규칙을 고정한다. 결말이 난 플레이의 사용자
  메시지에 교정이 붙는 것, 상대 메시지에 붙는 교정이 거절되는 것, 타 계정
  차단, 메시지 삭제를 따라 교정이 사라지는 것을 각각 확인한다.
- `bun run test`의 `apps/api` 테스트가 판정 결과를 행으로 남기는 것, 이미 알려
  준 패턴을 서버가 자기 행에서 읽는 것, 저장 실패를 삼키고 플레이를 잇는 것을
  확인한다.
- `bun run test`의 `apps/mobile` 테스트가 요청에 패턴 목록이 없는 것과 세션이
  실어 온 교정으로 배울 표현이 복원되는 것을 확인한다.
- `bun run check-types`가 통과한다.
- `bun run db:reset`이 성공하고, `bun run db:lint`가 경고 없이 통과하며,
  `bun run db:diff`가 "No schema changes found"로 선언형과 이력의 일치를
  확인한다.
- `agent-device` 한 세션에서 교정을 받은 화를 앱을 껐다 켜 다시 열어 배울
  표현이 복원되는 것과, 같은 규칙을 다시 틀려도 새 배울 표현이 붙지 않는 것을
  확인한다.

## Review checkpoint

None. 구현 단계의 최종 검토가 전체 diff를 본다. 정책 완화(결말 뒤 교정)는
pgTAP이 고정하고 최종 검토 범위에 든다.

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
- Verification: `bun run check-types` 5개 패키지 통과. `bun run test`가
  `apps/api` 98개, `apps/mobile` 501개, `scripts`를 통과한다. 서버 테스트가
  판정 결과를 행으로 남기는 것, 이미 알려 준 규칙을 서버가 자기 기록에서 읽어
  판정자에게 주는 것, 교정 저장이 실패해도 장면과 대화 기록이 그대로인 것,
  세션이 저장된 교정을 한 메시지로 묶어 실어 보내는 것을 각각 고정한다. 모바일
  테스트가 요청에 패턴 목록이 없는 것과 훅이 실어 온 교정으로 시작하는 것을
  고정한다. `bun run db:reset`, `bun run db:test` pgTAP 241개, `bun run db:lint`
  경고 없음, `bun run db:diff` "No schema changes found" 통과.

  `agent-device` 두 세션으로 iOS(slot 3 시뮬레이터)와 Android(flyn dev 1
  에뮬레이터)에서 각각 확인했다. 새 계정으로 이메일 코드 로그인 뒤 1화를 시작해
  같은 문장을 보냈고, 두 플랫폼 모두 배울 표현이 붙으면서
  `episode_corrections`에 `original`, `fixed`, `corrected`, `pattern`, `reason`
  다섯 값이 남았다. 앱을 껐다 켜고 홈의 이어 하기로 돌아오자 같은 메시지 곁에
  배울 표현이 강조까지 그대로 복원됐다(iOS
  `scratchpad/ios-correction-restored.png`, Android
  `scratchpad/android-correction-restored.png`).

  iOS에서 같은 규칙을 다시 틀린 문장을 보냈을 때 `article-the-specific`이 다시
  붙지 않았고, 행도 하나로 유지됐다. 앱 요청에는 `seenPatterns`가 실리지 않는다.
  이어서 두 플랫폼 모두 결말까지 진행해 마무리 화면의 결과 한 줄과 2화 예고를
  확인했다. 결말 턴에서 새 규칙(`article-indefinite-a-an`) 하나가 더 붙었다.
- Blocker: —
- Revision: 교정 행이 담는 값을 다섯으로 넓혔다. 명세가 정한 대로 판정의 실제
  출력(원문 조각, 고친 조각, 고친 문장, 패턴 키, 이유)을 그대로 담는다. 사용자가
  쓴 원문 전체는 행에 두지 않는다. 그 메시지가 이미 들고 있어 중복이고, 세션이
  돌려줄 때 대화에서 채운다.

  결말 뒤 교정을 허용하는 정책 완화는 넣었지만, 이번 기기 확인에서는 판정이
  결말보다 빨라 실제로 그 경로를 지나가지 않았다(세 교정 모두
  `created_at < finished_at`). pgTAP이 그 규칙을 고정한다.
