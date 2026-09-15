# Worktree 환경 파일 자동 연결

## 사용자 결과

- Codex가 어떤 경로로 worktree를 만들었더라도 로컬 개발 명령을 처음 실행하면 필요한 환경 파일이 준비된다.
- 개발자는 환경값을 원본 저장소에서 한 번만 관리한다. 같은 Git 저장소의 worktree는 그 파일을 함께 쓴다.
- 준비에 실패하면 비밀값을 드러내지 않는 오류에서 고칠 파일과 빠진 키를 바로 알 수 있다.

## 범위

- 같은 Git 저장소의 기본 checkout과 연결된 worktree 사이에서 아래 파일을 준비한다.
  - `apps/api/.env.local`
  - `apps/mobile/.env.local`
  - `supabase/.env`
- 저장소 루트에서 사람이 실행할 수 있는 환경 준비 명령을 제공한다.
- Codex 로컬 환경 setup, 루트 개발 세션, 로컬 인증 코드 확인과 API 평가 명령은 환경이 필요할 때 준비 명령을 먼저 거친다.
- `.worktreeinclude`는 Codex가 정상 생성 경로에서 파일을 복사하는 첫 번째 방법으로 유지한다.

## 수락 기준

1. 기본 checkout에서 환경 준비 명령을 실행하면 세 환경 파일을 바꾸지 않고 필요한 키가 비어 있지 않은지 확인한다.
2. 같은 저장소의 worktree에서 대상 파일이 없으면 Git common directory로 기본 checkout을 찾고, 검사를 통과한 원본 파일을 가리키는 symlink를 만든다.
3. worktree에 일반 파일이나 symlink가 이미 있으면 그 대상을 바꾸거나 덮어쓰지 않고 현재 파일을 검사한다.
4. 원본 파일이 없거나 필요한 키가 비어 있으면 어떤 대상도 새로 연결하지 않는다. 오류는 파일 경로와 키 이름만 보여 주며 환경값은 보여 주지 않는다.
5. 환경 준비 명령을 여러 번 실행해도 첫 실행 뒤 파일 상태가 달라지지 않는다.
6. `bun run dev <ios|android>`는 새 개발 세션을 준비하기 전에 환경 파일을 자동으로 준비한다. `dev:status`, `dev:stop`, `dev:remove`는 파일을 만들거나 바꾸지 않는다.
7. Codex 로컬 환경 setup은 의존성을 설치하기 전에 환경 파일을 준비한다. API의 공식 평가 명령과 로컬 인증 코드 확인도 같은 준비를 거친다.
8. 임시 Git 저장소와 실제 현재 worktree에서 자동 연결, 기존 파일 보존, 빠진 파일과 키의 안전한 오류, 반복 실행을 검증한다.
9. 저장소 검사와 관련 테스트가 통과하고 결과 문서에 실행한 검증과 남은 외부 문제가 기록된다.

## 확정한 제약과 이유

- 환경 파일은 복사하지 않고 절대 경로 symlink로 연결한다. 비밀값 사본이 worktree마다 늘어나지 않고 원본 변경이 모든 worktree에 바로 적용돼야 한다.
- 기본 checkout은 고정된 사용자 경로가 아니라 `git rev-parse --path-format=absolute --git-common-dir`의 부모로 찾는다. 같은 저장소의 worktree가 어느 worktree에서 파생됐는지에 기대지 않기 위해서다.
- 원본과 대상의 기존 파일은 자동으로 덮어쓰지 않는다. 개발자가 worktree별 값을 일부러 둔 경우와 잘못된 자동 복구를 구분할 수 있어야 한다.
- 환경값은 오류나 정상 출력에 넣지 않는다. 검사는 키 이름과 값이 비어 있는지만 판단한다.
- Codex 앱의 setup 실행만 믿지 않는다. 공개 이슈가 해결되기 전에도 실제 개발 명령이 스스로 준비 상태를 보장해야 한다.

## 가정

- 에이전트가 정한 기본값(사용자가 바꿀 수 있음): 기본 checkout의 Git directory가 저장소 루트 바로 아래 `.git`에 있는 일반적인 non-bare 저장소만 자동 연결 대상으로 본다. 이 구조가 아니면 원본을 추측하지 않고 멈춘다.
- 에이전트가 정한 기본값(사용자가 바꿀 수 있음): 기존 symlink는 가리키는 위치와 관계없이 사용자 파일로 보고 교체하지 않는다. 읽을 수 있고 필수 키가 있으면 그대로 사용한다.

## 범위 밖

- Codex 앱의 위임 생성, `create_thread`와 handoff 버그 수정: 앱 외부 문제라 저장소에서 고칠 수 없다.
- 새 clone, Remote SSH, CI와 배포 환경에 비밀값을 전달하는 기능: 같은 로컬 Git 저장소의 checkout 사이만 다룬다.
- 환경값을 만들거나 원격 서비스에서 내려받는 기능: 개발자가 기본 checkout에 준비한 값을 원본으로 삼는다.
- `.env.local` 값 전환이나 로컬·원격 Supabase 선택 기능: 기존 값을 그대로 공유한다.

## 미룬 결정

- Codex가 위임 생성과 handoff에서도 선택한 로컬 환경 setup을 항상 실행하게 되면 중복 안전망을 줄일지 다시 판단한다. 그때까지 저장소 명령의 자동 준비를 유지한다.

## 남은 위험

- symlink는 기본 checkout을 옮기거나 지우면 끊어진다. 그 경우 환경 준비 명령은 새 위치를 추측하지 않고 오류를 낸다.
- 같은 Git 저장소 안의 모든 worktree가 환경값을 공유하므로 worktree별로 서로 다른 원격 프로젝트를 동시에 쓰는 경우에는 맞지 않는다.

## 연결된 결정 계약

- [Worktree 환경 파일](../../decisions/worktree-environment-files.md): 파일 원본, 연결과 보호 규칙을 정한다.
- [Worktree 개발 세션](../../decisions/worktree-development-sessions.md): 루트 개발 명령의 실행 경계와 읽기 전용 명령을 정한다.
- [모바일 환경 설정](../../decisions/mobile-environment-configuration.md): 모바일 필수 키와 검증 책임을 정한다.
- [Supabase 클라이언트 경계](../../decisions/supabase-client-boundaries.md): 사용자가 고른 Supabase 값을 자동으로 바꾸지 않는 경계를 정한다.
- [로컬 인증 제공자 설정](../../decisions/local-auth-provider-configuration.md): `supabase/.env`의 소유권을 정한다.
