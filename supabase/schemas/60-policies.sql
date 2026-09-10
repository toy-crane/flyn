-- Access control for every table in `public`.
--
-- Two things decide it, and each answers a different question. A GRANT decides
-- whether a role may attempt a statement at all; RLS decides which rows that
-- statement reaches. Both are declared here so one file answers "who can touch
-- this table".
--
-- Supabase defaults can include table-wide CRUD grants. RLS still protects
-- rows, but a table-wide INSERT/UPDATE grant defeats column-scoped grants.
-- Revoke only those table-wide writes before declaring allowed columns below.
-- REFERENCES, TRIGGER, TRUNCATE and MAINTAIN are not Data API operations.
--
-- Functions are the exception and are revoked one by one in 50-functions.sql:
-- Revoke both PUBLIC and direct API-role grants before restoring allowed calls.

-- 공식 스토리와 각본. 로그인한 사람은 읽을 수 있지만, 저장소에서 배포한
-- 콘텐츠를 앱이 바꾸지는 못한다.
alter table public.stories enable row level security;

create policy stories_select_authenticated on public.stories
  for select
  to authenticated
  using (true);

grant select on table public.stories to authenticated;
grant all on table public.stories to service_role;

alter table public.characters enable row level security;

create policy characters_select_authenticated on public.characters
  for select
  to authenticated
  using (true);

grant select on table public.characters to authenticated;
grant all on table public.characters to service_role;

alter table public.episodes enable row level security;

create policy episodes_select_authenticated on public.episodes
  for select
  to authenticated
  using (true);

grant select on table public.episodes to authenticated;
grant all on table public.episodes to service_role;

alter table public.episode_characters enable row level security;

create policy episode_characters_select_authenticated
  on public.episode_characters
  for select
  to authenticated
  using (true);

grant select on table public.episode_characters to authenticated;
grant all on table public.episode_characters to service_role;

-- Access control for public.profiles.
alter table public.profiles enable row level security;

-- `anon` gets no policy and no grant. An unauthenticated caller holding the
-- publishable key can neither read nor change any profile.
--
-- `(select auth.uid())` rather than a bare `auth.uid()`: the subquery form is
-- evaluated once per statement instead of once per row.
create policy profiles_select_own on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

-- `using` decides which rows the user may update; `with check` decides what the
-- row may look like afterwards. Both are required — with `using` alone a user
-- could take a row they own and hand it to another user's id.
create policy profiles_update_own on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- No insert or delete policy. RLS denies what no policy allows, so profile
-- creation stays with the trigger and deletion follows the user through
-- `on delete cascade`.

-- Column-scoped update: `id` and `created_at` are identity and history, so a
-- user may not rewrite them even on their own row. `with check` above already
-- guards `id`; this also covers `created_at`, which a policy cannot express.
-- `updated_at` is the database's to set, through the trigger.
-- `username_changed_at` and `username_locked_until` are missing from the update
-- grant on purpose. They are the record of the rule, so a client that could write
-- them could clear its own lock and rename as often as it liked. The trigger sets
-- both, and it runs as owner.
grant select on table public.profiles to authenticated;
revoke update on table public.profiles from authenticated;
grant update (avatar_chosen_by_user, avatar_path, avatar_url, display_name, username)
  on table public.profiles to authenticated;

-- The backend role bypasses RLS and is reached only with the secret key.
grant all on table public.profiles to service_role;

-- Access control for public.retired_usernames.
--
-- RLS with no policy at all, and no grant to a client role: this table answers
-- "which ids are about to come free", which is a queue to camp on rather than
-- anything a person needs. The trigger writes it and the availability functions
-- read it, both as owner, so no client role needs to reach it directly.
alter table public.retired_usernames enable row level security;

grant all on table public.retired_usernames to service_role;

-- 회차, 플레이 기록, 메시지, 교정의 접근 규칙.
--
-- 네 테이블이 같은 모양을 쓴다. 자기 행만 읽고, 자기 행에만 쓰고, 결말이 난
-- 플레이는 더 이상 바뀌지 않는다. 어느 규칙이 어디 사는지는
-- docs/decisions/supabase-write-rules.md가 정한다.
alter table public.story_plays enable row level security;

create policy story_plays_select_own on public.story_plays
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 회차를 여는 것은 사람이 한다. 어느 스토리인지 말고 지킬 규칙이 없다: 회차는
-- 언제나 1화부터 시작하므로 앞선 화를 따질 것이 없고, 스토리의 존재는 외래키가
-- 막는다.
create policy story_plays_start_own on public.story_plays
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- update와 delete 정책이 없다. 회차 삭제와 이름 변경은 제품에서 제외한 기능이고,
-- `last_user_message_at`은 `public.touch_story_play`이 소유자 권한으로 쓴다.
-- `user_id`는 `episode_plays`와 같은 이유로 insert grant에서 빠져 있다.
-- `started_at`과 `last_user_message_at`도 없다. 시각을 클라이언트가 실어 보내면
-- 최근 대화 순서를 앱 밖에서 고를 수 있게 된다.
grant select on table public.story_plays to authenticated;
revoke insert on table public.story_plays from authenticated;
grant insert (story_id) on table public.story_plays to authenticated;
grant all on table public.story_plays to service_role;

alter table public.episode_plays enable row level security;

create policy episode_plays_select_own on public.episode_plays
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 플레이를 여는 것은 사람이 한다. 지킬 규칙은 "이 회차에서 지금 플레이할 화인가"
-- 하나뿐인데, 그 답은 같은 스토리의 앞선 화를 이 회차 안에서 모두 봐야 나오므로
-- 함수가 답한다. 그 함수가 회차의 주인과 스토리 일치도 함께 본다.
create policy episode_plays_start_own on public.episode_plays
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.episode_is_current(episode_id, story_play_id)
  );

-- 결말을 쓰는 정책은 없다. `public.finish_episode`가 결말과 이야기 기억과 언어
-- 수준을 한 트랜잭션에 남기고, 그 함수만이 이미 끝난 플레이를 다시 닫지 못하게
-- 한다. 아래 insert grant가 열을 하나로 좁히는 것이 그 규칙의 나머지 절반이다.
-- `user_id`도 여기 없다. 그 열은 기본값이 채우므로, 남의 이름을 실어 보내는
-- 문장은 정책을 만나기 전에 권한에서 막힌다.
grant select on table public.episode_plays to authenticated;
revoke insert on table public.episode_plays from authenticated;
grant insert (story_play_id, episode_id) on table public.episode_plays to authenticated;
grant all on table public.episode_plays to service_role;

alter table public.episode_messages enable row level security;

create policy episode_messages_select_own on public.episode_messages
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- `user_id`만 보고 답할 수 있는 것은 복합 외래키가 이 열을 플레이의 주인에
-- 묶어 두기 때문이다. 남는 조건은 "그 플레이가 아직 열려 있는가" 하나다.
create policy episode_messages_write_open_play on public.episode_messages
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.episode_plays played
      where played.id = play_id
        and played.finished_at is null
    )
  );

-- 다시 받기와 수정은 기준 메시지와 그 뒤를 지운다. 결말이 난 플레이에서는
-- 지우는 것도 막힌다.
create policy episode_messages_erase_open_play on public.episode_messages
  for delete
  to authenticated
  using (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.episode_plays played
      where played.id = play_id
        and played.finished_at is null
    )
  );

-- update 정책이 없다. 저장은 장면이 끝난 뒤 한 번 일어나고, 고쳐 쓰는 대신
-- 지우고 새로 넣는다. 쓸 일이 없는 문장은 열지 않는다. `user_id`는
-- `episode_plays`와 같은 이유로 insert grant에서 빠져 있다. `created_at`도 없다.
-- 자리를 정하는 것은 데이터베이스가 채우는 시각이라 실어 보낼 값이 아니다.
grant select, delete on table public.episode_messages to authenticated;
revoke insert on table public.episode_messages from authenticated;
grant insert (id, play_id, role, parts)
  on table public.episode_messages to authenticated;
grant all on table public.episode_messages to service_role;

alter table public.episode_expression_results enable row level security;

create policy episode_expression_results_select_own on public.episode_expression_results
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy episode_expression_results_write_own_message on public.episode_expression_results
  for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.episode_messages written
      where written.id = message_id and written.role = 'user'
    )
  );

grant select on table public.episode_expression_results to authenticated;
revoke insert on table public.episode_expression_results from authenticated;
grant insert (message_id, status, fixed, entries, situation, meaning, example, example_meaning)
  on table public.episode_expression_results to authenticated;
grant all on table public.episode_expression_results to service_role;

-- Access control for public.language_levels.
--
-- Same shape as episode_plays: the owner may read, and only
-- `public.finish_episode` writes. A person's reading of their own English is
-- theirs to see, not theirs to declare.
alter table public.language_levels enable row level security;

create policy language_levels_select_own on public.language_levels
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on table public.language_levels to authenticated;

grant all on table public.language_levels to service_role;

-- 손으로 담아 둔 표현의 접근 규칙.
--
-- 앞의 네 테이블과 다른 점이 둘이다. 담는 자리가 인물의 대사이기도 해서 어느
-- 역할의 메시지인지를 종류가 정하고, 결말이 난 화에서도 담고 취소할 수 있다.
alter table public.saved_expressions enable row level security;

create policy saved_expressions_select_own on public.saved_expressions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 담는 것은 사람이 한다. 지킬 규칙은 넷이다. 자기 것이어야 하고, 그 종류가 담을
-- 수 있는 역할의 메시지여야 하고, 적어 낸 화가 그 메시지가 실제로 오간 화여야
-- 하고, 배울 표현은 고칠 것이 있다고 판정된 메시지에서만 나와야 한다. 셋째가
-- 없으면 표현 노트의 출처 표시를 앱 밖에서 고를 수 있고, 넷째가 없으면 아무 말에나
-- 지어낸 교정을 붙일 수 있다. 판정 결과는 문제없음과 알 수 없음도 행으로 남기므로
-- 행이 있다는 것만으로는 모자라고, 고친 문장이 있는 판정만 배울 표현이 된다.
--
-- 인물 대사는 캐릭터가 말한 것이고 영어 교정과 한국어 안내는 사용자가 쓴 것에
-- 붙으므로, 담을 수 있는 역할이 종류마다 다르다. 지문과 내 말풍선에 저장을 두지
-- 않는다는 화면의 규칙과 달리, 여기서 막는 것은 역할까지다. 지문인지 대사인지는
-- 같은 메시지 안의 자리라 정책이 볼 수 없고, `utterance_at`이 가리키는 자리를
-- 서버가 읽어 영어 문장을 만든다.
--
-- 담기는 글 자체는 서버를 믿는다. `english`, `meaning`, `speaker`, `original`,
-- `entries`가 그렇다. 인물 대사의 화자와 문장은 `episode_messages.parts` 안에
-- 있으므로 정책이 대조할 수는 있지만, 한국어 뜻은 담는 순간 모델이 만드는 값이라
-- 데이터베이스에 견줄 원본이 없다. 다섯 열 중 하나만 규칙이 걸리면 나머지가
-- 지켜진다는 인상만 남으므로 다섯을 함께 서버에 맡긴다. 이 열들을 고쳐서 얻는
-- 것은 자기 표현 노트에 자기가 지어낸 글을 넣는 것뿐이고, 남의 행에는 닿지
-- 않는다. 모델을 부르지 않고도 문장을 확정할 수 있게 되면 다시 본다.
--
-- 플레이가 끝났는지는 보지 않는다. 결말이 얼리는 것은 대화이고, 끝난 화를 읽기
-- 전용으로 다시 열어 마음에 드는 대사를 담는 것은 이 기능이 하려는 일 그 자체다.
create policy saved_expressions_save_own on public.saved_expressions
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.episode_messages written
      join public.episode_plays played on played.id = written.play_id
      where written.id = message_id
        and written.user_id = (select auth.uid())
        and played.episode_id = saved_expressions.episode_id
        and written.role = (
          case when kind = 'utterance' then 'assistant' else 'user' end
        )
    )
    and (
      kind = 'utterance'
      or exists (
        select 1
        from public.episode_expression_results judged
        where judged.message_id = saved_expressions.message_id
          and judged.status = 'corrected'
      )
    )
  );

-- 담은 것을 지우는 것도 사람이 한다. 책갈피를 다시 누르는 취소와 표현 노트에서
-- 미는 삭제가 같은 문장이다. 자기 행인지 말고 볼 것이 없다.
create policy saved_expressions_erase_own on public.saved_expressions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- update 정책이 없다. 담은 항목은 고쳐 쓰지 않는다. 뜻 편집은 범위 밖이고,
-- 자리를 옮기는 일도 없다. `user_id`와 `created_at`은 앞의 테이블들과 같은 이유로
-- insert grant에서 빠져 있다.
grant select, delete on table public.saved_expressions to authenticated;
revoke insert on table public.saved_expressions from authenticated;
grant insert (
  kind, episode_id, message_id, utterance_at, english, meaning, speaker,
  original, entries
) on table public.saved_expressions to authenticated;
grant all on table public.saved_expressions to service_role;
