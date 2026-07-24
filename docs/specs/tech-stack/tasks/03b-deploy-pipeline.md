# 03b 배포 파이프

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 03a 네이티브 인증
- 상태: 대기

## 무엇을 만드는가

로컬에만 있던 뼈대를 배포 환경으로 확장한다. TestFlight 내부 배포본이
호스티드 dev Supabase와 Vercel preview API를 바라보고 03a의 로그인·CRUD가
그대로 동작한다. 마이그레이션은 로컬 → dev 순서로만 흐르고, CI는 PR마다
린트·테스트를 돌리며, PostHog가 배포본 이벤트를 받는다.

production 경로(스토어 빌드·prod 프로젝트·Vercel production)는 **환경 변수
체계만 준비**한다. prod Supabase 프로젝트 생성과 스토어 빌드는 제품 도메인이
정해진 뒤로 미룬다.

## 완료 기준

- [ ] 마이그레이션이 dev 프로젝트에 CLI로 적용되어 로컬과 스키마가 같다
- [ ] Vercel preview가 Hono를 서빙하고 유효/무효 JWT를 옳게 통과/거부한다
- [ ] EAS preview 빌드가 TestFlight 내부 배포되고 dev Supabase·Vercel
      preview를 바라보고 동작한다
- [ ] 신형 publishable/secret 키만 사용하고 legacy 키는 어디에도 없다
- [ ] CI가 PR마다 린트·테스트를 실행하고 결과가 PR에 표시된다
- [ ] PostHog에 배포본에서 발생한 이벤트가 수신된다

## 구현 메모

### 1. 호스티드 dev Supabase

대시보드에서 dev 프로젝트 생성 — **Postgres major version 17**이어야
`config.toml`의 `db.major_version`과 맞는다. `supabase link --project-ref <ref>`
후 루트 `package.json`에 `"db:push": "supabase db push"`를 추가한다(로컬→dev
흐름을 태우는 명령이 저장소에 하나도 없다). `supabase db diff --linked`가
비면 스키마 동일.

**`supabase/seed.sql`은 호스티드에 절대 적용 금지.** `auth.users`에 직접
꽂는 로컬 픽스처다. `db push`는 시드를 돌리지 않지만 `db reset --linked`는
돌린다 — README에 금지로 명시한다.

대시보드에서 신형 publishable/secret 키만 발급하고 legacy anon/service_role은
비활성화한다. 03a에서 로컬에 넣은 Apple·Google provider 설정을 dev
프로젝트에도 동일하게 적용한다.

### 2. Vercel에 Hono 배포

Vercel은 Hono를 zero-config로 인식하고 `src/index.ts`의 default export를
엔트리로 잡는다. `apps/api/src/index.ts`가 이미 `export default app`이라
**코드 변경 없이 배포 대상이 된다** — `vercel.json`도 어댑터도 만들지 않는다.

- Vercel 프로젝트 신규 생성, **Root Directory = `apps/api`**,
  "Include source files outside of the Root Directory" 활성(워크스페이스 의존성)
- `@flyn/supabase`는 빌드 없는 raw TS 패키지지만 `apps/api/src/index.ts`가
  `import type`으로만 쓰고 `verbatimModuleSyntax`가 켜져 있어 런타임 의존이
  남지 않는다. 번들 리스크는 낮다
- 환경 변수를 Preview·Production 스코프에 각각: `SUPABASE_URL` ·
  `SUPABASE_PUBLISHABLE_KEY` · `SUPABASE_SECRET_KEY` · `SUPABASE_JWKS_URL`.
  `@supabase/server` 미들웨어는 모듈 로드 시점에 env를 읽으므로(라우트
  테스트가 이 순서에 의존한다) 콜드 스타트 전에 값이 있어야 한다

### 3. EAS 프로필 3종과 TestFlight

`eas.json`에 `preview`(`distribution: "internal"`, iOS는 TestFlight 경유)와
`production` 프로필을 추가한다. 각 프로필 `env`에 `EXPO_PUBLIC_*`를 채운다 —
API base URL(Vercel preview 도메인), Supabase dev URL·publishable 키,
Google 클라이언트 ID, PostHog 키. 전부 번들에 노출되는 공개값이라 커밋 가능하고,
`EXPO_PUBLIC_*`이 아닌 값은 여기에 절대 넣지 않는다.

App Store Connect에 `com.odd.flyn` 앱 레코드를 만든 뒤
`eas build --profile preview --platform ios` → `eas submit --profile preview`.

### 4. PostHog 계측

`posthog-react-native`(+ `expo-file-system`, `expo-localization`)를 설치하고
`src/app/_layout.tsx`의 `QueryClientProvider` 바깥에 `PostHogProvider`를 둔다.
키가 없으면 provider를 끼우지 않는다 — `supabase.ts`의 `supabaseConfigured`와
같은 graceful degradation이라 로컬 개발이 프로덕션 이벤트를 오염시키지 않는다.
로그인 성공 시 `identify(userId)`를 03a의 auth 헬퍼에 얹는다.
`EXPO_PUBLIC_POSTHOG_API_KEY`·`EXPO_PUBLIC_POSTHOG_HOST`를 `.env.example`과
`eas.json` env에 추가.

### 5. GitHub Actions CI

`.github/workflows/ci.yml` 신규(저장소에 `.github`가 아예 없다):
`pull_request` + `push: main`에서 `oven-sh/setup-bun` →
`bun install --frozen-lockfile` → `bun run check`.

이 한 명령이 `turbo run lint test typecheck`이고 `test`가 워크스페이스로
팬아웃하므로 **Hono 테스트와 모바일 테스트가 둘 다 CI에 든다**:

- `apps/api` — `bun test`: `index.test.ts`(헬스체크·404) +
  `scratch-notes.route.test.ts`(JWT 게이트 5건: 토큰 없음·형식 오류·타 키
  서명·만료·정상)
- `apps/mobile` — `jest`(jest-expo): 컴포넌트 스모크 + 03a에서 추가한
  sign-in·use-auth 테스트
- `packages/supabase`는 `test` 스크립트가 없어 turbo가 건너뛴다

CI에서 빠지는 건 **pgTAP(`db:test`) 하나**다. `supabase start`에 Docker가
필요해 잡 시간이 3~5분 늘어난다. RLS가 보안 경계인 만큼 정책을 건드리는
PR에서는 로컬 `bun run db:test`를 돌리는 규율로 대신하고, 이 트레이드오프를
워크플로 주석과 README에 남긴다.

turbo 원격 캐시는 `TURBO_TOKEN`/`TURBO_TEAM` secret이 있을 때만 동작하도록
두고, 없으면 로컬 캐시로 조용히 돌아가게 한다.

### 6. 문서

`README.md`에 Expo Go → dev build로 바뀐 로컬 루프, `db:push` 흐름과 호스티드
reset 금지, EAS 프로필 3종, Vercel 프로젝트 설정, 환경 변수 표를 갱신한다.

### 검증

1. `bun run db:push` 후 `supabase db diff --linked`가 비어 있다
2. Vercel preview `/health` 200, dev JWT로 stats 200, 토큰 없이 401
3. TestFlight 빌드를 실기기에 설치 → Apple 로그인 → 카드 3종이 **dev
   Supabase와 Vercel preview**를 보고 동작(로컬 스택을 끈 상태에서 확인해야
   유효하다)
4. PostHog Activity에 그 실행의 이벤트와 `identify`된 user_id가 보인다
5. PR을 열어 CI가 실행되고 결과가 PR에 표시된다
6. `rg 'service_role|eyJ'`로 저장소에 legacy 키 문자열이 없음을 확인

### 주의

- 루트 `.gitignore`가 `.env*.local`만 무시한다. `.env`·`.env.production`을
  패턴에 추가할 것
- `turbo.json`에 `env`/`globalEnv` 선언이 없다. 지금은 lint·test·typecheck가
  env와 무관해 문제없지만 빌드 태스크가 생기면 캐시 오염이 된다
- AI 엔드포인트의 `maxDuration`·rate limit은 04 범위

### 실행 환경

대시보드·빌드 작업(`db push`, `eas build`, `eas submit`, Vercel 연결)이 모두
대화형 인증이라 **로컬 세션**에서 한다. 예외적으로 `.github/workflows/ci.yml`은
원격 세션에서도 PR을 열어 초록/빨강까지 확인할 수 있다.

### 사람이 해야 하는 것

Supabase 대시보드 프로젝트 생성과 provider 설정 · Vercel 프로젝트 연결과 env
입력 · App Store Connect 앱 레코드 · `eas build`/`eas submit` 실행 ·
PostHog 프로젝트 생성.
