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

pending

## Execution

- Base commit: —
- Task checkpoint commit: —
- Verification: —
- Task review: —
- Task correction rounds: 0
- Blocker: —
