-- One profile row per Supabase user. `auth.users` stays the source of identity;
-- this table holds only the values a user may edit about themselves, so provider
-- data (email, provider name, avatar) is never duplicated here.
-- These two columns are the only ones a client may write, so they are the only
-- place a client can put anything it likes. `text` alone accepts a name made of
-- spaces, a name the size of a file, and an `avatar_url` carrying a `javascript:`
-- or `data:` payload. RLS decides *whose* row may change; these decide what may
-- go in it, and nothing else in the app does.
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  username text unique,
  avatar_url text,
  -- The object in the `avatars` bucket holding a picture this person uploaded.
  -- A path rather than a URL: the same row is read from a simulator, a device and
  -- production, and each reaches storage on a different host. Storing
  -- `http://127.0.0.1:54321/...` would pin the row to whichever machine wrote it.
  avatar_path text,
  -- True once the person picked or deleted their own picture. `fillEmptyProfileValues`
  -- offers a provider picture only while this is false, which is what keeps a
  -- deleted photo deleted: without it, `avatar_url` is null again and the next
  -- sign-in would helpfully put the provider's picture straight back.
  avatar_chosen_by_user boolean not null default false,
  -- Set before account deletion starts. Avatar Storage policies lock this row
  -- while checking the value, which lets the delete path wait for older writes
  -- and refuse every new write before it begins removing objects.
  account_deletion_started_at timestamptz,
  -- Both are written by the username trigger, never by a client. `username_changed_at`
  -- is history; `username_locked_until` is the answer the edit screen shows, so the
  -- server decides the instant and the screen only formats it in the local date.
  username_changed_at timestamptz,
  username_locked_until timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_display_name_usable check (
    display_name is null
    or length(btrim(display_name)) between 1 and 30
  ),
  -- The pattern accepts lowercase only, so it is also what makes the UNIQUE
  -- above case-insensitive: two ids that differ only in case cannot both be
  -- stored, because the uppercase one cannot be stored at all. A direct write
  -- that skipped the app's normalization is rejected rather than quietly
  -- rewritten, so what the client sent and what the row holds never diverge.
  constraint profiles_username_usable check (
    username is null
    or username ~ '^[a-z0-9_]{3,20}$'
  ),
  constraint profiles_username_not_reserved check (
    username is null
    or not public.is_reserved_username(username)
  ),
  constraint profiles_avatar_url_usable check (
    avatar_url is null
    or (length(avatar_url) <= 2048 and avatar_url like 'https://%')
  ),
  -- The owner's id is the first path segment, which is the same shape the storage
  -- policies below match on. Writing it here as well means a row cannot claim a
  -- file it does not own even if it reached the table some other way.
  constraint profiles_avatar_path_owned check (
    avatar_path is null
    or (length(avatar_path) <= 512 and avatar_path like id::text || '/%')
  )
);

comment on table public.profiles is
  'User-editable profile, one row per auth.users row. Created by trigger, never by clients.';

comment on column public.profiles.display_name is
  'Name shown in the app. Providers only fill this while it is null.';

comment on column public.profiles.username is
  'Public account id, lowercase only. Null until the person finishes onboarding.';

comment on column public.profiles.avatar_url is
  'Provider-supplied image. Providers only fill this while it is null and the person has not chosen their own.';

comment on column public.profiles.avatar_path is
  'Object path in the avatars bucket for a picture this person uploaded. Beats avatar_url when set.';

comment on column public.profiles.avatar_chosen_by_user is
  'True once the person picked or deleted a picture. Blocks providers from filling avatar_url again.';

comment on column public.profiles.account_deletion_started_at is
  'Write fence set before account deletion removes avatar objects. Clients cannot change it.';

comment on column public.profiles.username_changed_at is
  'When the account id last changed. Null while the person still holds the id they chose at onboarding.';

comment on column public.profiles.username_locked_until is
  'When the account id may change again. Written by the trigger, so the server owns the instant.';

-- Account ids their previous owner gave up, kept out of reach for a while.
--
-- Without this, someone who renames frees their old id immediately and the next
-- account to take it inherits every mention, screenshot and memory of the person
-- who left it behind.
--
-- No RLS policy and no grant: `authenticated` never reads or writes this table.
-- The trigger fills it and the availability functions read it, both as owner. A
-- client that could select here would have a list of ids to sit and wait for.
create table public.retired_usernames (
  username text primary key,
  -- The account that gave the id up. `on delete cascade` releases it when the
  -- account is gone: nobody is left to be confused with.
  retired_by uuid not null references public.profiles (id) on delete cascade,
  retired_at timestamptz not null default now(),
  -- When anybody else may take it. Stored rather than derived so a change to the
  -- protection period does not silently move ids that are already retired.
  protected_until timestamptz not null,
  constraint retired_usernames_username_usable check (
    username ~ '^[a-z0-9_]{3,20}$'
  )
);

comment on table public.retired_usernames is
  'Account ids released by a rename, held back from other accounts until protected_until.';

-- Every lookup here asks "is this id still protected", never "which ids did this
-- account hold", so the index follows the question rather than the owner.
create index retired_usernames_protected_until_idx
  on public.retired_usernames (protected_until);

-- 끝난 화가 남기는 사실. 한 계정이 한 시즌의 한 화를 끝낼 때 한 행이 생긴다.
--
-- 진행 중인 에피소드는 여기에 오지 않는다. 장면은 앱이 들고 있다가 나가면
-- 사라지고, 서버에는 끝난 화의 결말만 남는다. 그래서 "사건은 한 세션 안에
-- 마무리한다"는 제품 정의를 지키면서도 다음 화를 열 수 있다.
--
-- 한 화의 결말은 한 번만 난다. 기본키가 그 규칙이다. 같은 화의 결말이 다시
-- 도착해도 앞의 사실을 덮어쓰지 않는다.
create table public.episode_endings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  -- 시즌 번호. 이야기 기억이 이어지는 단위이고 지금은 1뿐이다. 화 번호만으로는
  -- 다음 시즌의 1화와 이번 시즌의 1화를 구분할 수 없다.
  season smallint not null,
  -- 시즌 안의 화 번호. 각본은 서버 코드가 소유하므로 여기에는 번호만 남는다.
  episode smallint not null,
  -- 결말의 종류. 화면에도 이 낱말이 그대로 보인다.
  kind text not null,
  -- 사건의 결과 한 줄. 홈의 끝낸 화 목록과 마무리 화면이 함께 읽는다. 이야기
  -- 기억의 네 가지 중 "사건의 결과"이기도 하다.
  outcome text not null,
  -- 이야기 기억의 나머지 세 가지. 다음 화의 프롬프트에 들어가 대사와 관계와
  -- 지문으로 돌아온다. 장면을 닫은 모델이 결말과 같은 출력에 함께 쓰므로, 그
  -- 줄을 쓰지 않았거나 형식을 어긴 화는 기억 없이 남는다.
  memory_choice text,
  memory_relationship text,
  memory_question text,
  finished_at timestamptz not null default now(),
  primary key (user_id, season, episode),
  -- 위쪽 한계는 이 시즌의 길이가 아니라 상식선이다. 어떤 시즌이 몇 화인지는
  -- 각본을 가진 서버가 알고, 여기서는 직접 RPC를 부르는 클라이언트가 있지도
  -- 않은 화를 끝없이 쌓지 못하게만 막는다.
  constraint episode_endings_season_usable check (season between 1 and 100),
  constraint episode_endings_episode_usable check (episode between 1 and 100),
  constraint episode_endings_kind_known check (kind in ('성공', '타협', '실패')),
  constraint episode_endings_outcome_usable check (
    length(btrim(outcome)) between 1 and 300
  ),
  constraint episode_endings_memory_choice_usable check (
    memory_choice is null or length(btrim(memory_choice)) between 1 and 300
  ),
  constraint episode_endings_memory_relationship_usable check (
    memory_relationship is null
    or length(btrim(memory_relationship)) between 1 and 300
  ),
  constraint episode_endings_memory_question_usable check (
    memory_question is null or length(btrim(memory_question)) between 1 and 300
  )
);

comment on table public.episode_endings is
  'One row per finished episode. Progress is derived from these rows; running episodes are never stored.';

comment on column public.episode_endings.season is
  'Season the episode belongs to. Story memory continues within one season.';

comment on column public.episode_endings.episode is
  'Episode number inside the season. The script itself lives in the API server.';

comment on column public.episode_endings.kind is
  'How the incident ended: 성공, 타협 or 실패.';

comment on column public.episode_endings.outcome is
  'One Korean line naming what happened, written by the model that closed the scene.';

comment on column public.episode_endings.memory_choice is
  'What the person did in this incident. Null when the closing scene left no memory lines.';

comment on column public.episode_endings.memory_relationship is
  'How the relationship changed. Null when the closing scene left no memory lines.';

comment on column public.episode_endings.memory_question is
  'The question this incident opened. Null when the closing scene left no memory lines.';

-- 사용자가 쓰는 영어의 수준. 시즌이 아니라 계정에 붙는다.
--
-- 이야기 기억은 시즌이 끝나면 함께 끝나지만 이 사람의 영어는 이어진다. 그래서
-- 같은 행에 두지 않고 계정마다 한 줄로 둔다. 화가 끝날 때마다 그 시점의 관찰로
-- 덮어쓴다. 지난 수준의 역사는 남기지 않는다.
create table public.language_levels (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  -- 모델이 쓴 한국어 한 줄. 점수나 등급이 아니라 관찰이다.
  level text not null,
  observed_at timestamptz not null default now(),
  constraint language_levels_level_usable check (
    length(btrim(level)) between 1 and 300
  )
);

comment on table public.language_levels is
  'The latest reading of how this person writes English. One row per account, overwritten as episodes end.';

comment on column public.language_levels.level is
  'One Korean line describing the level, written by the model that closed the scene.';
