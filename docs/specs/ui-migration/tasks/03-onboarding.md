# 03. 온보딩이 HeroUI로 그려진다

## 전달되는 행동

첫 로그인 뒤 닉네임과 아이디를 정하는 흐름이 HeroUI로 그려진다. 하단 CTA로
전진하는 구조, 닉네임 규칙 footer, 아이디 가용성 신호와 중복 추천, 완료 시
프로필이 만들어져 홈으로 들어가는 동작이 모두 이전과 같다. 로그인 직후 화면부터
홈 진입까지 한 층(HeroUI)에서 이어진다.

## Blockers

- **01** — HeroUI 화면은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [ ] 온보딩 세 화면이 HeroUI로 그려지고 하단 CTA 전진 흐름이 유지된다
- [ ] 닉네임 규칙(이모지·장식 기호 차단)과 provider 이름 후보 채움이 동일하다
- [ ] 아이디 가용성 신호, 중복일 때만 danger, 추천 3개가 동일하게 동작한다
- [ ] 검증·정규화 순수 함수(`lib/`)는 변경 없이 그대로 공유한다
- [ ] `bun run auth:session`으로 새 계정 온보딩 완주가 재현된다
- [ ] onboarding-form 등 기존 온보딩 컴포넌트가 제거됐다

## 제약

- 설정 편집과는 검증·정규화 순수 함수만 공유하고 입력 컴포넌트를 공유하지
  않는다 — [settings-edits-use-native-form](../../../decisions/settings-edits-use-native-form.md).

## Status

in-progress

## Execution

- Base commit: 3ade766197a92a3cea80260772e924bdbdf87c79
- Task checkpoint commit: 9365247304d81aba0d46171f5eaad86bc6ba1cdf
- Verification: `bun run check --force` — 8/8 tasks, 0 cached, jest 428/428 (50 suites), lint·typecheck 통과
- Task review: —
- Task correction rounds: 1
- Blocker: task-review — (1) 사람이 브랜드 층 아이콘 소스를 `@expo/vector-icons`(Ionicons)로 정했고, SF Symbol은 `@expo/ui`가 그리는 표면에만 남긴다. 아이디 가용성 신호를 텍스트에서 아이콘으로 되돌린다 — "HeroUI에 아이콘 세트가 없다"는 사실이지만 HeroUI 문서 자체가 Button·Chip·InputGroup 예제에서 외부 아이콘 라이브러리를 쓰는 것을 관용으로 제시한다. (2) `self-contained-native-ui-boundaries.md:28`의 프로필 편집 시트 행이 `Spinner 가용성 신호`라고 적었으나 `Spinner`의 prop은 `size`·`color`·`isLoading`뿐이라 3상태를 표현할 수 없다 — 태스크 07이 읽을 표다. (3) `username.tsx:139-144` 주석이 `InteractionManager`가 전환 종료를 기다린다고 말하지만 네비게이션 스택은 `createInteractionHandle`을 부르지 않아 실제로는 한 틱 지연이다. (4) 잃은 가드: placeholder 단언, CTA full-width 고정.
