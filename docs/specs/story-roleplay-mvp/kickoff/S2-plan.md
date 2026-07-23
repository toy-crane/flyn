# S2 구현 플랜 — AI 엔진

> The code is the terrain and this plan is a map: where they disagree, the
> terrain wins. A divergence at the decision level flows back to spec.md
> instead of being worked around.

## Approach

**판정을 분리 가능한 단위로, 스트리밍은 표준 캐리어로.** S0 계약
(`src/lib/ai-contract.ts`)의 서버 쪽을 라우트 4파일(3계열) + `src/server/`
로 구현한다. 모델은 게이트웨이 실측 슬러그 `anthropic/claude-sonnet-5`.
S0-plan이 위임한 스트리밍 운반 방식이 이 세션의 설계 산출물이다.

주요 결정:

- **스토리 턴 = 모델 2콜.** 콜 A "턴 분석"(temp 0, `generateText` +
  `Output.object`)이 교정 + 달성 판정을, 콜 B "내레이터"(temp ~0.9,
  `streamText` + `Output.object`)가 beats(+결말)를 만든다. 사이에 순수 함수
  `resolveTurnPlan`이 종료를 판정한다 — `verdict ≠ in-progress` 또는
  `turnCount + 1 ≥ 30`이면 종료, endingKind는 verdict 우선, 아니면
  `forced`. **"턴 상한 30 서버 강제"가 이 함수다** (AI 없이 단위 테스트,
  `turnCount ≥ 30` 요청도 방어 처리). 근거: 판정 하니스가 beats 생성 비용
  없이 temp 0으로 판정만 회귀 검증하고, 마스터 플랜의 폴백("판정만 상위
  모델 분리")이 모델 상수 교체로 끝난다. 저항 원칙도 갈라진다 — 성급한
  성공 금지는 판정(콜 A), 마찰 생성·발화 유도는 내레이터(콜 B). 비용은
  입력 ~2배/턴, 첫 beat까지 ~3–8초 — 밑줄이 먼저 뜨는 UI 순서와 일치해
  수용. 종료 분기에서는 ending이 스키마상 non-null인 출력 스키마를 써서
  구조적으로 강제한다(두 스키마는 내레이터 내부용).
- **스트리밍 캐리어 = UIMessageStream(SSE) + data parts.** S7이 ai-sdk
  클라이언트 훅으로 소비하므로 표준을 쓴다. `data-turn-analysis` part 1회
  (persistent) = `{corrections, achievement}`; `data-turn-narrative` part는
  콜 B의 `partialOutputStream`을 같은 id로 반복 기록(자동 reconcile,
  ~100ms 스로틀), 최종 기록은 `{beats, ending | null}` 정규화 스냅샷.
  클라이언트 조립 = 두 part 병합 → 기존 `storyTurnResponseSchema.parse`.
  part 스키마는 **새 파일 `src/lib/ai-stream-contract.ts`**(기존 스키마
  `.pick` 조합만) — `ai-contract.ts`는 건드리지 않고, 마무리 보고에 "계약
  추가(S0 위임 이행)"로 기록한다.
- **교정 스팬은 모델 인용문 → 서버 오프셋 계산.** 모델은 문자 오프셋에
  취약하므로 `errorQuotes[]`/`changedQuotes[]`(정확한 부분 문자열)로 받고
  `src/server/correction-spans.ts`가 변환한다: ① 2단 앵커링(`originalText`
  를 입력 전체에서 → 인용문을 그 안에서), ② 인덱스 보존 1:1 정규화 폴백
  (곱슬↔직선 따옴표·대시), ③ 열화 사다리 — 인용 실패는 `originalText`
  전체 스팬, `originalText` 실패는 교정 폐기(밑줄 없는 교정은 3단 동선
  위반), ④ 정렬 + 겹침 병합. 계약 무변경.
- **리라이트 정합성 가드는 코드로.** scene/myRole/aiRole 편집 시 goal을 내
  역할 시점으로 재작성 + 조건 재생성(조건은 goal의 기계 판정 절).
  불변 필드(genre/title/intro + 비편집 필드)는 요청 값을 서버가 복사해
  되돌린다 — 모델 드리프트 차단, 순수 함수 + 테스트.
- **프롬프트 공통 조각**(`prompt-fragments.ts`): 언어 매트릭스(title·beats·
  교정 원문·ending narration 영어 / 나머지 한국어, evidence 한국어),
  수준 반영 2곳(내레이터 난이도 사다리 + 교정 문턱 — 기본 "명백한 오류만",
  beginner는 이해를 막는 오류만), 목적·장르·관심사는 가중치이지 필터 아님,
  퍼페티어링 차단(AI 역할 조건은 AI beats로만 충족), failure는 회복 불능일
  때만.

기각한 대안: 단일 콜 + 필드 순서 제어(하니스가 매 실행 beats 비용을 내고,
서사 관성이 판정을 후하게 만들며, temp를 하나로 묶는다), 하나의 부분 JSON
텍스트 스트림(useObject식 — 분석 페이로드를 먼저 실을 자리가 없다),
스트림 스키마의 클라이언트 측 중복 정의(최악 — 계약 이원화).

## Order

1. **플랜 문서** — 이 문서 커밋.
2. **셋업(커밋 없음)** — `bun install`, 메인 체크아웃 `.env.local` 복사,
   기준 `bun test`·`tsc` 그린, 설치된 `node_modules/ai/docs`로 API 실측
   (`Output.object`·`partialOutputStream`·`createUIMessageStream`).
3. **순수 로직** — `turn-rules.ts`(+테스트: verdict 우선, 29턴 강제, 30턴
   방어) / `correction-spans.ts`(+사다리 테스트: 반복 문자열·곱슬따옴표·
   `*행동*`·경계 걸침·인용 실패·원문 실패). 커밋 2건.
4. **스트림 계약** — `ai-stream-contract.ts` + 병합 왕복 테스트. 커밋.
5. **비스트리밍 라우트** — `ai.ts`·`prompt-fragments.ts`·`scenario.ts`
   (+가드 테스트)·`correction-thread.ts`·라우트 3파일·e2e(`describe.skipIf
   (!process.env.E2E_BASE_URL)` — 기본 `bun test`는 스킵). 게이트:
   `expo start --port 8083` + `E2E_BASE_URL=http://localhost:8083 bun test
   routes.e2e`. 8081·8082는 S0 기본·S1 몫이라 회피. 커밋.
6. **스토리 턴** — 프롬프트 작업 전에 2-write 더미 스트림으로 dev 서버 SSE
   관통 스모크(막히면 우회 말고 에스컬레이션). 이후 `turn-analysis.ts`·
   `narrator.ts`·`story-turn.ts`·`story-turn+api.ts` + e2e(두 part 도착,
   병합 parse, 명백한 오류 입력→교정 비어있지 않음, `turnCount: 29`→
   ending non-null, 조건 id 일치). 커밋.
7. **판정 하니스** — `evals/transcripts.ts` 6케이스(성공 직전 / 이번 턴
   성공 / 명백한 실패 / 게이밍-최소 발화 / 게이밍-행동 퍼페티어링 / 애매한
   진행) + `evals/judgment-eval.ts`(turn-analysis 직접 호출, dev 서버
   불필요, 표 출력, `--runs=N` 기본 3, 불일치 exit 1). 합격: 명확 5종
   verdict+met 만장일치, 애매 케이스 verdict만. 흔들리면 게이트 완화가
   아니라 프롬프트 수정. 턴 분석 프롬프트의 모든 수정(교정 강도 포함)은
   하니스 재통과가 조건이다. 커밋.
8. **마무리** — 키 감사(`git log -p` grep, 에러 응답 sanitize 확인), 전체
   재검증, self-grade, 보고, PR(`S2: AI 엔진 — 라우트 3종 + 판정 하니스`).

## Acceptance criteria

- [ ] S2 킥오프 완료 기준 4항 전부: 라우트 3종 계약대로 응답(dev 서버 직접
      요청 bun test) · 스토리 턴 스트리밍 + 교정·판정·결말 계약대로 ·
      하니스 전체 기대 판정 일치 · 키 비노출
- [ ] `turnCount + 1 ≥ 30`에서 서버가 결말을 구조적으로 강제(스키마 non-null
      분기), verdict 우선 규칙 단위 테스트 통과
- [ ] 기본 `bun test`·`tsc --noEmit`가 키·dev 서버 없이 그린
- [ ] 기존 파일 무수정 — `ai-contract.ts`·`text-spans.ts`·픽스처 불변

## Verification and seams

- **순수 로직**(턴 규칙·스팬 사다리·리라이트 가드) — 콜로케이션 `bun test`,
  키 불필요. 이 층이 "서버 강제"의 시금석이다.
- **라우트 계약** — e2e가 dev 서버에 실요청 후 계약 스키마로 parse. 게이트
  환경변수 없으면 스킵되므로 다른 세션의 `bun test`를 깨지 않는다.
- **판정 품질** — 하니스가 유일한 게이트. evidence는 표로 출력해 사람이
  읽고, 단언은 verdict·met에만 건다.
- **스트림 계약** — `ai-stream-contract.ts`의 병합 왕복 테스트가 S7 조립
  코드의 시금석. part 이름 상수도 여기서 가져간다.

## Off-limits

- `ai-contract.ts` 수정 금지 — 필요하면 구현 우회 없이 "계약 변경 제안".
- 공유 파일(`src/utils/text-spans.ts`, 픽스처, 컴포넌트) 수정 금지 — 스팬
  헬퍼는 `src/server/`에 두고 utils 승격은 보고로.
- 스펙 Deferred 선반영 금지, API 라우트 호스팅(EAS Hosting) 보류 — dev
  서버로 충분.
- 키 값 커밋·출력 금지.

## Risks and open questions

- **dev 서버 SSE 버퍼링** — 공식 지원 패턴이나 6단계 스모크로 선검증. S7
  인계: RN 클라이언트는 `expo/fetch` 필요.
- **temp 0 ≠ 결정론** — 3런 만장일치 게이트로 흔들림을 드러낸다. Sonnet 5가
  못 버티면 마스터 플랜 폴백(판정만 상위 모델) — `ai.ts` 상수 교체.
- **결말 턴 의미(스펙 역류 후보)** — 픽스처는 종료 AI 메시지를 저장하지
  않고 `ending.narration`만 두는데 계약 테스트는 narration을 beats에
  복제한다. 채택: 종료 턴 beats = 마지막 극중 응답, `ending.narration` =
  별도 마무리 내레이션. S5/S7 정렬을 위해 보고에 남긴다.
- **스팬 열화** — 폴백 전체 밑줄은 계약상 합법이나 프로토타입보다 뭉툭.
  S7 실사용 관찰 항목.
- **교정·판정 프롬프트 결합** — 한 프롬프트를 공유하므로 하니스가 턴 분석
  수정 전체를 게이트한다. 마찰이 커지면 콜 A를 병렬 2콜로 분리(+1콜,
  지연 동일).
