# 02 — 만든 스토리의 표지

## Outcome

`대화 시작하기` 때 각본과 나란히 표지 한 장을 만들어 공식 표지와 같은 방식으로
저장하고, 만든 스토리가 탐색, 상세, 대화 기록에서 그 표지와 함께 보인다. 표지가
각본보다 늦으면 1화는 그대로 열리고 표지는 준비되는 대로 나타난다. 표지 생성이
실패해도 스토리는 그대로 만들어지고 표지 자리는 빈 색 상자로 남는다.

## Blockers

01. 저장할 스토리와 `대화 시작하기` 흐름이 있어야 표지를 붙일 자리가 생긴다.

## Acceptance criteria

- [x] 1화에서 탐색으로 돌아오면 방금 만든 스토리에 표지가 보이고, 상세와 대화
      기록에서도 같은 표지가 보인다.
- [x] 표지는 단색 배경에 카드의 인물 중 순서 1번 한 명의 상반신 일러스트이고, 글자,
      로고, 배경 풍경이 없다.
- [x] 표지 생성만 실패시키면 스토리와 1화는 그대로 만들어지고 표지 자리는 빈 색
      상자다.
- [x] 표지가 각본보다 늦게 끝나도 `대화 시작하기`의 대기가 표지 때문에 늘지 않고,
      표지는 준비된 뒤 목록을 다시 열면 보인다.
- [x] 카드를 고쳐 새 카드가 나와도, 같은 스토리를 다시 플레이해도 표지를 새로 만들지
      않는다. 스토리당 표지는 한 장이다.

## Constraints

- 이미지 모델은 지금 쓰는 Vercel AI Gateway의 `openai/gpt-image-1-mini`, 품질 low,
  1024×1024 한 장이다. 새 이미지 제공자 SDK나 별도 자격 증명을 추가하지 않는다.
- 저장은 공식 표지와 같은 방식을 쓴다. 표지 저장소, 내용 해시로 정한 파일 이름,
  등록 시점에 만든 BlurHash를 표지 경로와 함께 스토리에 저장한다.
  [모바일 이미지 로딩](../../../decisions/mobile-image-loading.md)을 따른다.
- 스타일 문구는 제품이 고정하고 스토리마다 인물 설명과 장소만 바꾼다. 사용자가 적은
  실제 사람이나 회사 이름은 그림 문구에 넣지 않는다.
- 표지 다시 만들기, 사용자가 표지를 고르거나 올리는 기능은 넣지 않는다.

## Verification

- 단위 테스트: 이미지 모델을 대체한 상태에서 `대화 시작하기`가 표지 경로와 BlurHash를
  스토리와 함께 저장하고, 이미지 생성이 실패하면 표지 없이 스토리만 저장한다.
- 단위 테스트: 그림 문구에 카드의 순서 1번 인물 설명과 장소는 들어가고 사용자가 적은
  실제 이름은 들어가지 않는다.
- 통합 테스트: 로컬 Supabase 스택에서 `bun run test:integration`으로, 만든 표지 파일이
  저장소에 올라가고 스토리 행의 경로와 해시가 그 파일을 가리킨다.
- 실행 검증: iOS 시뮬레이터에서 `agent-device`로 스토리를 하나 만든 뒤 탐색, 상세,
  대화 기록에 같은 표지가 보이고, 표지 생성을 강제로 실패시킨 스토리는 빈 색 상자로
  보이는 것을 확인한다.

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
- Verification: DB 검사 463개, API 검사 181개, 모바일 검사 567개가 지나간다.
  임시 스택이 아니라 실제 로컬 스택에서 도는 통합 검사 5개가 표지 파일과
  스토리 행이 같은 파일을 가리키는 것, 남의 폴더와 공식 표지 자리에 올리지
  못하는 것, 표지가 한 번만 붙는 것을 확인한다. iOS 시뮬레이터에서 스토리를
  만들어 탐색, 상세, 대화 기록에 같은 표지가 보이는 것을 보았고, 그림은 단색
  배경에 상반신 하나이며 글자와 로고와 풍경이 없다.
- Verification: `AI_GATEWAY_IMAGE_MODEL`에 없는 모델 이름을 넣어 표지 생성만
  실패시켰다. 스토리와 1화는 그대로 만들어지고(`도서관의 소음`) 표지 자리는 빈
  색 상자였다. 카드를 고쳐 새 카드를 받아도, 만든 스토리를 다시 플레이해도
  표지 파일 수와 스토리의 표지 경로가 그대로였다.
- Blocker: —
- Revision: 표지 그림의 장소는 카드가 든다. 표지는 각본과 나란히 시작하므로
  각본이 쓴 값을 기다릴 수 없다. 카드에 `setting` 한 줄을 더하고 화면에는
  그리지 않는다. 스타일 문구는 공식 표지를 보고 적었고, 그 문구와 이유는
  `apps/api/src/features/episode/story-cover.ts`에 적었다. 통합 검사는 임시
  스택이 아니라 로컬 스택에서 돈다. 이 흐름은 secret key 없이 사용자의 토큰을
  RLS가 판정하는 것이 요지라서 진짜 로그인이 필요하고, 임시 스택에는 코드를
  받을 메일함이 없다. 같은 폴더의 다른 통합 검사도 로컬 스택을 쓴다.
  `supabase-reviewer`가 계정 삭제 범위를 짚어 만든 표지 폴더를 삭제 대상에
  넣고 쓰기 정책에 삭제 울타리를 더했다. 함수의 경로 검사도 저장소 정책과 같은
  모양으로 좁혔다. 표지가 각본보다 늦게 끝나는 갈래는 기기에서 재현하지
  못했다. 네 번 모두 표지가 먼저 끝났다. 그 갈래는 응답을 보낸 뒤 표지를 다는
  경로 검사로 확인한다. 각본이 실패했을 때 이미 올라간 표지 파일이 남는 것은
  [후속 기록](../../../follow-ups/made-cover-file-outlives-a-failed-save.md)으로
  옮겼다.
