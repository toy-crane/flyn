# Android 설정의 업데이트 정보 접근성 안내

## 증상

Android 설정의 버전 행에 실행 중인 업데이트 ID 설명과 복사 안내를 전달하는 접근성 속성이 없다.

## 확인한 근거

- PR #118의 Codex 리뷰가 삭제한 `settings-release-info` 명세의 남은 접근성 기준을 지적했다.
- `apps/mobile/src/screens/settings/settings-release-info.tsx`의 `useSettingsReleaseInfo()`는 `accessibilityModifiers`를 iOS에서만 반환한다. Android에서는 `undefined`다.
- `apps/mobile/src/screens/settings/settings-screen.tsx`는 그 값을 버전 행에 그대로 넘긴다.
- 사용자는 버전 정보 검증 완료와 명세 정리를 승인했다. 이 기록은 이후 코드 검토에서 확인한 Android 안내 누락을 추적한다. 이번 검토에서는 실제 TalkBack 낭독을 실행하지 않았다.

## 다음 작업

[모바일 설정 구조](../decisions/mobile-settings-structure.md)의 버전 정보 규칙에 따라 Android에도 값의 의미와 복사 행동을 알린다. 내려받은 OTA를 실행한 Android 앱에서 TalkBack으로 버전 행의 이름, 업데이트 ID 설명, 복사 안내를 확인한다. 내장 번들에서는 복사 행동을 안내하지 않는지도 확인한다.
