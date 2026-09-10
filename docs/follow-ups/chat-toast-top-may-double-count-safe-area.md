# 대화 토스트의 위쪽 자리가 안전 영역을 두 번 셀 수 있다

**Symptom**: `ChatPanel`이 `topInset`을 받은 채 토스트를 띄우면 토스트가 의도한
자리보다 `topInset`만큼 더 내려올 수 있다. 지금은 닿지 않는 길이다.

**Observed evidence**: 2026-09-10 전체 diff 검토에서 나왔다.
`apps/mobile/src/features/chat/ui/chat-panel.tsx`의 토스트 층은
`top: topInset + bannerHeight`로 서는데, 그 부모가 이미 `paddingTop: topInset`을
들고 있다. Yoga는 절대 위치 자식의 `top`을 부모의 안쪽 여백에 더한다. CSS에서
containing block이 padding box인 것과 다르다. 지금 토스트를 넘기는 곳은
`episode-screen.tsx` 하나이고 그쪽은 `topInset`을 넘기지 않는다. `topInset`을
넘기는 `episode-ask-screen.tsx`와 `create-story-screen.tsx`는 토스트를 넘기지
않는다. 그래서 두 값이 한 화면에서 만난 적이 없다.

**Suspected cause**: 토스트 층을 더할 때 부모의 여백을 고려하지 않았다. 지금
쓰이는 조합에서는 `topInset`이 0이라 차이가 드러나지 않는다.

**What was tried**: 기기에서 재현하지 못했다. 두 값이 함께 오는 화면이 없다.
Yoga의 셈법도 코드로만 확인했고 화면으로 재지 않았다.

**Proposed next step**: `AI에게 물어보기` 시트처럼 `topInset`을 쓰는 화면에
토스트를 더하게 되면 그 화면에서 먼저 확인한다. 두 번 세는 것이 맞으면 층을
부모의 여백 바깥으로 옮기거나 `top`에서 `topInset`을 빼면 된다.
