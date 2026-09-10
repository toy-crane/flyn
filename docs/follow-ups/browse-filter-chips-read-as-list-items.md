# 탐색의 필터 칩이 화면 읽기에 버튼이 아니라 목록 항목으로 읽힌다

**Symptom**: 탐색 화면의 `전체`와 `내 스토리` 칩이 접근성 트리에 버튼이 아니라 목록 항목으로 잡힌다. 화면 읽기 기능은 이 칩에 멈춰도 누를 수 있는 것이라고 알리지 않는다. 눌러서 목록을 거르는 자리인데 읽히기로는 그냥 글이다.

**Observed evidence**: 2026-09-10 iOS 시뮬레이터 `flyn-slot-3`에서 `agent-device snapshot -i`가 두 칩을 `[other]`로 보고했다. HeroUI Native의 `TagGroup.Item`이 자기 노드에 `role="listitem"`을 붙이고, React Native는 `role`과 `accessibilityRole`이 함께 있으면 `role`을 쓴다.

**Suspected cause**: `TagGroup`은 웹의 목록 의미를 그대로 가져온 컴포넌트로 보인다. 웹에서는 `listitem` 안에 누를 수 있는 요소를 따로 두지만, 이 구현은 항목 자체가 누르는 자리여서 역할이 실제 동작과 어긋난다.

**What was tried**: 앱에서 `accessibilityRole="button"`을 얹어 보았으나 `role`이 이겨서 트리는 그대로였다. 칩을 직접 그려 역할을 맞추는 것도 해 보았지만, 사용자가 HeroUI 기본 패턴을 쓰기로 정해 그 시도를 되돌렸다. 지금은 기본 패턴 그대로 두었고 역할은 `listitem`이다.

**Proposed next step**: 실제 VoiceOver를 켜고 이 칩을 훑어 선택 상태와 누를 수 있다는 것이 전해지는지 확인한다. 전해지지 않으면 HeroUI Native에 `TagGroup.Item`이 선택 가능한 항목의 역할을 갖게 해 달라고 요청하거나, 앱이 역할을 덮어쓸 수 있는 통로를 요청한다. [큰 접근성 글자 크기 기록](browse-text-clips-at-large-accessibility-sizes.md)과 같은 화면의 일이므로 함께 본다.
