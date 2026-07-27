# flyn

테크 스택: Turborepo(bun) · Expo(@expo/ui · Uniwind) · Hono on Vercel(AI SDK + AI Gateway) ·
Supabase(Auth·Postgres·RLS). 결정과 근거는 [docs/specs/tech-stack/spec.md](docs/specs/tech-stack/spec.md).

## UI

**새 화면은 universal `@expo/ui`로 만든다.** universal에 없는 컴포넌트나 표현이
필요하면 `@expo/ui/swift-ui`로 내려간다. 벤더 문서는 이 경우 `.ios.tsx` 분리나
`Platform.OS` 분기를 요구하지만 iOS 전용 앱이라 해당 없으니, universal에 있는
것으로 대신하지 말고 내려간다. Android·web 폴백도 만들지 않는다.

**`Host` 안에서 Uniwind `className`은 무효다.** Uniwind는 `Host` 바깥에서만 쓰고,
한 화면에서 두 방식을 섞지 않는다.

## 인증이 걸린 경로 검증

로그인 이후를 검증할 세션은 `bun run auth:session`으로 얻는다(로컬 스택 필요).
**Apple·Google 로그인은 자동화가 원천 불가하니 시도하지 말 것** — 무엇을 이미
해봤고 왜 막혔는지는 [docs/auth-verification.md](docs/auth-verification.md).

## 벤더 에이전트 문서

Expo·Supabase·Vercel(AI SDK)은 플러그인 스킬로 설치되어 있다(README 참조).
플러그인이 없는 벤더는 작업 전에 아래 문서 인덱스를 WebFetch로 읽는다:

- Uniwind: https://docs.uniwind.dev/llms.txt
- Hono: https://hono.dev/llms-full.txt (요약본: https://hono.dev/llms-small.txt)
