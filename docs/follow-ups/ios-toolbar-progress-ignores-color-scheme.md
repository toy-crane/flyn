# iOS 툴바의 저장 진행 표시가 화면 모드를 따르지 않는다

**Symptom**: iOS `프로필` 화면에서 저장을 누르면 툴바 자리에 진행 표시가 나타나는데, 이
표시의 색이 라이트와 다크에서 같다. 앱의 다른 진행 표시는 모두 화면 모드를 따라 바뀌므로
이 자리만 다르게 보인다.

**Observed evidence**: `apps/mobile/app/settings/profile.tsx`의 `Stack.Toolbar.View` 안
`ActivityIndicator`는 `color`를 넘기지 않는다. react-native 0.86.3의 `ActivityIndicator.js`는
`color` 기본값을 iOS에서 `#999999`로 두므로 화면 모드와 상관없이 같은 중성 회색이 나온다.
같은 자리의 Android 헤더(`profile-save-header-action.android.tsx`)는 헤더의 `tintColor`를
받아 이 문제가 없다.

**Suspected cause**: 네이티브 셸 안의 진행 표시는 셸이 정한 색을 따른다는 규칙을 이 자리가
실제로는 지키지 못한다. `Stack.Toolbar.View`는 자식에게 툴바의 tint를 내려 주지 않아서,
색을 넘기지 않으면 셸의 색이 아니라 React Native의 기본값이 나온다.

**What was tried**: 아직 손대지 않았다. 로딩 스피너 명세가 네이티브 셸 안의 진행 표시를
범위에서 뺐고, 그 작업 중에 소스를 읽다가 확인했다. 기기에서 두 화면 모드를 나란히 보지는
않았다.

**Proposed next step**: iOS 툴바에서 실제로 어떤 색이 나오는지 라이트와 다크에서 확인한다.
셸이 tint를 내려 주지 않는 것이 맞으면 이 자리도 색을 명시한다. 다만 어떤 색을 쓸지는
[모바일 작업 진행 표시](../decisions/mobile-action-progress.md)가 네이티브 셸의 색을 셸에
맡긴다고 정해 두었으므로, 그 경계를 먼저 사용자와 정한다.
