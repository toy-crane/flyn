-- Access control for every table in `public`.
--
-- Two things decide it, and each answers a different question. A GRANT decides
-- whether a role may attempt a statement at all; RLS decides which rows that
-- statement reaches. Both are declared here so one file answers "who can touch
-- this table".
--
-- Only the GRANTs are written out. This database does not hand new tables in
-- `public` to `anon` or `authenticated`: a table created here arrives with
-- REFERENCES, TRIGGER and TRUNCATE for them and nothing the Data API can call,
-- so the GRANTs below are the whole of the reachable surface rather than an
-- addition to a permissive default. The three that remain have no route through
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

-- Access control for public.episode_endings.
--
-- Read-only for the person who played. Writing goes through
-- `public.finish_episode`, which is the only place the "one episode at a time"
-- rule exists — an insert grant here would let the app hand itself a finished
-- season.
alter table public.episode_endings enable row level security;

create policy episode_endings_select_own on public.episode_endings
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on table public.episode_endings to authenticated;

grant all on table public.episode_endings to service_role;

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
-- Same shape as episode_endings: the owner may read, and only
-- `public.finish_episode` writes. A person's reading of their own English is
-- theirs to see, not theirs to declare.
alter table public.language_levels enable row level security;

create policy language_levels_select_own on public.language_levels
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

grant select on table public.language_levels to authenticated;

grant all on table public.language_levels to service_role;
