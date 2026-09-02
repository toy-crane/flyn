# 저장된 화면 모드를 렌더 도중에 적용해 첫 프레임을 보장하지 못한다

**Symptom**: 앱을 다시 열 때 저장된 화면 모드가 React가 그리는 첫 프레임에
반영된다고 단정할 수 없다. 저장값이 `다크`이고 운영체제가 라이트일 때, 첫
프레임이 라이트 팔레트로 커밋되고 다음 렌더에서 다크로 바뀔 여지가 남아 있다.

**Observed evidence**: `apps/mobile/src/core/theme/app-theme-bridge.tsx:61`이
`AppThemeBridge`의 렌더 도중에 `Uniwind.setTheme(themePreference)`를 부르고,
같은 렌더에서 그 뒤로 `useThemeColor`와 `useUniwind`가 값을 읽는다. 이 렌더가
새 테마를 읽는지는 Uniwind가 구독자에게 동기로 알리는지에 달려 있고, 그
동작을 확인하지 않았다. 2026-09-02에 iOS Simulator와 Android Emulator에서
`다크`로 두고 앱을 다시 열었을 때 화면은 다크로 나왔고 깜빡임은 보이지
않았다. 다만 네이티브 시작 화면이 그 구간을 덮으므로 한 프레임짜리 깜빡임은
스크린샷으로 가릴 수 없다.

**Suspected cause**: Uniwind의 테마 저장소가 React 밖에 있어, 렌더 중의 변경이
그 렌더의 스냅샷에 반영되는지가 구현에 달려 있다. 반영되지 않으면 첫 렌더가
기본 테마로 커밋된다.

**What was tried**: 모듈 최상단에서 적용하는 대신 렌더 중 한 번만 적용하도록
모듈 범위 플래그를 두었다. import 시점 부수 효과를 만들지 않으려는 선택이고,
실기기에서는 문제가 드러나지 않았다.

**Proposed next step**: 저장값을 읽어 `Uniwind.setTheme`을 부르는 일을 앱
진입점의 모듈 최상단으로 옮기고, `dev` 빌드에서 첫 렌더의 `useUniwind().theme`을
찍어 저장값과 같은지 확인한다. Uniwind가 `useSyncExternalStore`로 렌더 중
변경을 이미 흘려보낸다면 지금 자리를 유지하고 이 파일을 지운다.
