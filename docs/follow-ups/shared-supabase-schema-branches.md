# 공유 Supabase에서 서로 다른 스키마 작업을 함께 검증하기 어렵다

**Symptom**: 다른 worktree의 마이그레이션이 적용된 공유 로컬 DB에는 현재 브랜치의 전체 마이그레이션을 그대로 적용할 수 없다.

**Observed evidence**: 2026-09-10 `supabase_db_flyn`의 마이그레이션 목록에는 현재 브랜치에 없는 `20260909155751_saved_expressions`가 있었고, 이번 기능의 `episode_expression_results` 테이블은 없었다. 루트 개발 세션은 계약에 따라 이 공유 DB를 사용한다. 별도 스택의 전체 마이그레이션과 DB 검사는 통과했다. 같은 날 iOS 검증 중 `.claude/worktrees/ai-expression-storage-options-df139b`에서 실행한 `supabase db reset` 프로세스를 확인했다. 이후 추가한 테이블과 검증 계정이 사라졌고, 마이그레이션 목록은 `20260909165937_saved_expressions`까지 바뀌었다.

**Suspected cause**: 모든 worktree가 같은 Supabase와 마이그레이션 기록을 공유하지만 각 브랜치의 스키마 이력은 다르다.

**What was tried**: iOS 검증을 위해 생성된 `20260909153801_episode_expression_review_results.sql`에서 새 테이블 생성 이후의 제약·권한·정책만 공유 DB에 트랜잭션으로 적용했다. 기존 `episode_corrections`, 다른 작업의 테이블·데이터와 마이그레이션 기록은 변경하지 않았다. 다른 작업의 초기화 뒤 다시 준비할 때는 자동 승인 검토가 익명·로그인 역할의 `TRUNCATE` 권한을 거절했다. 새 테이블의 두 역할 기본 권한을 회수하고, 로그인 사용자의 RLS 안에서 `SELECT`와 지정 열 `INSERT`만 허용하는 검증용 권한으로 적용했다. 공유 DB는 전체 마이그레이션 완료 상태가 아니며, 이 부분 적용을 배포 절차로 사용하면 안 된다.

**Proposed next step**: 스키마 브랜치를 통합할 때 공유 DB의 두 이력과 부분 적용을 먼저 확인한다. 전체 마이그레이션을 다시 실행하기 전에 이번 추가 테이블의 데이터 보존과 이력 정리 방법을 결정한다. 이런 충돌이 반복되면 `worktree-development-sessions.md`의 재검토 조건에 따라 worktree별 DB 검증 경로를 정의한다.
