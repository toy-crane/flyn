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

-- 스토리는 공식 콘텐츠 사이의 순서와 세계, 등장인물, 순서가 있는 에피소드와
-- 끝을 한데 묶는다.
-- 화면에서 이 단위의 이름은 아직 쓰지 않지만, 데이터에서는 공유 가능한
-- 자기 완결 단위가 된다.
create table public.stories (
  id uuid primary key,
  position smallint not null unique,
  slug text not null unique,
  title text not null,
  -- 목록 행에 쓰는 한 줄 소개. 사용자에게 벌어진 사건을 1인칭 한국어로 쓴다.
  hook text not null,
  -- 스토리 상세가 여는 소개 문단. 훅보다 길고, 세계와 인물을 함께 말한다.
  intro text not null,
  -- 표지 타일이 그리는 이모지. 일러스트가 아직 없는 스토리의 표지가 되고,
  -- 그림이 있어도 그 뒤에 남아 이미지를 못 받았을 때 자리를 지킨다.
  cover_emoji text not null,
  -- `story-covers` 버킷에서 이 스토리의 표지 그림이 있는 자리.
  -- URL이 아니라 경로다. 같은 행을 시뮬레이터, 기기, 배포본이 함께 읽는데
  -- 저장소에 닿는 주소가 저마다 달라서, `http://127.0.0.1:54321/...`을 넣으면
  -- 그 행이 쓴 컴퓨터에 묶인다. `profiles.avatar_path`와 같은 이유다.
  cover_image_path text,
  target_language text not null,
  completion_title text not null,
  completion_copy text not null,
  constraint stories_position_usable check (position between 1 and 10000),
  constraint stories_slug_usable check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  constraint stories_title_usable check (
    length(btrim(title)) between 1 and 120
  ),
  -- 목록 행은 한 줄로 잘라 보여 주므로, 길이를 그 한 줄에 맞춰 둔다.
  constraint stories_hook_usable check (
    length(btrim(hook)) between 1 and 120
  ),
  constraint stories_intro_usable check (
    length(btrim(intro)) between 1 and 500
  ),
  constraint stories_cover_emoji_usable check (
    length(btrim(cover_emoji)) between 1 and 20
  ),
  constraint stories_cover_image_path_usable check (
    cover_image_path is null
    or length(btrim(cover_image_path)) between 1 and 512
  ),
  constraint stories_target_language_usable check (
    target_language ~ '^[a-z]{2}(?:-[A-Z]{2})?$'
  ),
  constraint stories_completion_title_usable check (
    length(btrim(completion_title)) between 1 and 120
  ),
  constraint stories_completion_copy_usable check (
    length(btrim(completion_copy)) between 1 and 500
  )
);

-- 사람이 쓴 각본 한 편. 번호는 스토리 안의 순서이고, 참조에는 안정된 id를 쓴다.
create table public.episodes (
  id uuid primary key,
  story_id uuid not null references public.stories (id) on delete restrict,
  number smallint not null,
  title text not null,
  preview text not null,
  situation text not null,
  situation_emoji text not null,
  opening text not null,
  stage text not null,
  cast_names text[] not null,
  ending_success text not null,
  ending_compromise text not null,
  ending_failure text not null,
  unique (story_id, number),
  constraint episodes_number_usable check (number between 1 and 100),
  constraint episodes_title_usable check (
    length(btrim(title)) between 1 and 120
  ),
  constraint episodes_preview_usable check (
    length(btrim(preview)) between 1 and 500
  ),
  constraint episodes_situation_usable check (
    length(btrim(situation)) between 1 and 300
  ),
  constraint episodes_situation_emoji_usable check (
    length(btrim(situation_emoji)) between 1 and 20
  ),
  constraint episodes_opening_usable check (
    length(btrim(opening)) between 1 and 10000
  ),
  constraint episodes_stage_usable check (
    length(btrim(stage)) between 1 and 20000
  ),
  constraint episodes_cast_names_usable check (
    cardinality(cast_names) between 1 and 20
  ),
  constraint episodes_ending_success_usable check (
    length(btrim(ending_success)) between 1 and 500
  ),
  constraint episodes_ending_compromise_usable check (
    length(btrim(ending_compromise)) between 1 and 500
  ),
  constraint episodes_ending_failure_usable check (
    length(btrim(ending_failure)) between 1 and 500
  )
);

-- 끝난 에피소드가 남기는 결말과 이야기 기억. 번호가 아니라 안정된 에피소드
-- id를 참조하므로 스토리가 늘거나 순서를 고쳐도 지난 기록의 대상을 잃지 않는다.
--
-- 한 화의 결말은 한 번만 난다. 기본키가 그 규칙이다. 같은 화의 결말이 다시
-- 도착해도 앞의 사실을 덮어쓰지 않는다.
create table public.episode_endings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete restrict,
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
  primary key (user_id, episode_id),
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

create index episode_endings_episode_id_idx
  on public.episode_endings (episode_id);

comment on table public.episode_endings is
  'One immutable ending and story memory per account and stable episode id.';

comment on column public.episode_endings.episode_id is
  'Stable episode reference. Numbers are only ordering inside a story.';

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

-- 진행 중과 끝난 에피소드가 같은 대화 기록 모양을 쓴다. `completed_at`이 비어
-- 있으면 이어서 할 장면이고, 값이 있으면 다시 열어 읽기만 하는 기록이다.
create table public.episode_runs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete restrict,
  messages jsonb not null,
  completed_at timestamptz,
  completed_by_fallback boolean not null default false,
  updated_at timestamptz not null default now(),
  primary key (user_id, episode_id),
  constraint episode_runs_messages_array check (jsonb_typeof(messages) = 'array'),
  -- 한 에피소드가 모델 문맥보다 훨씬 커지기 전에 저장 경계를 분명히 한다.
  -- 이 한도를 넘긴 기록은 결말을 막지 않고, 대화 기록 저장만 실패한다.
  constraint episode_runs_messages_size check (
    octet_length(messages::text) <= 1048576
  )
);

create index episode_runs_episode_id_idx on public.episode_runs (episode_id);

comment on table public.episode_runs is
  'One server-saved UI message list per account and episode, active or completed.';

comment on column public.episode_runs.messages is
  'AI SDK UI messages with stable message ids. Limited to one MiB per episode.';

comment on column public.episode_runs.completed_at is
  'Set after an ending exists. A fallback completion can be upgraded once by a compatible normal completion.';

comment on column public.episode_runs.completed_by_fallback is
  'True while a stopped client snapshot is the completed transcript. A compatible normal completion replaces it and clears this flag.';

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
