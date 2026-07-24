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

지도와 지형이 어긋난 곳 세 군데를 spec.md에 반영했다.

- **Uniwind Pro** — 무료 범위로 충분. Pro는 성능·애니메이션 계층이고 Expo Go를
  포기해야 해서 오히려 손해다. 스펙 회귀는 필요 없었다.
- **Ultracite extends** — v7에는 bare `"ultracite"` export가 없다.
  `ultracite/biome/{core,react,jest}`로 정정.
- **Jest 버전** — SDK 57의 jest-expo가 29 계열이라 스펙의 "Jest 30"을 29로 정정.

## 다음 태스크에 넘기는 것

- bun은 `bunfig.toml`에서 hoisted 설치로 고정돼 있다. isolated로 되돌리면
  jest-expo와 Metro가 깨진다.
- `apps/mobile/src/uniwind-types.d.ts`는 Metro 생성물이지만 커밋한다.
  themes 설정을 바꾸면 이 파일도 갱신해 함께 커밋할 것.
- 앱 식별자는 `flyn` / `com.odd.flyn`으로 확정했다(태스크 03의 전제 하나 해소).
