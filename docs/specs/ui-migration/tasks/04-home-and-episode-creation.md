# 04. 홈과 에피소드 생성이 HeroUI로 그려진다

## 전달되는 행동

에피소드 목록(홈)과 새 에피소드 생성 화면이 HeroUI `Card` 등 브랜드 컴포넌트로
그려진다. native 헤더의 타이틀·설정 진입, 생성 화면의 스텝 진행과 스텝별 큰
제목 갱신, 생성 후 목록으로 돌아오는 흐름은 변하지 않는다. 빈 목록·로딩·오류
상태도 HeroUI 상태 표현으로 같은 의미를 전달한다.

## Blockers

- **01** — HeroUI 화면은 provider·토큰·빌드 기반 없이 설 수 없다.

## 완료 기준

- [x] 홈 목록이 HeroUI로 그려지고 native 헤더와 설정 진입이 유지된다
- [x] 빈 상태·로딩·오류 상태가 HeroUI 표현으로 동작한다
- [x] 생성 화면의 스텝 진행·검증·제출이 이전과 같다
- [x] 생성 완료 후 목록 갱신과 대화 진입이 회귀 없다
- [x] 홈·생성의 기존 커스텀 컴포넌트가 제거됐다

## 제약

- 라우팅·query key·데이터 흐름은 바꾸지 않는다 — 이 태스크는 표현만 바꾼다.

## Status

completed

## Execution

- Base commit: b2d71e2fb15b6e0084e61d5e3adf7ec6d929eee1
- Task checkpoint commit: 786d2c0c5e0b75f9702758b9398def35bba1ae57
- Verification: `bun run check --force` 4회 연속 exit 0 — 매회 8/8 tasks, 0 cached, jest 437/437 (50 suites), lint·typecheck 통과. 시뮬레이터로 홈(빈·채워짐·오류)과 생성 3스텝을 light·dark로 촬영했다. 홈 첫 로딩 스피너는 로컬 응답이 수십 ms라 촬영하지 못했고 색은 렌더 색 단언으로만 덮인다.
- Task review: 블로킹 없음. 리뷰가 "표현만 바꾼다" 제약을 파일 목록이 아니라 의미 수준으로 확인했다 — 라우팅 목적지, mutation 페이로드, draft reducer, query 훅이 base와 동일하고 `lib/`은 diff에 없다. 다만 작업자가 보고한 "HeroUI CSS가 Tailwind 유틸리티를 이긴다"는 **거짓으로 밝혀졌다**: uniwind 런타임은 className 토큰을 순회하며 마지막 writer가 이기고 complexity는 variant 조건만 센다(`store.ts:115-178`). `bg-*`가 이겼을 것이다. `Card` variant 선택 자체는 라이브러리 토큰을 쓰므로 여전히 낫지만, 그 규칙을 이후 태스크로 옮기면 안 된다.
- Task correction rounds: 0
- Blocker: —
