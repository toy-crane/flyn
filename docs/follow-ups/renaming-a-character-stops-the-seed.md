# 인물 이름을 바꾸면 seed 재실행이 멈춘다

**Symptom**: 배포한 스토리의 인물 이름을 `supabase/seed.sql`에서 바꾸고 다시 실행하면 `characters_story_id_position_key` 위반으로 seed가 멈춘다. 이름을 바꾼 인물은 새 행으로 들어가려 하는데 그 스토리의 같은 `position`을 이미 옛 행이 쓰고 있기 때문이다.

**Observed evidence**: 2026-09-10 `20260910045742_story_characters.sql` 검토에서 확인했다. seed의 인물 upsert는 `on conflict (story_id, name)`을 충돌 대상으로 쓴다(`supabase/seed.sql`의 `insert into public.characters`). 이름이 달라지면 그 대상에 걸리지 않아 삽입이 되고, `unique (story_id, position)`에 걸린다. 이 제약은 `deferrable initially deferred`라 위반이 COMMIT에서 드러나므로 어느 행이 원인인지도 바로 보이지 않는다. 현재 콘텐츠로는 재현되지 않는다. 이름을 바꾸지 않는 재실행은 `supabase/seed_identity_test.sql`이 두 번 실행해 통과를 확인한다.

**Suspected cause**: 인물의 식별자를 이름으로 잡았는데, 이름은 작가가 고칠 수 있는 콘텐츠 값이기도 하다. 배포한 `slug`나 화 번호를 바꿀 때 별도 마이그레이션을 요구하는 규칙([Supabase 스키마 작업 방식](../decisions/supabase-schema-workflow.md)의 seed 규칙)이 인물 이름에는 아직 적혀 있지 않다.

**What was tried**: seed 주석에 "인물 이름 자체를 바꾸는 일은 배포한 콘텐츠의 식별자를 바꾸는 것이라 별도 마이그레이션이 맡는다"고 적어 두었다. `episode_characters`에는 목록에서 빠진 연결을 지우는 단계를 더해 화에서 인물을 빼는 경우는 막았다. 이름 변경 자체는 그대로 막힌 상태다.

**Proposed next step**: 인물 이름을 실제로 바꿔야 하는 첫 콘텐츠 작업에서, 기존 행의 이름을 옮기는 마이그레이션을 먼저 쓰는 절차를 결정 계약의 seed 규칙에 인물까지 넓혀 적는다. 그 전에 로컬에서 이름 변경 재실행을 한 번 재현해 실패 메시지를 확인한다.
