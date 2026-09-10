# 인물 대사 카드는 화면 읽기가 세 번 멈춘다

**Symptom**: 표현 노트에서 교정 카드는 화면 읽기가 한 번에 "출처, 영어, 한국어"로
읽는데, 그 옆의 인물 대사 카드는 세 조각으로 나뉘어 세 번 멈춘다. 카드 종류에
따라 목록을 훑는 손짓 수가 달라진다.

**Observed evidence**: 2026-09-10 전체 diff 검토에서
`mobile-ui-consistency-reviewer`가 짚었다.
`apps/mobile/src/shared/ui/expression-card.tsx`의 펼치는 갈래는 `accessible`과
`accessibilityLabel`, `accessibilityRole="button"`을 함께 주지만, 펼칠 것이 없는
갈래는 셋 다 주지 않아 안의 `Text` 셋이 각자 초점을 받는다.

**Suspected cause**: 펼치는 카드에 이름을 손으로 적은 것은 iOS가 목록 첫 카드의
이름을 짓지 못하던 문제를 고치기 위해서였고, 누르는 자리가 아닌 카드는 그 문제를
겪지 않아 그대로 두었다.

**What was tried**: 고치지 않았다. 작업 05의 확인 항목은 복사와 휴지통의 이름,
그리고 펼치는 카드가 펼침 상태를 알리는 것만 요구한다. 게다가 인물 대사는 장면
전체가 한 말풍선에 들어와 길 때가 많아서, 한 덩어리로 묶으면 긴 영어와 한국어를
끊어 들을 방법이 사라진다. 어느 쪽이 나은지는 실제로 화면 읽기를 쓰는 사람에게
물어야 정해진다.

**Proposed next step**: VoiceOver와 TalkBack을 켜고 긴 인물 대사 카드와 교정
카드를 나란히 훑어 보고, 한 덩어리로 읽는 쪽이 나으면 펼치지 않는 갈래에도
`accessible`과 같은 이름을 준다. 그때 `accessibilityRole="button"`과 펼침
상태는 주지 않는다. 누르는 자리가 아니다.
