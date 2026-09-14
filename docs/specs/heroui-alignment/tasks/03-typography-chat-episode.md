# 03 — 텍스트 역할 이전: 대화와 에피소드

## Outcome

대화 화면(말풍선, 장면 서술, 인물 이름표, 상황 줄, 배울 표현의 한 줄과 카드,
실패 줄, 편집 안내, 결말 카드), 표현 돌아보기 화면의 글자가 HeroUI `Typography`
역할로 그려진다. AI 답변 Markdown은 대응표 `body`의 크기와 행간을 숫자로 받는다.
본문 행간이 넓어지는 것 말고 문구, 색, 배치, 동작은 달라지지 않는다.

## Blockers

None.

## Acceptance criteria

- [x] 대화·에피소드 폴더에 `text-[Npx]`, `leading-[Npx]`가 없고, `Text`에 `text-*`(색 제외), `leading-*`, `font-*` 클래스가 없다. Markdown 렌더러의 숫자와 토스트의 인라인 줄 높이는 계약의 예외다.
- [x] 쓰인 `Typography` `type`이 모두 대응표에 있고, 본문 계열은 `Paragraph`, 제목 계열은 `Heading`이다.
- [x] 배울 표현의 바뀐 부분과 표시 구간의 중첩 `Text`에 색과 배경 클래스만 있다.
- [x] Markdown 렌더러가 받는 본문 크기와 행간이 대응표 `body`의 값이고, 실패 줄과 진행 표시의 줄 높이가 대응표 값이다. 표시 영역과 간격 규칙은 그대로다.
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

blocked

## Execution

- Verification: 코드 기준은 통과했다. 세 폴더 grep은 채팅 입력칸 `TextInput` 말고 0건이고, 남은 RN `Text`는 `shared/ui/marked-text.tsx`의 중첩 표시 `Text`(색·배경·밑줄 클래스)뿐이다. `bun run check`, `check-types`, 모바일 테스트가 통과했다. `mobile-ui-consistency-reviewer`(범위 `237ec54..ef5dc3b`)는 PASS_WITH_GAPS다. P3 두 건(회차 줄의 강조가 대응표 문장에 없음, 마지막 화 인사가 헤더로 읽힘)은 대응표 문장에 회차 줄과 마지막 화 인사를 더하고, 인사를 `Paragraph` `weight="semibold"`로 바꿔 닫았다. 2026-09-14 iOS 기본 크기·밝은 화면에서 대화(펼친 배울 표현 카드, 결말 카드)와 표현 돌아보기를 열어 잘림과 겹침이 없음을 봤다. 최대 크기, 어두운 화면, Android, 에피소드를 열 수 없는 화면은 아래 막힘으로 멈췄다.
- Blocker: task 02의 Blocker와 같다. HeroUI Native 1.0.8 `Typography`의 굵기가 정의되지 않은 `--font-*` 변수에 기대어, 결말 카드 결과 문장(h3), `기억해 둘 표현`(h6), 고친 영어 문장(h6), 장면 첫 줄·인물 이름표·회차 줄(`weight`)이 모두 보통 굵기로 그려진다. 문구·색·배치가 그대로라는 이 task의 결과와 대응표의 굵기 위계가 기기에서 성립하지 않는다. iOS `agent-device`는 XCTest 노드에 헤더 특성을 내보내지 않아(`role="heading"` 선택자 실패, 노드 형식 `StaticText`) `기억해 둘 표현`의 헤더 역할은 Android 트리로 확인해야 한다.
- Revision: 대응표에 결말 카드 결과 문장(h3), 본문색 목록 제목(h6), 헤더가 아닌 줄의 `weight` 강조를 더했다. 대사 뜻 카드의 뜻은 헤더가 아니므로 `Heading h6`에서 `Paragraph` `weight="semibold"`로 바꿨다(ef5dc3b). `AI에게 물어보기` 링크는 `text-xs`를 떼어 `LinkButton` `sm` 라벨(14)이 크기를 정한다. [대사 뜻 계약](../../../decisions/mobile-utterance-translation.md)이 `sm` 크기를 정하므로 계약과 맞다. `shared/ui/marked-text.tsx`는 04의 폴더지만 대화·에피소드 호출부가 크기 클래스를 넘겨서 여기서 `type`과 `weight`를 받게 바꿨다. 04는 `shared/ui/expression-card.tsx`가 아직 넘기는 크기 클래스만 정리하면 된다. 재개할 때 확인할 것: 토스트는 `lineHeight: 28 × min(fontScale, 1.6)`에 RN이 배율을 한 번 더 곱할 수 있어(c0a4bb1부터 있던 계산) 최대 크기에서 알약 높이를 본다.
