# Android 화면 전환 중 Reanimated가 없어진 뷰를 갱신하려 한다

**Symptom**: 스토리 상세에서 첫 에피소드로 이동할 때 Reanimated 경고가 반복됐다. 화면 조작과 번역 실패 줄은 정상으로 보였고 RedBox나 앱 종료는 없었다.

**Observed evidence**: 2026-09-13 20:09:48 KST, `flyn dev 2`의 `com.odd.flyn` 개발 빌드, Metro 8092, `smoke-android` 세션. `/Users/toycrane/.agent-device/sessions/smoke-android/app.log` 2457행 이후에 `synchronouslyUpdateUIProps failed`, `RetryableMountingLayerException: Unable to find SurfaceMountingManager for tag: [976]`가 반복됐다. 스택에는 `react-native-svg`의 `VirtualView.setClientRect`와 Reanimated의 동기 속성 갱신이 포함된다.

**Suspected cause**: 화면 전환으로 사라진 SVG 뷰에 애니메이션 속성 갱신이 늦게 도착하는 것으로 추정한다. 어떤 공용 동작이 이를 만드는지는 확인하지 않았다.

**What was tried**: 기기 검증에서 새 로그 구간을 열고 화면 동작을 계속 확인했다. 애니메이션을 끄거나 네이티브 코드를 변경하지 않았다. 번역 응답 후 실패하던 별도 문제는 React Native에 없는 AbortSignal 메서드 호출로 재현해 수정했으며, 이 경고와의 인과관계는 확인되지 않았다.

**Proposed next step**: 같은 개발 빌드에서 상세→에피소드 전환을 반복하며 SVG 아이콘이 제거되는 시점과 Reanimated 동기 갱신을 대조하고, 번역이 없는 기존 화면 전환에서도 재현되는지 확인한다.
