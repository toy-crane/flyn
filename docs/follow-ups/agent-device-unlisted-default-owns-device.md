# 목록에 없는 default 세션이 기기를 사용 중이라고 나온다

**Symptom**: worktree에 배정한 iOS 기기를 열면 목록에 없는 `default` 세션이 사용 중이라는 `DEVICE_IN_USE` 오류가 나온다.

**Observed evidence**: 2026-09-13 `3215/flyn`에서 `agent-device 0.20.5`로 `flyn-slot-1`을 열 때 발생했다. `session list`는 빈 배열을 반환했고 `device status`는 소유권 기록이 없다고 보고했다. 공용 daemon은 다른 worktree의 같은 버전으로 실행 중이었다.

**Suspected cause**: 공용 daemon의 세션 목록과 내부 기기 소유권이 어긋난 것으로 추정한다. 버전 교체가 원인인지는 확인하지 못했다.

**What was tried**: 이번 작업의 모든 기기 명령에 `AGENT_DEVICE_STATE_DIR=/tmp/flyn-3215-scene-device`를 지정하자 같은 배정 기기에서 앱이 열렸다. 다른 작업의 daemon과 adb 서버는 멈추지 않았다. 공용 상태의 불일치는 해결하지 않았다.

**Proposed next step**: 세션 목록이 비어 있을 때 공용 daemon이 반환하는 기기 소유권과 저장된 세션을 비교한다. 기존 세션을 보존하면서 오래된 소유권만 해제하는 방법을 확인한다.
