# AI 채팅 스트리밍 스크롤 안정화

## 상태

- 이 문서는 확정된 구현 스펙이다.
- 구현은 한 작업 세션에서 끝낸다.
- 부모 스펙은 [AI 채팅](../ai-chat/spec.md)이다.
- 생성 중 스피너와 중단 동작은
  [AI 채팅 생성 상태 피드백](../ai-chat-generation-feedback/spec.md)을 따른다.
- 부모 스펙의 “위쪽 기록을 읽을 때는 위치를 빼앗지 않고, 맨 아래에 있을 때만
  스트림을 따라간다”는 원칙을 유지한다. 이 문서는 그 원칙의 구체적인 화면
  동작과 완료 조건을 정한다.

## 목적

메시지를 보내거나 AI 응답이 스트리밍될 때 채팅 화면 전체가 크게 밀리고
버벅이는 것처럼 보이는 현상을 없앤다. 사용자가 맨 아래를 보고 있을 때는 새
내용을 계속 볼 수 있고, 과거 메시지를 읽는 중에는 현재 위치를 유지한다.

이번 작업은 정상적인 스크롤 이동을 없애는 것이 아니다. 긴 응답을 맨 아래에서
따라가면 이전 메시지가 위로 이동할 수 있다. 해결 대상은 콘텐츠 크기가 바뀔
때마다 스크롤 애니메이션이 다시 시작되며 생기는 갑작스러운 점프, 위치 보정
충돌과 첫 메시지의 추가 레이아웃 변화다.

## 확인된 현재 문제

iPhone 17 / iOS 26.5 시뮬레이터에서 키보드를 연 채 메시지를 보낸 전후를
확인했다.

- native header, composer와 keyboard의 바깥 frame은 유지됐다.
- 크게 변한 것은 화면 전체의 frame이 아니라 메시지 목록의 content offset이었다.
- 현재 목록은 content size가 바뀔 때마다 animated scroll-to-end를 다시 요청한다.
- 동시에 목록 자체의 visible-content 위치 보정도 켜져 있어 두 동작이 같은
  scroll offset을 제어한다.
- 스트리밍 중에는 응답 높이가 계속 바뀌므로 애니메이션이 반복해서 다시
  시작된다.
- 첫 메시지는 목록 안의 빈 상태가 메시지로 교체되면서 추가적인 높이 변화를
  만든다.
- 맨 아래로 이동하는 버튼은 채팅 영역 오른쪽에 있어 기대한 중앙 위치와 다르다.

따라서 이 현상은 keyboard가 화면 전체를 다시 배치하는 문제로 다루지 않는다.
메시지 목록의 스크롤 소유권과 빈 상태 전환 문제로 다룬다.

## 기준 동작

Vercel AI SDK의 `useChat`은 메시지와 요청 상태를 제공하지만 scroll이나 layout을
소유하지 않는다. Vercel의 UI 레이어는 별도의 bottom-stick 동작으로 이를
해결한다.

- [AI Elements `Conversation`](https://elements.ai-sdk.dev/components/conversation)는
  맨 아래 상태, 자동 추적과 복귀 버튼을 하나의 scroll context가 소유한다.
- [Vercel Chatbot의 scroll hook](https://github.com/vercel/chatbot/blob/main/hooks/use-scroll-to-bottom.tsx)은
  사용자가 맨 아래에 있고 직접 스크롤하는 중이 아닐 때만 콘텐츠 변화를
  따라간다. 스트리밍에 따른 자동 이동은 즉시 처리하고, 사용자가 복귀 버튼을
  누를 때만 부드럽게 이동한다.
- 설치된 [Legend List](https://github.com/LegendApp/legend-list)는 맨 아래 근처의
  자동 추적과 visible-content 위치 보정을 각각 제공한다.

Flyn은 이 가운데 Vercel Chatbot의 사용자 동작을 기준으로 삼되, React Native
목록에서는 같은 scroll offset을 자동·수동 로직이 동시에 소유하지 않게 한다.

## 스크롤 상태와 동작

| 사용자 상태 | 새 메시지 또는 스트리밍 높이 변화 | 맨 아래 버튼 |
| --- | --- | --- |
| 맨 아래 또는 72pt 이내 | 새 tail을 계속 보여 주되 별도 smooth animation을 시작하지 않는다 | 숨김 |
| 맨 아래에서 72pt 초과해 위를 읽는 중 | 현재 viewport를 유지하고 새 내용이 위치를 빼앗지 않는다 | 표시 |
| 위를 읽는 중 사용자가 버튼을 누름 | 맨 아래까지 한 번 부드럽게 이동하고 이후 자동 추적 상태로 복귀한다 | 도착하면 숨김 |
| 자동 이동 중 사용자가 위로 스크롤함 | 자동 이동을 중단하고 사용자의 위치를 우선한다 | 표시 |
| 빈 채팅에서 첫 메시지를 보냄 | 빈 상태 때문에 별도 content-height jump를 만들지 않고 일반 전송과 같은 규칙을 쓴다 | 상태에 따라 표시 또는 숨김 |

- 자동 추적 여부는 사용자가 맨 아래 근처에 있는지로만 정한다. AI SDK의
  `submitted`, `streaming` 같은 요청 상태가 scroll lock을 강제로 켜지 않는다.
- 스트리밍 중 콘텐츠가 여러 번 커져도 매 변화마다 새 smooth animation을
  시작하지 않는다.
- 자동 추적과 과거 메시지 위치 보정은 하나의 일관된 목록 정책이 소유한다.
  별도의 content-size callback이 같은 offset에 animated scroll을 반복 요청하지
  않는다.
- 사용자가 위쪽에서 메시지를 보내더라도 현재 위치를 강제로 빼앗지 않는다.
  새 메시지를 보려면 중앙의 맨 아래 버튼으로 이동할 수 있다.
- 맨 아래 판정은 현재 사용 중인 72pt 허용 범위를 유지한다. 실제 기기에서
  버튼이 지나치게 깜빡이는 증거가 있을 때만 조정한다.

## 맨 아래 버튼

- 버튼은 메시지 목록의 가로 중앙에 둔다.
- 세로 위치는 composer 바로 위의 현재 안전 간격을 유지한다.
- 사용자가 맨 아래에서 벗어났을 때만 표시한다.
- 탭하면 맨 아래로 한 번 부드럽게 이동한다.
- 이동이 실제로 끝나 맨 아래 상태가 되면 버튼을 숨긴다.
- 44pt 이상의 hit target, button role과 `맨 아래로` accessibility label을
  유지한다.
- 기존 앱 테마와 SF Symbol을 유지하며 버튼의 모양을 재설계하지 않는다.

## 빈 상태

- `무엇이든 물어보세요` 안내는 빈 채팅의 메시지 viewport 중앙에 계속 보인다.
- 빈 상태는 메시지 목록 content의 높이를 만들거나 첫 메시지의 scroll offset
  계산에 참여하지 않는다.
- 첫 메시지가 생기면 같은 자리에서 안내만 사라지고 header, composer와 keyboard
  frame은 변하지 않는다.
- 빈 상태는 메시지나 composer의 터치 동작을 가로막지 않는다.

## 유지할 경계

- 채팅 상세는 계속 RN 화면이며 Legend List와 현재 keyboard controller 경계를
  유지한다.
- AI SDK `useChat`, `expo/fetch`, 32ms message update throttle과 서버 스트리밍
  형식은 유지한다.
- 사용자 메시지의 optimistic 표시, AI 응답의 streaming store와 완료·중단 저장
  규칙은 유지한다.
- composer의 위치, 크기, Liquid Glass/material 표현과 keyboard interactive
  dismissal은 유지한다.
- 메시지 말풍선, Markdown, 생성 스피너, 오류와 재시도 표현은 유지한다.

## 제외 범위

- AI SDK, Legend List, React Native 또는 keyboard controller 패키지 업데이트
- Legend List를 FlatList나 다른 가상 목록으로 교체
- keyboard avoidance 또는 interactive dismissal 재설계
- 메시지 렌더링·Markdown 성능 최적화
- 응답 스트리밍 빈도와 AI 모델 변경
- 채팅방 목록의 pull-to-refresh spinner 동작
- composer, 말풍선, header와 native navigation의 시각 재설계
- 사용자가 고르는 자동 스크롤 설정

## 완료 조건

- 키보드를 연 상태에서 첫 메시지와 후속 메시지를 보낼 때 header, composer와
  keyboard frame이 유지되고 메시지 목록이 크게 튀지 않는다.
- 맨 아래에서 짧은 응답과 화면보다 긴 응답을 받을 때 tail을 계속 볼 수 있고,
  스트리밍 중 smooth animation이 반복해서 재시작되지 않는다.
- 스트리밍 중 위로 스크롤하면 이후 chunk가 와도 viewport를 빼앗지 않는다.
- 맨 아래에서 벗어나면 composer 위 가로 중앙에 버튼이 나타난다.
- 중앙 버튼을 누르면 맨 아래로 부드럽게 이동하고 도착 후 버튼이 사라진다.
- 빈 채팅의 안내는 중앙에 보이지만 첫 메시지가 생길 때 추가적인 content-height
  jump를 만들지 않는다.
- keyboard를 닫은 상태에서도 같은 자동 추적과 버튼 동작을 유지한다.
- 자동 테스트는 맨 아래 자동 추적, 위쪽 viewport 보존, 수동 smooth 이동,
  버튼 중앙 배치와 빈 상태 경계를 고정한다.
- iOS 시뮬레이터에서 첫 메시지, 후속 메시지, 긴 스트리밍, 스트리밍 중 위로
  스크롤, 중앙 버튼 복귀를 직접 확인하고 `bun run check`가 통과한다.

## 가정과 남은 위험

- 맨 아래에서 긴 응답을 따라갈 때 기존 메시지가 위로 이동하는 것은 의도된
  동작이다. viewport를 완전히 고정해 응답을 화면 아래에서만 자라게 하는 방식은
  이번 범위에 포함하지 않는다.
- Legend List의 가상화된 item 높이 추정이 실제 높이로 수렴하면서 작은 offset
  보정이 생길 수 있다. 반복 애니메이션은 없더라도 눈에 띄는 점프가 남는다면
  item 측정과 streaming item 갱신 경계를 별도로 조사한다.
- “화면 전체 layout shift”는 이번 재현에서 메시지 목록의 offset 변화로
  확인됐다. 이후 header나 composer frame 자체가 변하는 별도 재현이 나오면
  keyboard/layout 문제로 분리한다.
