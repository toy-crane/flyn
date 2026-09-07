# Android 자동화 헬퍼가 TalkBack 실행을 막는다

**Symptom**: 자동화 도구를 사용하는 동안 TalkBack을 켜도 서비스가 실행되지 않는다.
이 상태의 접근성 목록을 실제 TalkBack 읽기 검증으로 보아서는 안 된다.

**Observed evidence**: 2026-09-07 `agent-device` 0.20.5, `emulator-5564`,
TalkBack 15.0.0.639625893에서 `dumpsys accessibility`의 `Enabled services`에만
TalkBack이 남고 `Bound services`는 비어 있었다. `Ui Automation`은 실행 중이었다.
원본은 `/private/tmp/flyn-motion-evidence/android-talkback.mp4`와
`android-talkback-bound.txt`에 있다.

**Suspected cause**: 자동화 헬퍼의 UI Automation 연결이 다른 접근성 서비스를
억제하는 것으로 보인다. 헬퍼 구현의 연결 옵션까지 확인한 것은 아니다.

**What was tried**: 해당 기기의 `com.callstack.agentdevice.snapshothelper`만
멈추자 TalkBack 프로세스가 시작되고 `Bound services`에 나타났다. 앱과 테스트 세션을
유지한 채 ADB 입력과 녹화를 사용했다. TalkBack의 `Display speech output`에 대기
상태가 한 번 표시됐다. 검증 뒤 접근성 서비스 선택을 복원했다.

**Proposed next step**: 도구가 다른 접근성 서비스를 억제하지 않는 연결 옵션을
제공하는지 확인한다. 그전에는 실제 서비스 연결을 따로 확인한다. 이번 채팅 제품
코드에서는 자동화 헬퍼를 바꾸지 않는다.
