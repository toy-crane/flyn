# iOS 뒤로가기 후 채팅 목록 스피너 고착

- 상태: **해결됨**
- 확인일: 2026-07-29
- 환경: Expo SDK 57, React Native 0.86, iOS 26.5, New Architecture

## 증상

채팅 상세에서 AI 응답이 끝난 뒤 목록으로 돌아오면 상단 pull-to-refresh
스피너가 계속 회전했다. API 응답은 이미 끝났고 목록 행도 눌렸으므로 앱이나
JavaScript thread 전체가 멈춘 hang은 아니었다. 네이티브
`UIRefreshControl`의 표시 상태만 남은 visual hang이었다.

## 원인

발생 흐름은 다음과 같다.

```text
AI 응답 완료
→ chatRooms query invalidate
→ 뒤에 마운트된 홈 화면에서 background refetch
→ rooms.isFetching = true
→ LegendList.refreshing = true
→ 화면 밖의 iOS UIRefreshControl이 beginRefreshing
→ 뒤로 왔을 때 네이티브 spinner가 고착
```

TanStack Query의 `isFetching`은 사용자가 당겨 새로고침했다는 뜻이 아니다.
초기 조회와 query invalidation에 따른 background refetch까지 모두 포함한다.
이를 `RefreshControl.refreshing`에 직접 연결하면서 데이터 동기화 상태를 사용자
제스처 상태로 잘못 해석했다.

LegendList 고유 문제로 보지 않는다. LegendList는 받은 `refreshing`을 React
Native `RefreshControl`에 전달하며, 기본 `FlatList`에서도 같은 문제가 보고됐다.
React Native의 다음 이슈가 이 앱의 재현 조건과 가깝다.

- [#53263: FlatList UIRefreshControl not working properly when redirect](https://github.com/facebook/react-native/issues/53263)
  — Stack 화면 뒤의 offscreen `RefreshControl`에 `refreshing=true`가 전달된 뒤
  복귀하면 멈추는 사례
- [#53987: RefreshControl gets stuck on navigation](https://github.com/facebook/react-native/issues/53987)
  — iOS 26와 New Architecture에서 화면 전환 뒤 spinner가 고착되는 사례
- [#53310: offscreen beginRefreshing guard](https://github.com/facebook/react-native/pull/53310)
  — `_refreshControl.window` 확인을 제안했지만 merge되지 않은 수정

## 수정 원칙

채팅 목록의 데이터 갱신과 pull-to-refresh 표시를 분리한다.

- `rooms.isFetching`이나 `rooms.isRefetching`을
  `RefreshControl.refreshing`에 직접 연결하지 않는다.
- 사용자가 직접 당긴 경우에만 `manualRefreshing`을 `true`로 바꾼다.
- `rooms.refetch()`가 끝나거나 실패하면 `finally`에서
  `manualRefreshing`을 `false`로 되돌린다.
- 화면 focus를 잃으면 수동 새로고침 상태를 즉시 초기화한다.
- 네이티브 컴포넌트에는
  `refreshing={isFocused && manualRefreshing}`을 전달한다.
- query invalidation과 background refetch는 그대로 유지한다. 데이터 최신성을
  위해 필요한 동작이고, spinner 표시와 분리하는 것이 핵심이다.

구현은 [채팅 목록 화면](../apps/mobile/src/app/index.tsx)에 있고, 회귀 조건은
[화면 테스트](../apps/mobile/src/app/index.test.tsx)에 고정했다.

## 회귀 검증

자동 테스트는 다음 세 경계를 확인해야 한다.

1. background fetch 중이어도 pull-to-refresh spinner를 켜지 않는다.
2. 사용자가 당긴 경우에는 `refetch()`가 끝날 때까지만 spinner를 켠다.
3. 수동 새로고침 중 화면을 나갔다 돌아와도 spinner를 다시 켜지 않는다.

2026-07-29 검증 결과:

- 모바일 전체 30 suites, 228 tests 통과
- TypeScript 검사와 변경 파일 lint 통과
- iPhone 17 / iOS 26.5에서
  `메시지 전송 → AI 응답 완료 → 뒤로가기`를 실제 수행
- 목록 복귀 직후와 12초 뒤 모두 spinner가 없고 목록 조작이 정상
- 사용자가 직접 당긴 새로고침은 완료 후 정상 종료

해결 커밋: `0c5bf88 fix(mobile): scope refresh spinner to pull gesture`

## 다시 발생할 때

1. 목록 행이 눌리는지 확인해 앱 전체 hang과 visual hang을 먼저 구분한다.
2. 채팅방 목록 REST 요청의 완료 시각과 뒤로가기 시각을 비교한다.
3. `RefreshControl.refreshing`이 query의 전역 fetch 상태에 다시 연결되지
   않았는지 확인한다.
4. 화면 focus를 잃은 동안 `refreshing=true`가 네이티브로 전달되는지 확인한다.
5. 먼저 LegendList 교체나 React Native patch를 적용하지 않는다. 앱 상태 경계를
   확인한 뒤에도 재현될 때만 upstream 변경 여부를 다시 조사한다.
