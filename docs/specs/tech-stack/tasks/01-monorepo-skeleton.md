# 01 모노레포 골격과 로컬 루프

> The code is the terrain and this task is a map: where they disagree,
> the terrain wins. A divergence at the decision level flows back to
> spec.md instead of being worked around.

- 블로커: 없음
- 상태: 완료

## 무엇을 만드는가

빈 저장소를 개발자가 클론해서 바로 일할 수 있는 모노레포로 만든다.
개발자는 의존성 설치 후 시뮬레이터에서 Uniwind 스타일이 적용된 Expo 앱
화면을 띄우고, 로컬에서 실행 중인 Hono API의 헬스체크를 앱에서 호출해
응답을 본다. 린트(Ultracite)와 테스트(bun test·jest-expo)는 turbo 한
명령으로 전 워크스페이스에서 돈다.

스펙의 미확인 리스크였던 Uniwind Pro 유료 범위를 이 세션에서 확인하고,
핵심 기능이 유료라면 스펙으로 회귀한다.

## 완료 기준

- [x] 새로 클론한 환경에서 README의 절차만으로 로컬 루프가 재현된다
- [x] 시뮬레이터에서 앱이 실행되고 Uniwind 스타일이 적용된 화면이 뜬다
- [x] 앱이 로컬 Hono API 헬스체크를 호출해 응답을 화면에 표시한다
- [x] 린트와 테스트가 turbo 한 명령으로 전 워크스페이스에서 통과한다
- [x] 모바일(jest-expo)과 서버(bun test) 각각 예시 테스트가 1개 이상 돈다
- [x] Uniwind 무료 범위로 충분한지 확인되어 기록됐다

## 스펙으로 돌려보낸 것

터레인이 맵과 달랐던 지점. 상세는 spec.md의 "확인된 것".

- Uniwind Pro 유료 범위 확인 → 무료로 충분. 미확인 리스크 해소.
- 모바일 Jest 30 가정 → jest-expo(SDK 57)가 Jest 29 계열을 요구.
- bun 링커는 hoisted 고정 — isolated 설치에서 RN 툴체인이 해석되지 않는다.
- `biome.jsonc`의 extends는 `["ultracite"]`가 아니라
  `["ultracite/biome/core", "ultracite/biome/react"]`(ultracite 7 형식).

## 남긴 함정

- `jest-expo/<platform>` 프리셋은 babel 프리셋을 인라인으로 넘기지 않고
  프로젝트 babel 설정에 의존한다. `apps/mobile/babel.config.js`를 지우면
  RN 소스의 Flow 문법에서 테스트가 깨진다.
- Uniwind 타입(`src/uniwind-types.d.ts`)은 생성물이라 gitignore 대상이다.
  `typecheck`가 `uniwind generate-artifacts`를 먼저 돌려 이를 메운다.
