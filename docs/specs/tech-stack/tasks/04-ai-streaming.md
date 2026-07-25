# 04 AI 스트리밍 슬라이스

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 03a 남은 검증 → 03b 배포 파이프
- 상태: 대기. **착수 전 조사는 끝났다**(아래 "조사 결과") — 2026-07-25에
  한 번 앞당기려다 순서를 되돌렸고, 그때 확인한 사실을 버리지 않고 남겼다

## 무엇을 만드는가

스택의 마지막 이음새인 AI 경로를 관통시킨다. 로그인한 사용자가 앱의
예시 화면에서 메시지를 보내면, JWT 게이트를 통과한 요청이 Hono의
스트리밍 엔드포인트에서 AI Gateway를 거쳐 모델을 호출하고, 응답이
`useChat` + expo/fetch(필요 폴리필 포함)로 토큰 단위 스트리밍 렌더된다.
로컬 API와 배포된 API 양쪽에서 같은 경험이 확인되어야 한다.

기술적 의존은 02까지지만, 배포본 스트리밍 기준을 이 세션 안에서 닫기
위해 03b 뒤에 둔다.

## 완료 기준

- [ ] 비로그인 요청은 AI 엔드포인트에서 거부된다
- [ ] 시뮬레이터에서 로컬 API 기준 토큰 단위 스트리밍이 렌더된다
- [ ] 배포본(TestFlight 빌드 + Vercel API)에서도 스트리밍이 렌더된다
- [ ] AI SDK mock provider 테스트가 모델 호출 없이 스트리밍 프로토콜을
      검증한다
- [ ] AI Gateway 키·모델 지정이 환경 변수 체계로 관리되어 dev/prod에서
      모델 교체가 설정 변경만으로 가능하다

## 유보

- **사용자별 rate limit · `maxDuration`** — 03b가 받는다(03b의 `주의` 절).
  spec.md는 1일차부터 rate limit을 요구하지만 서버리스에서 의미 있는 카운터는
  Postgres·Redis 상태가 필요해, 스택을 관통시키는 이 태스크와 결이 다르다.
  **배포 전에 닫아야 하는 항목이다** — 미룬 것이지 없앤 것이 아니다.

## 조사 결과 (2026-07-25 · 착수 전 확인)

여기 적힌 것은 **원격 문서와 실제 실행으로 확인**한 것이다. 다만 착수 시점에는
설치된 버전의 번들 문서(`node_modules/ai/docs/`)로 한 번 더 확인할 것 —
버전이 정확히 일치하는 유일한 출처다.

`ai@7.0.37`이 최신이고 짝은 `@ai-sdk/react@4.0.40`. spec.md가 적었던 v5 기준
API는 대부분 이름이 바뀌었다:

| spec.md / 기억 | v7 실제 |
| --- | --- |
| `result.toUIMessageStreamResponse()` | deprecated. `createUIMessageStreamResponse({ stream: toUIMessageStream({ stream: result.stream }) })` |
| `result.fullStream` | `result.stream` |
| `convertToModelMessages(...)` 동기 | **async** — `await` 필수 |
| `MockLanguageModelV2` | `MockLanguageModelV4` (`ai/test`). V2는 없다 |
| `system:` / `stepCountIs()` | `instructions:` / `isStepCount()` |

함정 네 개 — 전부 실제로 확인한 것이다:

1. **`@ai-sdk/react`가 `ai`를 정확한 버전으로 핀한다**(`ai: 7.0.37`, 캐럿 없음).
   `bunfig.toml`이 hoisted 설치라, 워크스페이스에서 `ai@^7.0.37`로 넣으면 다음
   패치가 나온 순간 사본이 둘로 갈라져 `UIMessage` 타입 동일성이 깨지고
   `tsc --noEmit`이 구조 불일치로 터진다. **양쪽 다 정확한 버전으로 고정**하고
   설치 후 `ls node_modules/@ai-sdk/react/node_modules`에 `ai`가 없는지 본다.
2. **`zod`는 런타임 의존이다**(`ai`가 `zod/v4`를 static import). 지금 트리에는
   루트 devDependency인 `ultracite`의 전이 의존으로만 4.4.3이 있다 —
   `apps/api`에 명시로 넣지 않으면 Vercel 배포가 루트 개발 도구에 얹힌다.
3. **`toUIMessageStream`은 서버 에러를 숨긴다** — 잘못된 키·없는 모델·Gateway
   402가 throw도 non-200도 아니고 **200 + 스트림 안의 일반 문구**로 나오며
   서버 로그도 남지 않는다. `onError`를 넘겨 `console.error`하는 한 줄이
   이 슬라이스에서 값이 가장 높다.
4. **모바일 테스트는 `ai`·`@ai-sdk/react`를 반드시 팩토리와 함께 mock한다.**
   jest-expo의 `transformIgnorePatterns`에 두 패키지가 없어 babel을 타지 않는다.
   팩토리 없는 `jest.mock("ai")`는 automock이 모듈을 로드하려 들어
   `Cannot use import statement outside a module`로 죽는다. 팩토리가 있으면
   해석만 하고 실행하지 않으므로 **jest 설정은 건드릴 필요가 없다.**
   `expo/fetch`는 mock이 필요 없다 — jest-expo 프리셋이 이미 스텁을 넣는다.

그 외:

- **폴리필 파일을 만들지 말 것.** Expo 57 winter 런타임이 `structuredClone`·
  `TextEncoderStream`·`TextDecoderStream`을 이미 깐다(spec.md 리스크 절 참조).
- `app.request()`가 스트리밍 본문을 **청크 단위로** 돌려준다(bun에서 확인).
  라우트 레벨에서 "토큰이 쪼개져 순서대로 온다"까지 단정할 수 있다.
- 인증 헤더는 커스텀 fetch 래퍼가 필요 없다 — `DefaultChatTransport`의
  `headers`가 async 함수를 받는다. transport는 **모듈 스코프**에서 만든다
  (렌더마다 새로 만들면 `useChat` 내부 인스턴스가 무시한다).
- `generateAPIUrl` 같은 헬퍼도 필요 없다 — 이미 있는 `API_BASE_URL`을 쓴다.
- 검증 순서: 시뮬레이터보다 **먼저 `curl -N`으로** 프레임이 시간에 걸쳐
  도착하는지 본다. 그래야 버퍼링이 API 쪽인지 클라이언트 쪽인지 갈린다.
