# 스트리밍 대화 화면의 상호작용

이 계약은 AI 응답이 스트리밍되는 모든 대화 표면에 적용된다. 현재는 롤플레잉
에피소드의 대화와 문장 질문이 여기 해당한다.

## Decisions

- 사용자 메시지는 즉시 오른쪽 중립 말풍선에 보이고, AI 응답은 전체 폭
  Markdown으로 스트리밍한다. composer는 텍스트만 받으며 최대 4,000자다.
- 대화 화면은 가상 목록, streaming store, keyboard controller와 composer가 한
  scroll 경계를 공유하는 RN surface다.

생성 상태는 다음처럼 표현한다.

| 상태 | 대화 영역 | composer action |
| --- | --- | --- |
| 입력 없는 `ready` | 추가 표시 없음 | 비활성 전송 |
| 입력 있는 `ready` | 추가 표시 없음 | 전송 |
| `submitted` | AI 응답 위치의 system spinner | 탭 가능한 중단 spinner |
| `streaming` | 실제 text 전까지 spinner, 이후 응답만 표시 | 중단 symbol |
| `error` | spinner 제거, 오류와 재시도 표시 | 입력 상태에 따른 전송 |

- `Thinking`, 정적 말줄임표, stream cursor와 최소 spinner 노출 시간을 만들지 않는다.
- 첫 내용 전에 중단하면 빈 AI 메시지를 남기지 않는다. 일부 내용 뒤 사용자가
  중단하면 받은 내용을 `stopped`로 보존하고 오류로 표시하지 않는다.
- 맨 아래 또는 72pt 이내에서는 새 tail을 즉시 따라가되 content 변화마다 smooth
  animation을 다시 시작하지 않는다. 위를 읽는 중에는 viewport를 유지한다.
- 맨 아래에서 벗어나면 composer 위 중앙에 `맨 아래로` action을 표시하고, 사용자가
  누를 때만 한 번 부드럽게 이동한다.
- 키보드는 `whenAtEnd` 정책으로 맨 아래의 composer와 tail을 함께 올린다. 과거를
  읽는 중에는 위치를 유지하고, 실제 composer 높이를 목록 inset에 반영한다.
- pull-to-refresh spinner는 사용자가 직접 당긴 요청만 나타낸다. background fetch,
  query invalidation과 화면 밖 refetch를 `refreshing`에 연결하지 않는다.
- 메시지에 곁들이는 표시는 말풍선 본문이 아니라 **고정 폭 열**에 둔다. 서버가
  늦게 보내는 값이 붙어도 layout이 흔들리지 않아야 한다.

## Why

AI 요청 상태, streaming 높이, keyboard frame과 수동 scroll이 같은 offset을 따로
제어하면 점프·반복 animation·읽던 위치 탈취가 생긴다. 사용자 의도에 따라 목록
하나가 scroll을 소유하고, system loader와 native keyboard 경계를 쓰면 현재
상태를 보이면서 layout을 유지할 수 있다.

## Boundaries

- header, back gesture와 toolbar는 native stack이 소유한다.
- icon-only action은 최소 44pt hit target과 한국어 accessibility label을 가진다.
- AI Markdown은 문단·제목·강조·목록·링크·code·표를 지원하지만 이미지와 syntax
  highlighting은 지원하지 않는다.
- 이 계약은 대화 표면의 공통 상호작용만 소유한다. 무엇이 대화 위에 얹히는지
  — 목표 바, 상황 카드, 말풍선 곁의 표시 — 는 해당 작업 단위 문서가 정한다.
- 메시지 persistence와 server 권한은 [데이터 접근 계약](hybrid-data-access.md),
  실패 재시도와 운영 한도는 [안정성 계약](ai-chat-reliability.md)이 소유한다.

## Reconsider when

첨부·offline queue·background generation·대화 pagination 또는 사용자 선택 scroll
정책이 제품 요구가 되면 해당 상호작용을 별도 결정한다.

## Still-rejected alternatives

- streaming chunk마다 animated `scrollToEnd`를 다시 시작하기.
- keyboard event마다 별도 강제 scroll이나 수동 frame animation 만들기.
- 과거를 읽는 중 새 메시지나 keyboard가 자동으로 tail로 이동시키기.
- query의 `isFetching`을 iOS `RefreshControl.refreshing`에 직접 연결하기.
- AI SDK 상태 이름만 보고 실제 text가 없는데 spinner를 제거하기.
- 늦게 도착하는 표시를 위해 말풍선 안 공간을 그때 늘리기.

## Evidence worth preserving

- content-size callback의 반복 smooth scroll과 visible-content 보정을 함께 켰을 때
  streaming 중 같은 offset을 두 로직이 제어해 점프가 생겼다.
- keyboard spike에서 `whenAtEnd`는 맨 아래 tail과 과거 viewport를 모두 보존했지만
  `always`는 과거의 첫 visible item을 바꿨다.
- 화면 밖 background refetch가 native `RefreshControl`을 켜면 뒤로 돌아왔을 때
  spinner만 고착됐다. 데이터 동기화와 수동 제스처 상태를 분리하면 사라졌다.
