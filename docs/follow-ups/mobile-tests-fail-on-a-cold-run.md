# 캐시가 빈 첫 실행에서 모바일 테스트가 간헐적으로 실패한다

**Symptom**: `bun run test`를 캐시가 빈 상태로 처음 돌리면 `@repo/mobile`에서
suite 네 개, 테스트 스물세 개가 실패한다. 바로 다시 돌리면 501개가 모두
통과한다. 실패하는 것은 화면 전환을 기다리는 쪽으로,
`src/core/navigation/onboarding-routing.test.tsx`의 `waitFor`가 대표적이다.

**Observed evidence**: 2026-08-29에 두 번 관찰했다. 리베이스 직후 한 번,
교정 저장을 붙인 뒤 한 번이다. 두 경우 모두 첫 실행이 30초를 넘겼고
(`Time: 32.31 s`), 두 번째 실행은 9초 안팎에 501개를 통과했다. 에피소드와 교정
관련 suite는 두 실행 모두 통과했다.

**Suspected cause**: 첫 실행은 Babel과 Jest 변환 캐시가 비어 있어 개별 테스트가
`waitFor` 기본 제한 시간 안에 끝나지 못한다. 실패 목록이 실행마다 달라지고,
느린 화면 전환 테스트에 몰린다.

**What was tried**: 다시 돌려 통과를 확인하는 것으로 넘어갔다. 원인을 좁히거나
제한 시간을 늘리지 않았다.

**Proposed next step**: 실패한 실행의 suite 목록을 두세 번 모아 같은 것이
반복되는지 본다. 반복되면 그 suite의 `waitFor` 제한 시간을 올리거나, jest 설정에
캐시를 미리 채우는 단계를 두는 쪽으로 좁힌다.
