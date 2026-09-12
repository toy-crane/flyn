# 아이디 잠금 테스트가 달력이 지나면 깨진다

**Symptom**: `apps/mobile/src/screens/settings/profile-edit-screen.test.tsx`의
"변경 제한 중에는 아이디만 잠그고 다시 바꿀 날짜를 보여 준다"가 2026-09-12에
실패한다. `profile-username`의 `editable`이 `false`여야 하는데 `true`다.

**Observed evidence**: 테스트는 344행에서 잠금 해제 시각을
`new Date(2026, 8, 11, 9, 0)`으로 박아 둔다. 그 시각이 지난 뒤에 돌리면 화면은
잠금이 풀린 상태를 그리므로 단언이 어긋난다. 2026-09-11에는 같은 테스트가
통과했고, 나머지 612개는 지금도 통과한다.

**Suspected cause**: 미래의 한 시점을 고정 날짜로 적었다. 시계를 고정하지 않아
테스트의 전제가 달력과 함께 지나간다.

**What was tried**: 고치지 않았다. 로딩 진행 표시 작업의 범위 밖이고, 잠금 규칙을
어떻게 검증할지는 이 화면의 몫이다.

**Proposed next step**: 잠금 해제 시각을 실행 시각 기준(`Date.now()` + 하루)으로
만들거나 `jest.setSystemTime`으로 시계를 고정한다.
