# 개발 데이터가 있으면 DB 테스트의 전체 개수 비교가 실패한다

**Symptom**: 사용 중인 로컬 DB에서 `bun run db:test`를 실행하면 테스트와 관계없는 기존 데이터 때문에 일부 개수 비교가 실패한다.

**Observed evidence**: 2026-09-15 `841569c`에서 25개 파일, 575개 테스트 중 `saved_expressions_test.sql`의 29번과 `user_story_account_deletion_test.sql`의 2·8·9·10번이 실패했다. 각각 0 대신 저장한 표현 3개, 1 대신 사용자 4명, 0 대신 회차 3개·표현 3개·학습 사실 9개를 셌다. 같은 마이그레이션·시드·테스트를 별도의 빈 로컬 DB에 적용한 뒤에는 575개가 모두 통과했다.

**Suspected cause**: 해당 테스트는 `RESET ROLE` 뒤 테스트 사용자의 범위를 지정하지 않고 테이블 전체 개수를 비교한다. 다른 개발 세션에서 저장한 데이터도 결과에 포함되는 것으로 보인다.

**What was tried**: 임시 프로젝트 `flyn-ui-completion-20260915`와 DB 포트 56432에서 `supabase db start` 뒤 `supabase test db supabase/tests supabase/seed_identity_test.sql`을 실행했다. 통과를 확인한 뒤 해당 임시 프로젝트만 중지하고 삭제했다. 공유 개발 DB와 기존 사용자 데이터는 유지했다.

**Proposed next step**: 실패한 비교를 테스트에서 만든 사용자·행으로 제한하고 기존 데이터가 있는 DB에서도 검증한다. 전체 DB가 비어 있어야 하는 검사가 필요하다면 별도 DB에서 실행하도록 테스트 진입 명령을 분리한다.
