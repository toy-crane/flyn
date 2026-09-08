# 다른 agent-device 버전이 실행 중인 세션을 교체한다

**Symptom**: 화면 검증 중 agent-device 세션이 사라지고 Android 화면 조회가 실패했다.

**Observed evidence**: 2026-09-08 이 저장소의 `agent-device 0.20.5`로 검증하는 동안
공용 상태 폴더의 daemon이 `0.20.10`으로 바뀌었다. CLI가 `Replacing daemon`과
`version mismatch`를 출력했다. 그때 `adb devices`와 해당 기기의 셸은 정상 응답했다.

**Suspected cause**: 서로 다른 작업이 버전이 다른 CLI로 `~/.agent-device`를 함께
사용해 daemon과 세션의 소유권이 바뀐 것으로 추정한다.

**What was tried**: 현재 작업의 모든 CLI 호출에
`AGENT_DEVICE_STATE_DIR=/tmp/flyn-680e-device-qa`를 지정하고 같은 이름의 세션을
다시 열었다. 다른 작업의 daemon이나 adb 서버는 멈추지 않았다. 공용 기본값의
버전 충돌은 해결하지 않았다.

**Proposed next step**: 서로 다른 버전의 CLI 두 개로 별도 worktree에서 세션을
열어 재현한다. 저장소의 개발 세션 관리가 worktree별 상태 폴더를 제공할지,
CLI 버전을 통일할지 검토한다.
