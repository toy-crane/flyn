# flyn

iOS 앱과 그 백엔드를 담는 모노레포. 이 저장소가 지금 서 있는 위치는
[docs/decisions/README.md](docs/decisions/README.md)에 한 줄씩 있고, 논거는 거기
링크된 기록들이 들고 있다. 뜻이 갈리는 말은 [GLOSSARY.md](GLOSSARY.md).

| 워크스페이스 | 내용 | 러너 |
| --- | --- | --- |
| `apps/mobile` | Expo(Expo Router + Uniwind), iOS 전용 | jest-expo |
| `apps/api` | Hono API (로컬은 bun, 배포는 Vercel) | bun test |
| `packages/supabase` | 앱·API가 공유하는 Supabase 생성 타입 | tsc |

## 요구 사항

- [bun](https://bun.sh) 1.3 이상 — 패키지 매니저이자 API 로컬 런타임
- Xcode와 iOS 시뮬레이터 — 타깃은 iOS 전용이라 Android는 다루지 않는다
- [agent-device](https://agent-device.dev/) 0.20.0 이상 —
  지정한 Simulator에 development build를 연결한다
- [watchman](https://facebook.github.io/watchman/) — Metro 파일 감시에 권장
- [Docker](https://www.docker.com/) — Supabase 로컬 스택(`supabase start`) 구동에 필요
- Supabase CLI는 루트 devDependency다(`bun run db:*` 또는 `bunx supabase …`로 실행)

## 로컬 루프

```bash
bun install --frozen-lockfile
bun run db:start                   # 저장소당 한 번
bun run dev -- --device "iPhone 17" # 이 worktree의 첫 실행
bun run dev                        # 이후 저장된 slot·Simulator 재사용
```

새 워크트리도 커밋된 `bun.lock` 그대로 설치한다. 현재 Expo SDK 57 기준 네이티브
런타임 조합은 `react-native-reanimated` `4.5.0`과
`react-native-worklets` `0.10.0`으로 정확히 고정돼 있다. 두 패키지를
업그레이드할 때는 `package.json`과 `bun.lock`을 같은 변경에서 갱신하고
development build를 다시 만든다.

`dev`는 Supabase를 시작하거나 멈추지 않고, 실행 상태와 환경 변수만 확인한다.
선택한 Simulator에 `com.odd.flyn` development build가 없으면 자동 빌드하지 않고
다음 명령을 출력한다. Expo 57에서는 `--port`와 `--no-bundler`를 함께 쓸 수 없고,
Metro port는 이후 `bun run dev`가 agent-device에 주입한다. 한 번 빌드한 뒤 같은
`bun run dev` 명령을 다시 실행한다.

```bash
cd apps/mobile &&
bunx expo run:ios --device "<UDID>" --no-bundler
```

워크트리마다 `.flyn-runtime/assignment.json`에 slot과 Simulator를 저장한다.
slot 0은 API `3000`/Metro `8081`, slot 1은 `3001`/`8082`를 쓴다. 동시에
실행할 때는 워크트리마다 서로 다른 Simulator를 지정한다.

```bash
# 첫 번째 worktree
bun run dev -- --device "iPhone 17"

# 두 번째 worktree
bun run dev -- --device "iPhone 17 Pro"

# 배정만 확인하고 아무 파일·lock·서비스도 바꾸지 않기
bun run dev -- --dry-run --device "iPhone 17"
```

API `/health`와 Metro `/status`가 준비된 뒤 정확한 Simulator에 앱을 연다. 종료하면
그 명령이 만든 API·Metro와 agent-device session만 닫고 공유 Supabase와 Simulator
자체는 계속 둔다. `turbo run dev`는 병렬 워크트리의 공식 실행 경로가 아니다.

## Supabase 로컬 스택

로컬 개발은 저장소당 하나의 로컬 Supabase 스택을 모든 워크트리가 공유한다
(Docker 필요). 최초 1회:

```bash
bun run db:start   # supabase start — 로컬 스택 기동(Docker 이미지 최초 pull)
bun run db:status  # 로컬 URL과 신형 키(sb_publishable_… / sb_secret_…) 확인
```

`bun run db:status` 값을 각 앱 `.env.local`에 넣는다(`.env.example` 참고). `apps/mobile`은
`EXPO_PUBLIC_SUPABASE_URL`·`EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `apps/api`는
`SUPABASE_URL`·`SUPABASE_PUBLISHABLE_KEY`·`SUPABASE_SECRET_KEY`·`SUPABASE_JWKS_URL`.
**secret 키는 절대 커밋 금지·`EXPO_PUBLIC_*` 금지.**

```bash
bun run db:reset   # 마이그레이션+시드 적용 후 @flyn/supabase 타입 재생성
bun run db:test    # pgTAP로 RLS 정책 검증 (supabase test db)
```

migration, `db:reset`, RLS, Auth 설정, seed 변경은 병렬 실행하지 않고 한 번에 한
워크트리에서만 수행한다.

스키마 변경은 **선언적 스키마 + diff**로 저작한다(손으로 마이그레이션 안 씀):

```bash
# 1) supabase/schemas/*.sql 에서 원하는 최종 상태를 고친 뒤
bun run db:diff create_something   # supabase/migrations/에 마이그레이션 생성
# 2) 생성된 마이그레이션을 리뷰·커밋하고
bun run db:reset                   # 적용 + 타입 재생성
```

앱은 Apple·Google 네이티브 로그인(`signInWithIdToken`) 또는 이메일 6자리 코드로
세션을 얻고, 비공개 프로필의 표시 이름을 관리한다. 계정 삭제는
`@supabase/server` JWT 게이트를 거친다. provider 설정은 `config.toml`의
`[auth.external.apple]`·`[auth.external.google]`에 있고, Google 클라이언트 ID는
`.env.local`로 주입한다(`.env.example` 참고). 이메일은 매직링크가 아니라 코드다 —
`[auth.email.template.*]`가 `supabase/templates/`의 `{{ .Token }}` 템플릿을 쓴다.

로컬에서 보낸 메일은 Mailpit(<http://127.0.0.1:54324>)에 쌓인다. 로그인 이후
경로를 검증할 세션이 필요하면 소셜 로그인 대신 이 명령을 쓴다:

```bash
bun run auth:session   # 이메일 OTP로 실제 세션 발급 → access_token 출력
```

**Apple·Google 로그인은 자동화가 원천 불가하다.** 무엇을 시도했고 왜 막혔는지는
[docs/auth-verification.md](docs/auth-verification.md)에 근거와 함께 있다.
`@supabase/server` 검증에 로컬 비대칭 서명이 필요하면
`supabase gen signing-key --algorithm ES256`으로 서명키를 만든다(gitignore).

## 검사

```bash
bun run check
```

`turbo run lint test typecheck`를 전 워크스페이스와 루트 runtime scripts에 돌린다.
포맷·린트 자동 수정은 `bun run lint:fix`. 린트는 Biome +
[Ultracite](https://www.ultracite.ai) 프리셋이고 루트 태스크 하나로 저장소 전체를
훑는다.

같은 명령을 GitHub Actions가 PR마다 실행한다([.github/workflows/ci.yml](.github/workflows/ci.yml)).
**pgTAP만 CI에 없다** — `supabase start`에 Docker가 필요해서다. RLS 정책을
건드리는 PR은 로컬에서 `bun run db:test`를 돌리고 결과를 PR에 남긴다.

## 환경 변수

앱별 `.env.local`로 주입한다. inherited environment가 같은 이름의 `.env.local`
값보다 우선한다. `dev:worktree`가 slot별
`EXPO_PUBLIC_API_BASE_URL=http://127.0.0.1:<api-port>`를 Mobile에 주입하므로
로컬 Simulator용 API 주소를 직접 바꿀 필요는 없다.
[apps/mobile/.env.example](apps/mobile/.env.example) 참고.

`EXPO_PUBLIC_*` 값은 앱 번들에 그대로 노출되므로 공개 가능한 값만 둔다.

Supabase를 쓰는 화면·엔드포인트에는 위 **Supabase 로컬 스택**의 키가 더 필요하다.
`apps/api`도 `.env.local`을 쓴다([apps/api/.env.example](apps/api/.env.example) 참고) —
`SUPABASE_SECRET_KEY`는 서버 전용이라 여기에만 두고 절대 커밋하지 않는다.
채팅 모델은 API 코드의 `inclusionai/ling-3.0-flash-free`로 고정되어 `AI_MODEL`이
필요하지 않다. Gateway 호출에는 `AI_GATEWAY_API_KEY`가 필요하다.

## 알아둘 것

- **bun은 hoisted 설치로 고정**돼 있다([bunfig.toml](bunfig.toml)). bun 1.3의 기본값인
  isolated 설치는 React Native 툴체인(jest-expo의 transform 허용 목록, Metro 해석)을
  깨뜨린다.
- `apps/mobile/src/uniwind-types.d.ts`는 Metro가 생성하지만 저장소에 커밋한다.
  새로 클론한 사람이 Metro를 먼저 돌리지 않아도 `bun run check`가 통과해야 하기 때문.
- Metro transformer와 file-map cache는 각 워크트리의 `apps/mobile/.expo/` 아래에
  격리된다. 전환 전에 남은 공용 캐시 때문에 Worklets mismatch가 한 번 보이면 해당
  워크트리에서 `bunx expo start --clear`로 정리한 뒤 다시 `bun run dev`를 쓴다.
- 채팅 상세에서 뒤로 온 뒤 pull-to-refresh spinner가 남으면
  [AI 채팅 화면 계약](docs/decisions/ai-chat-experience.md)의 수동 새로고침 경계부터
  확인한다.
- **Uniwind는 무료(MIT) 범위로 충분하다.** Pro는 C++ 엔진·Reanimated 4 className
  애니메이션 같은 성능 계층이다. 판단 근거는
  [uniwind-css-theme](docs/decisions/uniwind-css-theme.md).

## 에이전트 스킬

공유 프로젝트 스킬은 [`.agents/skills`](.agents/skills)가 원본이고
`.claude/skills`는 같은 디렉터리를 가리키는 상대 심볼릭 링크다. 공개 Toycrane
스킬은 `sync-toycrane-skills`로 upstream Git 이력을 확인한 뒤 이 위치에
동기화한다. 프로젝트 전용 스킬은 이름이 upstream에서 관리됐다는 근거가 없으면
보존한다.

벤더 스킬과 MCP 플러그인은
[`.claude/settings.json`](.claude/settings.json)에 프로젝트 스코프로 선언한다.
저장소를 클론한 Claude Code는 이 목록을 각 마켓플레이스에서 설치한다.

| 플러그인 | 마켓플레이스 | 내용 |
| --- | --- | --- |
| `expo` | `expo/skills` | Expo·EAS 공식 스킬 |
| `supabase` | `supabase/agent-skills` | Supabase 전반 |
| `postgres-best-practices` | `supabase/agent-skills` | Postgres 성능·설계 |
| `vercel-plugin` | `vercel/vercel-plugin` | Vercel·Next.js·AI SDK·shadcn 공식 스킬 |
| `RevenueCat` | `RevenueCat/ai-toolkit` | RevenueCat MCP·구독 연동 공식 스킬 |
| `posthog` | `anthropics/claude-plugins-official` | PostHog 공식 플러그인(MCP·스킬) |
| `context7` | `upstash/context7` | 라이브러리 최신 문서·코드 예제 조회(MCP) |
