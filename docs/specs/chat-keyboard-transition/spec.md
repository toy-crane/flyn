# 채팅 키보드 전환

## 상태

- 이 문서는 확정된 구현 스펙이다.
- 구현은 한 작업 세션에서 끝낸다.
- 부모 스펙은 [AI 채팅](../ai-chat/spec.md)이다.
- 메시지 목록의 자동 추적과 과거 대화 위치 보존은
  [AI 채팅 스트리밍 스크롤 안정화](../ai-chat-scroll-stability/spec.md)를
  따른다.
- 기존 스크롤 안정화 스펙이 제외했던 keyboard avoidance 재설계 가운데 채팅
  상세 화면의 키보드 전환만 이번 작업에서 다룬다. 나머지 제외 범위는 유지한다.

## 목적

채팅방 맨 아래에서 키보드를 열면 composer만 떠오르고 마지막 메시지가 가려지는
느낌을 없앤다. 맨 아래에서는 composer와 대화의 tail이 키보드와 함께 자연스럽게
올라가 마지막 메시지를 계속 보여 준다.

과거 대화를 읽는 중에는 반대로 키보드가 열려도 읽던 위치를 빼앗지 않는다.
키보드 전환은 메시지 목록의 기존 스크롤 소유권과 협력해야 하며, 별도의 강제
스크롤이나 두 번째 애니메이션을 만들지 않는다.

## 확인된 현재 문제

iPhone 17 / iOS 26.5 시뮬레이터에서 키보드를 닫은 상태로 채팅방 맨 아래를 본
뒤 composer를 탭해 키보드를 열었다.

- 키보드를 닫았을 때 보이던 마지막 사용자 메시지가 키보드를 열면 viewport
  아래로 밀려 보이지 않는다.
- composer는 키보드 위로 이동하지만 메시지 목록의 tail은 같은 전환을 함께
  따르지 않는다.
- 현재 채팅 상세는 React Native `KeyboardAvoidingView`가 목록과 composer를
  감싸고 있다. 이 경계는 사용 가능한 높이를 바꾸지만 목록의 맨 아래 상태와
  연동되지 않는다.

따라서 composer 위치만 조정하는 문제가 아니라, 키보드 frame과 목록의 tail
위치를 같은 정책으로 연결하는 문제로 다룬다.

## 확정 동작

| 시작 상태 | 키보드가 열릴 때 | 키보드가 닫힐 때 |
| --- | --- | --- |
| 맨 아래 또는 72pt 이내 | composer가 키보드에 붙어 올라가고 대화의 tail도 함께 올라간다. 마지막 메시지는 계속 보인다. | composer와 tail이 키보드를 따라 원래 위치로 돌아간다. 추가 offset을 남기지 않는다. |
| 맨 아래에서 72pt 초과해 과거 대화를 읽는 중 | 현재 읽던 메시지와 viewport 위치를 유지한다. 키보드를 열었다는 이유로 tail로 이동하지 않는다. | 읽던 위치를 유지한다. |
| 빈 채팅 또는 한 화면보다 짧은 채팅 | composer는 키보드에 붙고, 빈 안내나 짧은 대화는 남은 메시지 viewport 안에서 기존 정렬을 유지한다. | 키보드를 열기 전 배치로 돌아간다. |

- 맨 아래 판정은 기존 72pt 허용 범위를 공유한다. 키보드 전환만을 위한 두 번째
  맨 아래 상태를 만들지 않는다.
- 키보드를 아래로 드래그해 닫는 동안 composer와 메시지 viewport는 같은 keyboard
  frame을 연속해서 따른다. 전환 도중 점프하거나 서로 떨어지지 않는다.
- composer가 여러 줄로 커질 때도 실제 composer 높이가 목록의 아래 inset에
  반영되어 마지막 메시지를 가리지 않는다.
- 과거 대화를 읽는 동안 키보드를 열면 기존 맨 아래 버튼은 계속 표시된다.
  버튼을 눌렀을 때만 tail로 한 번 부드럽게 이동한다.
- 스트리밍 중에도 키보드 전환이 기존 자동 추적 정책을 덮어쓰지 않는다. 맨
  아래에서는 새 tail을 계속 보여 주고, 위를 읽는 중에는 viewport를 유지한다.

## 선택한 경계

- 채팅 상세의 일반 React Native `KeyboardAvoidingView` 경계는 사용하지 않는다.
- 설치된 Legend List와 `react-native-keyboard-controller`가 제공하는 채팅 전용
  keyboard-aware 목록 경계를 사용한다.
- 목록은 `KeyboardAwareLegendList`, composer는 `KeyboardStickyView`, 실제
  composer 높이와 목록의 아래 inset 연결은 `useKeyboardChatComposerInset`이
  소유한다.
- 목록의 keyboard lift 정책은 `whenAtEnd`로 고정한다. 맨 아래일 때만 tail을
  키보드와 함께 올리고, 과거 대화를 읽는 중에는 현재 위치를 보존하기 위해서다.
- keyboard frame을 따라가는 추가 수동 애니메이션이나 키보드 이벤트마다
  `scrollToEnd`를 호출하는 로직은 두지 않는다.
- 현재 설치 버전인 Legend List 3.3.3과
  `react-native-keyboard-controller` 1.21.9 안에서 구현한다.

공식 근거:

- [`react-native-keyboard-controller` 채팅 앱 가이드](https://kirillzyusko.github.io/react-native-keyboard-controller/docs/1.21.0/guides/building-chat-app)
- [Legend List의 keyboard-aware 목록 연동](https://legendapp.com/open-source/list/v3/react-native/keyboard-and-animated/)
- [`react-native-keyboard-controller` 1.21.0 릴리스](https://github.com/kirillzyusko/react-native-keyboard-controller/releases/tag/1.21.0)

## 조사 결과와 선택 이유

공식 연동을 현재 채팅 구조에 적용한 일회성 native spike에서 두 정책을 비교했다.
spike 코드는 제품 코드에 남기지 않았다.

- 맨 아래에서 `whenAtEnd`를 사용하면 키보드가 열린 뒤에도 마지막 메시지가
  보였고 대화가 composer와 함께 올라갔다.
- 과거 대화를 읽는 상태에서 `whenAtEnd`는 첫 visible item을 그대로 유지했다.
- 같은 상태에서 `always`는 첫 visible item을 1번에서 13번으로 바꿔 읽던 위치를
  밀었다.

따라서 “맨 아래에서는 함께 올라가고, 과거 대화를 읽는 중에는 읽던 위치를
유지한다”는 확정 의도를 `whenAtEnd`가 직접 만족한다.

## 유지할 경계

- AI SDK `useChat`, `expo/fetch`, 32ms message update throttle과 서버 스트리밍
  형식은 유지한다.
- 사용자 메시지의 optimistic 표시, AI 응답의 streaming store와 완료·중단 저장
  규칙은 유지한다.
- Legend List가 소유하는 맨 아래 자동 추적, visible-content 위치 보존과 72pt
  판정은 유지한다.
- 키보드의 interactive dismissal과 composer의 여러 줄 입력은 유지한다.
- composer의 위치 관계를 제외한 크기, Liquid Glass/material 표현과 입력 동작은
  유지한다.
- 메시지 말풍선, Markdown, 생성 스피너, 오류·재시도, 빈 상태와 맨 아래 버튼의
  시각 표현은 유지한다.
- native header와 navigation 구조는 유지한다.

## 제외 범위

- AI SDK, Legend List, React Native 또는 keyboard controller 패키지 업데이트
- Legend List를 FlatList나 다른 가상 목록으로 교체
- Android와 web 대응
- 메시지 렌더링·Markdown 성능 최적화
- 응답 스트리밍 빈도와 AI 모델 변경
- composer, 말풍선, header와 native navigation의 시각 재설계
- anchor-to-top 배치와 `anchoredEndSpace` 도입
- 사용자가 고르는 자동 스크롤 설정

## 완료 조건

- iPhone 17 / iOS 26.5에서 채팅방 맨 아래에 보이던 마지막 메시지가 키보드를
  연 뒤에도 보인다.
- 키보드를 열고 닫을 때 composer와 대화 tail이 같은 frame을 자연스럽게
  따르며, 전환 전후에 불필요한 offset이 남지 않는다.
- 72pt보다 위에서 과거 대화를 읽다가 키보드를 열고 닫아도 같은 메시지와 읽던
  viewport 위치가 유지된다.
- 과거 대화를 읽는 중 키보드를 열어도 맨 아래 버튼이 유지되고, 버튼을 누를
  때만 tail로 부드럽게 이동한다.
- 키보드를 아래로 드래그해 interactive dismissal할 때 composer와 메시지
  viewport 사이에 틈, 순간 점프 또는 이중 스크롤이 없다.
- composer를 한 줄에서 허용된 최대 줄 수까지 키우고 다시 줄여도 마지막
  메시지가 가려지지 않으며 과거 대화의 읽던 위치를 빼앗지 않는다.
- 빈 채팅, 한 화면보다 짧은 채팅과 긴 채팅에서 키보드를 열고 닫아도 각각의
  기존 정렬과 스크롤 정책이 유지된다.
- 키보드가 열린 상태에서 짧은 스트리밍과 화면보다 긴 스트리밍을 받아도
  [스크롤 안정화 스펙](../ai-chat-scroll-stability/spec.md)의 tail 추적과 과거
  viewport 보존이 유지된다.
- 자동 테스트는 맨 아래에서의 keyboard lift, 과거 viewport 보존, 여러 줄
  composer inset, 맨 아래 버튼 복귀와 72pt 경계를 고정한다.
- iOS 시뮬레이터에서 위 상태를 직접 확인하고 `bun run check`가 통과한다.

## 가정과 남은 위험

- 채팅 상세의 safe-area와 native header 높이는 현재 구조가 계속 소유한다.
  실제 기기에서 keyboard offset이 한 번 더 적용되는 증거가 나오면 해당 frame
  계산만 조정한다.
- keyboard-aware 목록의 inset 갱신과 composer 높이 측정 시점이 한 frame
  어긋날 수 있다. 여러 줄 전환에서만 점프가 재현되면 두 값의 동기화를 별도로
  조사한다.
- 키보드가 열린 상태의 맨 아래 버튼은 실제 viewport 기준으로
  `scrollToEnd`가 도착하는지 직접 검증해야 한다. 버튼이 키보드 이전 높이를
  기준으로 멈추면 keyboard-aware 목록이 보고하는 현재 inset을 기준으로
  복귀 동작을 맞춘다.
- Legend List의
  [`anchoredEndSpace`와 여러 줄 입력 관련 공개 이슈](https://github.com/LegendApp/legend-list/issues/451)는
  이번에 선택하지 않은 anchor-to-top 배치에서 발생한다. 해당 배치를 나중에
  도입하면 이 결정을 다시 검토한다.
