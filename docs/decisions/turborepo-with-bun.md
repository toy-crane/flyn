# 모노레포와 패키지 관리

## Decisions

- Expo 앱, Hono API와 공유 패키지는 Turborepo 모노레포에 둔다.
- Bun은 패키지 매니저와 API 로컬 런타임이고, Turborepo는 태스크 실행만 맡는다.
- Bun 설치는 [`bunfig.toml`](../../bunfig.toml)의 `linker = "hoisted"`로 고정한다.
- Supabase 생성 타입은 `packages/supabase` 한 곳에서 만들고 mobile과 API가 함께
  소비한다. 클라이언트 초기화와 secret은 각 앱 경계에 남긴다.
- CLI 프로젝트인 루트 `supabase/`는 워크스페이스로 만들거나 아래로 옮기지 않는다.

## Why

앱과 API가 같은 DB 타입과 API 계약을 공유한다. 생성물을 한 번만 만들면 한쪽만
갱신되는 드리프트를 막을 수 있다. Supabase CLI는 실행 위치의 부모에서
`supabase/`를 찾으며, React Native 도구는 평평한 `node_modules`를 전제로 한다.

## Boundaries

- `packages/supabase`는 import하는 타입 패키지이고, 루트 `supabase/`는 CLI가 읽는
  설정·SQL·메일 템플릿이다.
- Docker가 필요한 `bun run db:test`는 로컬 검증이며 일반 Turbo CI 그래프에
  억지로 넣지 않는다.

## Still-rejected alternatives

- mobile과 API에서 타입을 따로 생성하기.
- `supabase/`를 `packages/` 아래로 옮기거나 빈 워크스페이스로 승격하기.
- Bun의 isolated linker로 되돌리기.

## Evidence worth preserving

isolated 설치는 `jest-expo`의 변환 규칙과 Metro 해석을 깨뜨렸다. hoisted 설치는
모바일 테스트와 번들링이 공유하는 전제다.
