# flyn

테크 스택: Turborepo(bun) · Expo(Uniwind) · Hono on Vercel(AI SDK + AI Gateway) ·
Supabase(Auth·Postgres·RLS). 결정과 근거는 [docs/specs/tech-stack/spec.md](docs/specs/tech-stack/spec.md).

## 벤더 에이전트 문서

Expo·Supabase·Vercel(AI SDK)은 플러그인 스킬로 설치되어 있다(README 참조).
플러그인이 없는 벤더는 작업 전에 아래 문서 인덱스를 WebFetch로 읽는다:

- Uniwind: https://docs.uniwind.dev/llms.txt
- Hono: https://hono.dev/llms-full.txt (요약본: https://hono.dev/llms-small.txt)
