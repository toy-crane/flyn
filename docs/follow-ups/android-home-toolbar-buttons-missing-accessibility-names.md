# Android 홈 도구막대 버튼을 접근성 이름으로 찾을 수 없다

**Symptom**: Android 홈에서 새 대화와 설정 아이콘이 보이지만 `agent-device`
접근성 목록에는 이름 없는 group 두 개로 나온다.

**Observed evidence**: 2026-09-07, `codex/chat-motion-polish`의 Expo SDK 57
Development Build `com.odd.flyn`, `flyn_dev_1` (`emulator-5564`), Metro 8132에서
로컬 이메일 로그인 후 확인했다. `snapshot -i`에는 `새 대화`, `설정 열기`가
없었다. 화면에서는 왼쪽 +와 오른쪽 프로필 아이콘을 확인했다. 같은 실행의
iOS에서는 두 접근성 이름을 모두 찾았다.

**Suspected cause**: `apps/mobile/app/(tabs)/(home)/index.tsx`는 두
`Stack.Toolbar.Button`에 `accessibilityLabel`을 넘긴다. Android Compose
도구막대에서 이 이름이 접근성 트리로 전달되지 않는 것으로 추정한다.

**What was tried**: 화면에서 확인한 새 대화 버튼의 좌표를 눌러 `/chat`으로
들어갔다. 채팅 검증은 진행할 수 있었으며 도구막대 구현은 바꾸지 않았다.

**Proposed next step**: TalkBack으로 홈 도구막대를 직접 탐색하고 버튼 이름과
실행 여부를 확인한다. 설치된 Expo Router의 Android Toolbar에서 접근성 이름을
전달하는 경로를 확인한다.
