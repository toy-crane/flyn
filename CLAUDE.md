# flyn

테크 스택: Turborepo(bun) · Expo(@expo/ui · Uniwind) · Hono on Vercel(AI SDK + AI Gateway) ·
Supabase(Auth·Postgres·RLS).

**이 저장소가 지금 서 있는 위치는 [docs/decisions/README.md](docs/decisions/README.md)에
한 줄씩 있다.** 뜻이 갈리는 말은 [GLOSSARY.md](GLOSSARY.md).

## UI

아래는 규칙만 적는다 — 근거는 각 기록에 있고, 어기려면 그 기록을 읽고 새 기록을
쓴다.

- **새 화면은 universal `@expo/ui`로 만든다.** 없으면 `@expo/ui/swift-ui`로
  내려간다(universal에 있는 것으로 대신하지 않는다). iOS 전용이라
  `.ios.tsx`·`Platform.OS` 분기도, Android·web 폴백도 만들지 않는다 —
  [expo-ui-by-default](docs/decisions/expo-ui-by-default.md),
  [ios-only](docs/decisions/ios-only.md)
- **`Host` 안에서 Uniwind `className`은 무효다.** Uniwind는 `Host` 바깥에서만
  쓰고 한 화면에서 두 방식을 섞지 않는다. Uniwind가 맡는 것은 레이아웃·간격·
  타이포뿐 — [uniwind-for-styling](docs/decisions/uniwind-for-styling.md)
- **색은 iOS 시맨틱 색만 쓰고 `dark:` 변형을 색에 붙이지 않는다.** Tailwind
  팔레트를 쓰지 않는다 —
  [ios-semantic-colors](docs/decisions/ios-semantic-colors.md)

## 시뮬레이터 검증

**화면을 눈으로 확인할 일은 `agent-device`로 한다** — 스크린샷을 보고 좌표를
찍는 내장 시뮬레이터 도구를 쓰지 않는다. `@expo/ui` 화면은 진짜 SwiftUI라
접근성 트리로 요소를 지목하는 쪽이 맞다. MCP 도구와 CLI 중 무엇을 써도 되고
(같은 데몬이다), 명령은 `agent-device help`가 버전에 맞게 들고 있다 —
[agent-device-for-simulator-checks](docs/decisions/agent-device-for-simulator-checks.md)

## 인증이 걸린 경로 검증

로그인 이후를 검증할 세션은 `bun run auth:session`으로 얻는다(로컬 스택 필요).
**Apple·Google 로그인은 자동화가 원천 불가하니 시도하지 말 것** — 무엇을 이미
해봤고 왜 막혔는지는 [docs/auth-verification.md](docs/auth-verification.md).

## 벤더 에이전트 문서

Expo·Supabase·Vercel(AI SDK)은 플러그인 스킬로 설치되어 있다(README 참조).
플러그인이 없는 벤더는 작업 전에 아래 문서 인덱스를 WebFetch로 읽는다:

- Uniwind: https://docs.uniwind.dev/llms.txt
- Hono: https://hono.dev/llms-full.txt (요약본: https://hono.dev/llms-small.txt)
