# Android 시스템 글자 크기를 바꾸면 홈으로 돌아간다

**Symptom**: 종료한 대화 화면을 연 채 Android 시스템 글자 크기를 바꾸면 홈으로 돌아간다. 로그인과 저장한 대화는 유지되지만 현재 화면을 복원하지 않는다.

**Observed evidence**: 2026-09-10 Android 15의 `flyn_dev_1` Development Build에서 확인했다. 실제 이메일 로그인과 카페 1화 종료 후 어두운 화면을 적용하고 `adb -s emulator-5556 shell settings put system font_scale 2.0`을 실행했다. 다음 화면은 종료 화면 대신 홈이었다. `스토리`에서 같은 대화 기록을 다시 열 수 있었다. 화면 증거는 `/private/tmp/flyn-android-closing-large-dark.png`다. 이름과 달리 이 파일에는 홈이 찍혀 있다.

**Suspected cause**: 생성된 `MainActivity`의 `android:configChanges`에 `fontScale`이 없어 설정 변경 때 Activity를 다시 만들고, 이때 탐색 상태를 복원하지 않는 것으로 추정한다. 설정 변경과 Activity 재생성의 관계는 추가 확인이 필요하다.

**What was tried**: 큰 글자 상태에서 `스토리`의 기존 대화 기록으로 다시 들어가 종료·표현 돌아보기 화면 검증을 이어갔다. 네이티브 설정이나 앱 전체의 탐색 복구 방식은 바꾸지 않았다.

**Proposed next step**: 글자 크기만 변경해 Activity 생명주기와 시작 경로를 확인한다. Expo 설정 플러그인으로 `fontScale` 변경을 직접 받는 방법과 탐색 상태 복원을 비교하고, 실제 설정 앱을 다녀와도 현재 대화·입력·카드 펼침 상태가 유지되는지 확인한다.
