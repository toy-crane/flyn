# 짧은 영어 답변의 표현 확인이 실패했다

**Symptom**: `Yes, please check it now.`를 보낸 뒤 상대의 답은 도착했지만, 표현 확인은 `표현을 확인하지 못했어요`와 `표현 다시 확인`으로 바뀌었다.

**Observed evidence**: 2026-09-13 Android `flyn_dev_2`, `story-android` 세션에서 직접 만든 `새 커피 머신의 누수`의 1화를 플레이했다. 작업 폴더는 `/Users/toycrane/.codex/worktrees/7a15/flyn`, API 포트는 3951이다. API 기록에 `Request failed on POST /ai/episode/correction Error: Inconsistent expression result.`가 남았다. 화면의 실패와 오류를 같은 요청 뒤에 확인했다.

**Suspected cause**: `apps/api/src/features/episode/correction.ts`의 `judgeExpression`은 상태, 수정문과 항목 수가 서로 맞지 않으면 이 오류를 낸다. 모델의 원본 출력은 기록하지 않아 어떤 필드가 어긋났는지는 아직 모른다. 이번 변경은 이 판정 함수를 고치지 않았다.

**What was tried**: 화면에서 `표현 다시 확인`을 누르고 플레이를 이어 갔다. 서버 검사를 완화하거나 결과를 임의로 고치지는 않았다.

**Proposed next step**: 같은 짧은 영어 답변으로 교정 평가를 반복하고, 개인정보가 없는 고정 입력에서 원본 출력을 남긴다. 어떤 상태와 필드 조합이 실패하는지 확인한 뒤 프롬프트 또는 검사 규칙을 회귀 테스트와 함께 고친다.
