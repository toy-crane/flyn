# 02 — 텍스트 역할 이전

## Outcome

React Native UI의 모든 글자가 HeroUI `Typography`의 역할로 그려져, 같은 역할이
모든 화면에서 같은 크기, 행간, 굵기로 보인다. 화면 안 제목, 섹션 헤딩, 카드
제목이 화면 읽기에 헤더로 읽히고, 큰 시스템 글자 크기에서 모든 역할이 Dynamic
Type 램프를 따라 커진다. 문구, 색, 배치, 동작은 달라지지 않는다.

## Blockers

None. 01이 아이콘 버튼과 칩의 라벨을 컴포넌트에 넘기므로 01 뒤에 하면 같은
파일을 두 번 만지지 않는다.

## Acceptance criteria

- [ ] React Native UI에 `text-[Npx]`, `leading-[Npx]`, 인라인 `fontSize`가 없다. 코드 표시의 monospace 지정은 예외다.
- [ ] `Text`에 `text-*`(색 제외), `leading-*`, `font-*` 클래스가 없다. 강조는 `weight`로 표현한다.
- [ ] 쓰인 `Typography` `type`이 모두 [모바일 타이포그래피](../../../decisions/mobile-typography.md) 대응표에 있다.
- [ ] 화면 안 제목, 섹션 헤딩, 카드 제목이 화면 읽기에 헤더로 읽힌다.
- [ ] 인증, 온보딩, 탐색, 대화, 종료, 표현 돌아보기, 표현 노트, 대화 기록, 프로필 편집 화면을 기본 글자 크기와 최대 시스템 글자 크기로 앱을 완전히 닫고 다시 시작해 잘림과 겹침이 없다. 밝은 화면과 어두운 화면 모두 같다.
- [ ] 상태 줄과 진행 표시의 줄 높이가 대응표의 값과 맞고, 진행 표시 크기 규칙은 그대로다.

## Constraints

- 카드와 목록 행의 구조는 건드리지 않는다. 그 안의 글자 역할만 바꾼다.
- `Typography`의 값을 global.css에서 재정의하지 않는다. 어색한 값이 보이면 이 task의 Execution에 적고 계약의 재검토로 넘긴다.
- 토스트와 로그인 버튼의 확대 상한, AI 답변 Markdown 렌더러의 숫자 크기는 그대로 둔다.

## Verification

- 저장소 grep: 임의 크기·행간 값과 `Text`의 크기·굵기 클래스가 0건.
- `bun run test`(모바일)가 통과하고, 크기 클래스를 검사하던 테스트는 역할 `type`을 검사한다.
- 아홉 화면을 iOS와 Android에서 기본·최대 글자 크기, 밝은·어두운 모드로 재시작해 찍은 스크린샷.
- 화면 읽기(iOS VoiceOver 또는 접근성 트리)로 제목 셋이 헤더 역할이다.

## Review checkpoint

One review pass after this task. 누적 범위는 01과 02 전체다. 위험은 역할을
잘못 고른 것이 03의 카드 구조로 그대로 번지는 것과, 최대 글자 크기에서 `h6`의
`subheadline` 램프가 본문보다 덜 커져 위계가 뒤집혀 보이는지를 자동 검사로
잡을 수 없다는 점이다.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
