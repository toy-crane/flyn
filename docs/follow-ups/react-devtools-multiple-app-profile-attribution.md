# 여러 앱이 연결된 DevTools 프로필의 대상을 구분하기 어렵다

**Symptom**: agent-device의 React DevTools에 앱 세 개가 연결된 상태에서 Android
에피소드를 조작하면 완료 요약은 0 commit으로 나오지만 내보낸 파일에는 56개가 있다.
해당 root의 snapshots는 비어 있어 본문 이름과 연결할 수 없다.

**Observed evidence**: 2026-09-07, agent-device 0.20.5가 실행하는
agent-react-devtools 0.4.0, 기본 포트 8097에서 확인했다. 원본은
`/private/tmp/flyn-motion-evidence/android-body-profile.json`이다. iOS 프로필에서는
조작 전에 찾은 root 7833과 본문 ID를 내보낸 snapshots에 연결할 수 있었다.

**Suspected cause**: 여러 React 앱의 root ID 충돌 또는 프로필 대상을 고르는 도구
경로와 관련될 수 있다. 정확한 원인은 아직 확인하지 않았다.

**What was tried**: `status`, `wait --connected`, `find`, 전체 트리와 프로필 내보내기를
확인했다. 다른 작업의 연결을 끊지 않았다. Android의 렌더 횟수는 임시 본문 로그를
앱 프로세스 4591에 한정해 따로 계측했고, 계측 코드는 제거했다.

**Proposed next step**: 전용 DevTools 포트와 앱 하나로 같은 계측을 비교하거나,
다중 앱의 root와 renderer ID를 함께 구분하는 도구 버전에서 다시 확인한다.
