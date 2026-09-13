# 스토리 만들기 재시도와 표지 실패 경로를 확인한다

**Symptom**: 같은 카드에서 다시 시도해 성공하는 경로와 표지 생성만 실패해 빈 색 상자로 상세가 열리는 경로는 실제 화면에서 확인하지 않았다. iOS의 실패 알림을 닫은 뒤 카드 복원도 확인하지 못했다.

**Observed evidence**: [실제 앱 검증 기록](../../apps/api/eval/results/story-evaluation-review-2026-09-13.md)에 플랫폼별 확인 범위가 있다. [Android 실패 알림](evidence/story-creation-refinement/flyn-android-failure-alert.png)과 [닫은 뒤 카드](evidence/story-creation-refinement/flyn-android-failure-restored.png)를 보존했다. [수정 검증 기록](../../apps/api/eval/results/story-fixes-review-2026-09-13.md)은 최종 목표 안내 검사 뒤 iOS 생성과 한 화 완주를 확인했지만 Android에서는 같은 경로를 다시 실행하지 않았다.

**Suspected cause**: API 연결을 끊은 검증은 전체 생성 실패만 만들었다. 표지만 실패하는 조건과 동일 카드의 재시도 성공은 별도 검증이 필요하다. 결함이 있다고 단정하지 않는다.

**What was tried**: API 연결을 끊어 iOS와 Android의 실패 알림을 확인했다. Android는 닫은 뒤 같은 카드, 원래 버튼과 안내가 돌아왔다. iOS는 알림 뒤 세션을 재시작해 복원을 확인하지 못했다. 단계 문구와 실패 복원은 화면 단위 테스트로 확인했다.

**Proposed next step**: 두 플랫폼에서 실패 알림을 닫고 카드, 원래 버튼 문구, 카드 뒤 안내가 남는지 본다. 같은 카드의 `다시 시도`로 성공하고 실패한 시도가 `내 스토리`에 남지 않는지 확인한다. 표지만 실패시켜 상세가 빈 색 상자로 열리는지 보고, 대본·표지·저장 단계의 문구가 서버의 실제 완료 순서를 따르는지 확인한다. 새 표지 두 장에서 인물과 앵글이 구별되고 글자나 명찰이 없는지도 본다.
