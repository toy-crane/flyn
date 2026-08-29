# 이유가 300자를 넘으면 그 메시지의 배울 표현이 통째로 사라진다

**Symptom**: 교정 판정이 낸 이유 한 줄이 300자를 넘거나 패턴 키가 120자를 넘으면
`episode_corrections` insert가 제약에 걸린다. 항목을 한 문장으로 함께 넣으므로
그 메시지의 배울 표현이 전부 저장되지 않는다. 화면에는 이미 붙어 있어 그 자리에서
는 멀쩡해 보이고, 다시 열었을 때 사라진 것을 알게 된다.

**Observed evidence**: 코드 검토가 2026-08-29에 짚었다.
`supabase/schemas/30-tables.sql`의 `episode_corrections_reason_usable`이 1–300자,
`episode_corrections_pattern_usable`이 1–120자를 요구한다.
`apps/api/src/features/episode/progress.ts`의 `appendEpisodeCorrection`은
`correction.entries`를 한 번의 insert로 넣고 길이를 다듬지 않는다. 이야기 기억을
남기는 `recordEpisodeEnding`은 같은 문제를 `usableNote`로 잘라 막고 있다. 실제로
긴 이유가 나온 적은 없다.

**Suspected cause**: 판정 프롬프트가 "해요체 한 문장"을 요구할 뿐 길이를 강제하지
못한다. 모델이 길게 쓰면 그대로 데이터베이스로 간다.

**What was tried**: 아무것도 바꾸지 않았다. 이번 기기 확인에서 나온 이유는 모두
짧았고, 저장 실패는 최선 노력이라 삼켜져 플레이를 막지도 않는다.

**Proposed next step**: `appendEpisodeCorrection`에서 `usableNote`와 같은 방식으로
`reason`을 300자, `pattern`을 120자로 자른다. 자르는 대신 그 항목만 버리는 쪽도
있지만, 이유가 잘린 배울 표현이 통째로 없는 것보다 낫다.
