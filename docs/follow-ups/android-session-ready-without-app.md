# 준비된 Android 개발 세션에 앱 패키지가 없다

**Symptom**: 개발 세션은 준비됐다고 보고했지만 배정된 기기에 앱 패키지가 없어 앱을 열지 못했다.

**Observed evidence**: 2026-09-13 `3215/flyn`에서 `bun run dev ios android`는 slot 1의 Android 공용 빌드 설치 완료를 보고했다. 이후 `emulator-5556`의 AVD 이름은 배정된 `flyn_dev_2`였지만 `pm list packages flyn`은 비어 있었다. `bun run dev android`도 앱의 Intent를 찾지 못해 실패했다.

**Suspected cause**: 세션의 설치 완료 기록과 기기의 설치 상태가 어긋난 것으로 추정한다. 설치 직후 패키지를 조회하지 않아 누락 시점과 원인은 확인하지 못했다.

**What was tried**: 같은 fingerprint `24d7e2fb2a27ef63f0a10c2e83bb4ce4bfd7a76c`의 공용 APK를 배정 기기에 `adb install -r`로 설치했다. `bun run dev android`가 앱을 열었고 화면 검증을 이어 갔다. 다른 기기와 서버는 건드리지 않았다.

**Proposed next step**: 공용 빌드 설치 직후 실제 패키지 존재를 확인하며 다시 실행한다. 이미 준비된 세션에서 패키지가 없을 때 지원 명령이 재설치하도록 할지 검토한다.
