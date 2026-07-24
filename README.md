# flyn

빈 저장소입니다.

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
