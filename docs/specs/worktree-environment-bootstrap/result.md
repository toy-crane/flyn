# Worktree 환경 파일 자동 연결 결과

## 결과

같은 Git 저장소의 기본 checkout을 환경 파일 원본으로 삼고, 연결된 worktree에 파일이 없을 때만 절대 경로 symlink를 만드는 준비 명령을 추가했다. Codex가 `.worktreeinclude` 또는 로컬 환경 setup을 건너뛰어도 실제 개발 명령이 시작 전에 환경을 준비한다.

환경 준비는 값을 만들거나 출력하지 않는다. 세 파일을 모두 검사한 뒤에만 연결하므로 원본 파일이나 필수 키가 빠졌을 때 일부 파일만 연결된 상태를 남기지 않는다. worktree에 일반 파일이나 symlink가 이미 있으면 검사만 하고 그대로 둔다.

## 구현

- `bun run env:setup`이 `apps/api/.env.local`, `apps/mobile/.env.local`, `supabase/.env`를 준비한다.
- `bun run env:setup -- supabase`는 로컬 Supabase 시작에 필요한 `supabase/.env`만 준비한다. 새 프로젝트가 Supabase를 먼저 시작해 앱 공개 값을 얻는 흐름을 막지 않는다.
- `bun run dev <ios|android>`는 인수를 먼저 읽고 실제 개발 세션을 시작할 때만 전체 환경을 준비한다. `dev:status`, `dev:stop`, `dev:remove`와 같은 하위 명령은 환경 파일을 만들지 않는다.
- API 개발·평가 명령과 `auth:otp`는 전체 환경 준비를 먼저 실행한다.
- Codex 로컬 환경 setup은 의존성 설치 전에 전체 환경을 준비한다.
- dotenv 값은 런타임과 같은 `node:util`의 `parseEnv`로 읽는다. 주석만 있거나 빈 따옴표 뒤에 주석이 붙은 값도 빈 값으로 거른다.

## 수락 기준 확인

1. 기본 checkout에서는 세 원본을 검사만 하고 바꾸지 않는 테스트가 통과했다.
2. 임시 Git 저장소의 연결된 worktree에서 Git common directory를 통해 기본 checkout을 찾고 세 symlink를 만드는 테스트가 통과했다.
3. 기존 일반 파일과 symlink를 덮어쓰지 않는 테스트가 통과했다.
4. 원본 파일 또는 필수 키가 빠졌을 때 어떤 symlink도 만들지 않고 파일과 키 이름만 알리는 테스트가 통과했다.
5. 같은 준비 명령을 두 번 실행해도 두 번째 실행이 파일 상태를 바꾸지 않는 테스트가 통과했다.
6. 개발 세션 시작만 환경을 준비하고 상태 확인·종료·반납은 준비하지 않도록 명령 경계를 나눴다.
7. Codex 로컬 환경 setup, API 공식 평가 명령과 로컬 인증 코드 확인에 준비 명령을 연결했다.
8. 임시 저장소 테스트와 현재 worktree의 실제 명령 검증이 통과했다.
9. 저장소의 코드 검사, 타입 검사와 테스트가 모두 통과했다.

## 실행한 검증

- `bun test ./scripts/environment/setup.test.ts`: 9개 통과, 59개 검증 통과
- `bun run --cwd scripts test`: 353개 통과, 7개 선택적 통합 테스트 건너뜀, 실패 0개
- `bun run check`: 5개 패키지 통과
- `bun run check-types`: 5개 패키지 통과
- `bun run test`: 3개 테스트 작업 통과
- 현재 worktree에서 세 symlink를 지운 뒤 `bun run dev`를 인수 없이 실행했다. 환경 파일을 만들지 않고 사용법을 보여 준 뒤 종료했다.
- 같은 상태에서 `bun run dev status`를 실행했다. 환경 파일을 만들지 않고 상태만 확인했다.
- `bun run env:setup -- supabase`를 실행했다. `supabase/.env` 하나만 연결했다.
- `bun run env:setup`을 실행했다. 세 파일을 모두 다시 연결했고 환경값은 출력하지 않았다.

## 코드 리뷰

자동 코드 리뷰에서 세 가지 문제를 찾고 모두 고쳤다.

- `db:start`가 앱 환경값까지 요구해 새 프로젝트 초기 설정을 막는 문제: Supabase 전용 준비 범위를 추가했다.
- 주석이 붙은 빈 dotenv 값을 유효한 값으로 보는 문제: 런타임 dotenv 파서로 바꾸고 회귀 테스트를 추가했다.
- `bun run dev status|stop|remove`와 인수가 없는 `bun run dev`가 환경 준비에 먼저 막히는 문제: 개발 명령을 먼저 해석하고 시작 명령에서만 준비하도록 옮겼다.

수정 뒤 관련 테스트와 저장소 전체 검증을 다시 실행해 모두 통과했다.

## 남은 외부 문제

Codex의 위임 생성, `create_thread`와 handoff가 선택한 로컬 환경 setup을 건너뛰는 공개 문제는 저장소에서 고칠 수 없다. 이 구현은 해당 경로가 고쳐질 때까지 실제 저장소 명령에서 누락을 복구하는 안전망이다.

기본 checkout을 옮기거나 지우면 절대 경로 symlink가 끊어진다. worktree마다 다른 환경을 써야 할 때는 해당 worktree에 일반 파일을 직접 두어 자동 연결 대상에서 제외해야 한다.
