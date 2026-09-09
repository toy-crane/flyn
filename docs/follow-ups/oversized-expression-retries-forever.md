# 제약을 넘긴 표현은 다시 시도해도 계속 실패한다

**Symptom**: 담으려는 값이 `saved_expressions`의 길이 제약을 넘으면 저장이
23514로 거절되고, 서버가 그것을 500으로 덮는다. 앱은 `표현을 저장하지 못했어요.`와
새로고침 아이콘을 보여 주므로 사용자는 계속 누르지만 매번 같은 자리에서 실패한다.
명세는 "다시 시도하면 저장된다"고 적고 있고, 앱에는 일시적 실패와 영구 실패를
가를 근거가 없다.

**Observed evidence**: `supabase-reviewer`가 2026-09-10 검토에서 짚었다.
`supabase/schemas/30-tables.sql`의 `saved_expressions_entries_size`는 `entries`를
8192바이트로 막는데, 한 메시지에 붙는 `episode_corrections` 행 수에는 상한이 없다.
행마다 `original` 1000자, `fixed` 1000자, `reason` 300자까지 허용되고 `reason`은
한국어라 UTF-8에서 글자당 3바이트다. `english`도 1000자인데
`apps/api/src/features/episode/route.ts`의 `utteranceDraft`가 넘기는 장면 대사
길이에는 상한이 없다. 어느 쪽이든 `saveExpression`이 던지고
`apps/api/src/app.ts`가 500으로 바꾼다. 실제로 넘치는 입력은 아직 관찰하지 못했다.

**Suspected cause**: 담기 경로가 제약을 넘긴 값을 넘겼는지 확인하지 않는다.
데이터베이스의 거절과 게이트웨이 장애 같은 일시적 실패가 앱에서 같은 응답으로
도착한다.

**What was tried**: 아무것도 바꾸지 않았다. 같은 검토에서 나온 다른 셋(화자 열의
서버 신뢰 근거, 판정을 받지 않은 메시지의 배울 표현 차단, 취소 경로의 id 검증)은
고쳤다. 이것은 실제로 닿는 입력을 찾지 못해 남겨 둔다.

**Proposed next step**: 실제 교정의 `entries` 크기 분포를 로컬 데이터에서 재어
제약 값이 현실과 맞는지 먼저 본다. 그다음 서버가 담기 전에 길이를 확인해 4xx로
돌려주고, 앱이 그 응답에서는 다시 시도를 권하지 않게 한다.
