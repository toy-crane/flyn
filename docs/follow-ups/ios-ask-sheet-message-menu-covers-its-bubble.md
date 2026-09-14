# iOS 물어보기 시트에서 메시지 메뉴가 누른 말풍선을 덮는다

**Symptom**: iOS의 `AI에게 물어보기` 시트에서 내 말풍선을 길게 누르면 `복사`와
`수정` 메뉴가 말풍선 아래가 아니라 말풍선 위에 겹쳐 뜬다. 짧은 질문이면 말풍선이
메뉴에 거의 다 가려져 무엇을 눌렀는지 보이지 않는다.

**Observed evidence**: 2026-09-14 iOS 시뮬레이터(`flyn-slot-1`)에서 에피소드 교정의
`AI에게 물어보기`를 열고 질문을 보낸 뒤 말풍선을 길게 눌렀다. 기본 크기의 어두운
화면에서 메뉴 윗변이 말풍선 윗변과 같은 높이에 섰고, 최대 글자
크기(`accessibility-extra-extra-extra-large`)의 밝은·어두운 화면에서도 메뉴가
말풍선 아래쪽 절반을 덮었다. heroui-native 1.0.8에서 찍은 heroui-alignment task 01
스크린샷도 같은 모습이라 1.0.9로 올려서 생긴 일이 아니다. Android 에뮬레이터는
100%와 200% 모두 메뉴가 말풍선 바로 아래에 선다. 메시지 메뉴는 이 시트에서만
열린다(에피소드와 스토리 만들기 대화는 `hasMessageActions={false}`).

**Suspected cause**: `apps/mobile/src/features/chat/ui/user-message.tsx`의 `Menu`는
`placement="bottom"`으로 트리거를 재서 자리를 잡는다. iOS에서만 어긋나므로, 시트
화면의 좌표와 메뉴가 그려지는 포털의 좌표가 시트 윗부분만큼 다를 가능성이 있다.
확인하지 않았다.

**What was tried**: 없음. heroui-alignment 범위 밖이라 원인을 좁히지 않았다.

**Proposed next step**: 시트 안에서 트리거가 잰 위치와 메뉴가 실제로 그려진 위치를
비교해 어긋난 값이 시트 윗부분 높이와 같은지 본다. 같으면 포털을 시트 안에 둘지,
재는 기준을 바꿀지 [모바일 채팅 메시지 동작](../decisions/mobile-chat-message-actions.md)과
[모바일 AI에게 물어보기](../decisions/mobile-ask-ai.md)를 기준으로 정한다. HeroUI
원본은 고치지 않는다.
