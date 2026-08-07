# 03. 온보딩이 HeroUI로 그려진다

## 전달되는 행동

첫 로그인 뒤 닉네임과 아이디를 정하는 흐름이 HeroUI로 그려진다. 하단 CTA로
전진하는 구조, 닉네임 규칙 footer, 아이디 가용성 신호와 중복 추천, 완료 시
프로필이 만들어져 홈으로 들어가는 동작이 모두 이전과 같다. 로그인 직후 화면부터
홈 진입까지 한 층(HeroUI)에서 이어진다.

## Blockers

- **01** — HeroUI 화면은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [x] 온보딩 세 화면이 HeroUI로 그려지고 하단 CTA 전진 흐름이 유지된다
- [x] 닉네임 규칙(이모지·장식 기호 차단)과 provider 이름 후보 채움이 동일하다
- [x] 아이디 가용성 신호, 중복일 때만 danger, 추천 3개가 동일하게 동작한다
- [x] 검증·정규화 순수 함수(`lib/`)는 변경 없이 그대로 공유한다
- [x] `bun run auth:session`으로 새 계정 온보딩 완주가 재현된다
- [x] onboarding-form 등 기존 온보딩 컴포넌트가 제거됐다

## 제약

- 설정 편집과는 검증·정규화 순수 함수만 공유하고 입력 컴포넌트를 공유하지
  않는다 — [settings-edits-use-native-form](../../../decisions/settings-edits-use-native-form.md).

## Status

completed

## Execution

- Base commit: 3ade766197a92a3cea80260772e924bdbdf87c79
- Task checkpoint commit: 22078b9d9c54fe2c567b4028169917c8a9cfbb9b
- Verification: `bun run check --force` 6회 연속 exit 0 — 매회 8/8 tasks, 0 cached, jest 435/435 (50 suites), lint·typecheck 통과. `--runInBand` 직렬 실행도 435/435. 온보딩 완주는 `bun run auth:session`으로 새 계정을 만들어 두 차례 재현했고(두 번째는 `t03icon@example.test`로 가용성 아이콘 네 상태를 light·dark로 촬영), 증거는 세션 scratchpad에 있다 — 저장소 안에는 남지 않는다.
- Task review: 블로킹 없음. 교정 1회로 사람이 정한 아이콘 어휘(Ionicons)를 반영하고, `Spinner 가용성 신호` 표 행과 `InteractionManager` 주석을 사실에 맞췄으며, placeholder·CTA full-width 가드를 복원했다.
- Task correction rounds: 2
- Blocker: resolved verification — 원인은 디스크에 실제로 있는 모듈에 붙은 `jest.mock(..., { virtual: true })` 7곳이었다. jest는 virtual mock을 **모듈 이름 문자열**을 경로로 삼아 등록하고, 그 module ID를 워커 수명 내내 `Resolver._moduleIDCache`에 남긴다. 뒤에 도는 suite가 같은 모듈을 정상 mock해도 캐시가 낡은 virtual ID를 돌려줘 mock이 걸리지 않고 진짜 `expo-symbols`가 로드된다. 그래서 두 suite 중 **나중에 도는 쪽**이 졌다. 플래그를 떼서 해소했다. 내가 처음 지목한 태스크 01의 gesture-handler jestSetup은 **오답이었다** — 작업자가 `78b1b00` 이전 설정을 복원해 같은 실패를 재현해 반증했고, `{ virtual: true }`는 마이그레이션 이전(`d9ec5c3`)부터 있었다. `78b1b00`은 suite 타이밍만 바꿔 두 파일을 같은 워커에 묶었을 뿐이다.
- Superseded blocker (resolved): task-review — (1) 사람이 브랜드 층 아이콘 소스를 `@expo/vector-icons`(Ionicons)로 정했고, SF Symbol은 `@expo/ui`가 그리는 표면에만 남긴다. 아이디 가용성 신호를 텍스트에서 아이콘으로 되돌린다 — "HeroUI에 아이콘 세트가 없다"는 사실이지만 HeroUI 문서 자체가 Button·Chip·InputGroup 예제에서 외부 아이콘 라이브러리를 쓰는 것을 관용으로 제시한다. (2) `self-contained-native-ui-boundaries.md:28`의 프로필 편집 시트 행이 `Spinner 가용성 신호`라고 적었으나 `Spinner`의 prop은 `size`·`color`·`isLoading`뿐이라 3상태를 표현할 수 없다 — 태스크 07이 읽을 표다. (3) `username.tsx:139-144` 주석이 `InteractionManager`가 전환 종료를 기다린다고 말하지만 네비게이션 스택은 `createInteractionHandle`을 부르지 않아 실제로는 한 틱 지연이다. (4) 잃은 가드: placeholder 단언, CTA full-width 고정.
