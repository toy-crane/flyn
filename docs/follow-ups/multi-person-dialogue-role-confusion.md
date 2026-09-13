# 여러 인물의 사정과 말하는 상대가 섞인다

**Symptom**: 한 대사에서 한 인물을 이름으로 부른 뒤 `your`를 쓰며, 누구의 주문이나 음료를 말하는지 모호해진다. 종료 대사에서는 인물의 회의 일정을 사용자의 일정처럼 말한다.

**Observed evidence**: 2026-09-13 iOS `flyn-slot-1`의 공식 카페 2화에서 사용자가 Owen에게 1분 더 기다릴 수 있냐고 물었다. Owen이 기다리겠다고 답한 뒤 Mia는 `Thanks, Owen. Your drink is ready, but I still need the payment first.`라고 답했다. 앞 대화에서는 사용자의 카드가 거절되어 폰 결제를 안내하던 중이었다. `docs/follow-ups/evidence/multi-person-dialogue-role-confusion/multi-cast-one-target.png`에 실제 화면을 남겼다. 별도 실제 모델 평가 `apps/api/eval/results/multi-cast-1789293088734.json`의 `two-people` 3회차 마지막 턴도 Owen의 주문 취소 말 뒤에 Mia가 `I can make your coffee next, or I can cancel it.`라고 답해 상대가 모호하다.

같은 iOS 대화에서 사용자가 폰을 대고 소리를 들었다고 말하자 결제가 완료됐다. Owen은 `Good. I am glad it worked. I hope you make your meeting.`이라고 답했다. 도입에서 회의에 늦는 사람은 Owen이고 사용자는 회의가 있다고 말하지 않았다. 이전 화의 대화와 기억에도 사용자 회의는 없다. `docs/follow-ups/evidence/multi-person-dialogue-role-confusion/multi-cast-ending.png`와 `docs/follow-ups/evidence/multi-person-dialogue-role-confusion/multi-cast-runtime-dialogue.json`에 남겼다.

**Suspected cause**: 구조화 출력의 `speaker`는 누가 말하는지만 정한다. 모델이 말하는 상대와 각자의 사정을 끝까지 구분하지 못한 것으로 추정한다. 주문의 경우 실제 혼동인지 상대 전환을 글로 드러내지 못한 것인지는 확정하지 않았지만, 마지막 회의 일정은 Owen에서 사용자로 옮겨졌다.

**What was tried**: iOS에서 직전 대화와 새 응답을 함께 확인했고, 두 명과 세 명의 연속 대화 평가 전문을 읽었다. 화자 이름표와 말풍선 분리는 정상이다. 자연스러움 확인 요청이므로 제품 프롬프트와 스트림 형식은 바꾸지 않았다.

**Proposed next step**: 실제 카드 거절 대화의 중간과 종료, 고정 평가의 주문 순서 대화를 회귀 사례로 사용한다. 각 인물의 사정을 사용자에게 옮기지 않고, 말하는 상대를 바꿀 때 이름이나 `the coffee you ordered`처럼 주체를 분명히 쓰는 프롬프트 후보를 비교한다. 필요 없이 모든 문장에 이름을 붙이는 부작용도 전문으로 확인한다.
