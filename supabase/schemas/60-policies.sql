-- Access control for every table in `public`.
--
-- Two things decide it, and each answers a different question. A GRANT decides
-- whether a role may attempt a statement at all; RLS decides which rows that
-- statement reaches. Both are declared here so one file answers "who can touch
-- this table".
--
-- Only the GRANTs are written out. This database does not hand new tables in
-- `public` to `anon` or `authenticated`: a table created here arrives with
-- REFERENCES, TRIGGER, TRUNCATE and MAINTAIN for them and nothing the Data API
-- can call, so the GRANTs below are the whole of the reachable surface rather
-- than an addition to a permissive default. Those four have no route through
-- PostgREST, which exposes select, insert, update, delete and rpc only.
--
-- Functions are the exception and are revoked one by one in 50-functions.sql:
-- Postgres still grants EXECUTE to PUBLIC on every new function, which `anon`
-- and `authenticated` inherit.

-- 공식 스토리와 각본. 로그인한 사람은 읽을 수 있지만, 저장소에서 배포한
-- 콘텐츠를 앱이 바꾸지는 못한다.
alter table public.stories enable row level security;

create policy stories_select_authenticated on public.stories
  for select
  to authenticated
  using (true);

grant select on table public.stories to authenticated;
grant all on table public.stories to service_role;

alter table public.episodes enable row level security;

create policy episodes_select_authenticated on public.episodes
  for select
  to authenticated
  using (true);

grant select on table public.episodes to authenticated;
grant all on table public.episodes to service_role;

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

-- 플레이 기록, 메시지, 교정의 접근 규칙.
--
-- 세 테이블이 같은 모양을 쓴다. 자기 행만 읽고, 자기 행에만 쓰고, 결말이 난
-- 플레이는 더 이상 바뀌지 않는다. 어느 규칙이 어디 사는지는
-- docs/decisions/supabase-write-rules.md가 정한다.
alter table public.episode_plays enable row level security;

create policy episode_plays_select_own on public.episode_plays
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 플레이를 여는 것은 사람이 한다. 지킬 규칙은 "지금 플레이할 화인가" 하나뿐인데,
-- 그 답은 같은 스토리의 앞선 화를 모두 봐야 나오므로 함수가 답한다.
create policy episode_plays_start_own on public.episode_plays
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and public.episode_is_current(episode_id)
  );

-- 결말을 쓰는 정책은 없다. `public.finish_episode`가 결말과 이야기 기억과 언어
-- 수준을 한 트랜잭션에 남기고, 그 함수만이 이미 끝난 플레이를 다시 닫지 못하게
-- 한다. 아래 insert grant가 열을 둘로 좁히는 것이 그 규칙의 나머지 절반이다.
grant select on table public.episode_plays to authenticated;
grant insert (user_id, episode_id) on table public.episode_plays to authenticated;
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
-- 지우고 새로 넣는다. 쓸 일이 없는 문장은 열지 않는다.
grant select, insert, delete on table public.episode_messages to authenticated;
grant all on table public.episode_messages to service_role;

alter table public.episode_corrections enable row level security;

create policy episode_corrections_select_own on public.episode_corrections
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 교정은 사용자가 쓴 메시지에만 붙는다. 상대의 대사에 교정을 다는 요청은 여기서
-- 막힌다.
create policy episode_corrections_write_own_message on public.episode_corrections
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.episode_messages written
      join public.episode_plays played on played.id = written.play_id
      where written.id = message_id
        and written.role = 'user'
        and played.finished_at is null
    )
  );

-- delete 정책이 없다. 교정은 그것이 붙은 메시지를 따라 사라진다.
grant select, insert on table public.episode_corrections to authenticated;
grant all on table public.episode_corrections to service_role;

-- 진행 중 장면과 끝난 대화 기록. 사용자는 자기 기록만 읽고, 쓰기는 순서와
-- 완료 불변성을 검사하는 함수만 맡는다.
alter table public.episode_runs enable row level security;

create policy episode_runs_select_own on public.episode_runs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on table public.episode_runs to authenticated;
grant all on table public.episode_runs to service_role;

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
