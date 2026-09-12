# 모바일 컴포넌트 선택

## 결정

- React Native UI에서 누를 수 있는 것과 표면은 HeroUI Native 컴포넌트나 그것을 감싼 저장소 공용 컴포넌트로 만든다. 버튼은 공용 `Button`, 눌리지 않는 라벨 알약은 `Chip`, 누르는 작은 알약은 `Button`의 `sm` 크기, 목록은 `ListGroup`과 항목 사이 `Separator`, 펼치지 않는 카드는 `Card`, 펼침 카드는 `Accordion`의 표면 변형, 구분선은 `Separator`, 입력의 오류 문구는 `FieldError`를 쓴다. HeroUI `Chip`은 눌림 반응과 비활성 표현이 없으므로 누르는 자리에 쓰지 않는다.
- 목록 행의 눌림 반응은 HeroUI 문서대로 `PressableFeedback`으로 행을 감싸고 `onPress`를 그쪽에 두며 `ListGroup.Item`은 `disabled`로 둔다. 행의 버튼 역할은 감싼 쪽에 넘긴다.
- 아이콘만 있는 버튼은 저장소 공용 아이콘 버튼으로 만든다. `PressableFeedback`의 축소 반응만 쓰고, 비활성은 HeroUI의 `element-disabled` 유틸리티(투명도 0.5)로 표현한다. `PressableFeedback` 자체에는 비활성 표현이 없다.
- 원시 `Pressable`은 이 계약의 예외 목록에 이름과 이유가 적힌 자리에서만 쓴다. 새 자리에 필요하면 먼저 이 목록에 줄을 더하고 쓴다. 목록에 없는 `Pressable`은 UI 일관성 검토의 finding이다.
- HeroUI 컴포넌트가 주는 상태와 슬롯을 앱이 다시 그리지 않는다. 무효 상태는 `isInvalid`, 비활성은 컴포넌트의 `isDisabled`, 눌림 반응은 컴포넌트의 것을 쓴다. `opacity-40` 같은 자체 비활성 표현을 두지 않는다.
- 공용 컴포넌트가 HeroUI 기본값을 바꾸면 그 값과 이유를 해당 주제의 결정 계약에 적는다. 계약에 없는 재정의, 특히 `!important`로 HeroUI 클래스를 덮는 것은 두지 않는다.
- HeroUI 컴포넌트의 기본 모양을 앱 전체에서 바꾸려면 `apps/mobile/global.css`에서 해당 클래스를 한 번 재정의한다. 호출 지점마다 className으로 바꾸지 않는다.
- 크기, 둥글기, 여백, 비활성 투명도는 HeroUI 기본값을 그대로 쓴다. 인증 코드 칸도 HeroUI 기본 칸 크기와 왼쪽 정렬을 쓰고 화면 폭을 채우지 않는다.
- `apps/mobile/global.css`의 HeroUI 재정의는 다음 둘뿐이다. 버튼의 고정 높이를 최소 높이로 바꿔 큰 시스템 글자 크기에서 라벨이 자라게 하는 것과, 펼침 카드 트리거의 세로 정렬을 첫 줄 맞춤으로 바꿔 큰 글자에서 쉐브론이 첫 줄에 붙게 하는 것이다. 둘 다 [모바일 타이포그래피](mobile-typography.md)의 확대 규칙과 [표현 노트](expression-note.md)의 첫 줄 맞춤 규칙을 지키기 위한 것이다. 화면 코드에서 `!important`로 HeroUI 클래스를 덮지 않는다.
- 공용 `Button`의 선행 슬롯(진행 표시, 앞 아이콘)은 HeroUI가 주는 줄 안 슬롯을 쓴다. 절대 위치로 라벨 밖에 두지 않는다.

## 예외 목록

원시 `Pressable`을 쓰는 자리와 그 이유다. 각 자리의 동작은 링크한 계약이 소유한다.

- 사용자 말풍선의 길게 누르기: 말풍선은 버튼이 아니라 메시지라서 버튼 역할을 지우고 길게 누를 때만 메뉴를 연다. [모바일 채팅 메시지 동작](mobile-chat-message-actions.md).
- Google, Apple, 이메일 로그인 버튼: 제공자 브랜드 규칙이 모양과 색을 정한다. [모바일 작업 진행 표시](mobile-action-progress.md).
- 아바타 탭(홈, 설정, 프로필 편집): 이미지 자체가 컨트롤이다. [모바일 UI 렌더러 경계](mobile-ui-renderer-boundaries.md).
- 채팅의 보내기, 중지, 최신 메시지 버튼: Glass 플로팅 컨트롤 안의 44pt 원형 아이콘 버튼이다. HeroUI `Button`의 가장 작은 크기가 40pt 고정이라 만들 수 없다. 공용 아이콘 버튼 하나로 모은다. [모바일 AI 채팅 표현](mobile-ai-chat-rendering.md).
- 메시지 아래 아이콘 줄의 28pt 버튼: HeroUI `PressableFeedback`을 쓰며 하이라이트와 물결을 뺀다. [모바일 채팅 메시지 동작](mobile-chat-message-actions.md).
- 대화 중 배울 표현의 접힌 한 줄과 펼친 카드, 카드의 접기 쉐브론: 한 줄이 그 자리에서 카드로 바뀌는 구조라 HeroUI `Accordion`으로 표현할 수 없다. [모바일 대화 중 교정](mobile-episode-correction.md).
- 사용자 말풍선 아래 표현 확인 실패 줄의 재시도 아이콘: 표시 크기는 역할별 기준값, 터치 영역은 그와 따로 정한다. [모바일 작업 진행 표시](mobile-action-progress.md)와 [모바일 대화 중 교정](mobile-episode-correction.md).
- 탐색의 필터 칩: HeroUI `TagGroup` 기본 패턴이다. [모바일 스토리 탐색](mobile-story-browsing.md).

## 경계

- Settings와 시스템 폼은 `@expo/ui`가 소유하므로 이 계약의 대상이 아니다. [모바일 UI 렌더러 경계](mobile-ui-renderer-boundaries.md)를 따른다.
- 진행 표시, 토스트, 아이콘은 각각의 계약이 HeroUI 대신 다른 수단을 정했다. 그 계약이 우선한다.
- 텍스트 역할은 [모바일 타이포그래피](mobile-typography.md)가 정한다.
- 기억해 둘 표현과 표현 노트의 카드, 회차 카드와 스토리 행, 화 행, 추천 아이디 행은 이 계약을 쓰기 전에 만들어졌고 아직 원시 `Pressable`이다. 예외가 아니라 되돌릴 대상이다. 2026-09-13 시안에서 사용자가 HeroUI 기본 모양(`Accordion` 표면 변형, `ListGroup`)으로 가기로 정했고, 옮기는 중에 HeroUI가 줄 수 없는 동작이 확인되면 그때 예외 목록에 이유와 함께 넣는다.
- 펼침 카드에서 HeroUI `Accordion`이 주지 않는 것은 그 카드의 계약이 소유한 채로 남는다. 카드 밖 아래의 아이콘 줄, 손으로 조립하는 접근성 이름, 옆으로 민 뒤 뗀 것을 누름으로 치지 않는 판정이 그것이다. [표현 노트](expression-note.md).

## 이유

원시 `Pressable`은 빈 도화지라서 눌림 반응, 비활성 표현, 접근성 역할, 테마 색을 자리마다 새로 적어야 한다. 감사 시점에 원시 `Pressable`이 21곳, HeroUI `PressableFeedback`이 1곳이었고, 카드 표면의 둥글기와 여백 조합이 11가지였다. 결정 계약이 동작만 정하고 수단을 정하지 않은 자리에서 이런 갈래가 생겼다. 수단까지 적은 자리(스피너, 토스트, 아이콘, 설정 화면, Glass 입력창)는 일관됐다.

예외를 없애는 것이 아니라 예외의 자리를 계약이 아는 것이 목표다. 그래야 새 화면이 같은 자리를 만들 때 같은 답이 나오고, 검토가 근거 없는 우회와 의도한 예외를 구분할 수 있다.

## 재검토 조건

- HeroUI Native가 필요한 컴포넌트를 없애거나, 눌림 반응과 접근성 동작이 플랫폼 관례에서 벗어난다.
- 예외 목록이 기본값보다 길어진다.

## 계속 제외하는 대안

- 화면마다 `Pressable`로 직접 만들기: 같은 역할이 화면마다 다르게 보이고 반응한다. 감사에서 확인된 현재 상태다.
- 모든 컨트롤을 앱 자체 컴포넌트 라이브러리로 감싸기: HeroUI와 두 체계가 생기고 HeroUI 갱신을 따라가지 못한다. 공용 컴포넌트는 HeroUI가 못 주는 상태(`isPending`)나 크기(28pt, 44pt 아이콘 버튼)를 더할 때만 만든다.

- 카드, 목록 행, 칩, 인증 코드 칸의 모양을 앱이 조정하기: 2026-09-13 시안에서 지금 모습(A), HeroUI 기본(B), 본문 행간만 재정의(C)를 비교했고 사용자가 가장 HeroUI다운 B를 골랐다. 한국어 화면에서 기본값이 실제로 문제를 만들면 global.css 한 곳에서 재정의한다.

## 보존할 근거

- 2026-09-13 감사 기준 HeroUI Native 1.0.8 컴포넌트 44종 중 11종을 쓰고 있었다. 근거 없는 우회는 12곳이었다. 다크 모드에서 앱이 `--surface`만 바꾸고 HeroUI가 리터럴로 둔 `--overlay`와 `--field-background`는 두어 카드와 메뉴·입력 필드의 표면 색이 갈렸다.
- HeroUI `Button`의 크기별 높이는 sm 40pt, md 48pt, lg 56pt로 고정이다(`styles/components/button.css`). 아이콘 전용 28pt와 44pt는 만들 수 없다.
