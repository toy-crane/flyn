# 02 Supabase 경계

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 01 모노레포 골격과 로컬 루프
- 상태: 대기

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

- [ ] 로컬 스택이 마이그레이션과 시드로 재현 가능하게 구성된다
- [ ] 익명 로그인으로 앱이 세션을 얻고 예시 테이블에 CRUD 한다
- [ ] RLS: 본인 행 접근 성공과 타인 행 접근 거부가 pgTAP으로 증명된다
- [ ] Hono 엔드포인트가 유효/무효 JWT를 옳게 통과/거부하며, 그 동작이
      서버 기동 없는 테스트로 증명된다
- [ ] 스키마 변경 → 타입 재생성 → 앱·API 타입 반영이 명령 하나로 돈다
- [ ] 앱의 API 호출이 Hono RPC를 거쳐 컴파일 타임에 계약을 검증받는다
