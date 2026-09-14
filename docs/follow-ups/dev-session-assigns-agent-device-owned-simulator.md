# 개발 세션이 다른 agent-device 세션의 기기를 배정한다

**Symptom**: 루트 개발 명령으로 배정하고 앱을 연 iOS 기기에서 `agent-device open`이 `DEVICE_IN_USE`로 실패한다.

**Observed evidence**: 2026-09-14 `codex/database-schema-cleanup`에서 `bun run dev ios`가 slot 1에 UDID `886E6243-0A31-4CE9-82BC-792D479D6206`을 배정하고 공용 빌드를 설치했다. `agent-device device status`는 같은 기기를 `live session=s1 workspace=/Users/toycrane/code/flyn/.claude/worktrees/remaining-specs-01c181`로 보고했다. 해당 경로는 현재 `git worktree list`에 없었다. `agent-device` 클라이언트는 0.20.10이다.

**Suspected cause**: 개발 세션의 기기 풀과 `agent-device`의 사용권 목록이 서로 다른 상태를 유지하는 것으로 보인다. 표시된 세션이 실제로 기기를 계속 쓰는지는 확인하지 않았다.

**What was tried**: 다른 세션의 사용권을 강제로 해제하지 않고 Android 검증을 시작했다. iOS에서는 동작 검증을 진행하지 못했다.

**Proposed next step**: `scripts/dev`의 배정·설치 전에 `agent-device`의 현재 사용권을 확인하는 경로를 검토한다. 오래된 세션의 정상 해제 방법도 도구 문서와 현재 세션 상태로 확인한다.

**추가 확인 (2026-09-14)**: 사용자가 동시 작업 세션이 없음을 확인한 뒤 iOS 검증을 다시 시작했다. `close --session s1`은 `SESSION_NOT_FOUND`였으나 기기 사용권은 여전히 살아 있었다. 사용권의 PID와 시작 시각을 실제 프로세스에 대조하니 삭제된 worktree 경로의 `agent-device@0.20.5` daemon이 부모 PID 1로 남아 있었다. 해당 프로세스에만 SIGTERM을 보내고 종료를 확인했다. 도구가 `owner-process-dead`로 판단한 뒤 새 `open`에서 사용권을 자동 회수했다. 사용권 파일은 직접 수정하지 않았다. 이후 같은 기기를 `flyn-db-cleanup-ios` 세션으로 열었다. 이번 검증의 차단은 해소됐지만 개발 세션과 도구 사용권의 배정 연동 문제는 남는다.
