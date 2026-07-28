# 모노레포는 Turborepo + bun, 설치는 hoisted 고정

앱(Expo)과 API(Hono)가 Supabase 생성 타입과 API 계약을 공유하므로 한 저장소에
둔다. bun은 패키지 매니저이자 API 로컬 런타임이고, 태스크 오케스트레이션만
Turborepo가 맡는다.

- `apps/mobile` — Expo 앱
- `apps/api` — Hono API
- `packages/supabase` — Supabase 생성 타입 공용 패키지
- `packages/*` — 그 외 공유 코드(설정, 유틸)가 생기면 추가

## 생성 타입은 한 곳에서만 만든다

`supabase gen types typescript` 산출물은 `packages/supabase` 한 곳에만 생성하고
mobile·api 양쪽이 소비한다. **플랫폼별 생성은 드리프트 위험으로 기각했다** —
같은 스키마에서 두 번 생성하면 한쪽만 갱신된 상태를 타입이 잡아주지 못한다.
클라이언트 초기화는 각 앱에 남긴다(모바일은 AsyncStorage 세션 저장, 서버는
secret 키).

## `supabase/`는 루트에 남기고 워크스페이스로 올리지 않는다

CLI는 실행한 자리에서 **부모 방향으로 거슬러** `supabase/`를 찾는다 —
`apps/mobile`에서 `supabase status`를 쳐도 `Using workdir <저장소 루트>`가 찍힌다.
그래서 `packages/db/supabase/`처럼 아래로 내리면 루트에서 친 명령이 그 폴더를
영영 찾지 못하고, 모든 호출에 `--workdir`가 붙는다.

자리를 옮기지 않고 **워크스페이스 자격만** 주는 것(`supabase/package.json` +
루트 `workspaces`에 추가)은 가능하고 Supabase + Turborepo 글들이 흔히 권한다.
그래도 기각한다 — `import`할 것이 없어서 얻는 것은 스크립트를 매달 자리뿐인데,
그건 이미 루트 `db:*`에 있다. 승격의 진짜 이유인 turbo `dependsOn`으로 pgTAP
앞에 스택을 세우는 것도 여기선 무효다: `db:test`는 Docker가 필요해
[의도적으로 CI 밖](../../README.md#검사)에 있다.

`packages/supabase`와 이름이 겹치지만 다른 물건이다. 그쪽은 앱과 API가
`import`하는 생성 타입이고, 이쪽은 CLI가 읽는 설정·SQL·메일 템플릿이다.

## bun은 hoisted 설치로 고정한다 — 기본값으로 되돌리지 말 것

bun 1.3의 기본값인 isolated 설치(`node_modules/.bun` 스토어 + 심링크)는 React
Native 툴체인을 깨뜨린다. jest-expo의 `transformIgnorePatterns`와 Metro 해석이
평평한 `node_modules`를 전제하기 때문이다. 그래서 [bunfig.toml](../../bunfig.toml)에
`linker = "hoisted"`를 박아 뒀다(Expo 모노레포 가이드 권장). 이 줄을 지우면
모바일 테스트와 번들링이 함께 죽는다.
