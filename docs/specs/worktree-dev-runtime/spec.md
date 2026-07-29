# 워크트리별 개발 런타임

## 상태

- 이 문서는 확정된 구현 스펙이다.
- 구현은 [구현 계획](implementation-plan.md)의 논리 단위와 검증 게이트를 따른다.
- 기반 결정은
  [워크트리별 모바일 런타임 격리](../../decisions/worktree-isolated-mobile-runtime.md)다.

## 목적

같은 저장소의 여러 워크트리에서 API와 Expo development build를 동시에 실행해도
포트, Metro 캐시, iOS Simulator가 서로 간섭하지 않게 한다. 일상 명령은
`bun run dev:worktree` 하나로 통일하고, Worklets 버전이 다른 워크트리 사이에서도
오래된 변환 결과를 재사용하지 않는다.

이 스펙은 로컬 개발 인프라를 안정화한다. 채팅 화면의 제품 동작이나 Supabase
토폴로지는 바꾸지 않는다.

## 확정된 경계

### 채팅 모델

- 프로덕션 채팅 모델은 API 코드에
  `inclusionai/ling-3.0-flash-free`로 고정한다.
- `AI_MODEL` 환경 변수는 읽지 않으며 `.env.example`과 개발 문서에서도 제거한다.
- 런타임에 필요한 모델 secret은 `AI_GATEWAY_API_KEY`뿐이다.
- 테스트가 가짜 모델을 주입하는 기존 경계는 유지한다.

### dev slot

- 워크트리마다 정수 dev slot 하나를 안정적으로 배정한다.
- 포트는 `API = 3000 + slot`, `Metro = 8081 + slot`이다.
  예를 들어 slot 0은 `3000/8081`, slot 1은 `3001/8082`다.
- 배정은 해당 워크트리의 gitignore 대상
  `.flyn-runtime/assignment.json`에 저장한다. 이 파일은 다른 워크트리로
  복사하는 목록에 넣지 않는다.
- 최초 실행은 사용 가능한 가장 낮은 slot을 원자적으로 선점한다. 이후에는 저장한
  slot을 재사용한다.
- 프로세스 간 경쟁은 OS 임시 폴더의 저장소별 slot lock으로 막는다. lock에는
  canonical worktree 경로와 PID를 기록한다. PID가 살아 있으면 빼앗지 않고,
  죽은 PID의 lock만 포트가 비어 있음을 확인한 뒤 회수한다.
- `--slot <n>`으로 명시 배정할 수 있다. 저장된 slot이나 명시 slot의 포트를
  관계없는 프로세스가 쓰고 있으면 그 프로세스를 종료하거나 자동으로 다른
  번호로 바꾸지 않고, 충돌한 포트와 해결 방법을 출력하고 실패한다.

### Metro 캐시

- Metro transformer cache는 현재 워크트리의
  `apps/mobile/.expo/metro-cache`를 쓴다.
- Metro file-map cache는 현재 워크트리의
  `apps/mobile/.expo/metro-file-map`을 쓴다.
- Metro config의 공식 `cacheStores`와 `fileMapCacheDirectory` 경계를 사용한다.
  `FileStore`는 Metro가 callback에 주입한 구현을 사용하며 이를 위해
  `metro-cache` 직접 의존성을 추가하지 않는다.
- `expo start --clear`는 새 설정을 처음 적용할 때 기존 공용 캐시를 버리는 1회
  복구 절차다. 정상적인 `dev:worktree` 실행에는 붙이지 않는다.
- 이 변경을 위해 `react-native-reanimated`나 `react-native-worklets` 버전을
  올리거나 맞추지 않는다.

### API와 Metro

`bun run dev:worktree`는 선택한 slot으로 두 자식 프로세스를 실행한다.

- API는 `apps/api`에서 `PORT=<api-port>`를 받아 실행한다.
- Metro는 `apps/mobile`에서
  `EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:<api-port>`와
  `expo start --dev-client --localhost --port <metro-port>`로 실행한다.
- API의 `/health`와 Metro의 준비 상태를 확인한 뒤 시뮬레이터 연결을 완료한다.
- 두 프로세스 로그는 `[api:<port>]`, `[metro:<port>]`처럼 출처를 구분한다.
  환경 변수 값과 token, key, authorization header는 로그에 쓰지 않는다.
- `Ctrl+C`와 `SIGTERM`은 이 명령이 만든 API와 Metro 자식만 종료하고 slot lock을
  해제한다. 기존 프로세스나 Supabase는 종료하지 않는다.
- 한 자식이 시작 단계에서 실패하면 다른 자식을 정리하고 원인을 출력한다.

### iOS Simulator

- 동시에 실행 중인 워크트리는 서로 다른 iOS Simulator를 사용한다.
- bundle identifier는 모든 워크트리에서 기존 `com.odd.flyn`을 유지한다.
- 첫 실행은 `--device <name-or-udid>`로 시뮬레이터를 지정하고 배정 파일에
  기억한다. 이후에는 저장한 기기를 기본값으로 쓴다.
- 저장한 기기가 다른 활성 slot에 배정돼 있으면 실행하지 않고 다른 기기를
  고르라는 오류를 낸다.
- 앱 실행과 자동 검증은 저장소 결정대로 `agent-device`를 사용한다.
- public `--device` 입력은 이름이나 UDID를 받지만, 선택 뒤 `agent-device`
  호출에는 0.20.0 CLI의 정확한 ID selector인 `--udid`를 사용한다.
- Expo development client에는 선택한 Metro URL의 launch URL도 전달해 서버
  선택 화면에 머물지 않고 해당 워크트리 bundle을 연다.
- 선택한 시뮬레이터에 development build가 없으면 자동으로 네이티브 빌드를
  시작하지 않는다. 실행해야 할
  `expo run:ios --device <device> --no-bundler` 명령을 정확히 안내한다.
  Expo 57에서 `--port`와 `--no-bundler`는 함께 쓸 수 없으며 runtime port는
  다음 `dev:worktree` 실행이 agent-device에 주입한다.
- 네이티브 의존성이나 config plugin이 달라진 워크트리는 자기 시뮬레이터의
  development build를 다시 만든다.

### 공유 Supabase

- Supabase는 워크트리별로 격리하지 않는다. 사용자가 저장소당 한 번
  `bun run db:start`로 실행한 로컬 스택을 모든 워크트리가 공유한다.
- `dev:worktree`는 read-only 상태/health 검사만 한다. 스택이 없으면
  `bun run db:start`를 실행하라는 오류를 내며 직접 시작하지 않는다.
- 기존 `apps/api/.env.local`과 `apps/mobile/.env.local`의 공유 스택 URL·키를
  사용하고 생성·복사·출력하지 않는다.
- `dev:worktree` 종료는 Supabase를 멈추지 않는다.
- migration, `db:reset`, RLS, Auth 설정, seed 변경은 병렬 실행하지 않고 한
  워크트리에서만 수행한다.

## 명령 계약

```text
bun run dev:worktree
bun run dev:worktree -- --slot 1
bun run dev:worktree -- --device "iPhone 17 Pro"
bun run dev:worktree -- --slot 1 --device "iPhone 17 Pro"
bun run dev:worktree -- --dry-run
```

- 인자가 없으면 저장된 배정을 재사용하거나 최초 배정을 만든다.
- `--dry-run`은 선택될 worktree, slot, API·Metro 포트, 캐시 경로, simulator,
  실행할 프로세스를 표시하되 lock 선점, 자식 실행, 파일 변경을 하지 않는다.
- 지원하지 않는 인자, 음수 slot, 찾을 수 없는 simulator는 자식 프로세스를
  시작하기 전에 실패한다.

## 오류와 복구

- Supabase 미실행, 누락된 필수 `.env.local` 값, `AI_GATEWAY_API_KEY` 누락은
  어떤 서비스가 무엇을 필요로 하는지 구분해 안내한다. secret 값은 출력하지
  않는다.
- port나 simulator 충돌 시 관계없는 프로세스를 강제 종료하지 않는다.
- 비정상 종료 뒤에는 다음 실행이 PID와 port를 확인해 stale lock만 회수한다.
- Worklets mismatch가 기존 공용 캐시 때문에 한 번 남아 있다면 해당 워크트리에서
  `expo start --clear`로 1회 정리한 뒤 `dev:worktree`로 돌아온다.

## 제외 범위

- 워크트리별 Supabase stack, DB volume, Auth, Mailpit, project ID
- Supabase의 자동 시작·중지·reset과 `.env.local` 생성
- 워크트리별 bundle identifier, 앱 이름, scheme, Apple·Google OAuth variant
- Reanimated·Worklets·Expo SDK 버전 변경
- 한 시뮬레이터에 여러 flyn variant 설치
- production, EAS, Vercel 배포 동작 변경
- 채팅 홈의 background refetch와 pull-to-refresh 표현 변경

## 완료 조건

- 서로 다른 두 워크트리의 `dev:worktree --dry-run`이 서로 다른 API·Metro 포트와
  각 워크트리 내부의 Metro 캐시 경로를 보고한다.
- Worklets `0.10.0` 워크트리와 `0.11.2` 워크트리를 별도 시뮬레이터에서 동시에
  실행해도 Babel/plugin mismatch나 공용 Metro cache 재사용이 없다.
- 두 워크트리에서 API `/health`와 인증된 실제 채팅 요청이 각각 자기 포트로
  성공한다.
- 한 `dev:worktree`를 종료해도 다른 워크트리와 공유 Supabase는 계속 동작한다.
- 저장된 slot, 명시 slot, live/stale lock, port 충돌, 잘못된 device, signal
  cleanup이 자동 테스트로 재현된다.
- 프로덕션 채팅 경로가 고정 모델을 사용하고 `AI_MODEL` 없이 동작한다.
- `bun run check`가 통과한다.

## 가정과 남은 위험

- 두 워크트리는 같은 로컬 DB와 Auth 상태를 본다. 데이터 충돌 가능성은 공유
  Supabase를 택한 명시적 비용이다.
- 네이티브 앱은 빌드 시점의 Worklets 버전을 포함한다. 캐시를 격리해도 해당
  워크트리의 JavaScript 의존성과 development build 자체가 다르면 재빌드가
  필요하다.
- 뒤로 가기 시 홈 중앙에 보이는 spinner는 현재
  `rooms.isFetching`에 연결된 background refetch 표현이다. 런타임/API hang이
  사라진 뒤에도 짧게 보일 수 있다. 계속 멈춰 있거나 오류 상태를 설명하지 못하면
  별도 UI 신뢰성 스펙으로 다룬다.
