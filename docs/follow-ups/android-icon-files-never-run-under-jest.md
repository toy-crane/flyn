# Android 아이콘 파일이 Jest에서 한 번도 실행되지 않는다

**Symptom**: 설정 화면 테스트의 Android 검사가 `Platform.OS`만 바꾸므로, 파일
확장자로 갈라 둔 `settings-icon`과 `external-destination-icon`은 언제나 iOS
구현이 잡힌다. Android가 행 앞 아이콘을 그리게 되는 회귀가 생겨도 자동 검사가
알아채지 못한다.

**Observed evidence**: 2026-09-02에 `@react-native/jest-preset@0.86.2`의
`jest-preset.js`가 `haste.defaultPlatform: "ios"`로 고정하는 것을 확인했다.
`apps/mobile/src/screens/settings/settings-screen.test.tsx:495`의
"Android 설정은 헤더 높이만큼 여백을 더하지 않는다"는 `jest.replaceProperty`로
`Platform.OS`를 android로 바꾸지만, 그 안에서 `SettingsIcon`은 여전히
`settings-icon.ios.tsx`가 그린다.

**Suspected cause**: Metro는 번들 플랫폼으로 `.ios.tsx`와 `.tsx`를 갈라 고르지만
Jest는 실행 중에 그 선택을 바꿀 수 없다. `Platform.OS` 대입은 런타임 분기에만
닿고 모듈 해석에는 닿지 않는다.

**What was tried**: Android 선택 행은
`theme-option-row.android.test.tsx`처럼 파일 이름을 직접 적어 실행했다. 아이콘
두 쌍에는 같은 테스트를 만들지 않았다. 실기기 확인으로 Android에 행 앞
아이콘이 없고 외부 이동 글리프만 있다는 것은 눈으로 확인했다.

**Proposed next step**: `settings-icon.test.tsx`를 만들어 기본 구현이 아무것도
그리지 않는다는 것과, `settings-icon.ios`가 `accessibilityHidden` modifier를
붙인 심벌을 그린다는 것을 각각 확인한다.
`external-destination-icon.android`도 같은 방식으로 파일 이름을 적어 XML
드로어블을 넘기는지 본다.
