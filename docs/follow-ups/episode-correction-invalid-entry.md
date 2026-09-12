# 에피소드 플레이 중 표현 교정 한 건이 실패한다

**Symptom**: 스토리 대화는 이어지지만 사용자 메시지 한 건 아래에 `표현을 확인하지 못했어요`와 `표현 다시 확인`이 나온다.

**Observed evidence**: 2026-09-13, `1012eb2`의 iOS `flyn-slot-5`, 직접 만든 `커피 머신 매장` 1화에서 확인했다. 입력은 `Yes, it is between the minimum and maximum lines. I see that the rubber seal is loose. I have unplugged the machine. Can I put the seal back and test the tank?`다. 같은 실행의 API 로그 끝에는 `Request failed on POST /ai/episode/correction Error: Invalid expression entry.`가 있다. 앞뒤 입력의 교정과 1화 종료, 2화 진입은 동작했다.

**Suspected cause**: 교정 모델 출력이 표현 항목 검사에 맞지 않았을 가능성이 있다. 원본 응답을 확보하지 않아 어떤 필드가 원인인지는 확인하지 못했다.

**What was tried**: 실패 표시와 API 오류를 대조하고 스토리 대화가 계속되는지 확인했다. 프롬프트나 검사 코드는 변경하지 않았다.

**Proposed next step**: 같은 입력과 당시 대화 문맥으로 교정을 재현하고, 실패한 모델 출력의 필드와 검사 조건을 대조한다. 재시도가 해당 메시지를 정상 복원하는지도 확인한다.

## 2026-09-13 수정과 재확인

같은 문장과 재구성한 직전 질문으로 실제 모델을 세 번 호출했다. 두 번은 natural,
한 번은 원문과 fixed가 같은데 교정 항목을 네 개 붙여 `Inconsistent expression result`로
실패했다. 당시 전체 문맥과 원본 응답이 없으므로 최초 `Invalid expression entry`와
동일한 재현이라고 보지는 않는다.

검증에 맞지 않는 출력만 같은 취소 신호 안에서 한 번 재판정한다. 네트워크 오류나
두 번째 검사 실패는 숨기지 않는다. 재판정 안내는 system에 두고 마지막 user에는
원문을 다시 보낸다. 안내를 user에 두었던 중간 구현은 안내 자체를 번역해 세 번 모두
실패했다. 수정 뒤 오류 출력 주입과 실제 모델 재판정 세 번은 모두 natural로 복원됐다.

공개 API 테스트는 두 호출 상한, 원문 전달, 원래 메시지에만 저장, 두 번째 실패의
미저장을 확인한다. 모델이 처음부터 모순된 출력을 만드는 근본 원인은 남는다.
상세 조건과 실제 응답은 [수정 검증 기록](../../apps/api/eval/results/story-fixes-review-2026-09-13.md)에 둔다.
