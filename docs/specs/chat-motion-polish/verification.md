# 채팅 움직임 검증

## 현재 확인 결과

실행 코드는 `78cbb1e` 기준이다. 아래 기록은 2026-09-07의 iOS Simulator와
Android Emulator에서 얻었다. VoiceOver 실제 읽기는 확인하지 않았으며, 2026-09-07
사용자 요청으로 이번 완료 조건에서 제외했다. 이전 단락의 미확인 항목은 이 절의
최신 결과와 구분한다. Codex 전체 리뷰 1회에서 나온 두 문제를 수정하고 관련 검증을
다시 통과했다. 승인된 범위의 구현과 검증을 완료했다.

- 루트 `bun run check`, `bun run check-types`, `bun run test`를 통과했다.
  모바일 73개 suite의 537개 테스트, API 98개, 개발 스크립트 176개가 통과했다.
- iOS·Android export와 Astro build를 통과했다. 단순 `bun run build`는 공개 환경
  변수 누락으로 실패했다. `scripts/dev/environment.ts`의 `parseEnvFile`과
  `buildMobileEnvironment`로 실제 `apps/mobile/.env.local` 및 slot 5 포트를 읽고,
  그 환경에서 `bunx turbo run build --env-mode=loose`를 실행했다. 설정 검사나
  환경 검증을 생략하지 않았다. 원본 로그는 `/private/tmp/flyn-motion-evidence/`의
  `review-final-check.log`, `review-final-check-types.log`, `review-final-test.log`,
  `review-build.log`에 있다.
- `git diff --check`를 통과했다. 거리와 본문 렌더 횟수의 임시 계측 코드는 제거했다.

표의 기존 기기 검증에서 리뷰 수정의 영향을 받는 스크롤과 제품 흐름은 아래
"리뷰 후 다시 확인한 범위"에서 다시 확인했다.

### 실제 화면에서 확인한 범위

| 항목 | iOS | Android |
| --- | --- | --- |
| 일반 채팅 전송, 대기, 첫 본문, 완료 | 실제 응답과 녹화 | 실제 응답과 녹화 |
| 영어 입력, 교정, 한국어 AI 도움, 에피소드 마무리와 홈 예고 | 새 3·4화 진행 | 새 3·4화 진행 |
| AI에게 물어보기의 네이티브 Markdown, 복사·다시 받기 | 실제 응답과 메뉴 | 실제 응답과 메뉴 |
| 수정 전송, 중지, 전송 중 앱 이탈·복귀 | 실제 조작 | 실제 조작 |
| 완료된 3화 읽기 전용 대화 | 입력·대기 없음 | 입력·대기 없음 |
| 지난 본문 시작·완료 렌더 횟수 | 대상 4개, 0회 | 대상 13개, 0회 |
| 밝은 화면·어두운 화면·글자 확대 | 화면 확인 | 화면 확인 |
| 동작 줄이기의 고정된 세 점 | 설정 후 재실행·녹화 | 설정 후 재실행·녹화 |
| 화면 읽기 | 접근성 상태 확인, VoiceOver 실제 읽기 미확인 | TalkBack 실제 출력 확인 |

- 완료된 기록은 [iOS](evidence/ios-readonly.png),
  [Android](evidence/android-readonly.png)에서 입력창이나 새 대기 표시 없이 열렸다.
  새 4화에서도 마지막 발화와 지문을 마무리 카드 위에서 읽었고, 홈에 5화 예고가 남았다.
- 가까운 거리는 iOS 0.49화면, Android 0.57화면이었다. 먼 거리는 각각 6.34화면과
  4.63화면이었다. 실제 질문으로 긴 대화를 만들고 목록 공개 상태를 계측했다.
  [거리 값](evidence/latest-distances.json),
  [iOS 가까운 이동](evidence/ios-latest-near.mp4),
  [iOS 먼 이동](evidence/ios-latest-far.mp4),
  [Android 가까운 이동](evidence/android-latest-near.mp4),
  [Android 먼 이동](evidence/android-latest-far.mp4).
  먼 경우 마지막 한 화면으로 먼저 옮긴 뒤 끝으로 이동했고, 도착 후 버튼이 사라졌다.
- 최신 메시지 버튼을 누른 직후 직접 스크롤해 읽는 위치를 바꿨다. 자동으로 끝으로
  돌아가지 않았고, 이후 두 플랫폼에서 실제 키보드 입력과 닫기를 확인했다.
  iOS는 별도 CLI 호출 사이에 이동이 끝나는 첫 시도를 제외하고, 한 daemon 요청에서
  버튼 누르기와 드래그를 연달아 보냈다. [iOS 중단 녹화](evidence/ios-interrupt.mp4)의
  0.8~1.1초에서 끝으로 이동하는 동안 드래그가 시작되고, 읽던 위치와 버튼이 남았다.
  Android 원본은 `/private/tmp/flyn-motion-evidence/android-interrupt.mp4`에 있다.
  이동 중 취소와 늦은 완료 신호 무시 조건은 공개 목록 테스트로도 확인했다.
- 대기 중 이 worktree 소유의 API 3951 연결을 종료했다. 두 플랫폼에서 점이 사라지고
  오류 안내와 다시 시도하기가 나타났다. [iOS](evidence/ios-connection-error.png),
  [Android](evidence/android-connection-error.png). 루트 `bun run dev ios android`로
  API와 Metro를 복원했다. 다른 worktree와 공유 Supabase는 종료하거나 초기화하지 않았다.
- [iOS 글자 확대·다크](evidence/ios-dark-large-composer.png),
  [Android 글자 확대·다크](evidence/android-help-dark-large.png)를 확인했다.
  iOS의 여러 줄 입력창과 AI에게 물어보기 돌아가기 표시는 겹치지 않았다.
  Android도 [여러 줄](evidence/android-return-multiline.png)과
  [수정 중](evidence/android-return-edit.png)에 두 돌아가기 버튼이 겹치지 않았다.
  수정 중 AI 도움 돌아가기는 기존 정책대로 비활성 상태였다.
  [오류 상태](evidence/android-return-error.png)에서도 돌아가기 표시, 오류 안내와
  입력창이 분리됐다. 이 장면의 마지막 질문은 보이는 상태여서 최신 메시지 버튼은
  숨겨져 있었다. 모든 상태의 조합을 전부 확인했다는 뜻은 아니다.
- [iOS 동작 줄이기](evidence/ios-reduced-motion.mp4),
  [Android 동작 줄이기](evidence/android-reduced-motion.mp4)에서 점 세 개의 밝기가
  같고 변하지 않았다. iOS는 Reduce Motion, Android는 세 가지 animation scale을
  모두 끈 뒤 앱을 재실행했다. Android의 Reanimated는 transition animation scale을
  읽으므로 animator duration scale만 끈 첫 시도는 통과 근거에서 제외했다.
- TalkBack의 실제 서비스 연결과 TTS 출력을 확인했다. AI 도움 답변을 다시 받았을 때
  `답변을 준비하고 있어요.`를 하나의 상태로 출력했다. 세 점을 따로 읽지 않았다.
  [TalkBack 음성 내용 표시](evidence/android-talkback-waiting.png).
  UIAutomation이 TalkBack을 억제하는 도구 문제는
  [별도 기록](../../follow-ups/android-agent-device-suppresses-talkback.md)에 남겼다.
- Markdown 컴포넌트를 memo로 바꾸는 도중 Fast Refresh 상태에서 `Object is not a
  function`이 발생했다. 프로세스를 새로 실행한 뒤 실제 AI 도움 질문·답변·다시 받기를
  두 플랫폼에서 재현했고 같은 오류는 없었다. 기존 로그의 오류 줄을 지우지 않았다.

### 실행 환경과 확인 범위

검증 계정은 두 플랫폼 모두 앱 화면에서 로그아웃하고 같은 `agent-device` 세션을
닫았다. 라이트 모드, 기본 글자 크기, 동작 줄이기 해제와 Android Gboard를 복원했다.
TalkBack 서비스 선택 및 검증용 음성 내용 표시도 원래대로 돌렸다. slot 5의 API
`http://127.0.0.1:3951`과 Metro `http://127.0.0.1:8132`는 실행 중이다.
다시 앱을 여는 명령은 이 worktree 루트의 `bun run dev ios android`다.

- VoiceOver 실물 검증은 사용자 요청으로 생략한다. 개인 iPhone을 사용하지 않았다.
  접근성 트리에 상태 하나가 있다는 결과를 실제 VoiceOver 읽기로 대신하지 않는다.
- 처음에는 자동 승인 검토가 코드 전송 승인이 필요하다는 이유로 리뷰 실행을 거절했다.
  2026-09-07 사용자가 리뷰를 허용한 뒤 다시 실행했다. 설치된 CLI 0.147.0은 현재
  모델을 지원하지 않아 검토 전에 실패했다. 앱에 포함된 CLI 0.153.4의 읽기 전용
  Codex 기본 리뷰를 한 번 완료했다. 환경 파일과 인증정보는 검토 범위에서 제외했다.

### 전체 리뷰 결과

- 기준은 `9e0cb71`이며, `4060e86`까지의 전체 변경과 사용자가 승인한 VoiceOver
  검증 예외를 검토했다. 리뷰 명령은 `/Applications/ChatGPT.app/Contents/Resources/codex
  review -c 'sandbox_mode="read-only"' -`다. 검토 입력과 원본 출력은 로컬
  `/private/tmp/flyn-motion-evidence/review-context.txt`와
  `/private/tmp/flyn-motion-evidence/whole-diff-review-bundled.log`에 있다.
- P2: 직접 목록 끝까지 내려와도 자동 추적이 복구되지 않을 수 있었다.
  `onEndVisible(true)`는 실제 끝에 도착하기 전에 한 번만 올 수 있다. 공개 목록
  이벤트 테스트에서 이 신호 뒤 스크롤로 끝에 도달해도 버튼이 남는 것을 재현했다.
  현재 스크롤 이벤트의 좌표로도 끝 도달을 확인하도록 수정했다.
- P2: 먼 이동의 첫 단계에서 답변이 늘어나면 한 화면보다 길게 이동했다.
  620px 화면에서 목록 높이가 400px 늘어나는 테스트에서 이동 거리가 1,020px였다.
  출발점과 도착점에 같은 끝 좌표를 사용하도록 수정해 620px를 유지했다. 새 끝까지
  도착하지 않았으면 자동 추적을 켜거나 추가로 당기지 않고 버튼을 남긴다.
- 두 재현 테스트를 먼저 실패시킨 뒤 수정했다. ChatPanel 96개 테스트와 루트 전체
  검사, 타입 검사, 테스트, iOS·Android export 및 Astro build를 통과했다.
  수정 커밋은 `78cbb1e`다. 같은 변경을 두 번째 리뷰에 보내지 않았다.

### 리뷰 후 다시 확인한 범위

- 두 플랫폼에서 로컬 이메일 코드로 기존 검증 계정에 로그인했다. 새 5화에서 영어
  문장을 보내 교정과 실제 응답, 에피소드 마무리를 확인했다. 교정에서 AI에게 물어보기를
  열어 한국어 설명을 받았다. 첫 스토리를 마친 뒤 홈에는 다음 스토리 `출장 일주일`이
  나타났다. iOS 일반 채팅에서도 별도의 긴 질문과 실제 응답을 확인했다.
- 수동으로 끝에 도달한 iOS 좌표는 709px였다. 목록 길이 1,583px에서 높이 874px를
  뺀 실제 끝과 같았다. Android도 목록 길이 4,246px, 높이 844px의 끝 3,402px에
  도달했다. 두 플랫폼 모두 이전 위치에서 보이던 최신 메시지 버튼이 사라졌다.
  [iOS 수동 이동](evidence/review-ios-manual-end.mp4),
  [Android 수동 이동](evidence/review-android-manual-end.mp4),
  [iOS 도착 화면](evidence/review-ios-manual-end.png),
  [Android 도착 화면](evidence/review-android-manual-end.png).
- 긴 대화의 최신 메시지 이동은 iOS 630→3,434px(보이는 높이 656px), Android
  0→3,402px(보이는 높이 752px)에서 확인했다. 두 경우 모두 마지막 한 화면으로
  먼저 옮긴 뒤 남은 한 화면만 이동하고 도착 후 버튼을 숨겼다.
  [iOS 먼 이동](evidence/review-ios-latest-far.mp4),
  [Android 먼 이동](evidence/review-android-latest-far.mp4),
  [iOS 도착 화면](evidence/review-ios-latest-end.png).
  첫 이동을 기다리는 바로 그 사이에 본문이 400px 늘어나는 조건은 위의 결정적
  테스트로 재현했다. 기기 녹화에서 같은 순간의 증가까지 강제로 만들었다고 주장하지 않는다.
- 원본은 `/private/tmp/flyn-motion-evidence/`의 `review-ios-core.mp4`,
  `review-ios-far.mp4`와 `review-android-core*.mp4`다. Android 녹화는 도구가 여러
  파일로 나눴다. 발췌 영상은 원본의 정지 구간 표시 시간을 유지하고 해당 동작만 담았다.
  원본에 없는 중간 움직임 프레임은 만들지 않았다.
- iOS의 긴 여러 줄 `fill`이 Return 키를 전송해 실행 제한 시간을 넘긴 도구 문제는
  [별도 기록](../../follow-ups/ios-agent-device-multiline-fill-submits-chat.md)에 남겼다.
  해당 입력 시도를 정상 검증으로 세지 않았다. 이후 시스템 Paste 메뉴로 4,484자를
  한 초안에 넣고 전송했다. 임시 계측은 제거했으며 최종 코드로 전체 검사를 다시 통과했다.
- 두 계정 모두 앱에서 로그아웃했고 두 `agent-device` 세션을 닫았다. Android의
  테스트 입력기를 Gboard로 복원했다. 개인 iPhone과 VoiceOver는 사용하지 않았다.
- 이번 수정의 기기 검증 구간에는 Metro의 새 오류가 없었다. 로그에 남은
  `Object is not a function` 세 건은 위에 기록한 이전 Fast Refresh 오류다.

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

## 2026-09-07 전송과 답변 높이

- 키보드 닫힘, 입력창 배치, 질문 스크롤 순서로 바꿨다. 질문 자체의 진입 효과를 없앴다.
  사용자의 드래그, 앱 이탈, 완료 신호 누락에서 대기 작업을 취소한다.
- 네이티브 녹화에서 대기 표시 제거와 버튼 줄 추가가 질문을 다시 옮기는 현상을 발견했다.
  대기 표시를 답변 행에서 바꾸고, 본문이 나타나면 버튼 공간을 먼저 확보했다.
  질문 아래 빈 공간이 남아 있는 동안에는 목록 끝 자동 추적을 적용하지 않는다.
  마지막 본문 뒤 완료 상태 변경은 버튼의 표시와 조작 가능 여부만 바꾼다.
- ChatPanel의 89개 테스트를 통과했다. 닫힘 순서, 중단·앱 이탈·시간 초과, 빠른 답변이
  배치 중 끝을 당기지 않는 조건, 버튼 공간 유지와 에피소드의 공간 생략을 포함한다.
- iOS와 Android 일반 채팅에서 실제 답변을 받아 확인했다. Android는 Gboard가 열린
  상태에서 보냈다. agent-device 입력 도구의 테스트 IME는 실제 키보드를 숨기므로,
  그 상태의 전송은 열린 키보드 검증으로 세지 않았다.
- [iOS 녹화](evidence/ios-send-stable.mp4), [Android 녹화](evidence/android-send-stable.mp4).
  Android 영상 5~18초의 질문 위치는 대기, 본문과 완료 상태에서 같다. iOS도 질문 도착
  뒤 4.5~18초 위치를 유지했다. 플랫폼별 영상 크기가 달라 좌표 수치를 서로 비교하지 않았다.

여러 줄·수정 전송, 긴 답변과 중간 드래그, 최신 메시지 이동, 지난 본문 렌더 횟수,
접근성 설정과 제품 전체 흐름은 아직 남아 있다.

## 2026-09-07 최신 메시지 이동

- 끝까지 거리가 길면 헤더, 입력창과 키보드를 뺀 마지막 한 화면으로 먼저 옮기고
  남은 구간만 애니메이션으로 이동한다. 이동 중에는 자동 추적을 끈다.
- 이동 중 드래그, 앱 이탈과 시간 초과는 후속 작업을 취소하고 키보드 고정을 푼다.
  이동 중 답변이 길어져 아직 끝이 아니면 버튼을 남긴다.
- 버튼은 마운트를 유지한 채 입력창 뒤로 이동한다. 이동 중 크기와 Glass 투명도는
  일정하며, 완전히 내려간 뒤 표시를 끈다. 숨은 버튼은 터치와 접근성 목록에서 빠진다.
- ChatPanel 93개 테스트와 모바일 타입 검사를 통과했다. 실제 SharedValue처럼 참조를
  유지하도록 Jest 모킹을 보정했다. 기본 모킹은 매번 새 객체를 만들어 정리 효과를
  실행했으므로, 비동기 중단 검증에 실제와 다른 결과를 만들었다.
- 두 플랫폼에서 이전 대화로 직접 스크롤하고 최신 메시지 버튼으로 돌아왔다.
  [iOS 이동](evidence/ios-latest.mp4), [Android 이동](evidence/android-latest.mp4).
  도착 후 마지막 답변과 버튼 줄을 읽을 수 있고 최신 메시지 버튼의 잔상이 없다.
  영상은 원본의 해당 구간을 60fps로 저장했다. 원본은
  `/private/tmp/flyn-motion-evidence/{ios,android}-latest-run.mp4`에 있다.

이 기록만으로 반 화면·세 화면 거리 비교, 손으로 중단하는 순간, 여러 줄·오류·수정
입력창과 돌아가기 표시의 전체 조합을 검증했다고 보지 않는다. 최종 확인에 남긴다.

## 2026-09-07 지난 본문 렌더

- 사용자 본문, 장면 조각과 Markdown 본문에 각각 메모를 적용했다. 장면을 나누는
  계산도 해당 메시지가 바뀔 때만 한다. 메뉴와 버튼을 감싸는 영역은 유지한다.
- AI에게 물어보기의 콜백은 최신 값을 참조하되, 콜백 함수만 새로 생겼다고 선택 메뉴
  배열을 다시 만들지 않는다. 선택 메뉴를 실제로 숨기거나 보여 줄 때는 네이티브
  Markdown에 바뀐 메뉴를 전달한다. 이 경우 표시 조건이 바뀌므로 0회 대상과 구분한다.
- 테스트에서 내용과 선택 메뉴가 같은 지난 답변의 네이티브 렌더러 호출은 시작·완료
  합계 2회에서 0회로 줄었다. ChatPanel 94개 테스트와 모바일 타입 검사를 통과했다.
- iOS 첫 에피소드에서 영어 입력, 교정 카드와 마무리까지 실제 서버 응답을 받았다.
  React DevTools의 해당 앱 158개 commit 동안 시작 장면의 본문 네 개는 0회 렌더됐다.
  [계측 결과](evidence/ios-body-render-counts.json). 프로필에는 다른 연결 앱도 있어서
  사전에 확인한 해당 root와 본문 ID만 추렸다. 원본은 기록에 적힌 로컬 경로에 있다.
- Android에서도 같은 문장을 보내 교정 카드와 마무리를 확인했다. Android의 렌더
  횟수를 iOS 결과로 대신하지 않으며, 별도 계측은 최종 확인에 남긴다.

iOS 마무리 카드가 생긴 뒤 마지막 발화 일부가 가려지는 것을 확인했다. 목록 끝 이동을
바꾼 코드와 입력 영역 높이 갱신을 함께 조사한다. 제품 전체 검증은 아직 통과하지 않았다.

## 2026-09-07 마무리 전환 보정

- iOS에서 마무리 카드가 생긴 뒤 목록 높이가 53px 더 늘었다. 고정 좌표로 이동하면
  뒤늦게 측정한 마지막 본문이 카드에 가려졌다. 마무리 전환에서는 질문 배치를 취소하고
  키보드 보정을 잠시 고정한 뒤, 마지막 행의 측정을 기다리는 목록 끝 이동을 사용한다.
  최신 메시지 버튼은 승인한 고정 목표 이동을 유지한다.
- 변경 후 두 기기의 새 3화에서 영어로 요청하고 사건을 마무리했다. 마지막 발화와
  지문을 카드 위에서 모두 읽을 수 있다. [iOS](evidence/ios-closing-visible.png),
  [Android](evidence/android-closing-visible.png). 원본 녹화는 로컬
  `/private/tmp/flyn-motion-evidence/{ios,android}-closing-deferred.mp4`에 있다.
- ChatPanel 94개 테스트, 모바일 타입 검사와 변경 파일 Ultracite 검사를 통과했다.
- Android 앱 프로세스에서 별도로 계측한 지난 본문 13개도 답변 시작부터 완료까지
  0회 렌더됐다. [Android 계측 결과](evidence/android-body-render-counts.json).
  임시 렌더 계측 코드는 제거했다.

접근성 설정과 AI에게 물어보기 등 남은 수용 기준은 계속 확인한다.
