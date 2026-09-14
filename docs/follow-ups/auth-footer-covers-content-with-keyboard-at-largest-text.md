# 최대 글자 크기에서 키보드가 올라오면 인증 화면 아래 버튼이 내용을 덮는다

**Symptom**: 인증 코드, 이메일, 닉네임 화면에서 키보드가 올라온 채로 보면, 키보드 위에 붙은
아래 버튼이 제목 아래 안내 문구, 입력칸, 오류 문구를 덮는다. 코드 화면에서는 흐린 `N초 후
다시 받기` 버튼 뒤로 `주소로 보냈어요` 문구가 비친다.

**Observed evidence**: 2026-09-14 iOS 시뮬레이터(`flyn-slot-1`)를
`accessibility-extra-extra-extra-large`로 두고 앱을 다시 시작한 뒤 확인했다. 이메일 화면은
`인증 코드 받기` 버튼이 `이메일 주소를 다시 입력해 주세요` 문구의 아래 절반을 덮었다. 코드
화면은 버튼이 두 줄로 자라 안내 문구 위에 겹쳤다. 닉네임 화면은 버튼이 입력칸을 덮었다.
키보드를 내리면 같은 화면이 스크롤되고 모든 내용이 겹치지 않고 보였다. Android 200%와 iOS
기본 크기에서는 겹치지 않았다.

**Suspected cause**: `apps/mobile/src/features/auth/ui/auth-layout.tsx`는 아래 버튼을
`KeyboardStickyView`로 키보드와 함께 올리지만, 위의 `ScrollView`는 키보드와 버튼 높이만큼
아래 여백을 늘리지 않는다. 그래서 보이는 영역이 줄어도 내용은 버튼 뒤에 남고, 끝까지
스크롤해도 가려진 줄을 버튼 위로 올릴 수 없다. 이 배치는 저장소 첫 커밋부터 있었고
heroui-alignment 작업(글자 역할, 필드 오류, 버튼 최소 높이)은 바꾸지 않았다.

**What was tried**: 확인만 했다. 키보드를 내리면 스크롤로 모든 내용에 닿는 것을 봤다.

**Proposed next step**: iOS 최대 글자 크기에서 세 화면을 다시 열고, `ScrollView`의 아래
여백을 키보드 높이와 버튼 높이에 맞추는 방식(react-native-keyboard-controller의
`KeyboardAwareScrollView` 등)을 [모바일 인증](../decisions/mobile-authentication.md)과
[모바일 타이포그래피](../decisions/mobile-typography.md)의 확대 규칙을 기준으로 정한다.
