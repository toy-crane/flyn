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

- [ ] 대화 화면이 HeroUI 토큰 위에서 그려지고 가상 목록·streaming
      markdown·composer가 동작한다
- [ ] [ai-chat-experience](../../../decisions/ai-chat-experience.md) 기준 —
      생성 상태, 맨 아래 action·오류 배너의 공간 관계, 스크롤, 키보드,
      새로고침 — 이 회귀 없다
- [ ] goal dock과 말풍선 첨삭 표시가 동일하게 동작한다
- [ ] 문장 질문 화면이 저장·이어 묻기 포함 동일하게 동작한다
- [ ] Reduce Motion에서 의미가 유지된다
- [ ] chat·episode 컴포넌트의 `theme/` 소비가 남지 않았다

## 제약

- 가상 목록은 `@legendapp/list`, 키보드는 `react-native-keyboard-controller`를
  유지한다 — HeroUI로 대체하지 않는다.
- streaming text와 메시지 행에 반복 애니메이션을 붙이지 않는다 —
  [native-motion](../../../decisions/native-motion.md).
- 검증은 `bun run auth:session` 세션으로 실제 스트리밍 대화를 재현한다.

## Status

pending

## Execution

- Base commit: —
- Task checkpoint commit: —
- Verification: —
- Task review: —
- Task correction rounds: 0
- Blocker: —
