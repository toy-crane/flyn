# check:expo가 Expo 패치 버전 드리프트로 실패해 lint까지 막는다

**Symptom**: 루트 `bun run check`가 `@repo/mobile#check`에서 실패한다. `check:expo`가
설치된 Expo 패키지들이 기대 버전보다 낮다고 종료 코드 1을 반환해, 뒤의
`ultracite check`가 실행되지 못한다.

**Observed evidence**: 2026-08-20 이 저장소 main에서 `bun run check` 실행.
`expo@57.0.13 - expected version: ~57.0.14`를 비롯해 expo-build-properties,
expo-constants, expo-dev-client, expo-image-picker, expo-router,
expo-splash-screen 일곱 패키지가 지적되고 `Found outdated dependencies`로
실패했다. 코드 변경과 무관하게 Expo가 상류에서 패치를 낼 때마다 생기는
드리프트다.

**Suspected cause**: `check:expo`가 설치 버전을 Expo의 최신 기대 버전 목록과
비교하는데, lockfile은 고정되어 있어 상류 패치 공개만으로 검사가 깨진다.
버전 갱신 정책은 [모바일 Expo 의존성 호환](../decisions/mobile-expo-dependency-compatibility.md)이
소유한다.

**What was tried**: 이번 세션에서는 lint 검증을 `ultracite check`를 패키지별로
직접 실행해 우회했다. 의존성은 건드리지 않았고 `check` 태스크는 여전히
실패한다.

**Proposed next step**: 결정 계약의 절차에 따라 지적된 Expo 패키지들을 기대
패치 버전으로 올리고 `bun run check`가 통과하는지 확인한다.
