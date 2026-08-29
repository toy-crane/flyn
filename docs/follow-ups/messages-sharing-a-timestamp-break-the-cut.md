# 같은 시각에 앉은 메시지 둘은 다시 받기가 지우지 못한다

**Symptom**: 한 플레이의 두 메시지가 `episode_messages.created_at`에 같은 값을
받으면, 다시 받기나 수정으로 버려야 할 행이 지워지지 않고 대화에 남는다. 읽는
순서도 그 둘 사이에서는 정해지지 않는다.

**Observed evidence**: 데이터베이스 검토가 2026-08-29에 짚었다. 잘라내기는
`apps/api/src/features/episode/progress.ts`의 `openEpisodePlay`가
`.gt("created_at", lastKept)`로 하고, 읽기는 `.order("created_at")` 하나뿐이라
두 번째 정렬 키가 없다. 로컬 `pg_indexes`에서 `(play_id, created_at)` 색인은
유니크가 아니고, 유니크는 `episode_messages_pkey`와 `episode_messages_owned_id`
둘뿐이다. 실제로 동률을 재현하지는 못했다.

**Suspected cause**: `clock_timestamp()`가 microsecond 해상도라 같은 값이 나올
수 있고, 그 자리에 동률을 막는 제약이 없다. 실사용에서는 사용자 메시지 저장과
장면 저장 사이에 모델 호출이 끼어 수십 밀리초 이상 벌어지므로 아직 관찰되지
않았다.

**What was tried**: 아무것도 바꾸지 않았다. 재현하지 못했고, 자리 번호 대신
시각으로 순서를 정한다는 결정은 그대로 둔다.

**Proposed next step**: 셋 중 하나로 좁힌다. `(play_id, created_at)` 색인을
유니크로 올리거나, 잘라내기를 `gte` 뒤에 기준 메시지 id만 빼는 형태로 바꾸거나,
읽기 정렬에 `id`를 두 번째 키로 더한다. 첫 번째는 동률 자체를 막는 대신 저장
실패 경로를 만들고, 나머지 둘은 값싸지만 동률을 그대로 둔다.
