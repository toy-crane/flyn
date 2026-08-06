# 06. 대화와 문장 질문이 HeroUI 위 커스텀으로 그려진다

## 전달되는 행동

에피소드 대화와 문장 질문 화면이 HeroUI 조합 + 커스텀 확장으로 그려진다. 가상
목록·streaming markdown·composer는 HeroUI 토큰을 소비하는 커스텀으로 다시
만들고, 버튼·상태 피드백·goal dock류 표현은 HeroUI 컴포넌트를 쓴다. 스트리밍
중 스크롤, 키보드와 composer의 관계, 맨 아래 action과 오류 배너의 등장·소멸,
말풍선 첨삭 표시, 문장 질문의 이어 묻기까지 사용자 눈에 보이는 동작은 전부
이전과 같다.

## Blockers

- **01** — HeroUI 화면은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [x] 대화 화면이 HeroUI 토큰 위에서 그려지고 가상 목록·streaming
      markdown·composer가 동작한다
- [x] [ai-chat-experience](../../../decisions/ai-chat-experience.md) 기준 —
      생성 상태, 맨 아래 action·오류 배너의 공간 관계, 스크롤, 키보드,
      새로고침 — 이 회귀 없다
- [x] goal dock과 말풍선 첨삭 표시가 동일하게 동작한다
- [x] 문장 질문 화면이 저장·이어 묻기 포함 동일하게 동작한다
- [x] Reduce Motion에서 의미가 유지된다
- [x] chat·episode 컴포넌트의 `theme/` 소비가 남지 않았다

## 제약

- 가상 목록은 `@legendapp/list`, 키보드는 `react-native-keyboard-controller`를
  유지한다 — HeroUI로 대체하지 않는다.
- streaming text와 메시지 행에 반복 애니메이션을 붙이지 않는다 —
  [native-motion](../../../decisions/native-motion.md).
- 검증은 `bun run auth:session` 세션으로 실제 스트리밍 대화를 재현한다.

## Status

completed

## Execution

- Base commit: 666c0c988adc0deb2c275c30bc11b68f932fd8e0
- Task checkpoint commit: 23bd27c6ed850fe20e04c36d6d5652b421ac2051
- Verification: `bun run check --force` 3회 연속 exit 0 — 매회 8/8 tasks, 0 cached, jest 442/442 (48 suites), lint·typecheck 통과. 실제 스트리밍 대화 3턴을 자연 종료까지 재현했고(apps/api가 매 턴 model.completed 로그), 오류 배너는 API를 죽였다 살려서, 문장 질문 이어 묻기와 Reduce Motion까지 촬영했다.
- Task review: 교정 1회로 닫았다. 리뷰가 블로커 4건을 잡았고 둘은 가드 테스트가 버그를 못 잡는 형태로 다시 쓰인 경우였다 — composer의 고정 `lineHeight`(`text-base`가 line-height를 함께 낸다), 정의된 적 없는 `rounded-panel`·`rounded-panel-inner`(uniwind가 조용히 버려 세 표면이 24px로 나갔다), 전체 폭이 되면서 스크롤·탭을 삼키던 `맨 아래로` 앵커, 마크다운 heading·table cell 안에서 글자 크기를 초기화하던 중첩 `Typography`. 넷 다 기기에서 A/B로 확인했다(반지름 픽셀 측정, Dynamic Type 잘림, 같은 위치 팬 제스처에서 스크롤 픽셀 33,649 대 0). 부수 소득으로 `className` 리터럴이 실제 CSS 규칙을 만드는지 저장소 전체를 검사하는 가드가 생겼다 — 내가 직접 변이를 넣어 클래스 이름과 파일까지 짚어내는 것을 확인했다. Reduce Motion에서 HeroUI `Spinner`가 정지하는 것은 라이브러리에 지원 수단이 없어 남겼고 근거를 `native-motion.md`에 기록했다 — 기기 확인은 하지 않았다.
- Task correction rounds: 1
- Blocker: resolved task-review — 원문: (1) composer 입력에 고정 `lineHeight`가 되돌아왔다. `text-base`는 font-size만이 아니라 `line-height`도 낸다(tailwind `--text-base--line-height`). base는 `lineHeight: undefined`를 명시적으로 덮어써서 큰 Dynamic Type에서 글자가 잘리는 것을 막고 있었다. 이를 잡던 테스트도 무력화됐다 — `props.style`은 style prop을 아예 안 넘겨 자명하게 undefined이고, `leading-` 클래스 검사는 실제 경로가 아니다. (2) `rounded-panel`·`rounded-panel-inner`가 어디에도 정의되지 않았다. `global.css`에도 HeroUI에도 없고 uniwind는 모르는 클래스를 조용히 버린다(`store.ts:116`). 오류 배너·상황 카드·인용 카드가 의도한 16/12px 대신 `surface__root`의 24px로 나간다. 승인된 프로토타입은 12px다. "토큰 원본은 global.css 하나"도 어긴다 — 쓰이지 않은 토큰을 읽고 있다. (3) `맨 아래로` 앵커가 `inset-x-0`로 전체 폭이 됐는데 `pointerEvents="auto"`를 유지한다. base는 44pt 폭이었다. 스크롤을 올린 동안(=버튼이 보이는 유일한 때) composer 위 60pt 지점에 전체 폭 투명 띠가 생겨 드래그 시작과 말풍선 탭을 삼킨다. 이 지오메트리를 고정하던 테스트도 `items-center`만 남기고 완화됐다. (4) 중첩 `Typography`가 글자 크기를 초기화한다. HeroUI `Typography`는 항상 `type` 클래스를 내고 기본이 `body`(16px)라, 마크다운 heading(24px) 안의 굵은 글씨가 16px로, table cell(14px) 안에서는 16px로 튄다.
