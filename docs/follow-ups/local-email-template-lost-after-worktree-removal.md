# Worktree 삭제 뒤 로컬 인증 메일에 코드가 없다

**Symptom**: 로컬 앱에서 이메일 인증 코드를 요청했지만 Mailpit에는 로그인 링크만
도착했다. `bun run auth:otp`는 6자리 코드가 없다고 실패했다.

**Observed evidence**: 2026-09-09 스토리 화면 이동을 확인하던 중 발생했다.
`supabase_auth_flyn`은 코드 템플릿 URL을 사용하도록 설정되어 있었지만,
컨테이너에서 `/email/confirmation.html`을 요청하면 404가 나왔다.
`supabase_kong_flyn`의 두 이메일 템플릿 bind mount는 이미 삭제된
`.claude/worktrees/database-architecture-diagram-fc406e/supabase/templates/email-otp.html`을
참조했다. 현재 저장소의 템플릿에는 `{{ .Token }}`이 있다.

**Suspected cause**: 공용 Supabase를 시작한 worktree의 파일 경로가 컨테이너에
남아 있다. 그 worktree를 지운 뒤 템플릿을 읽지 못해 기본 로그인 링크 메일로
대체된 것으로 보인다.

**What was tried**: 다른 개발 세션과 실행 중인 DB 작업이 없는 것을 확인한 뒤
기본 checkout에서 `bun run db:stop`과 `bun run db:start`으로 재시작했다.
데이터 삭제 옵션과 DB 초기화는 사용하지 않았다. 앱 인증이나 템플릿 코드는 바꾸지 않았다.
재시작 후 템플릿 요청과 코드 발송이 복구됐고, iOS와 Android에서 코드로 로그인했다.

**Proposed next step**: 공용 Supabase가 삭제 가능한 worktree의 파일을 참조하지
않도록 시작 위치와 템플릿 소유권을 정한다. worktree 삭제 뒤에도 새 이메일 코드
요청과 `auth:otp`가 동작하는지 확인한다.
