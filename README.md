# flyn

iOS 앱과 그 백엔드를 담는 모노레포. 이 저장소가 지금 서 있는 위치는
[docs/decisions/README.md](docs/decisions/README.md)에 한 줄씩 있고, 논거는 거기
링크된 기록들이 들고 있다. 뜻이 갈리는 말은 [GLOSSARY.md](GLOSSARY.md), 스택
전체 그림은 [docs/specs/tech-stack/spec.md](docs/specs/tech-stack/spec.md).

| 워크스페이스 | 내용 | 러너 |
| --- | --- | --- |
| `apps/mobile` | Expo(Expo Router + Uniwind), iOS 전용 | jest-expo |
| `apps/api` | Hono API (로컬은 bun, 배포는 Vercel) | bun test |
| `packages/*` | 공유 코드 (아직 없음) | bun test |

## 요구 사항

- [bun](https://bun.sh) 1.3 이상 — 패키지 매니저이자 API 로컬 런타임
- Xcode와 iOS 시뮬레이터 — 타깃은 iOS 전용이라 Android는 다루지 않는다
- [watchman](https://facebook.github.io/watchman/) — Metro 파일 감시에 권장
- [Docker](https://www.docker.com/) — Supabase 로컬 스택(`supabase start`) 구동에 필요
- Supabase CLI는 루트 devDependency다(`bun run db:*` 또는 `bunx supabase …`로 실행)

## 로컬 루프

```bash
bun install
```

앱은 **development build**로 돈다(03a부터 — Google 네이티브 로그인이 Expo Go에서
동작하지 않는다). 최초 1회, 그리고 네이티브 모듈·config plugin이 바뀔 때마다
네이티브 빌드가 필요하다:

```bash
cd apps/mobile && bunx expo run:ios
```

이후 일상 루프는 이 한 줄이 전부다.

```bash
bun run dev
```

로컬 Supabase 스택을 세운 뒤 API(`:3000`)와 Metro(`:8081`)를 띄우고, 시뮬레이터에
설치된 dev build까지 연다. 한쪽만 띄우려면 `turbo run dev --filter=@flyn/api`.

API는 <http://localhost:3000/health>에서 `{"service":"flyn-api","status":"ok"}`를
돌려준다. 앱 화면의 **API health** 카드에 같은 응답이 뜨면 앱 ↔ API 연결까지
살아 있는 것이다. iOS 시뮬레이터는 호스트의 `localhost`에 그대로 접근하므로
별도 설정이 필요 없다.

## Supabase 로컬 스택

로컬 개발은 로컬 Supabase 스택 위에서 돈다(Docker 필요). 최초 1회:

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

스키마 변경은 **선언적 스키마 + diff**로 저작한다(손으로 마이그레이션 안 씀):

```bash
# 1) supabase/schemas/*.sql 에서 원하는 최종 상태를 고친 뒤
bun run db:diff create_something   # supabase/migrations/에 마이그레이션 생성
# 2) 생성된 마이그레이션을 리뷰·커밋하고
bun run db:reset                   # 적용 + 타입 재생성
```

앱은 Apple·Google 네이티브 로그인(`signInWithIdToken`) 또는 이메일 6자리 코드로
세션을 얻어 `scratch_notes`에 RLS 경계 안에서 CRUD 하고, 서버 전용 집계는
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
`scratch_notes`는 도메인이 아니라 스택 관통용 **throwaway 예시**다. `@supabase/server`
검증에 로컬 비대칭 서명이 필요하면 `supabase gen signing-key --algorithm ES256`으로
서명키를 만든다(gitignore).

## 검사

```bash
bun run check
```

`turbo run lint test typecheck`를 전 워크스페이스에 돌린다. 포맷·린트 자동 수정은
`bun run lint:fix`. 린트는 Biome + [Ultracite](https://www.ultracite.ai) 프리셋이고
루트 태스크 하나로 저장소 전체를 훑는다.

같은 명령을 GitHub Actions가 PR마다 실행한다([.github/workflows/ci.yml](.github/workflows/ci.yml)).
**pgTAP만 CI에 없다** — `supabase start`에 Docker가 필요해서다. RLS 정책을
건드리는 PR은 로컬에서 `bun run db:test`를 돌리고 결과를 PR에 남긴다.

## 환경 변수

앱별 `.env.local`로 주입한다. 로컬 시뮬레이터는 기본값으로 동작하므로 파일 없이도
루프가 돌고, 실기기나 EAS 빌드에서는 `EXPO_PUBLIC_API_BASE_URL`이 필요하다.
[apps/mobile/.env.example](apps/mobile/.env.example) 참고.

`EXPO_PUBLIC_*` 값은 앱 번들에 그대로 노출되므로 공개 가능한 값만 둔다.

Supabase를 쓰는 화면·엔드포인트에는 위 **Supabase 로컬 스택**의 키가 더 필요하다.
`apps/api`도 `.env.local`을 쓴다([apps/api/.env.example](apps/api/.env.example) 참고) —
`SUPABASE_SECRET_KEY`는 서버 전용이라 여기에만 두고 절대 커밋하지 않는다.

## 알아둘 것

- **bun은 hoisted 설치로 고정**돼 있다([bunfig.toml](bunfig.toml)). bun 1.3의 기본값인
  isolated 설치는 React Native 툴체인(jest-expo의 transform 허용 목록, Metro 해석)을
  깨뜨린다.
- `apps/mobile/src/uniwind-types.d.ts`는 Metro가 생성하지만 저장소에 커밋한다.
  새로 클론한 사람이 Metro를 먼저 돌리지 않아도 `bun run check`가 통과해야 하기 때문.
- **Uniwind는 무료(MIT) 범위로 충분하다.** Pro는 C++ 엔진·Reanimated 4 className
  애니메이션 같은 성능 계층이다. 판단 근거는
  [uniwind-for-styling](docs/decisions/uniwind-for-styling.md).

## 에이전트 스킬

스킬은 저장소에 벤더링하지 않고 Claude Code 플러그인으로 설치합니다. 설치 목록은
[.claude/settings.json](.claude/settings.json)에 프로젝트 스코프로 선언되어 있어,
저장소를 클론하면 Claude Code가 마켓플레이스에서 자동으로 받아옵니다.

| 플러그인 | 마켓플레이스 | 내용 |
| --- | --- | --- |
| `toycrane-skills` | `toy-crane/skills` | 아이디어 구체화, 계획 수립, 프로토타입, 도메인 모델링, TDD |
| `expo` | `expo/skills` | Expo·EAS 공식 스킬 |
| `supabase` | `supabase/agent-skills` | Supabase 전반 |
| `postgres-best-practices` | `supabase/agent-skills` | Postgres 성능·설계 |
| `vercel-plugin` | `vercel/vercel-plugin` | Vercel·Next.js·AI SDK·shadcn 공식 스킬 |
| `RevenueCat` | `RevenueCat/ai-toolkit` | RevenueCat MCP·구독 연동 공식 스킬 |
| `posthog` | `anthropics/claude-plugins-official` | PostHog 공식 플러그인(MCP·스킬) |
| `context7` | `upstash/context7` | 라이브러리 최신 문서·코드 예제 조회(MCP) |

수동으로 설치하려면:

```
/plugin marketplace add toy-crane/skills
/plugin install toycrane-skills@toycrane
```
