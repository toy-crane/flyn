# flyn

테크 스택: Turborepo(bun) · Expo(Uniwind) · Hono on Vercel(AI SDK + AI Gateway) ·
Supabase(Auth·Postgres·RLS). 결정과 근거는 [docs/specs/tech-stack/spec.md](docs/specs/tech-stack/spec.md).

## 작업 규칙

- 워크스페이스: `apps/mobile`(Expo, iOS 전용) · `apps/api`(Hono) · `packages/*`.
- 검사는 turbo로 fan-out한다: `bun run lint` · `bun run test` · `bun run typecheck`.
- 모바일 의존성은 `cd apps/mobile && bunx expo install <pkg>`로 추가한다
  (SDK 정합 버전을 골라준다). 루트 설치는 `bun install`.
- bun 링커는 hoisted 고정([bunfig.toml](bunfig.toml)) — RN 툴체인이 isolated에서 깨진다.
- 로컬 루프 절차는 [README.md](README.md).

## 벤더 에이전트 문서

Expo·Supabase·Vercel(AI SDK)은 플러그인 스킬로 설치되어 있다(README 참조).
플러그인이 없는 벤더는 작업 전에 아래 문서 인덱스를 WebFetch로 읽는다:

- Uniwind: https://docs.uniwind.dev/llms.txt
- Hono: https://hono.dev/llms-full.txt (요약본: https://hono.dev/llms-small.txt)
