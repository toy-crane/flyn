# 계정 삭제 검사가 표 전체를 세어 기기 검증 뒤에는 실패한다

**Symptom**: 기기에서 앱을 써 본 뒤 `bun run db:test`를 돌리면
`supabase/tests/user_story_account_deletion_test.sql`의 세 검사가 실패한다.
`an expression saved from the made story is there too`가 `have: 7 / want: 1`,
`the runs through that story are gone`이 `have: 4 / want: 0`,
`the expressions saved along the way are gone`가 `have: 6 / want: 0`이다.

**Observed evidence**: 2026-09-10 표현 화면 다듬기의 마지막 검증에서 나왔다. iOS와
Android로 대화를 하고 표현을 담은 뒤 계정 두 개(`toast-check-0910@example.test`,
`android-row-0910@example.test`)와 `story_plays` 4행, `saved_expressions` 6행이
로컬 데이터베이스에 남았다. 같은 커밋에서
`bun scripts/ci/database.ts verify <base> <head>`는 통과한다. 그 명령은 빈
데이터베이스에 마이그레이션을 재생하고 그 위에서 pgTAP을 돌린다. 즉 실패는 이번
변경이 아니라 검사가 서 있는 자리의 문제다.

**Suspected cause**: 세 단언이 `count(*) FROM public.story_plays`와
`count(*) FROM public.saved_expressions`처럼 표 전체를 센다. 같은 파일의 다른
단언은 `WHERE story_id = (SELECT story_id FROM made)`로 자기가 만든 것만 센다.
표 전체를 세는 세 곳만 앞서 쌓인 데이터에 걸린다. 로컬 Supabase 스택은 머신에
하나이므로 기기 검증이든 다른 worktree든 쌓인 행이 그대로 들어온다.

**What was tried**: `db:reset`은 다른 세션의 로컬 데이터까지 지우므로 하지 않았다.
대신 CI가 쓰는 재생 검증으로 같은 스위트가 깨끗한 데이터베이스에서 통과하는 것을
확인했다.

**Proposed next step**: 세 단언을 자기가 만든 계정과 스토리로 좁힌다.
`story_plays`는 `WHERE story_id = (SELECT story_id FROM made)`, `saved_expressions`는
`WHERE user_id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'`로 거르면 앞서 쌓인 행이
있어도 계정 삭제의 연쇄를 그대로 잰다.
