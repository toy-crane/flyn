# flyn

Turborepo(bun) 모노레포. iOS 앱(Expo + Uniwind)과 API(Hono)가 한 저장소에 있다.
기술 스택 결정과 근거는 [docs/specs/tech-stack/spec.md](docs/specs/tech-stack/spec.md).

## 구조

```
apps/
  mobile/   Expo(SDK 57) + Expo Router + Uniwind — iOS 전용
  api/      Hono — 로컬은 bun, 배포는 Vercel
packages/   공유 패키지 (아직 없음)
```

## 사전 요구

- [bun](https://bun.sh) 1.3+
- Xcode + iOS 시뮬레이터 (`xcode-select --install` 이후 Xcode에서 시뮬레이터 1개 설치)

## 로컬 루프

```bash
bun install
```

터미널 2개를 띄운다. 하나는 API:

```bash
cd apps/api && bun run dev
```

다른 하나는 앱 (시뮬레이터가 자동으로 열린다):

```bash
cd apps/mobile && bun run ios
```

앱 첫 화면에 로컬 API의 `/health` 응답이 뜨면 루프가 완성된 것이다.
앱은 기본적으로 `http://localhost:3000`을 바라본다. 다른 주소를 쓰려면
`apps/mobile/.env.local`에 `EXPO_PUBLIC_API_URL`을 넣는다.

> 앱은 Expo Go로 실행된다. 네이티브 로그인·결제가 들어오면 development
> build가 필요해지고, 그건 별도 태스크에서 다룬다.

## 검사

```bash
bun run lint && bun run test && bun run typecheck
```

각각 turbo가 전 워크스페이스에 fan-out한다 (모바일은 jest-expo, API는 `bun test`).
저장소 루트 파일까지 한 번에 포맷·검사하려면 `bun run check` / `bun run fix`.

## 규약

- 패키지 설치는 루트에서 `bun install`. 모바일 의존성은 버전 정합을 위해
  `cd apps/mobile && bunx expo install <pkg>`로 추가한다.
- bun은 hoisted 링커를 쓴다([bunfig.toml](bunfig.toml)). React Native
  툴체인이 isolated 설치에서 해석되지 않는다.
- 린트·포맷은 Biome + Ultracite 프리셋. 편집 후 자동 fix 훅이
  [.claude/settings.json](.claude/settings.json)에 걸려 있다.

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
