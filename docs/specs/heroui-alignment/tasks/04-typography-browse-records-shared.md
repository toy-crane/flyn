# 04 — 텍스트 역할 이전: 탐색, 기록, 노트, 공용 UI

## Outcome

탐색, 스토리 상세, 대화 기록, 표현 노트, 홈, 프로필 편집 헤더, 화면 상태 안내와
그 밖의 공용 UI의 글자가 HeroUI `Typography` 역할로 그려진다. `최근 대화` 같은
섹션 소제목이 두 화면에서 같은 보조색·중간 굵기·작은 글자가 되고 화면 읽기에
헤더로 읽힌다. 이 task가 끝나면 React Native UI 전체에서 텍스트 역할 이전이
완료된다.

## Blockers

02, 03

## Acceptance criteria

- [ ] 탐색, 스토리, 노트, 홈, 설정 헤더, 공용 UI 폴더에 `text-[Npx]`, `leading-[Npx]`가 없고, `Text`에 `text-*`(색 제외), `leading-*`, `font-*` 클래스가 없다.
- [ ] 저장소의 React Native UI 전체에서 같은 조건이 0건이고, 인라인 크기는 계약이 적은 예외뿐이다. 쓰인 `type` 조합이 모두 대응표에 있다.
- [ ] 스토리 탭과 대화 기록의 `최근 대화` 소제목이 같은 역할(`body-sm`, `medium`, `muted`)이고 접근성 트리에서 헤더 역할이다.
- [ ] 스토리 상세와 대화 기록의 화면 안 제목이 헤더 역할이다.
- [ ] 탐색, 스토리 상세, 대화 기록, 표현 노트, 홈, 프로필 편집, 생성된 개요가 보이는 스토리 만들기 화면을 계약의 절차로 기본 크기와 최대 글자 크기, 밝은 화면과 어두운 화면으로 열어 잘림과 겹침이 없다.

## Constraints

- 이 task는 `screens/browse`, `screens/stories`, `screens/note`, `screens/home`, `screens/settings`의 RN 부분, `features/story`, `features/note`, `shared/ui`를 다룬다. `shared/ui/status-line.tsx`, `shared/ui/progress-metrics.ts`, `shared/ui/screen-toast.tsx`는 03이 이미 바꿨으므로 여기서는 손대지 않는다. `@expo/ui`가 소유하는 설정 화면의 글자는 바꾸지 않는다.
- 02와 03이 끝난 뒤에 한다. 저장소 전체 0건 주장은 그 둘이 끝나야 참이 된다.
- 카드와 목록 행의 구조는 바꾸지 않는다. 글자 역할만 바꾼다.
- `Typography`의 값을 global.css에서 재정의하지 않는다.

## Verification

- `grep -rnE "text-\[|text-(xs|sm|base|lg|[0-9]?xl)|leading-\[|leading-[0-9]|font-[a-z]" apps/mobile/src apps/mobile/app`가 계약의 예외(Markdown 렌더러, 토스트, 제공자 로그인 버튼)를 빼고 0건이다. 기본 크기 클래스(`text-sm` 등)와 `font-normal`을 포함한 모든 `font-*`도 잡아야 크기나 굵기 하나만 붙은 원시 `Text`가 남지 않는다.
- `bun run check`와 모바일 `bun run test`가 통과하고, 크기 클래스를 검사하던 테스트는 역할 `type`을 검사한다.
- 기기 확인: 계약의 절차대로 최대 글자 크기로 바꾼 뒤 앱을 완전히 닫고 다시 시작해 일곱 화면(탐색, 스토리 상세, 대화 기록, 표현 노트, 홈, 프로필 편집, 생성된 개요가 보이는 스토리 만들기)을 iOS와 Android, 밝은·어두운 모드로 찍는다. 통과 조건은 잘림과 겹침이 없고, 카드 제목(`h6`)과 본문의 위계가 최대 크기에서 뒤집혀 보이지 않는 것이다.
- `agent-device` 접근성 트리에서 소제목과 화면 안 제목이 헤더 역할이다.
- 변경을 `mobile-ui-consistency-reviewer`로 검토한다.

## Review checkpoint

None.

## Status

pending

## Execution

- Verification: —
- Blocker: —
- Revision: —
