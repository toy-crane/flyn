# Android에서 펼친 교정 카드의 AI에게 물어보기 링크가 눌리지 않는다

**Symptom**: Android 에피소드 대화에서 교정 한 줄을 눌러 카드로 펼치면 카드 아래 `AI에게 물어보기` 링크가 화면에는 보이지만, 눌러도 물어보기 시트가 열리지 않는다. 같은 카드의 접기 버튼과 카드 밖 아이콘 줄은 트리에 있다. iOS에서는 같은 링크로 시트가 열린다.

**Observed evidence**: 2026-09-15 16:55–17:05 KST, `flyn_dev_3`(emulator-5562)의 `com.odd.flyn` 개발 빌드, Metro 8122, `notes-android` 세션. `룸메이트 구함` 1화에서 영어 교정이 붙은 뒤 `id="correction-line"`을 눌러 카드를 펼쳤다. `agent-device snapshot -i`와 `snapshot --raw`에 `물어보기`가 한 번도 나오지 않았고(`grep -c` 결과 0), `press 'id="correction-ask"'`는 대상을 찾지 못했다. 링크 문구 위치를 `adb shell input tap 1000 1142`와 `agent-device press 1000 2073`으로 눌러도 화면이 바뀌지 않았다. 표현 노트 동작 작업의 변경을 빼고 `c8344b0`의 `correction-note.tsx`, `chat-panel.tsx`, `scene-message.tsx`, `episode-screen.tsx`로 되돌린 상태에서도 같았다. 같은 시각 iOS `flyn-dev-3`에서는 `press 'id="correction-ask"'`로 시트가 열렸다.

**Suspected cause**: 펼친 카드가 `entering`과 `exiting`을 가진 Reanimated `Animated.View` 안에 있고 바깥 줄도 `LinearTransition`을 쓴다. Android에서 레이아웃 애니메이션이 끝난 뒤 이 카드 안 `LinkButton`의 터치 영역이나 접근성 노드가 트리에 붙지 않는 것으로 추정한다. 확인하지 않았다.

**What was tried**: 좌표 탭 두 방식과 선택자 탭을 시도했고, 표현 노트 작업의 변경을 되돌려 이 작업이 원인이 아님을 확인했다. 앱 코드는 고치지 않았다. 대사 뜻 한 줄의 링크와 표현 노트 카드의 링크는 이번 검증에서 확인하지 않았다.

**Proposed next step**: Android에서 동작 줄이기를 켜 `entering`과 `exiting`이 빠진 상태로 같은 카드를 펼쳐 링크가 트리에 나타나는지 먼저 본다. 나타나면 카드의 레이아웃 애니메이션을 원인으로 좁혀 `correction-note.tsx`의 애니메이션 층 구성을 바꿔 본다.
