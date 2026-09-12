# 03 — 텍스트 역할 이전: 대화와 에피소드

## Outcome

대화 화면(말풍선, 장면 서술, 인물 이름표, 상황 줄, 배울 표현의 한 줄과 카드,
실패 줄, 편집 안내, 결말 카드), 표현 돌아보기 화면의 글자가 HeroUI `Typography`
역할로 그려진다. AI 답변 Markdown은 대응표 `body`의 크기와 행간을 숫자로 받는다.
본문 행간이 넓어지는 것 말고 문구, 색, 배치, 동작은 달라지지 않는다.

## Blockers

None.

## Acceptance criteria

- [ ] 대화·에피소드 폴더에 `text-[Npx]`, `leading-[Npx]`가 없고, `Text`에 `text-*`(색 제외), `leading-*`, `font-*` 클래스가 없다. Markdown 렌더러의 숫자와 토스트의 인라인 줄 높이는 계약의 예외다.
- [ ] 쓰인 `Typography` `type`이 모두 대응표에 있고, 본문 계열은 `Paragraph`, 제목 계열은 `Heading`이다.
- [ ] 배울 표현의 바뀐 부분과 표시 구간의 중첩 `Text`에 색과 배경 클래스만 있다.
- [ ] Markdown 렌더러가 받는 본문 크기와 행간이 대응표 `body`의 값이고, 실패 줄과 진행 표시의 줄 높이가 대응표 값이다. 표시 영역과 간격 규칙은 그대로다.
- [ ] 표현 돌아보기의 `기억해 둘 표현` 제목이 접근성 트리에서 헤더 역할이다.
- [ ] 대화(종료 카드 포함), 표현 돌아보기, 에피소드를 열 수 없는 화면을 계약의 절차로 기본 크기와 최대 글자 크기, 밝은 화면과 어두운 화면으로 열어 잘림과 겹침이 없다.

## Constraints

- 이 task는 `features/chat`, `features/episode`, `screens/episode` 화면과, 실패 줄과 진행 표시의 줄 높이를 정하는 공용 파일 `shared/ui/status-line.tsx`, `shared/ui/progress-metrics.ts`, 토스트의 인라인 줄 높이 기준값이 있는 `shared/ui/screen-toast.tsx`만 다룬다. 이 세 파일은 이 task의 기준(실패 줄, 진행 표시, 토스트)이 값을 요구하므로 04가 아니라 여기서 바꾼다.
- 대화 중 배울 표현의 한 줄과 카드, 실패 줄, 메시지 아래 아이콘 줄, 상황 줄, 결말 카드의 구조는 바꾸지 않는다. 글자 역할만 바꾼다.
- 토스트의 확대 상한과 인라인 줄 높이는 그대로 두되 기준값을 대응표의 값으로 맞춘다.
- `Typography`의 값을 global.css에서 재정의하지 않는다.

## Verification

- 위 세 폴더에 대한 `grep -rnE "text-\[|text-(xs|sm|base|lg|[0-9]?xl)|leading-\[|leading-[0-9]|font-[a-z]"`가 Markdown 렌더러와 토스트의 예외, 그리고 `Text`가 아닌 채팅 입력칸(`TextInput`)의 크기 클래스를 빼고 0건이다.
- `bun run check`와 모바일 `bun run test`가 통과하고, 채팅 패널 테스트의 Markdown 크기 기대값과 배울 표현 재시도 테스트의 줄 높이 기대값이 대응표 값으로 바뀐다.
- 기기 확인: 계약의 절차대로 최대 글자 크기로 바꾼 뒤 앱을 완전히 닫고 다시 시작해 대화(종료 카드 포함), 표현 돌아보기, 에피소드를 열 수 없는 화면을 iOS와 Android, 밝은·어두운 모드로 찍는다. 통과 조건은 잘림과 겹침이 없는 것이다.
- `agent-device` 접근성 트리에서 `기억해 둘 표현` 제목이 헤더 역할이다.
- 변경을 `mobile-ui-consistency-reviewer`로 검토한다.

## Review checkpoint

None.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
