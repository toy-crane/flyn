# iOS 자동 입력이 줄바꿈에서 채팅을 전송함

## 증상

iOS 채팅 입력창에 줄바꿈을 포함한 긴 문장을 `agent-device fill`로 입력하면 첫 줄이
전송되고 나머지 글자는 다음 초안에 들어간다. 긴 입력은 XCTest 제한 시간도 넘겼다.

## 관찰 근거

2026-09-07 `agent-device` 0.20.5, slot 5 iOS Simulator에서 4,484자의 합성 질문을
입력했다. 도구는 `main thread execution timed out`을 반환했고, 실제 화면에는 첫 줄의
답변 대기 표시와 다음 문장의 일부가 입력창에 함께 보였다. 뒤이은 조회는 `RUNNER_BUSY`였다.
원본 화면은 `/private/tmp/flyn-motion-evidence/review-ios-long-entry.png`에 있다.

## 추정 원인

XCTest의 문자 입력이 줄바꿈을 Return 키로 전달한 것으로 보인다. 채팅 입력창은
`submitBehavior="submit"`을 쓰므로 Return 키가 전송을 실행한다.

## 시도한 방법

155자의 한 줄 입력은 정상 작동했다. 긴 여러 줄 입력 뒤에는 이 Simulator의 테스트
앱만 종료해 남은 자동 입력을 멈췄다. 앱 데이터와 로그인, 다른 기기는 초기화하지 않았다.
같은 세션에서 앱을 다시 열고 Simulator 클립보드와 시스템 Paste 메뉴를 사용했다.
4,484자와 연습 문장 35개가 하나의 초안에 모두 들어간 것을 읽어 확인한 뒤 한 번 전송했다.

## 다음 단계

iOS의 긴 여러 줄 입력은 클립보드와 사용자가 누르는 붙여넣기 메뉴로 검증한다.
`agent-device fill`이 줄바꿈을 문자로 보존하는 방법을 제공하는지 도구 쪽에서 확인한다.
