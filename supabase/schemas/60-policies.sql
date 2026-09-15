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

-- 스토리와 대본. 로그인한 사람은 공식 콘텐츠와 자기가 만든 스토리를 읽을 수
-- 있지만, 어느 쪽도 앱이 바꾸지는 못한다.
--
-- 만든 스토리를 저장하는 것은 `create_story`다. 그 함수가 네 테이블을 한
-- 문장으로 채우고 주인이 부르는 사람인지도 스스로 확인하므로, 여기에 insert
-- 정책과 권한을 두지 않는다. 절반만 저장된 스토리가 생길 길이 그래서 없다.
alter table public.stories enable row level security;

-- 주인이 없는 행은 공식 콘텐츠라 누구나 읽고, 주인이 있는 행은 그 사람만
-- 읽는다. 탐색이 남의 스토리를 비추지 않는다는 약속이 이 한 줄에 있다. API는
-- 사용자 자신의 클라이언트로 데이터베이스를 부르므로 이 정책이 마지막 관문이다.
create policy stories_select_official_or_own on public.stories
  for select
  to authenticated
  using (owner_id is null or owner_id = (select auth.uid()));

grant select on table public.stories to authenticated;
grant all on table public.stories to service_role;

alter table public.characters enable row level security;

-- 자식은 자기 부모가 보이는지만 묻는다. 그 물음이 위의 정책을 다시 타므로
-- 소유 규칙이 한 곳에만 적혀 있고, 규칙이 바뀌어도 네 군데가 어긋나지 않는다.
create policy characters_select_visible_story on public.characters
  for select
  to authenticated
  using (
    exists (select 1 from public.stories where stories.id = characters.story_id)
  );

grant select on table public.characters to authenticated;
grant all on table public.characters to service_role;

alter table public.episodes enable row level security;

create policy episodes_select_visible_story on public.episodes
  for select
  to authenticated
  using (
    exists (select 1 from public.stories where stories.id = episodes.story_id)
  );

grant select on table public.episodes to authenticated;
grant all on table public.episodes to service_role;

alter table public.episode_characters enable row level security;

create policy episode_characters_select_visible_story
  on public.episode_characters
  for select
  to authenticated
  using (
    exists (
      select 1 from public.stories
      where stories.id = episode_characters.story_id
    )
  );

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
-- `username_locked_until` is missing from the update grant on purpose. It is the
-- record of the rule, so a client that could write it could clear its own lock and
-- rename as often as it liked. The trigger sets it, and it runs as owner.
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
-- 막는다. 그 외래키는 이제 문장이 아니라 거래가 끝날 때 확인하므로, 없는
-- 스토리를 가리키는 행은 그때 막힌다. 앱은 요청 하나가 거래 하나라 보이는
-- 결과가 같다.
--
-- 외래키 확인은 RLS를 타지 않는다. 남의 만든 스토리 id를 알아낸 사람은 그것을
-- 가리키는 회차를 열 수 있고, 그러면 그 주인의 계정 삭제가 참조 검사에 걸린다.
-- id는 uuid라 맞힐 길이 사실상 없고, 이 참조가 `restrict`이던 때에도 결과는
-- 같았다. 콘텐츠가 새는 길은 아니다.
create policy story_plays_start_own on public.story_plays
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

-- update 정책이 없다. 이름 변경은 제품에서 제외한 기능이고,
-- `last_user_message_at`은 `public.touch_story_play`이 소유자 권한으로 쓴다.
-- `user_id`는 `episode_plays`와 같은 이유로 insert grant에서 빠져 있다.
-- `created_at`과 `last_user_message_at`도 없다. 시각을 클라이언트가 실어 보내면
-- 회차 시작 시각과 최근 대화 순서를 앱 밖에서 고를 수 있게 된다.
grant select on table public.story_plays to authenticated;
revoke insert on table public.story_plays from authenticated;
grant insert (story_id) on table public.story_plays to authenticated;
create policy story_plays_delete_own on public.story_plays
  for delete to authenticated
  using ((select auth.uid()) = user_id);
grant delete on table public.story_plays to authenticated;
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

-- 결말을 쓰는 정책은 없다. `public.finish_episode`가 결말과 이야기 기억을 한
-- 트랜잭션에 남기고, 그 함수만이 이미 끝난 플레이를 다시 닫지 못하게 한다. 아래 insert grant가 열을 하나로 좁히는 것이 그 규칙의 나머지 절반이다.
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
      where played.id = episode_play_id
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
      where played.id = episode_play_id
        and played.finished_at is null
    )
  );

-- update 정책이 없다. 저장은 장면이 끝난 뒤 한 번 일어나고, 고쳐 쓰는 대신
-- 지우고 새로 넣는다. 쓸 일이 없는 문장은 열지 않는다. `user_id`는
-- `episode_plays`와 같은 이유로 insert grant에서 빠져 있다. `created_at`도 없다.
-- 자리를 정하는 것은 데이터베이스가 채우는 시각이라 실어 보낼 값이 아니다.
grant select, delete on table public.episode_messages to authenticated;
revoke insert on table public.episode_messages from authenticated;
grant insert (id, episode_play_id, role, parts)
  on table public.episode_messages to authenticated;
grant all on table public.episode_messages to service_role;

alter table public.learning_events enable row level security;
create policy learning_events_select_own on public.learning_events
  for select to authenticated
  using ((select auth.uid()) = user_id);
grant select on table public.learning_events to authenticated;
grant all on table public.learning_events to service_role;

-- 로그인 여부와 관계없이 현재 배포 대상의 정책을 읽는다. Dashboard 운영자만 바꾼다.
alter table public.expressions enable row level security;
create policy expressions_read_own on public.expressions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy expressions_save_own on public.expressions for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy expressions_release_own_claim on public.expressions for delete to authenticated
  using ((select auth.uid()) = user_id and kind = 'dialogue' and meaning is null);
revoke insert, update on public.expressions from authenticated;
grant select, delete on public.expressions to authenticated;
grant update(saved_at) on public.expressions to authenticated;
grant all on public.expressions to service_role;

alter table public.app_version_policies enable row level security;
create policy app_version_policies_read on public.app_version_policies
  for select to anon, authenticated using (true);
revoke insert, update, delete on public.app_version_policies from anon, authenticated;
grant select on public.app_version_policies to anon, authenticated;
grant all on public.app_version_policies to service_role;
