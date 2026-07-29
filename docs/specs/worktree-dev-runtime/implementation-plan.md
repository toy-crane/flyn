# 워크트리별 개발 런타임 구현 계획

이 계획은 [확정 스펙](spec.md)을 구현 가능한 논리 단위로 나눈다. 각 단계는
테스트를 먼저 실패시키고 최소 구현으로 통과시킨 뒤 conventional commit 하나를
만든다. 원격 push와 배포는 하지 않는다.

## 1. 채팅 모델을 코드에 고정

수정 대상:

- `apps/api/src/chat.ts`
- `apps/api/src/chat.model.test.ts`
- `apps/api/.env.example`
- 필요하면 `README.md`

작업:

1. 제품 모델 ID를 공개 상수로 두고 production `GatewayChatModel`의 기본값으로
   사용한다.
2. 생성자에 주입한 가짜 `LanguageModel`이 기본값보다 우선하는 테스트 경계는
   보존한다.
3. `process.env.AI_MODEL` 읽기와 미설정 오류를 제거한다.
4. `.env.example`과 환경 변수 문서에서 `AI_MODEL`을 제거한다.

검증:

- 환경에 `AI_MODEL`이 없거나 다른 값이어도 production model event와
  `streamText`가 `inclusionai/ling-3.0-flash-free`를 사용한다.
- 주입한 가짜 모델을 쓰는 기존 timeout·retry 테스트는 그대로 통과한다.

커밋: `fix: pin chat model in code`

## 2. Metro 캐시를 워크트리 내부로 격리

수정 대상:

- `apps/mobile/metro.config.js`
- 새 Metro config 테스트

작업:

1. `apps/mobile/.expo/metro-cache`와 `.expo/metro-file-map` 절대 경로와
   디렉터리를 만든다. Expo file-map writer는 대상 디렉터리를 직접 만들지
   않으므로 config 로드 시 두 디렉터리를 선제 생성한다.
2. Expo 기본 config에 `cacheStores` callback과 `fileMapCacheDirectory`를
   설정한 뒤 기존 Uniwind wrapper에 전달한다.
3. 현재 resolver `blockList`와 Uniwind CSS 설정이 보존되는지 확인한다.
4. `metro-cache` 직접 의존성은 추가하지 않는다.

검증:

- config를 로드한 테스트가 transformer와 file-map 경로 모두 현재
  `apps/mobile/.expo` 아래임을 확인한다.
- config 경로에 OS 공용 temp directory가 포함되지 않는다.
- 기존 resolver/Uniwind config가 유지된다.

전환 확인:

```bash
cd apps/mobile
bunx expo start --clear
```

이 명령은 기존 공용 캐시 영향을 없애기 위해 한 번만 수행하며 정상 실행 스크립트에
넣지 않는다.

커밋: `fix: isolate Metro cache per worktree`

## 3. slot 배정기를 순수 로직부터 구현

수정 대상:

- 새 `scripts/dev-worktree.ts`
- 새 `scripts/dev-worktree.test.ts`
- `.gitignore`
- `package.json`

내부 경계:

- CLI 인자 파싱
- canonical worktree identity 계산
- slot → API/Metro 포트 계산
- assignment JSON read/write
- 저장소별 global lock read/acquire/release
- PID 생존과 port 사용 여부 검사
- dry-run plan 생성

작업:

1. `.flyn-runtime/assignment.json` schema와 version을 정의하고 `.gitignore`에
   `.flyn-runtime/`을 추가한다.
2. 저장소 공통 identity와 worktree path를 분리해 OS temp 아래 lock namespace를
   정한다.
3. 최초 자동 배정, 저장값 재사용, `--slot`, `--device`, `--dry-run`을 구현한다.
4. lock 파일은 exclusive create + 검증된 stale 회수로 경쟁을 막는다.
5. dry-run은 파일과 lock을 변경하지 않는 순수 plan 경로로 만든다.

자동 테스트:

- slot 0/1이 `3000/8081`, `3001/8082`를 만든다.
- 두 worktree의 최초 배정이 같은 slot을 얻지 않는다.
- 저장된 배정은 재실행 때 유지된다.
- live lock은 빼앗지 않고 stale lock만 회수한다.
- explicit slot, 음수 slot, malformed assignment를 구분한다.
- dry-run은 filesystem과 process 상태를 변경하지 않는다.

커밋: `feat: add worktree runtime planner`

## 4. API·Metro supervisor와 공유 Supabase preflight 연결

수정 대상:

- `scripts/dev-worktree.ts` 또는 역할별 `scripts/dev-worktree/*`
- 해당 자동 테스트
- `package.json`

작업:

1. 루트 `dev:setup` 스크립트와 Turbo의 `//#dev:setup`,
   `dev.dependsOn` 연결을 제거한다. `db:start`는 명시적인 공유 Supabase 시작
   명령으로 유지한다.
2. `bun run dev:worktree`를 추가하고 기존 `bun run dev`도 같은
   `scripts/dev-worktree.ts` entrypoint를 직접 실행한다. 중첩된 `bun run` alias는
   Ctrl+C가 바깥 runner에서 끝나 내부 cleanup을 건너뛸 수 있으므로 두 명령이
   동일 entrypoint를 가리키는 방식으로 alias 의미를 유지한다.
3. Supabase status와 앱별 필수 환경 변수 이름을 검사하되 값을 출력하거나
   `.env.local`을 수정하지 않는다.
4. API를 `PORT=<api-port>`, Metro를
   `EXPO_PUBLIC_API_BASE_URL=<slot-api-url>`과 선택한 Metro port로 spawn한다.
   Expo `--localhost`가 macOS에서 IPv6 loopback에만 bind하지 않도록 기존
   `NODE_OPTIONS`를 보존하면서 `--dns-result-order=ipv4first`를 추가한다.
5. API `/health`와 Metro 준비 상태를 timeout 안에서 poll한다.
6. 자식 로그 prefix, startup rollback, signal forwarding, lock cleanup을
   구현한다.
7. port 충돌을 사전 검사하고 다른 프로세스를 종료하지 않는다.

테스트 방법:

- filesystem, port probe, child process, HTTP poller, signal/cleanup을 adapter로
  주입해 실제 서버 없이 supervisor 상태 전이를 테스트한다.
- child 하나가 실패할 때 다른 child와 lock이 정리되는지 확인한다.
- 정상 종료와 `SIGTERM`에서 API·Metro만 종료하고 Supabase stop 명령은 호출하지
  않음을 확인한다.
- 로그 redaction 테스트에 token, key, authorization header를 넣어 원문이 남지
  않음을 확인한다.

커밋: `feat: orchestrate worktree dev services`

## 5. 선택한 Simulator에 development build 연결

수정 대상:

- worktree runtime의 simulator adapter와 테스트
- `README.md`

작업:

1. 구현 시점의 `agent-device help`로 device 조회·boot·앱 실행 명령을 확인하고
   그 공개 CLI를 adapter로 감싼다.
2. `--device` 값의 name/UDID 해석, assignment 저장, 다른 live slot의 device
   중복 검사를 구현한다.
3. development build 유무를 확인하고 없으면
   `expo run:ios --device <UDID> --no-bundler` 복구 명령을 출력한다. Expo 57은
   `--port`와 `--no-bundler`를 함께 받지 않으므로 Metro port는 이후 runtime
   실행에서 주입한다.
4. `agent-device` 0.20.0은 `--device`를 이름 selector로만 해석하므로, 내부
   adapter는 확정된 Simulator ID를 `--udid`로 전달한다.
5. Metro가 준비된 뒤 `--metro-host`·`--metro-port`와
   `exp+flyn://expo-development-client/?url=...` launch URL을 함께 전달해
   development-client 서버 선택 화면이 아니라 앱 JavaScript를 바로 연다.
   같은 deterministic session이 비정상 종료에서 남았으면 그 session만 먼저
   닫고 Simulator는 shutdown하지 않는다.
6. README의 단일-worktree `bun run dev` 설명을 공유 Supabase 선행 실행 +
   `bun run dev:worktree` 흐름으로 교체한다.

자동 테스트:

- 저장 device 재사용, name/UDID 선택, 없는 device, live device 충돌을
  fake adapter로 확인한다.
- build 부재는 네이티브 빌드를 spawn하지 않고 복구 명령을 출력한다.

커밋: `feat: connect worktree simulator`

## 6. 병렬 실제 검증

사전 조건:

1. 저장소당 한 번 `bun run db:start`.
2. 각 워크트리에 동일한 공유 Supabase `.env.local` 값과
   `AI_GATEWAY_API_KEY`가 준비돼 있다.
3. Worklets `0.10.0` 워크트리용 시뮬레이터와 `0.11.2` 워크트리용
   시뮬레이터에 각 development build가 설치돼 있다.

검증 순서:

1. 두 워크트리에서 `bun run dev:worktree -- --dry-run`을 실행해 slot, port,
   cache, device가 분리됐는지 기록한다.
2. 각 워크트리에서 `bun run dev:worktree`를 동시에 실행한다.
3. 두 API `/health`가 각 port에서 성공하는지 확인한다.
4. `agent-device`로 두 simulator에서 로그인된 채팅을 열고 실제 메시지를 보내
   각 slot API의 스트리밍 응답을 확인한다.
5. 상세에서 홈으로 돌아와 spinner가 끝나고 목록이 갱신되는지 확인한다.
6. Worklets mismatch/redbox가 없는지 두 Metro 로그와 화면에서 확인한다.
7. 한 runtime을 종료하고 다른 앱의 채팅과 공유 Supabase가 계속 동작하는지
   확인한다.
8. 종료한 runtime을 재실행해 같은 slot과 simulator를 재사용하는지 확인한다.

최종 게이트:

```bash
bun run check
```

DB schema를 바꾸지 않으므로 `db:reset`과 `db:test`는 이 변경의 필수 게이트가
아니다. 병렬 검증 중에는 둘 다 실행하지 않는다.

## 중단 조건과 후속 범위

- 캐시 격리 뒤에도 Worklets mismatch가 재현되면 JavaScript 의존성과 해당
  simulator의 native development build 버전을 먼저 대조한다. 확인 없이
  Worklets 버전을 올리지 않는다.
- API 응답은 정상인데 홈 spinner만 계속 남으면
  `rooms.isFetching`을 전체 중앙 spinner와 pull-to-refresh에 함께 쓰는 현재 UI를
  별도 신뢰성 작업으로 분리한다.
- 공유 Supabase에서 데이터 경합이 실제 반복되면 그 증거로만 워크트리별
  Supabase 스펙을 다시 연다. 이번 구현에는 미리 넣지 않는다.
