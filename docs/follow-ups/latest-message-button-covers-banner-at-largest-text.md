# 최대 글자 크기에서 최신 메시지 버튼이 상황 줄을 덮는다

**Symptom**: 에피소드 대화에서 답변 오류 줄(`답변을 받지 못했어요`와 `다시 시도하기`
알약)이 뜬 채 목록을 위로 올리면, 최신 메시지 버튼이 화면 위쪽의 상황 줄 위에
겹쳐 그려진다.

**Observed evidence**: 2026-09-14 iOS 시뮬레이터(`flyn-slot-1`)를
`accessibility-extra-extra-extra-large`로 두고 앱을 다시 시작한 뒤, API를 멈춰
답변 오류를 만들고 목록을 위로 올려 확인했다. 입력창 안내가 세 줄로 자라고 오류
줄이 두 줄이 되면서 입력 영역이 화면의 절반을 넘었고, 화살표 버튼이 상황 줄
글자 위에 섰다. 같은 화면을 Android 200%와 기본 크기에서 볼 때는 겹치지 않았다.

**Suspected cause**: `apps/mobile/src/features/chat/ui/chat-panel.tsx`의 최신
메시지 층이 `bottom: composerHeight`로 입력 영역 바로 위에 서므로, 입력 영역이
커질수록 층이 위로 밀려 상황 줄 자리까지 올라간다. 층이 올라갈 수 있는 위쪽
한계가 없다. heroui-alignment task 01(커밋 259225d)은 이 배치를 바꾸지 않았다.
오류 줄을 두 줄로 나눈 뒤에는 오히려 이전보다 덜 올라간다.

**What was tried**: 오류 줄이 한 글자 폭으로 눌리던 문제만 `flex-wrap`으로 고쳤다.
최신 메시지 층의 자리는 건드리지 않았다.

**Proposed next step**: 같은 조건(최대 글자 크기, 오류 줄, 위로 올린 목록)을 iOS에서
다시 만들고, 최신 메시지 층의 위쪽 끝을 상황 줄 아래로 제한할지
[모바일 채팅 스크롤](../decisions/mobile-chat-scrolling.md)과
[모바일 AI 채팅 표현](../decisions/mobile-ai-chat-rendering.md)을 기준으로 정한다.
