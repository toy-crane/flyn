# 채팅 움직임 검증

## 2026-09-07 대기 표시 변경

`31d60e1` 이후 점 세 개 대기 표시를 바꾼 작업 트리를 확인했다.
전송 순서, 최신 메시지 이동과 답변 완료 높이는 아직 변경하거나 검증하지 않았다.

- `waiting-answer.test.tsx`, `chat-panel.test.tsx`: 85개 통과.
  기존 문구 제거, 접근성 상태 하나, 300ms 이전 생략과 첫 본문 도착 뒤 제거를 확인했다.
- 모바일 타입 검사와 바뀐 코드 네 파일의 Ultracite 검사, `git diff --check` 통과.
- 루트 `bun run dev ios android`로 slot 5의 공용 Development Build를 실행했다.
  API 3951, Metro 8132이며 두 번들 모두 현재 worktree 경로에서 만들어졌다.
- iOS: `flyn-slot-5`, UDID `C550D61C-4C65-48D9-8BE7-D12BBF8C0B52`.
- Android: `flyn_dev_1`, serial `emulator-5564`.
- 각 기기에서 로컬 이메일 코드로 새 계정을 만들고 홈의 새 대화로 들어갔다.
  일반 채팅에 질문을 보내 실제 서버 답변을 받았다. 두 플랫폼에서 점의 위치와 크기가
  고정된 채 차례로 밝아지고, 첫 본문이 도착하면 점 말풍선이 없어지는 것을 녹화로 확인했다.
  [iOS 대기 화면](evidence/ios-waiting.png), [Android 대기 화면](evidence/android-waiting.png).
- Android의 요청 직후 접근성 목록에는 `답변을 준비하고 있어요.`가 한 번 나왔다.
  첫 본문 뒤 목록에는 이 상태가 없었다. TalkBack 음성 출력까지 확인한 것은 아니다.
- 확인 구간의 Metro 로그와 앱 화면에 번들 오류나 RedBox는 없었다.

원본 영상은 로컬 `/private/tmp/flyn-motion-evidence/ios-waiting.mp4`와
`/private/tmp/flyn-motion-evidence/android-waiting.mp4`에 있다. iOS 18.4초와
Android 24초 장면을 위 화면에 남겼다.

동작 줄이기, 라이트·다크와 글자 확대, VoiceOver·TalkBack 실제 읽기, 중지·실패,
에피소드와 AI에게 물어보기, 전송과 최신 메시지 이동의 전체 수용 기준은 아직 확인하지
않았다. 이 기록은 명세 전체의 완료 근거가 아니다.
