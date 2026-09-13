# iOS 최대 글자 크기에서 설정의 프로필 글자가 화면 밖으로 나간다

**Symptom**: 설정 화면의 닉네임과 아이디가 화면 너비를 넘어서 앞뒤가 보이지 않는다.

**Observed evidence**: 2026-09-14 `flyn-slot-1` iOS Simulator에서 시스템 글자 크기를 `accessibility-extra-extra-extra-large`로 바꾸고 `com.odd.flyn`을 완전히 종료한 뒤 다시 열었다. 닉네임 `글자크기확인`, 아이디 `codexfontsizeios2026`인 계정의 설정 화면에서 두 글줄이 화면 양옆으로 잘렸다. [화면](evidence/ios-max-settings-text/settings.png)에 남겼다. 당시 앱 코드는 `def1d78`이며, 이 커밋은 설정 화면을 수정하지 않았다. [글자 크기 정리 스펙](../specs/text-size-after-relaunch/spec.md)은 재시작 뒤 설정 화면에서 잘림이 없어야 한다고 정한다.

**Suspected cause**: 설정 화면의 네이티브 프로필 글줄이 접근성 글자 크기에서 긴 값을 줄바꿈하거나 너비 안에 두지 못하는 것으로 보인다. 원인은 아직 확인하지 않았다.

**What was tried**: 앱을 완전히 종료하고 다시 시작해 실시간 글자 크기 변경의 영향을 제외했다. 다른 글자 크기나 프로필 값으로 우회하지 않았다.

**Proposed next step**: 같은 기기에서 `def1d78`의 부모 커밋과 현재 커밋을 각각 같은 계정·글자 크기로 열어 기존 결함인지 확인한다. 설정의 프로필 글줄을 그리는 코드를 조사하고, 화면 너비 안에서 읽히도록 하는 수정이 글자 크기 스펙의 변경 금지 범위와 충돌하는지 결정한다.
