# 02 Supabase 경계

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 01 모노레포 골격과 로컬 루프
- 상태: **완료** (PR #15). 체크박스가 오래 비어 있었던 건 기록 누락이다 —
  아래는 2026-07-25에 터레인을 보고 채운 것이다

## 무엇을 만드는가

하이브리드 데이터 접근 경계를 로컬 Supabase 스택 위에서 관통시킨다.
사용자는 익명 로그인으로 세션을 얻고(네이티브 로그인은 03에서 교체),
앱에서 예시 테이블에 직접 CRUD를 수행하면 RLS가 본인 행만 보여준다.
서버 전용 동작은 `@supabase/server`를 단 Hono 엔드포인트가 담당하며,
유효한 JWT만 통과시킨다. DB 스키마 변경은 마이그레이션으로만 이뤄지고,
생성 타입은 공용 패키지를 거쳐 앱·API 양쪽으로, API 계약은 Hono RPC로
앱까지 타입이 흐른다.

예시 테이블은 도메인 이름을 점유하지 않는 명백한 throwaway로 만든다.

## 완료 기준

- [x] 로컬 스택이 마이그레이션과 시드로 재현 가능하게 구성된다 —
      `supabase/migrations/`·`supabase/schemas/`·`seed.sql`, `bun run db:reset`
- [x] 익명 로그인으로 앱이 세션을 얻고 예시 테이블에 CRUD 한다 —
      당시 확인. **단, 이 수단은 03a에서 제거됐다**(`anonymous_users: false`).
      기준은 충족한 뒤 폐기된 것이지, 지금 재현되지는 않는다
- [x] RLS: 본인 행 접근 성공과 타인 행 접근 거부가 pgTAP으로 증명된다 —
      `bun run db:test` 8건 PASS (2026-07-25 재확인).
      `supabase/tests/scratch_notes_rls.test.sql`
- [x] Hono 엔드포인트가 유효/무효 JWT를 옳게 통과/거부하며, 그 동작이
      서버 기동 없는 테스트로 증명된다 — `app.request()` 5건
- [x] 스키마 변경 → 타입 재생성 → 앱·API 타입 반영이 명령 하나로 돈다 —
      `bun run db:reset` = `supabase db reset && bun run db:types`
- [x] 앱의 API 호출이 Hono RPC를 거쳐 컴파일 타임에 계약을 검증받는다 —
      `apps/mobile/src/lib/rpc.contract.ts`가 `tsc --noEmit`으로 계약을 지킨다
