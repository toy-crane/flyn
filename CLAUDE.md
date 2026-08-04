# flyn

Turborepo(bun) · Expo(`@expo/ui` · Uniwind) · Hono on Vercel(AI SDK + AI
Gateway) · Supabase(Auth · Postgres · RLS).

현재 프로젝트 결정은 [docs/decisions/README.md](docs/decisions/README.md), 뜻이
갈리는 용어는 [GLOSSARY.md](GLOSSARY.md)에서 찾는다. `docs/specs/<slug>/`는 아직
끝나지 않은 한 작업 단위만 담는다.

## 시뮬레이터 검증

화면 조작과 증거 수집에는 `agent-device`를 사용한다. 명령은 설치 버전의
`agent-device help`와 `.agents/skills/agent-device`를 따른다. 선택 이유는
[결정 계약](docs/decisions/agent-device-for-simulator-checks.md)에 있다.

## 인증이 걸린 경로 검증

로컬 스택을 시작한 뒤 `bun run auth:session`으로 이메일 OTP 세션을 얻는다.
소셜 로그인은 자동화하지 않는다. 재현 가능한 경로와 수동 확인 절차는
[docs/auth-verification.md](docs/auth-verification.md)에 있다.

## 벤더 문서

Expo·Supabase·Vercel은 설치된 프로젝트 스킬을 먼저 사용한다. 플러그인이 없는
벤더는 구현 전에 현재 문서 인덱스를 확인한다.

- Uniwind: https://docs.uniwind.dev/llms.txt
- Hono: https://hono.dev/llms-full.txt
