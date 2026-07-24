# flyn

테크 스택 결정은 [docs/specs/tech-stack/spec.md](docs/specs/tech-stack/spec.md) 참고.

## 요구사항

- [bun](https://bun.sh) (버전은 [package.json](package.json)의 `packageManager` 참고)
- Xcode + iOS 시뮬레이터 — 모바일 앱은 iOS 전용

## 로컬 개발

1. 의존성 설치

   ```
   bun install
   ```

2. API 실행 (터미널 1)

   ```
   cd apps/api && bun run dev
   ```

   `http://localhost:3000/health`에서 `{"status":"ok"}` 응답을 확인할 수
   있습니다.

3. 모바일 앱 실행 (터미널 2)

   ```
   cd apps/mobile && bun run ios
   ```

   iOS 시뮬레이터가 열리고, Uniwind로 스타일된 홈 화면에 위 API의
   헬스체크 응답이 표시됩니다. 앱은 기본으로 `http://localhost:3000`을
   호출합니다. 다른 주소가 필요하면 `apps/mobile/.env.local`에
   `EXPO_PUBLIC_API_BASE_URL`을 설정하세요.

## 린트·테스트

전 워크스페이스가 turbo 명령 하나로 돕니다.

```
bun run lint
bun run test
```

모바일(jest-expo)과 API(bun test) 각각 최소 1개의 예시 테스트가 포함돼
있습니다.

## 구조

- `apps/mobile` — Expo Router + Uniwind 앱
- `apps/api` — Hono API
- `packages/*` — 앱 간 공유 코드(생기면 추가)

## 알려진 사항

- **Uniwind 무료 티어로 충분함**: 기본 className 스타일링(레이아웃·타이포·
  색상), 테마, 반응형 브레이크포인트, RN 내장 컴포넌트 지원은 모두 무료
  범위다. 유료(Pro) 티어는 zero-rerender 스타일 업데이트, group variants,
  Reanimated 연동, 네이티브 테마 트랜지션 등 런타임 성능 기능만 추가로
  제공한다. 이 저장소는 무료 티어만으로 구성돼 있다.

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
