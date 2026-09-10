# 남이 연 회차가 그 스토리 주인의 계정 삭제를 막을 수 있다

**Symptom**: 어떤 사람이 남의 만든 스토리 id를 가리키는 `story_plays` 행을 열어 두면, 그 스토리 주인이 계정 삭제를 요청했을 때 삭제가 참조 검사에서 실패한다. 주인의 프로필에는 `account_deletion_started_at`만 올라간 채 계정이 남는다. 그 표시는 저장소 쓰기 울타리라서, 주인은 아바타와 표지를 더 올리지 못하면서 계정도 지우지 못하는 자리에 갇힌다.

**Observed evidence**: 2026-09-10 전체 diff 리뷰에서 코드를 읽어 확인했다. `supabase/schemas/60-policies.sql`의 `story_plays_start_own` 주석이 이 갈래를 이미 적어 두었다. 회차를 여는 정책은 어느 스토리인지 말고 규칙을 두지 않고, 외래키 확인은 RLS를 타지 않으므로 남의 스토리를 가리키는 insert가 통과한다. `supabase/schemas/30-tables.sql`에서 `stories.owner_id`는 `profiles`를 `on delete cascade`로 따라가지만, 그렇게 지워지는 스토리를 가리키는 `story_plays` 행은 다른 사람의 것이라 같은 연쇄로 사라지지 않는다. 실제로 만들어 보지는 않았다. 만들려면 남의 스토리 uuid를 먼저 알아야 한다.

**Suspected cause**: 회차를 여는 자리에 스토리가 보이는지 묻는 검사가 없다. 공식 스토리만 있던 때에는 모든 스토리가 누구에게나 보였으므로 물을 것이 없었다. 사용자가 만든 스토리가 생기면서 "보이는 스토리인가"와 "가리킬 수 있는 스토리인가"가 갈라졌는데, 뒤쪽은 그대로 두었다.

**What was tried**: 그대로 두었다. 스토리 id는 uuid이고 API는 남의 만든 스토리를 목록에도 상세에도 내려보내지 않으므로, 지금 그 id를 얻을 길이 없다. 참조가 `restrict`이던 때에도 결과는 같았다.

**Proposed next step**: `story_plays_start_own`의 `with check`에 그 스토리가 `stories`의 select 정책을 지나는지 묻는 `exists`를 더한다. `characters_select_visible_story`가 쓰는 것과 같은 모양이다. 그러면 남의 만든 스토리를 가리키는 회차가 아예 열리지 않는다. 더하기 전에 그 검사가 회차를 여는 흔한 길의 계획을 얼마나 무겁게 만드는지 본다. 또 하나의 길은 계정 삭제가 지우기 전에 그 사람의 스토리를 가리키는 남의 회차를 먼저 정리하는 것인데, 남의 데이터를 지우는 일이라 더 조심스럽다.
