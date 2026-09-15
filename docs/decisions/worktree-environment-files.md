# Worktree 환경 파일

## 결정

- 개발자는 기본 checkout의 `apps/api/.env.local`, `apps/mobile/.env.local`, `supabase/.env`를 같은 Git 저장소가 쓰는 로컬 환경 파일의 원본으로 관리한다.
- `.worktreeinclude`를 Codex 관리 worktree가 환경 파일을 준비하는 첫 번째 경로로 유지한다.
- 저장소의 환경 준비 명령은 Git common directory의 부모에서 기본 checkout을 찾는다. 현재 worktree에 대상 파일이 없을 때만 원본을 가리키는 절대 경로 symlink를 만든다.
- 환경 준비 명령은 원본을 먼저 검사한다. 원본 파일이 없거나 필요한 키가 비어 있으면 symlink를 만들지 않고 파일과 키 이름만 알린다.
- 현재 checkout에 일반 파일이나 symlink가 이미 있으면 덮어쓰거나 다른 곳으로 연결하지 않는다. 기존 파일을 검사하고 그대로 사용한다.
- Codex 로컬 환경 setup과 환경 파일이 필요한 저장소 명령은 환경 준비 명령을 먼저 실행한다. 상태 확인과 자원 반납처럼 환경값이 필요 없는 읽기·정리 명령은 실행하지 않는다.

## 경계

- 같은 non-bare Git 저장소의 기본 checkout과 연결된 로컬 worktree에만 적용한다. 새 clone, Remote SSH, CI와 배포 환경에는 비밀값을 전달하지 않는다.
- 환경 준비는 값을 생성하거나 바꾸지 않는다. 사용자가 기본 checkout 또는 현재 checkout에 둔 값을 공유하고 검증할 뿐이다.
- 오류와 정상 출력에 환경값을 넣지 않는다.
- worktree별로 서로 다른 환경을 쓰려면 해당 worktree에 일반 파일을 직접 두면 된다. 자동 연결은 그 파일을 건드리지 않는다.

## 이유

Codex의 일반 worktree 생성은 `.worktreeinclude`에 적은 ignored 파일을 복사하지만, 위임 생성과 handoff 경로가 선택한 로컬 환경 setup을 건너뛰는 문제가 반복됐다. 환경이 없는 worktree가 다음 작업의 출발점이 되면 복사할 파일도 사라진다. Git common directory는 어느 worktree에서 작업을 시작했는지와 관계없이 같은 기본 checkout을 가리키므로 이 연쇄를 끊는다.

파일을 worktree마다 복사하면 비밀값 사본이 늘고 원본 변경 뒤 서로 다른 값이 남는다. symlink는 원본 하나를 유지하면서 worktree별 일반 파일을 둘 수 있는 예외도 보존한다. 기존 파일을 자동으로 덮어쓰지 않으면 사용자가 고른 원격 Supabase나 별도 시험 환경을 뜻하지 않게 바꾸지 않는다.

## 재검토 조건

- Codex가 모든 worktree 생성과 handoff 경로에서 `.worktreeinclude`와 선택한 로컬 환경 setup 실행을 보장할 때
- worktree마다 다른 Supabase 프로젝트나 AI 모델 자격 증명을 동시에 써야 할 때
- 기본 checkout 밖의 운영체제 자격 증명 저장소가 프로젝트 환경 파일을 안정적으로 제공하게 될 때

## 계속 제외하는 대안

- `.worktreeinclude`만 사용: 정상 UI 생성에는 충분하지만 위임 생성과 handoff에서 환경 setup이 빠진 실제 오류를 막지 못한다.
- 환경 파일 복사: worktree마다 비밀값 사본이 생기고 원본을 바꿔도 이미 만든 worktree는 갱신되지 않는다.
- 고정된 `/Users/...` 경로 사용: 다른 사용자와 clone 경로에서 동작하지 않는다.
- 기존 대상 파일 자동 교체: worktree별 값을 일부러 둔 경우를 지우고 사용자가 고른 원격 환경을 바꿀 수 있다.

## 보존할 근거

- 2026-09-15에 확인한 최근 Flyn 세션 6개와 현재 세션에서 환경 파일 누락 또는 필수 키 오류가 실제 명령을 막았다.
- 같은 날 기본 checkout에는 세 환경 파일이 있었지만 여러 Codex worktree에는 없었다. worktree의 로컬 환경 설정 경로는 앞서 만든 worktree를 시간순으로 가리켰다.
- OpenAI Codex 공개 이슈 #36028, #27584와 #18981은 위임 생성, `create_thread`와 첫 handoff에서 선택한 로컬 환경 setup이 빠지는 문제를 각각 보고한다.
