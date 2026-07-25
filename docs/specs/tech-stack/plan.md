# Plan

> The code is the terrain and this plan is a map: where they disagree, the
> terrain wins. A divergence at the decision level flows back to spec.md
> instead of being worked around.

## Approach

**세로 슬라이스로 걷는 뼈대(walking skeleton)를 먼저 세운다.** 빈 저장소에서
시작해, 제품 기능 없이 스택의 모든 이음새 — 로그인 → RLS 쿼리 → Hono 인증
경계 → AI 스트리밍 → 빌드·배포 — 를 최소 한 줄기로 관통시키는 것이 이
계획의 전부다. 리스크가 큰 통합(Uniwind 실사용, `@supabase/server` 베타,
기기 위 AI 스트리밍)을 앞당겨 검증하고, 제품 도메인 작업은 이 뼈대 위에서
시작한다.

기각한 대안: **레이어별 완성**(각 도구를 끝까지 설정 후 다음으로)은 통합
리스크를 마지막으로 미뤄서 기각. **스타터 템플릿 이식**은 우리 조합
(bun·Uniwind·Hono)과 기본값이 달라 걷어내는 비용이 더 커서 기각 — 단,
앱·API 개별 생성기는 사용한다.

## Order

세션 단위로 나누고, 각 세션 끝이 검증 가능 지점이다.

1. **모노레포 골격과 로컬 루프** — Turborepo + bun 워크스페이스, Expo 앱
   (Expo Router + Uniwind), Hono API 로컬 실행, Ultracite 린트, 테스트 러너
   2종 배선. 끝: 시뮬레이터에서 Uniwind 스타일 화면이 뜨고 로컬 API
   헬스체크를 호출하며, 린트·테스트가 turbo 한 명령으로 돈다. Uniwind Pro
   유료 범위도 여기서 확인.
2. **Supabase 경계** — 로컬 스택, 첫 마이그레이션(RLS 동시 작성 + pgTAP
   테스트), 타입 생성 파이프, 앱의 직접 CRUD, `@supabase/server`로 Hono
   인증 게이트 + Hono RPC 타입 공유. 네이티브 로그인 전이므로 익명
   로그인으로 JWT 경로부터 관통. 끝: "내 행만 보인다"가 테스트로 증명된다.
3. **네이티브 인증** — EAS development build, Apple·Google 로그인으로 02의
   익명 로그인 교체. 검증은 로컬 Supabase 기준. 끝: dev build에서 두 공급자
   각각으로 세션을 얻고 RLS·JWT 카드가 그대로 돈다. Google 네이티브
   사인인 때문에 개발 루프가 Expo Go에서 development build로 이동한다.
4. **배포 파이프** — 호스티드 dev 프로젝트·Vercel preview 연결, EAS 프로필
   3종과 TestFlight, GitHub Actions CI, PostHog 계측 초기화. 끝: TestFlight
   내부 배포본이 dev 환경을 바라보고 동작한다.
5. **AI 스트리밍 슬라이스** — AI Gateway 연결, Hono 스트리밍 엔드포인트,
   `useChat` + expo/fetch(폴리필 포함). 끝: 시뮬레이터와 배포본 모두에서
   토큰 단위 스트리밍이 보인다.

3·4는 원래 한 세션(태스크 03)이었으나 완료 기준 7개가 한 세션에 담기지
않아 03a·03b로 쪼갰다.

RevenueCat은 구독 상품이 제품 결정에 의존하므로 이 계획에 넣지 않는다.

### 현재 위치 (2026-07-25)

**다음 작업은 03a의 남은 검증이다.** 03a는 코드가 끝났고 Apple·Google 로그인만
사용자 자격증명을 기다린다(포털 capability · 시뮬레이터 Apple 계정 · Google 계정
2개). 그것이 닫히기 전에는 4·5로 넘어가지 않는다 — 소셜 로그인이 실제로 도는지
모르는 상태에서 배포 파이프를 얹으면 TestFlight 빌드에서 처음 터지고, 원인이
인증인지 배포인지 갈리지 않는다. 인증은 모든 경로가 통과하는 관문이라 미검증
상태로 아래에 깔면 이후 모든 실패의 용의자로 남는다.

AI 스트리밍(순서 5번 = 태스크 04)은 기술적 의존이 02까지뿐이라 앞당길 수 있었고
조사도 끝냈지만(04 문서의 "조사 결과"), 같은 이유로 순서를 지키기로 했다.

순서 번호와 태스크 파일 이름은 03을 03a·03b로 쪼갠 뒤로 한 칸 어긋나 있다 —
순서 4번이 `03b`, 순서 5번이 `04`다.

## Acceptance criteria

체크는 **누가 언제 무엇으로 확인했는지**를 함께 적는다. 근거 없는 체크는
다음 사람이 재확인할 수 없어 체크의 값이 0이다.

- [x] 시뮬레이터에서 앱이 실행되고 Uniwind 스타일이 적용된다 — 01에서 확인
- [ ] Apple 또는 Google 로그인으로 세션을 얻는다 (시뮬레이터/실기기) —
      **코드 완료, 검증 보류.** 이메일 OTP 경로는 03a에서 전 구간 확인했지만
      이 기준은 두 소셜 공급자를 요구한다. 남은 것은 사용자 자격증명뿐
      (03a "남은 검증"). **이것이 다음 작업이다**
- [x] RLS: 본인 행 CRUD 성공, 타인 행 접근 거부가 pgTAP 테스트로 증명된다 —
      `bun run db:test` 8건 PASS (2026-07-25 재확인)
- [x] Hono 엔드포인트가 유효/무효 JWT를 옳게 통과/거부한다 (테스트 포함) —
      토큰 없음·형식 오류·타 키 서명·만료·정상 5건
      ([scratch-notes.route.test.ts](../../../apps/api/src/scratch-notes.route.test.ts))
- [ ] 앱 화면에서 AI 응답이 토큰 단위로 스트리밍 렌더된다 (로컬·배포 모두) —
      태스크 04. 착수 전
- [x] `turbo run test`·`lint` 한 명령으로 전 워크스페이스 검사가 돌고 CI가
      PR마다 실행한다 — `bun run check` 6/6 태스크 통과(API 7건 · 모바일 26건),
      [ci.yml](../../../.github/workflows/ci.yml)이 `pull_request`마다 같은 명령을 돈다
- [ ] EAS preview 빌드가 dev Supabase·Vercel preview를 바라보고 TestFlight
      배포된다 — 태스크 03b. 착수 전
- [ ] 새로 클론한 사람이 README만으로 로컬 루프를 재현할 수 있다 —
      README는 계속 갱신했지만 **실제로 새 클론에서 재현해 본 적은 없다.**
      03a에서 dev build로 루프가 바뀐 뒤로는 더 그렇다

## Verification and seams

높은 경계 두 곳에 테스트를 건다. **SQL 경계**: RLS 정책은 pgTAP
(`supabase test db`)로, 정책 생성과 같은 변경에서 작성. **HTTP 경계**:
Hono는 `app.request()`로 서버 기동 없이, AI는 AI SDK mock provider로 모델
호출 없이 결정적으로. 모바일은 이 단계에선 jest-expo 스모크 수준만 두고,
Maestro E2E는 화면이 안정된 뒤로 미룬다. 두 경계 아래의 내부 구조는
테스트가 참견하지 않는다.

## Off-limits

- **제품 도메인 선반영 금지** — 뼈대용 테이블·화면은 도메인 이름을 점유하지
  않는 명백한 예시(throwaway)로 만들고, 도메인 스키마는 도메인 셰이핑 후에만.
- **legacy 키(anon/service_role) 사용 금지** — 신형 publishable/secret 키만.
- **prod 스키마 수동 변경 금지** — 마이그레이션 경로로만.
- **시크릿 커밋 금지** — 로컬 env 파일과 EAS·Vercel 환경 변수로만.
- **RevenueCat 연동 시작 금지** — 제품 결정 대기.

## Risks and open questions

- Uniwind와의 첫 실전 접촉이 세션 1 — 치명적 문제 발견 시 NativeWind 전환은
  스펙 변경으로 회귀한다.
- `@supabase/server`는 베타 — API 변동 시 jose 수동 검증 경로로 후퇴.
- AI SDK의 Expo 폴리필이 기기·플랫폼 조합에 따라 다르게 필요할 수 있다.
- 세션 3(03a)의 전제는 해소됐다 — Apple Developer Program 계정은 등록 완료,
  앱 이름·번들 ID는 `flyn`/`com.odd.flyn`으로 확정(태스크 01).
- Google 네이티브 사인인은 Expo Go에서 동작하지 않는다. 03a에서 개발 루프가
  development build로 이동하며, 01에 기록한 Expo Go 이점이 소멸한다 —
  spec.md 회귀 대상.
