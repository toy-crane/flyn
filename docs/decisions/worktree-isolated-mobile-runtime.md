# 워크트리별 모바일 개발 런타임

## Decisions

- 각 활성 워크트리에 안정적인 dev slot을 배정한다. slot은 API와 Metro 포트 한
  쌍을 정하며, `bun run dev`가 배정과 실행을 관리한다.
- Metro transformer와 file-map 캐시는 워크트리의 `apps/mobile/.expo/` 아래에 둔다.
- bundle identifier는 `com.odd.flyn` 하나를 유지하고, 동시에 실행하는 워크트리는
  서로 다른 iOS Simulator를 사용한다.
- 로컬 Supabase는 저장소당 하나만 실행해 모든 워크트리가 공유한다. 워크트리 개발
  명령은 상태를 확인하지만 시작·중지·reset하지 않는다.
- 프로덕션 채팅 모델은 API 코드에 고정하고 dev slot별 환경 변수로 바꾸지 않는다.

## Why

기본 API·Metro 포트, 시뮬레이터와 macOS 임시 캐시를 공유하면 병렬 실행이 서로를
덮는다. 특히 다른 Worklets/Babel 조합으로 변환한 캐시가 재사용되면 JavaScript와
네이티브 버전이 어긋난다. 포트·캐시·시뮬레이터만 격리하면 소셜 로그인 설정과 DB
토폴로지를 복제하지 않고도 병렬 개발할 수 있다.

## Boundaries

- DB, Auth, Mailpit, 세션과 데이터는 워크트리 사이에 공유된다. migration,
  `db:reset`, RLS, Auth 설정과 seed 변경은 한 번에 한 워크트리만 수행한다.
- 네이티브 의존성이 달라진 워크트리는 자기 시뮬레이터에서 development build를
  다시 만든다.
- `expo start --clear`는 전환이나 복구 때 한 번 쓰는 수단이지 일상 명령이 아니다.

## Reconsider when

병렬 DB 변경이 일상화되거나 provider 설정을 포함한 여러 app variant를 유지할
제품 요구가 생기면 Supabase와 bundle identifier 격리를 다시 결정한다.

## Still-rejected alternatives

- 모든 실행에서 Metro 캐시를 지우기.
- 활성 브랜치의 Worklets 버전을 강제로 맞춰 캐시 충돌을 피하기.
- 워크트리마다 bundle identifier 또는 Supabase 스택 만들기.

## Evidence worth preserving

의존성 재설치 뒤 네이티브 앱을 다시 만들지 않은 상태에서 `expo start --clear`로
오류가 사라진 재현은 공용 변환 캐시가 원인이었음을 뒷받침한다. 현재 allocator,
supervisor와 simulator adapter 테스트가 slot·정리·충돌 경계를 고정한다.
