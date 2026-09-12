# 03 — 카드와 목록 행 이전

## Outcome

표현 카드, 교정 카드, 회차 카드가 HeroUI `Accordion` 표면 변형으로, 스토리 행,
회차 행, 추천 아이디 행이 HeroUI `ListGroup`으로 그려져 같은 모양과 눌림 반응을
갖는다. 펼침과 접힘, 복사와 담기, 회차 열기와 이어서 하기는 지금과 같다. 표현
카드의 스와이프·탭 판정, 손으로 조립한 접근성 이름, 배율 재생성 처치가 사라진다.

## Blockers

02. 카드 안 글자 역할이 02의 결과라, 먼저 하면 같은 파일을 다시 고치게 된다.

## Acceptance criteria

- [ ] 여섯 자리에 원시 `Pressable`이 없고, 손으로 그린 구분선(`border-b`, `h-px`)이 없다.
- [ ] 카드를 누르면 펼쳐지고 다시 누르면 접힌다. 아이콘 줄을 눌러도 카드가 열리지 않는다. 목록을 스크롤하다 손을 떼도 카드가 열리지 않는다.
- [ ] 행을 누르면 살짝 작아지는 눌림 반응이 있고, 대화가 없는 회차 행은 눌리지 않는다.
- [ ] 화면 읽기에서 카드는 `expanded` 상태를 가진 버튼으로, 행은 제목과 설명을 잇는 이름의 버튼으로 읽힌다.
- [ ] 탐색, 표현 돌아보기, 표현 노트, 대화 기록, 온보딩 아이디 화면을 기본 글자 크기와 최대 시스템 글자 크기로 앱을 완전히 닫고 다시 시작해 잘림과 겹침이 없다. 밝은 화면과 어두운 화면 모두 같다.
- [ ] 종료 화면의 축하 연출과 카드 펼침 애니메이션이 겹쳐도 카드 내용이 가려지지 않는다.

## Constraints

- 행의 눌림 반응은 HeroUI 문서대로 `PressableFeedback`으로 행을 감싸고 `onPress`를 그쪽에 둔다. `ListGroup.Item` 혼자서는 눌림 반응이 없다.
- 배율 재생성 처치 제거는 [글자 크기 스펙](../../text-size-after-relaunch/spec.md)과 겹친다. 먼저 끝난 쪽이 없애고, 이 task를 시작할 때 남아 있는 것만 없앤다.
- HeroUI가 줄 수 없는 동작이 확인되면 그 자리만 되돌리고 [모바일 컴포넌트 선택](../../../decisions/mobile-component-selection.md)의 예외 목록에 이유와 함께 넣는다.
- 카드와 행의 내용과 동작은 [표현 노트](../../../decisions/expression-note.md), [에피소드 종료와 표현 돌아보기](../../../decisions/episode-ending-and-review.md), [모바일 대화 중 교정](../../../decisions/mobile-episode-correction.md), [모바일 스토리 탐색](../../../decisions/mobile-story-browsing.md)이 소유한다. 그리는 수단만 바꾼다.

## Verification

- 저장소 grep: 여섯 자리에 원시 `Pressable`과 손으로 그린 구분선이 0건.
- `bun run test`(모바일)가 통과하고, 카드의 접근성 역할과 `expanded` 상태, 행의 접근성 이름을 검사하는 테스트가 있다.
- 다섯 화면을 iOS와 Android에서 기본·최대 글자 크기, 밝은·어두운 모드로 재시작해 찍은 스크린샷.
- 종료 화면에서 축하 연출과 카드 펼침을 함께 녹화한 영상.

## Review checkpoint

None. 구현 단계의 마지막 검토가 전체 diff를 본다.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
