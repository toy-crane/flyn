# 모바일 Expo 관련 패키지가 설치된 SDK 기대 버전보다 뒤처져 있다

**Symptom**: 저장소 루트에서 `bun run check`를 실행하면 `@repo/mobile#check`
단계에서 `expo install --check`가 실패해 전체 명령이 오류로 끝난다.

**Observed evidence**: `apps/mobile`에서
`EXPO_NO_DOTENV=1 MOBILE_EXPO_STATIC_CONFIG=1 CI=1 expo install --check`를
실행하면 `@expo/ui`, `expo`, `expo-build-properties`, `expo-constants`,
`expo-crypto`, `expo-dev-client`, `expo-image-picker`, `expo-linking`,
`expo-router`, `expo-secure-store`, `expo-splash-screen`, `expo-sqlite`,
`expo-system-ui`, `react-native`, `jest-expo` 15개 패키지가 설치된 Expo SDK가
기대하는 버전보다 낮다고 보고하고 코드 1로 종료한다. `apps/mobile/package.json`은
이번 작업에서 건드리지 않았고, `git log -1 -- apps/mobile/package.json`이
가리키는 커밋 이후로 패치 버전이 벌어진 것으로 보인다.

**Suspected cause**: `expo`와 관련 패키지의 패치 릴리스가 저장소의 lockfile
갱신 없이 시간이 지나며 쌓인 것으로 추정한다. 코드 변경이 아니라 의존성 갱신
누락으로 보인다.

**What was tried**: 이 작업(에피소드 상황 줄 배너)은 위 패키지들과 무관해
`apps/mobile`의 `ultracite check .`(lint·포맷)와 `tsc --noEmit`(타입 체크)를
따로 실행해 통과를 확인했다. `check:expo` 실패는 그대로 두고 넘어갔다.

**Proposed next step**: `apps/mobile`에서 `bunx expo install --fix`로 나열된
패키지를 SDK 기대 버전에 맞추고, `bun run check`가 다시 통과하는지 확인한다.
