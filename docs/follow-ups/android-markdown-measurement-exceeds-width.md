# Android Markdown 측정값이 최대 너비를 넘긴다

**Symptom**: Android의 네이티브 Markdown이 전달받은 최대 너비보다 1dp 큰 값을
보고하는 로그를 남긴다.

**Observed evidence**: 2026-09-07, `codex/chat-motion-polish`, `emulator-5564`,
Metro 8132, `react-native-enriched-markdown` 1.0.1에서 에피소드 본문을 확인했다.
앱 프로세스 4591의 1788766805.225 로그에 `Max: [296.667,inf]`와
`Actual: [297.667,48]`가 함께 나왔다. 직후 고정 너비 측정에서도 같은 차이를 보고했다.
앱이 종료되지는 않았다. 해당 말풍선의 1dp 차이가 눈에 보이는 잘림을 만들었는지는
아직 확인하지 않았다.

**Suspected cause**: 네이티브 Markdown의 측정 또는 소수점 너비 반올림과 관련될
가능성이 있다. 이번 변경은 텍스트 측정 방식과 Markdown 너비를 바꾸지 않았다.

**What was tried**: 같은 문장이 있는 실제 에피소드를 계속 진행했다. 본문, 교정 카드와
마무리는 표시됐다. 측정 코드를 우회하거나 너비를 임의로 줄이지 않았다.

**Proposed next step**: 같은 문장과 글자 크기로 최소 재현을 만들고 Android Markdown
측정값의 반올림 경로를 확인한다. 글자 확대와 선택 핸들에서 실제 잘림이 있는지도 확인한다.
