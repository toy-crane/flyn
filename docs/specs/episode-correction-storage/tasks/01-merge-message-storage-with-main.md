# 01 — 메시지 저장을 main의 기능과 한 몸으로 합친다

## Outcome

사용자가 main의 모든 기능(스토리 골라 시작, 배울 표현, AI에게 물어보기, 홈
이어 하기)을 그대로 쓰는데, 대화는 메시지 단위 구조 위에서 돈다. 앱은 새로 쓴
말 하나만 실어 보내고 저장은 서버 한 곳이 맡는다. 교정은 아직 main처럼 세션
상태로만 남는다.

## Blockers

None.

## Acceptance criteria

- [x] [에피소드 메시지 저장](../../episode-message-storage/spec.md)의 수용 기준
      전부가 합쳐진 결과에서 성립한다. 껐다 켜 이어 하기, 중지, 다시 받기, 수정,
      읽기 전용, 요청 크기, 타 계정 차단이 여기 든다.
- [x] 스토리 다섯 개의 콘텐츠(각본, 표지, 훅, 소개)와 홈, 스토리 목록, 상세
      화면이 main과 같다.
- [x] 여러 스토리를 번갈아 진행해도 진행과 이야기 기억이 서로 섞이지 않는다.
- [x] 진행 표시(다시 열 수 있는 끝낸 화, 이어 하기와 시작의 구분, 가장 최근 손댄
      스토리)가 플레이 기록과 메시지 행에서 나오고, 보이는 것은 main과 같다.
- [x] 배울 표현 한 줄, 카드, 다시 보내기, AI에게 물어보기가 main과 같이
      동작하고, 장면 스트리밍이 교정 때문에 멈추지 않으며, 인물의 대사에 교정이
      나타나지 않는다.
- [x] 끝난 화를 다시 열면 결말과 예고가 세션에 실려 오고 읽기 전용으로 보인다.
- [x] 이 브랜치가 임시로 만든 단일 스토리 진행 조회가 남아 있지 않다.

## Constraints

- 교정 저장은 이 작업이 하지 않는다. `seenPatterns` 나르기와 transient 방식을
  main 그대로 유지한다. 걷어내는 것은 02다.
- [AI 에피소드 프로토콜](../../../decisions/ai-episode-protocol.md)의 양쪽
  갱신(main의 교정 규칙, 이 브랜치의 저장 규칙)을 한 계약으로 합쳐 적는다.
- 선언형 스키마가 원본이다. 병합 뒤 마이그레이션 이력과 생성 타입이 스키마와
  일치한다.
- 화면 동작은
  [모바일 채팅 메시지 동작](../../../decisions/mobile-chat-message-actions.md)이
  정한 겉모습을 바꾸지 않는다.

## Verification

- `bun run check-types`가 통과한다.
- `bun run test`의 `apps/api` 테스트가 새 메시지 하나만 받는 턴, 스토리 단위
  진행 판정, 교정이 장면과 나란히 도는 것을 확인한다.
- `bun run test`의 `apps/mobile` 테스트가 앱이 저장을 요청하지 않는 것과 배울
  표현 흐름이 main과 같이 동작하는 것을 확인한다.
- `bun run db:reset`이 마이그레이션 전체를 처음부터 재생하고 성공한다.
- `bun run db:test`가 통과한다.
- `bun run db:lint`가 경고 없이 통과하고, `bun run db:diff`가 "No schema changes
  found"로 선언형과 이력의 일치를 확인한다.
- `agent-device` 한 세션에서 스토리를 골라 시작하고, 교정을 받아 다시 보내고,
  앱을 껐다 켜 이어 하고, 결말까지 진행한 뒤 끝난 화를 다시 열어 읽기 전용인
  것까지 확인한다.

## Review checkpoint

One review pass after this task. 누적 범위는 병합된 전체 diff다. 서버 에피소드
경로, 모바일 에피소드 흐름, 스키마·정책·마이그레이션 병합, 진행 조회 재작성이
든다. 조용히 병합되는 어긋남(지워진 테이블을 읽는 진행 조회, 마이그레이션
순서)과 두 갈래의 의미 충돌은 결정적 검사가 다 잡지 못하고, 02가 전부 이 위에
선다. 데이터베이스 부분은
[Supabase 스키마 작업 방식](../../../decisions/supabase-schema-workflow.md)이
정한 전용 검토 agent가 맡는다.

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
- Verification: `origin/main` 위로 리베이스해 커밋 14개를 그대로 올렸다.
  `bun run check-types` 5개 패키지 통과. `bun run test`가 `apps/api` 94개,
  `apps/mobile` 500개, `scripts`를 통과한다. `bun run db:reset`이 마이그레이션
  전체를 재생하고 스토리 다섯 개와 표지 그림을 복원한다. `bun run db:test`
  pgTAP 241개 통과, `bun run db:lint` 경고 없음, `bun run db:diff`가
  "No schema changes found"로 선언형과 이력의 일치를 확인한다.

  `agent-device` 한 세션에서 slot 3 기기로 확인했다. 새 계정으로 이메일 코드
  로그인 뒤 스토리 탭에서 다섯 스토리가 훅·표지·진행률과 함께 보였고, 카페
  스토리를 골라 상세에서 1화를 시작했다. 보낸 문장에 배울 표현 3개가 붙었고
  (`the wrong coffee`, `want to get`, `an iced americano`), 카드를 펼쳐 항목과
  이유를 확인한 뒤 AI에게 물어보기로 한국어 답을 받았다. 결말이 나자 마무리에
  결과와 2화 예고가 보였다.

  저장은 데이터베이스로 대조했다. 첫 장면, 사용자 메시지, 닫는 장면이
  `episode_messages`에 한 행씩 `created_at` 순으로 남고, 결말은
  `episode_plays`에 남는다. 사용자 메시지 id는 모두 uuid다. 앱을 껐다 켜면 홈이
  "진행하던 장면부터 이어가요"와 진행률 20%를 보이고, 이어 하기로 2화 대화가
  첫 장면부터 그대로 복원된다.

  답변이 흐르는 중에 화면을 나가도 서버가 자기가 만든 장면을 끝까지 저장했다
  (행 6개 → 7개). 메시지 저장 명세가 남겨 둔 첫 번째 위험이 여기서 해소됐다.
  `episode_corrections`는 0행으로, 02가 채울 자리가 비어 있다.

  다시 받기와 수정은 기기로 확인하지 못했다. 에피소드 화면이
  `hasMessageActions={false}`로 그 버튼을 두지 않기 때문이고, 이는 이 작업이
  만든 상태가 아니다. 서버 테스트가 그 경로를 고정한다.
- Blocker: —
- Revision: main의 진행 조회를 새 구조로 옮기면서 "마지막으로 손댄 시각"의
  근거가 바뀌었다. 옛 구조는 `episode_runs.updated_at`을 썼는데, 새 구조에서 그
  값을 정확히 얻으려면 이 계정의 메시지 행을 전부 읽어야 한다. 홈 정렬의 쓰임이
  스토리 사이의 앞뒤를 가리는 것뿐이라 `finished_at ?? started_at`으로 근사하고,
  메시지는 중첩 select로 세기만 한다. 진행 중인 화를 오래 하다 다른 스토리를
  시작하면 순서가 뒤집힐 수 있다.

  브랜치가 임시로 만든 `GET /ai/episode/story`와 `readStoryView`,
  `transcriptEpisodeIds`, `StoryView`, `FinishedEpisodeView`를 지웠다. main의
  `/home`, `/stories`, `/stories/:storyId`가 그 자리를 이미 채운다.
