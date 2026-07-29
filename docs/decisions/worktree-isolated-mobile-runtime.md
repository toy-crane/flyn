# 병렬 모바일 개발은 런타임을 워크트리별로 격리하고 Supabase는 공유한다

여러 워크트리에서 Expo 앱을 동시에 실행할 수 있지만 기본 개발 명령은 모두
API `3000`, Metro `8081`, 현재 부팅된 시뮬레이터와 macOS 임시 폴더의 Metro
캐시를 함께 쓴다. 특히 서로 다른 `react-native-worklets` 버전으로 변환한 결과가
공용 캐시에 남으면 다른 워크트리에서 Babel plugin과 JavaScript bundle 버전이
어긋난다. 실제로 의존성을 다시 설치한 뒤 네이티브 앱을 재빌드하지 않고
`expo start --clear`만 했을 때 오류가 사라진 것이 이 경로와 일치한다.

따라서 병렬 개발 런타임은 다음처럼 나눈다.

- 각 워크트리는 안정적으로 배정된 dev slot을 가진다. slot은 API와 Metro 포트
  한 쌍을 정하고 다른 활성 워크트리와 겹치지 않는다.
- Metro transformer cache와 file-map cache는 각 워크트리의
  `apps/mobile/.expo/` 아래에 둔다. 평소에는 `--clear` 없이 실행한다.
- 같은 bundle identifier `com.odd.flyn`을 유지하되, 동시에 실행하는 워크트리는
  서로 다른 iOS Simulator를 쓴다.
- Supabase 로컬 스택은 저장소당 하나만 별도로 실행하고 모든 워크트리가
  공유한다. 워크트리 개발 명령은 상태만 확인하며 시작·중지·reset하지 않는다.

## 받아들인 비용

- 병렬 워크트리는 DB, Auth, Mailpit과 세션·데이터를 공유한다. migration,
  `db:reset`, RLS, Auth 설정, seed 변경은 한 번에 한 워크트리에서만 수행한다.
- 두 시뮬레이터에 같은 앱을 따로 설치해야 한다. 네이티브 의존성이 달라진
  워크트리는 자기 시뮬레이터에서 development build를 다시 만든다.
- slot과 simulator 배정, 프로세스 종료 정리가 필요하므로 단순한 `turbo run dev`
  위에 작은 로컬 오케스트레이터를 둔다.

## 기각한 대안

- **모든 실행에 `expo start --clear`를 붙이지 않는다.** 증상 복구에는 유효하지만
  매번 전체 변환 비용을 내고 캐시 소유권 문제를 숨긴다. 기존 공용 캐시를 버리는
  전환 시점의 1회 복구 수단으로만 쓴다.
- **활성 브랜치의 Worklets 버전을 강제로 같게 만들지 않는다.** 의존성 정렬은
  별도 변경이어야 하고, 다시 버전이 갈리는 순간 문제가 돌아온다. 캐시 격리가
  근본 경계다.
- **워크트리별 bundle identifier를 만들지 않는다.** 한 시뮬레이터에 여러 앱을
  설치할 수 있지만 Apple·Google 네이티브 로그인 설정과 development build
  변형 비용이 커진다. 별도 시뮬레이터가 더 작은 변경이다.
- **워크트리별 Supabase를 만들지 않는다.** 포트·project ID·환경 변수·DB 볼륨을
  모두 생성하는 복잡도에 비해 현재 병렬 개발에 필요한 이득이 작다.

## 근거

- [Worklets troubleshooting](https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting/)은
  다른 Babel plugin으로 미리 변환된 코드가 남은 version mismatch에서 bundler
  cache 초기화를 우선 복구책으로 안내한다.
- [Metro configuration](https://metrobundler.dev/docs/configuration/#cachestores)은
  transformer `cacheStores`와 file map cache 위치를 설정하는 공개 경계를 제공한다.
- [Expo CLI](https://docs.expo.dev/more/expo-cli/)는 dev server `--port`와
  development build 실행을 지원한다.
- [Expo app variants](https://docs.expo.dev/build-reference/variants/)에서 한 기기에
  여러 variant를 설치하려면 고유 bundle identifier가 필요하다. flyn은 네이티브
  소셜 로그인 설정까지 분기되는 비용을 피하고 simulator를 분리한다.
