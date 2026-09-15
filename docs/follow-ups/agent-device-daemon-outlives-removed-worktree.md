# 지운 worktree에서 띄운 agent-device 데몬이 모든 iOS 세션을 막는다

**Symptom**: iOS 화면 검증 도중 `agent-device snapshot`과 `open`이 `iOS runner project not found`로 실패했다. 세션을 닫고 다시 열어도 같은 오류가 났다.

**Observed evidence**: 2026-09-15 `remove-unused-tables-fields-9c3c0e` worktree에서 `bunx agent-device`(0.20.5)로 `flyn-slot-2`를 조작하던 중 발생했다. `~/.agent-device/daemon.json`의 pid 61162 프로세스 명령은 `/Users/toycrane/code/flyn/.claude/worktrees/episode-closing-input-clear-3960d5/node_modules/.bun/agent-device@0.20.5/node_modules/agent-device/dist/src/internal/daemon.js`였고, 그 worktree 폴더는 이미 없었다. 판과 코드 서명이 같아 클라이언트는 데몬을 교체하지 않았다. 같은 시각 `session list`는 빈 목록이었다.

**Suspected cause**: 데몬은 처음 띄운 worktree의 `node_modules`에서 iOS 러너 Xcode 프로젝트를 읽는 것으로 보인다. 그 worktree를 병합 뒤 정리하면 프로세스는 메모리에 남아 계속 응답하지만 러너 프로젝트 파일이 사라진다. worktree 정리 흐름은 그 worktree에서 시작된 공용 데몬을 확인하지 않는다.

**What was tried**: 활성 세션이 없는 것을 `bunx agent-device session list`로 확인한 뒤 pid 61162만 종료했다. 다음 `bunx agent-device open`이 현재 worktree의 설치본으로 새 데몬(pid 97539)을 띄웠고 iOS 스냅샷이 다시 동작했다. 새 데몬도 이 worktree를 지우면 같은 문제가 생긴다.

**Proposed next step**: `bun run dev:remove`나 병합 뒤 worktree 정리에서 `~/.agent-device/daemon.json`의 프로세스 경로가 지우는 worktree 안에 있는지 확인한다. 안에 있으면 활성 세션이 없을 때만 그 데몬을 종료하고, 세션이 있으면 정리를 멈추고 알린다.
