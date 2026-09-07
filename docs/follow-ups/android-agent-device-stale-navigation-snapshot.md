# Android 화면 전환 뒤 이전 접근성 목록이 남는다

**Symptom**: 화면을 옮긴 뒤 `agent-device`의 접근성 목록이 이전 화면을 반환한다.
목록만 보고 뒤로 가기를 반복하면 의도한 화면을 지나친다.

**Observed evidence**: 2026-09-07 `agent-device` 0.20.5와 `emulator-5564`에서
새 대화 화면을 촬영했지만 `snapshot -i`에는 `home-scroll`과 홈의 5화 시작하기가
남았다. `dumpsys window`의 앞 앱은 `com.odd.flyn.MainActivity`였다. 실제 화면은
`/private/tmp/flyn-motion-evidence/android-current.png`에 있다. AI 도움 창을 닫았을
때도 실제 본 채팅 화면과 달리 직전 도움 답변이 목록에 남은 적이 있다.

**Suspected cause**: Android 관찰 헬퍼의 접근성 목록이 화면 전환 뒤 늦게 갱신되는
것으로 보인다. 앱과 헬퍼 중 어느 쪽이 이전 목록을 유지하는지 확정하지 않았다.

**What was tried**: 해당 기기의 `com.callstack.agentdevice.snapshothelper`만
재시작한 뒤 새 대화의 `chat-list`와 입력창을 확인했다. 이후 전환 직후에는 스크린샷도
확인하고, 검증한 안정된 selector로 다음 동작을 실행했다. 앱 데이터는 지우지 않았다.

**Proposed next step**: 도구의 화면 전환 직후 접근성 갱신 경로를 확인한다. 그전에는
목록이 이전 화면이면 화면 사진으로 실제 위치를 확인하고 뒤로 가기를 반복하지 않는다.
