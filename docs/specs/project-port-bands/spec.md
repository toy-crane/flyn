# 프로젝트 포트 대역

## 목표

같은 컴퓨터에서 dearly처럼 다른 프로젝트의 로컬 스택과 개발 세션이 떠 있어도,
flyn의 Supabase, API, Metro가 포트 충돌 없이 함께 뜬다. 프로젝트 하나가 대역
번호 하나를 갖고, 그 번호에서 세 종류의 포트가 모두 정해진다.

## 사용자에게 보이는 결과

- dearly 스택이 `54321`번대에 떠 있는 채로 `bun run db:start`가 성공하고, flyn
  스택은 `54331`번대에 뜬다.
- 다른 프로젝트의 세션이 `3900`과 `8081`을 쓰고 있어도 flyn worktree의
  `bun run dev ios`는 자기 대역의 포트를 그대로 받는다. 다른 프로젝트 때문에
  "저장된 slot의 포트가 사용 중이라 옮깁니다"가 나오지 않는다.
- `bun run dev`가 띄운 API와 앱은 개발자의 `.env.local`에 적힌 옛 포트와 관계없이
  `supabase/config.toml`의 포트로 Supabase에 붙는다.
- `bun run auth:otp`는 새 포트의 Mailpit에서 인증 코드를 읽는다.

## 확정 범위

- flyn의 프로젝트 대역 번호는 1번이다. dearly는 0번(기본값)이며 손대지 않는다.
- Supabase 포트는 `supabase/config.toml`에 숫자로 커밋한다. 1번 대역은
  `54330`～`54339`이며 끝자리는 기본값과 같다. shadow `54330`, API `54331`,
  DB `54332`, Studio `54333`, Mailpit `54334`, SMTP `54335`, POP3 `54336`,
  analytics `54337`, pooler `54339`. 주석 처리된 항목은 주석인 채로 값만 맞춘다.
- 대역 번호의 원본은 `supabase/config.toml`의 `[api] port` 하나다. 번호는
  `(API 포트 - 54321) / 10`이고, Metro 포트는 `8081 + 번호 + slot × 10`, API
  포트는 `3900 + 번호 + slot × 10`이다. flyn worktree의 slot 0은 Metro `8082`,
  API `3901`이다. 번호를 두 곳에 적지 않는다.
- Supabase 주소가 필요한 프로그램은 모두 `config.toml`에서 포트를 읽는다.
  - 개발 세션은 Metro에 넘기던 Supabase 포트를 API 자식 프로세스에도 넘긴다.
    API가 이미 읽는 `SUPABASE_URL`과 `SUPABASE_JWKS_URL`을 셸 환경으로 주고,
    `apps/api/.env.local`은 읽기만 하고 고치지 않는다.
  - `bun run auth:otp`는 Mailpit 주소와 로컬 Supabase 주소 판정에
    `config.toml`의 포트를 쓴다.
- 저장소 안에서 `54321`과 `54324`를 실제 주소로 적은 곳(README, `.env.example`,
  결정 계약)은 새 대역의 값이나 "config.toml의 포트"라는 표현으로 바꾼다.
- 이 컴퓨터에 있는 flyn 저장소의 gitignore된 `.env.local`(기본 checkout, Codex
  worktree, 이 worktree의 `apps/api`와 `apps/mobile`)에서 포트 값을 새 대역으로
  고친다. 파일의 다른 값은 그대로 둔다. 이 파일들은 커밋되지 않으므로 PR에는
  보이지 않는다.
- `bun run dev:status`는 대역 번호와 Supabase API 포트를 함께 보여 준다.
- [Worktree 개발 세션](../../decisions/worktree-development-sessions.md)에는 이
  결정을 이미 반영했다. 구현은 그 계약과 같아야 한다.

## 수용 기준

- dearly 스택이 `54321`에 떠 있는 상태에서 `bun run db:start`가 성공하고
  `bun run db:status`의 API URL이 `http://127.0.0.1:54331`이다.
- 다른 프로세스가 `3900`과 `8081`을 쓰는 상태에서 flyn worktree의
  `bun run dev ios`가 slot 0을 받으면 API `3901`, Metro `8082`로 뜨고 slot 이동
  메시지가 나오지 않는다.
- `apps/api/.env.local`의 `SUPABASE_URL`에 일부러 다른 포트를 적어도,
  `bun run dev`가 띄운 API는 `config.toml`의 포트로 인증한다.
- `bun run auth:otp`가 `54334`의 Mailpit에서 코드를 읽어 로컬 이메일 로그인이
  끝까지 된다.
- `config.toml`의 `[api] port`가 숫자가 아니면(`env(...)` 등) 세션이 대역을
  추측하지 않고 이유를 말하며 멈춘다.
- `bun run check`와 `bun run test`가 통과하고, 대역 번호에서 포트를 계산하는
  규칙에 단위 테스트가 있다.
- 저장소에서 `54321`과 `54324`가 실제 주소로 남은 곳이 없다. 테스트가 임의로
  쓰는 값은 예외다.

## 확정 제약과 이유

- Supabase 포트를 숫자로 커밋하고 `env()`를 쓰지 않는다. Supabase CLI는 정수
  포트에도 `port = "env(VAR)"`를 허용하지만, 변수가 비어 있으면 그 글자가 그대로
  남아 실패하고, 값을 담을 `supabase/.env*`는 gitignore라 저장소에 기본값을 둘 수
  없다. 세션 스크립트도 숫자만 읽는다.
- 대역 번호의 원본을 `config.toml`로 둔다. Supabase가 숫자를 요구하므로 그 파일이
  어차피 번호를 담고, 다른 곳에 한 번 더 적으면 어긋난다.
- Metro와 API의 프로젝트 오프셋을 slot 간격(10) 안의 한 자리로 둔다. 프로젝트
  10개까지 어떤 slot끼리도 겹치지 않고, 기존 slot 배정과 상태 파일 구조를 그대로
  쓴다.
- worktree끼리는 지금처럼 Supabase 스택 하나를 공유한다. `project_id`가 같으면
  CLI가 같은 컨테이너에 붙으므로 포트만으로는 나눌 수 없고, 스택 하나가 Docker
  메모리 약 2.3GB를 써서 worktree마다 두는 것은 현실적이지 않다.
- 세션이 API에 Supabase 주소를 넘긴다. Bun은 셸 환경 값을 `.env.local`보다
  우선하므로, 개발자 파일을 고치지 않고도 세션이 정한 포트가 이긴다.

## 가정

- 대역 번호 1번이 이 컴퓨터의 다른 프로젝트와 겹치지 않는다. 지금 `5433x`,
  `3901`대, `8082`대는 모두 비어 있다.
- `edge_runtime.inspector_port`는 `8083`으로 둔다. `supabase start`는 이 포트를
  호스트에 열지 않는다.
- Supabase 포트를 바꿔도 컨테이너와 볼륨 이름은 `project_id`를 따르므로 기존
  로컬 데이터는 유지된다. 실패하면 `bun run db:reset`으로 다시 만든다.
- `scripts/setup/fixture.ts`와 각 테스트가 임의 값으로 쓰는 `54321`은 그대로 둔다.

## 제외

- 템플릿의 `bun run setup`이 새 프로젝트에 대역 번호를 배정하는 기능. flyn은
  설정이 끝난 저장소라 이번 범위에 없다.
- worktree마다 별도 Supabase 스택을 띄우는 옵션.
- dearly 저장소의 변경.
- 실제 기기와 LAN 주소.

## 유보

- 서로 다른 스키마 변경을 나란히 검증해야 하는 날, 그 worktree 전용 스택을
  `project_id`와 대역을 바꿔 띄우는 선택 옵션. 결정 계약의 재검토 조건으로
  남긴다.
- 템플릿 setup의 대역 배정.

## 남은 위험

- 대역 번호는 사람이 프로젝트마다 다르게 정한다. 같은 번호를 쓰는 프로젝트가
  생기면 다시 겹치며, 그때는 `supabase start`의 "port is already allocated"가
  그대로 보인다.
- 대역을 바꾸면 살아 있는 flyn worktree의 Metro 환경 fingerprint가 한 번 바뀌어
  다음 `bun run dev`에서 API와 Metro를 다시 띄운다. 일회성이다.
- Codex worktree의 상태 파일은 slot 0에 `3900`/`8081`을 기록하고 있다. 다음
  시작이 실제 프로세스에 맞춰 회수하므로 손으로 고칠 일은 없다.
