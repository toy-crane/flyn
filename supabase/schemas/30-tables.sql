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
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
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
  updated_at timestamptz not null default clock_timestamp(),
  id uuid primary key default gen_random_uuid(),
  -- 이 스토리를 만든 사람. 공식 콘텐츠는 비어 있고, 사용자가 만든 스토리에만
  -- 이름이 들어간다. 탐색에서 무엇이 보이는지를 이 한 열이 가른다.
  --
  -- 사람이 지워지면 그 사람이 만든 스토리도 함께 지운다. 공식 스토리는 주인이
  -- 없어 이 연쇄에 걸리지 않는다.
  owner_id uuid references public.profiles (id) on delete cascade,
  -- 만든 순서. 탐색의 `내 스토리`가 최근에 만든 것부터 보여 준다. 공식
  -- 스토리에는 `position`이 그 일을 하므로 이 값을 쓰지 않는다.
  created_at timestamptz not null default now(),
  -- 공식 콘텐츠 안의 자리. 사용자가 만든 스토리에는 없다.
  position smallint unique,
  -- seed가 공식 콘텐츠를 다시 올릴 때 같은 행을 찾는 열쇠. 사용자가 만든
  -- 스토리에는 없으므로 seed의 문장이 그 행에 닿지 못한다.
  slug text unique,
  title text not null,
  -- 목록 행에 쓰는 한 줄 소개. 사용자에게 벌어진 사건을 1인칭 한국어로 쓴다.
  hook text not null,
  -- 스토리 상세가 여는 소개 문단. 훅보다 길고, 세계와 인물을 함께 말한다.
  intro text not null,
  -- `story-covers` 버킷에서 이 스토리의 표지 그림이 있는 자리.
  -- URL이 아니라 경로다. 같은 행을 시뮬레이터, 기기, 배포본이 함께 읽는데
  -- 저장소에 닿는 주소가 저마다 달라서, `http://127.0.0.1:54321/...`을 넣으면
  -- 그 행이 쓴 컴퓨터에 묶인다. `profiles.avatar_path`와 같은 이유다.
  cover_image_path text,
  cover_blurhash text,
  target_language text not null,
  completion_title text not null,
  completion_copy text not null,
  constraint stories_position_usable check (position between 1 and 10000),
  constraint stories_slug_usable check (
    slug ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  -- 공식 콘텐츠는 자리와 열쇠를 함께 갖고, 사용자가 만든 스토리는 둘 다 갖지
  -- 않는다. 한쪽만 가진 행을 막아야 seed가 절반만 찾아내는 일이 생기지 않는다.
  constraint stories_authorship_usable check (
    (owner_id is null) = (slug is not null)
    and (owner_id is null) = (position is not null)
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

-- 한 스토리에 사는 등장인물. 화가 바뀌어도 같은 것만 여기 있다.
--
-- 탐색이 "내가 만든 스토리를 최근에 만든 것부터"를 묻고, 정책도 행마다 같은
-- 열을 확인한다. 두 열이 그 순서대로 앉아 있으면 그 질문이 이 색인만 탄다.
-- 공식 스토리는 `owner_id`가 비어 있어 이 색인에 거의 자리를 차지하지 않는다.
create index stories_owner_id_created_at_idx
  on public.stories (owner_id, created_at desc)
  where owner_id is not null;

-- 인물을 스토리가 소유하면 같은 사람을 화마다 다시 설명하지 않는다. 화가 이
-- 행을 가리키므로 1화의 Mia와 2화의 Mia가 같은 사람이라는 것이 글자 일치가
-- 아니라 관계로 남는다. 그 화에서의 사정은 여기가 아니라 화의 `stage`가 쓴다.
--
-- `position`은 스토리 안의 순서이고 이름표 색의 번호가 된다. 1..4로 묶고 스토리
-- 안에서 겹치지 않게 하면, 스토리에 다섯째 인물이 생기는 일도 세는 트리거 없이
-- 막힌다. 한 모델이 여러 인물을 연기하므로 넷을 넘으면 인물이 흐려진다.
create table public.characters (
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  id uuid primary key default gen_random_uuid(),
  -- 스토리가 인물을 소유하므로 스토리가 사라지면 인물도 사라진다. 계정을
  -- 지우면 그 사람이 만든 스토리가 지워지는데, 여기가 `restrict`면 그 연쇄가
  -- 막혀 계정 삭제가 절반만 지운 채 실패한다.
  --
  -- 공식 스토리를 실수로 지우는 것을 막는 일은 스토리를 바깥에서 가리키는
  -- 회차와 저장한 표현이 맡는다. 그 둘은 행이 생긴 뒤에만 막으므로, 아무도
  -- 플레이하지 않은 스토리는 `delete from public.stories` 한 문장에 인물과
  -- 대본까지 함께 사라진다. 그 문장을 쓸 수 있는 것은 소유자와 `service_role`
  -- 뿐이고 앱에는 그 길이 없다.
  story_id uuid not null references public.stories (id) on delete cascade,
  -- 공식 콘텐츠의 고정 키. 이름이나 순서를 바꿔도 이 값은 바꾸지 않는다.
  content_key text,
  name text not null,
  position smallint not null,
  persona text not null,
  unique (story_id, content_key),
  unique (story_id, name) deferrable initially deferred,
  constraint characters_content_key_usable check (
    content_key is null or content_key ~ '^[a-z0-9]+(?:-[a-z0-9]+)*$'
  ),
  -- 콘텐츠를 다시 올릴 때 두 인물의 순서가 서로 바뀔 수 있다. 문장이 끝날 때
  -- 확인하면 그 교체가 중간 상태에서 걸리지 않는다. 화 안의 자리도 같은 자세다.
  unique (story_id, position) deferrable initially deferred,
  -- 화가 (character_id, story_id) 한 쌍으로 참조하기 위한 대상. 다른 스토리의
  -- 인물을 이 화에 세우는 문장이 외래키에서 막힌다.
  constraint characters_owned_id unique (id, story_id),
  constraint characters_name_usable check (
    length(btrim(name)) between 1 and 60
  ),
  constraint characters_position_usable check (position between 1 and 4),
  constraint characters_persona_usable check (
    length(btrim(persona)) between 1 and 2000
  )
);

-- 사람이 쓴 대본 한 편. 번호는 스토리 안의 순서이고, 참조에는 안정된 id를 쓴다.
create table public.episodes (
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  id uuid primary key default gen_random_uuid(),
  -- `characters.story_id`와 같은 이유로 함께 지운다. 대본은 스토리의 일부다.
  story_id uuid not null references public.stories (id) on delete cascade,
  number smallint not null,
  title text not null,
  preview text not null,
  situation text not null,
  situation_emoji text not null,
  opening text not null,
  stage text not null,
  ending_success text not null,
  ending_compromise text not null,
  ending_failure text not null,
  unique (story_id, number),
  -- `episode_characters`가 (episode_id, story_id) 한 쌍으로 참조하기 위한 대상.
  constraint episodes_owned_id unique (id, story_id),
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

-- 이 화에 서는 인물. 스토리가 소유한 인물 중 누가 나오는지만 가리킨다.
--
-- `position`은 이 화의 인물 목록에서의 자리다. 프롬프트의 등장인물 문장이 이 차례로
-- 이름을 부르므로, 같은 인물이라도 화마다 먼저 불릴 수 있다. 색을 정하는
-- `characters.position`과는 다른 값이다. 1..3으로 묶고 화 안에서 겹치지 않게
-- 하면 화에 넷째 인물이 서는 일도 세는 트리거 없이 막힌다.
--
-- `story_id`를 함께 들고 두 부모를 그 쌍으로 참조한다. 열 하나가 늘지만, 다른
-- 스토리의 인물을 이 화에 세우는 문장이 애플리케이션에 닿기 전에 막힌다.
create table public.episode_characters (
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  episode_id uuid not null,
  character_id uuid not null,
  story_id uuid not null,
  position smallint not null,
  primary key (episode_id, character_id),
  -- 콘텐츠를 다시 올릴 때 두 인물의 자리가 서로 바뀔 수 있다. 문장이 끝날 때
  -- 확인하면 그 교체가 중간 상태에서 걸리지 않는다.
  unique (episode_id, position) deferrable initially deferred,
  constraint episode_characters_episode_fkey
    foreign key (episode_id, story_id)
    references public.episodes (id, story_id) on delete cascade,
  -- 인물이 사라지면 그 인물이 서 있던 자리도 사라진다. 인물을 바꿔 다시 올릴
  -- 때는 이름이 같은 행을 갱신하므로 이 연쇄를 타지 않는다.
  constraint episode_characters_character_fkey
    foreign key (character_id, story_id)
    references public.characters (id, story_id) on delete cascade,
  constraint episode_characters_position_usable check (position between 1 and 3)
);

-- 화를 열 때마다 이 스토리의 연결을 자리 차례로 읽는다. 기본 키는 화 하나를
-- 묻는 데만 쓸모가 있어서 이 방향을 돕지 못한다.
create index episode_characters_story_idx
  on public.episode_characters (story_id, position);

-- 인물 행을 지울 때의 참조 검사가 이 색인을 탄다. 없으면 그 검사가 테이블을
-- 훑는다.
create index episode_characters_character_idx
  on public.episode_characters (character_id);

-- 한 사람이 한 스토리를 1화부터 진행하는 회차 하나.
--
-- 같은 스토리를 여러 번 진행할 수 있게 만드는 것이 이 테이블이다. 플레이,
-- 메시지, 교정과 이야기 기억이 모두 회차 아래로 들어가므로, 두 회차에서 다른
-- 선택을 해도 서로의 기억을 읽지 않는다.
--
-- 행은 사용자가 1화에서 처음 말할 때 생긴다. 첫 장면만 보고 나온 진입은 아무
-- 행도 남기지 않으므로, 빈 회차를 숨기는 규칙 없이도 기록에 빈 줄이 생기지
-- 않는다. 두 기기가 동시에 처음 말하면 회차도 둘로 갈린다. 서로 다른 대화를
-- 한 회차로 합치면 그 회차의 이야기 기억이 두 흐름을 섞어 읽게 된다.
create table public.story_plays (
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  id uuid primary key default gen_random_uuid(),
  -- `episode_plays`와 같은 이유로 부르는 사람이 채운다. insert grant에서 빠져
  -- 있어 남의 이름으로 회차를 여는 문장은 정책에 닿기 전에 권한에서 막힌다.
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  -- 회차는 스토리를 바깥에서 가리킨다. 회차가 남아 있는 스토리를 지우는 문장은
  -- 여기서 막혀야 하고, 공식 콘텐츠를 지키는 일이 그 막음이다.
  --
  -- 다만 확인을 문장이 끝날 때로 미룬다. 계정을 지우면 그 사람의 회차와 그
  -- 사람이 만든 스토리가 같은 문장 안에서 함께 사라지는데, 지우는 차례는 정해져
  -- 있지 않다. 스토리가 먼저 지워지는 차례에서 바로 확인하면 아직 남아 있는
  -- 회차 때문에 계정 삭제가 통째로 막힌다. 문장이 끝날 때는 둘 다 사라져 있다.
  story_id uuid not null references public.stories (id)
    on delete no action deferrable initially deferred,
  started_at timestamptz not null default now(),
  -- 이 회차에서 사용자가 마지막으로 말한 시각. 스토리 탭의 `최근 대화`가 이
  -- 값으로 정렬한다.
  --
  -- 메시지를 세지 않고 시각만 밀어 올린다. 기록을 열어 보거나 첫 장면만 열어
  -- 보는 것으로는 사용자 메시지가 생기지 않으므로, 조회가 순서를 바꿀 수 있는
  -- 길이 없다. 트리거가 쓰고 클라이언트는 쓰지 못한다.
  last_user_message_at timestamptz,
  -- 플레이가 (story_play_id, user_id) 한 쌍으로 참조하기 위한 대상. 자식이 나르는
  -- user_id가 회차의 주인과 어긋날 수 없게 만든다.
  constraint story_plays_owned_id unique (id, user_id)
);

-- 스토리 탭이 "내가 대화한 스토리를 최근순으로"를 묻는다. 두 열이 그 순서대로
-- 앉아 있으면 그 질문 하나가 이 색인만 탄다.
create index story_plays_user_id_last_message_idx
  on public.story_plays (user_id, last_user_message_at desc);

-- 대화 기록 화면이 스토리 하나의 회차를 모아 읽고, 스토리를 지울 때 도는 조회도
-- 함께 받는다.
create index story_plays_story_id_idx on public.story_plays (story_id);

comment on table public.story_plays is
  'One account playing one story from episode 1. Created by the first user message, never by opening a scene.';

comment on column public.story_plays.started_at is
  'When this run began, which is when its first user message arrived. Shown as the record card title.';

comment on column public.story_plays.last_user_message_at is
  'When this run last received a user message. Written by a trigger, so reading a record cannot move it.';

-- 한 사람이 한 회차에서 한 화를 플레이한 기록. 시작 시각과 결말과 이야기 기억이
-- 여기 붙고, 그 아래 오간 메시지가 대화 기록이 된다. 번호가 아니라 안정된
-- 에피소드 id를 참조하므로 스토리가 늘거나 순서를 고쳐도 지난 기록의 대상을
-- 잃지 않는다.
--
-- 진행 중과 끝남은 `finished_at`이 가른다. 대화 쪽에 완료 표시를 따로 두지
-- 않는다. 한 화의 결말은 한 번만 나고, `public.finish_episode`가 그 규칙을 지킨다.
create table public.episode_plays (
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  -- 메시지와 교정이 참조할 안정된 키. (user_id, episode_id)를 그대로 물려주면
  -- 자식 테이블마다 두 열을 나르게 되고, 교정은 그 위에 message_id까지 얹어
  -- 세 열이 된다.
  id uuid primary key default gen_random_uuid(),
  -- 부르는 사람이 채운다. 값을 실어 보낼 필요가 없으니 insert grant에서 이 열을
  -- 빼 두었고, 그래서 남의 이름으로 플레이를 여는 문장은 정책에 닿기도 전에
  -- 권한에서 막힌다. 정책은 그대로 두어 기본값이 바뀌어도 규칙이 남는다.
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  -- 이 플레이가 속한 회차. 같은 화를 여러 회차에서 플레이할 수 있게 만드는
  -- 자리이자, 이야기 기억을 회차 안에 가두는 자리다.
  story_play_id uuid not null,
  -- `story_plays.story_id`와 같은 이유로 확인을 문장 끝으로 미룬다.
  episode_id uuid not null references public.episodes (id)
    on delete no action deferrable initially deferred,
  started_at timestamptz not null default now(),
  -- 결말의 종류. 화면에도 이 낱말이 그대로 보인다.
  ending_kind text,
  -- 사건의 결과 한 줄. 홈의 끝낸 화 목록과 마무리 화면이 함께 읽는다. 이야기
  -- 기억의 네 가지 중 "사건의 결과"이기도 하다.
  ending_outcome text,
  -- 이야기 기억의 나머지 세 가지. 다음 화의 프롬프트에 들어가 대사와 관계와
  -- 지문으로 돌아온다. 장면을 닫은 모델이 결말과 같은 출력에 함께 쓰므로, 그
  -- 줄을 쓰지 않았거나 형식을 어긴 화는 기억 없이 남는다.
  memory_choice text,
  memory_relationship text,
  memory_question text,
  finished_at timestamptz,
  -- 한 회차 안에서 한 화는 한 번 플레이한다. 계정이 아니라 회차가 기준이라는
  -- 것이 다시 플레이를 열어 주는 규칙이다. 이름을 붙인 이유는
  -- `public.finish_episode`가 `on conflict on constraint`로 이 제약을 가리키기
  -- 때문이다. 열 이름으로 쓰면 `episode_id`가 함수 파라미터와 컬럼 사이에서
  -- 모호해진다.
  constraint episode_plays_one_per_story_play unique (story_play_id, episode_id),
  -- 메시지가 (episode_play_id, user_id) 한 쌍으로 참조하기 위한 대상. 자식이 나르는
  -- user_id가 플레이의 주인과 어긋날 수 없게 만든다. 그래서 메시지 정책은
  -- 조인 없이 자기 열만 보고 끝난다.
  constraint episode_plays_owned_id unique (id, user_id),
  -- 회차와 같은 짝을 물려받는다. 플레이가 나르는 user_id가 회차의 주인과
  -- 어긋날 수 없으므로, 정책은 남의 회차에 플레이를 매다는 문장을 조인 없이
  -- 막는다.
  foreign key (story_play_id, user_id)
    references public.story_plays (id, user_id) on delete cascade,
  -- 결말은 셋이 함께 오거나 함께 없다. 종류만 있고 결과가 없는 반쪽 결말은
  -- 화면이 읽을 수 없다.
  constraint episode_plays_ending_whole check (
    (ending_kind is null) = (finished_at is null)
    and (ending_outcome is null) = (finished_at is null)
  ),
  -- 이야기 기억은 장면을 닫은 모델이 결말과 같은 출력에 쓴다. 끝나지 않은
  -- 플레이에 기억만 있을 수는 없다.
  constraint episode_plays_memory_needs_ending check (
    finished_at is not null
    or (
      memory_choice is null
      and memory_relationship is null
      and memory_question is null
    )
  ),
  constraint episode_plays_ending_kind_known check (
    ending_kind is null or ending_kind in ('성공', '타협', '실패')
  ),
  constraint episode_plays_ending_outcome_usable check (
    ending_outcome is null or length(btrim(ending_outcome)) between 1 and 300
  ),
  constraint episode_plays_memory_choice_usable check (
    memory_choice is null or length(btrim(memory_choice)) between 1 and 300
  ),
  constraint episode_plays_memory_relationship_usable check (
    memory_relationship is null
    or length(btrim(memory_relationship)) between 1 and 300
  ),
  constraint episode_plays_memory_question_usable check (
    memory_question is null or length(btrim(memory_question)) between 1 and 300
  )
);

create index episode_plays_episode_id_idx
  on public.episode_plays (episode_id);

-- `(story_play_id, user_id)` 외래키를 정확히 덮는 색인은 두지 않는다. 위
-- `episode_plays_one_per_story_play`이 만드는 유니크 색인의 앞자리가 `story_play_id`라 회차의
-- 플레이를 모아 읽는 조회도, 회차를 지울 때 도는 조회도 그것을 탄다.
-- `episode_messages`의 같은 자리와 같은 판단이다.

comment on table public.episode_plays is
  'One account playing one episode inside one run: when it started, how it ended, and the story memory it left.';

comment on column public.episode_plays.id is
  'Stable key the messages and corrections of this play hang from.';

comment on column public.episode_plays.story_play_id is
  'The run this play belongs to. Story memory never crosses it.';

comment on column public.episode_plays.episode_id is
  'Stable episode reference. Numbers are only ordering inside a story.';

comment on column public.episode_plays.started_at is
  'When this account opened the episode. Set once and never rewritten.';

comment on column public.episode_plays.ending_kind is
  'How the incident ended: 성공, 타협 or 실패. Null while the play is still open.';

comment on column public.episode_plays.ending_outcome is
  'One Korean line naming what happened, written by the model that closed the scene.';

comment on column public.episode_plays.memory_choice is
  'What the person did in this incident. Null when the closing scene left no memory lines.';

comment on column public.episode_plays.memory_relationship is
  'How the relationship changed. Null when the closing scene left no memory lines.';

comment on column public.episode_plays.memory_question is
  'The question this incident opened. Null when the closing scene left no memory lines.';

comment on column public.episode_plays.finished_at is
  'When the permanent ending arrived. Null means the play is still open; a value freezes it.';

-- 대화의 메시지 한 건이 한 행이다. 배열 하나를 통째로 덮어쓰지 않으므로 뒤를
-- 잘라 내는 다시 받기와 수정이 그 행을 지우는 일이 되고, 사용자가 어느 화에서
-- 무엇을 썼는지 꺼내는 조회가 대화 전문을 풀지 않아도 된다.
--
-- 행은 메시지까지만 나누고 `parts`는 JSON 한 덩이로 둔다. part 구조는 AI SDK가
-- 판올림마다 바꾸는 계약이라 여기까지 펴면 SDK를 올릴 때마다 데이터 구조를 함께
-- 고쳐야 한다. Vercel이 자기 제품에서 긋는 선도 같은 자리다.
create table public.episode_messages (
  updated_at timestamptz not null default clock_timestamp(),
  -- AI SDK가 이 메시지에 붙인 식별자를 그대로 쓴다. 앱과 서버와 데이터베이스가
  -- 같은 이름으로 같은 메시지를 가리켜야, 다시 받기가 "이 메시지부터"를 말할 수
  -- 있다. uuid로 좁혀 두면 앱이 아무 문자열이나 실어 보낼 수 없다.
  id uuid primary key,
  episode_play_id uuid not null,
  -- 플레이의 주인을 여기 한 번 더 적는다. 복합 외래키가 둘을 묶으므로 어긋날 수
  -- 없고, 대신 정책이 다른 테이블을 보지 않고 이 열만으로 답한다. 값은
  -- `episode_plays`와 같은 이유로 부르는 사람이 채운다.
  user_id uuid not null default auth.uid(),
  role text not null,
  parts jsonb not null,
  -- 대화 안의 자리를 이 시각이 정한다. 번호를 따로 매기지 않는 이유는 그 번호를
  -- 누군가 세야 하기 때문이다. 애플리케이션이 세면 저장이 한 번 실패했을 때
  -- 어긋나고, 데이터베이스가 세게 하려면 트리거가 매번 같은 플레이를 훑는다.
  -- 대화는 뒤에 붙거나 뒤를 잘라 낼 뿐 중간에 끼워 넣지 않으므로 시각으로 충분하다.
  -- Vercel도 자기 제품에서 같은 선택을 했다.
  --
  -- `now()`가 아니라 `clock_timestamp()`인 것은 한 트랜잭션이 두 행을 넣어도
  -- 앞뒤가 갈리게 하기 위해서다. `now()`는 트랜잭션이 시작한 순간에 멈춰 있다.
  --
  -- insert grant에 이 열이 없다. 앱이 보낸 시각은 순서의 근거가 되지 않는다.
  created_at timestamptz not null default clock_timestamp(),
  expression_status text,
  constraint episode_messages_expression_status_known check (
    expression_status is null or (role = 'user' and expression_status in ('provided', 'natural', 'unclear'))
  ),
  -- 표현이 (message_id, user_id) 한 쌍으로 참조하기 위한 대상.
  constraint episode_messages_owned_id unique (id, user_id),
  foreign key (episode_play_id, user_id)
    references public.episode_plays (id, user_id) on delete cascade,
  constraint episode_messages_role_known check (role in ('user', 'assistant')),
  constraint episode_messages_parts_array check (jsonb_typeof(parts) = 'array'),
  -- 한 메시지가 모델 문맥보다 커지기 전에 저장 경계를 분명히 한다. 옛 구조의
  -- 1 MiB는 한 화의 대화 전체에 걸린 한도였고, 그래서 대화가 길어질수록 남은
  -- 자리가 줄었다. 여기서는 메시지 하나마다 같은 한도가 걸린다.
  constraint episode_messages_parts_size check (
    octet_length(parts::text) <= 262144
  )
);

-- 한 플레이의 대화를 순서대로 읽는 조회와 뒤를 잘라 내는 삭제가 모두 이 색인을
-- 탄다. 앞자리가 `episode_play_id`이므로 부모를 지울 때 도는 조회도 함께 받는다.
--
-- `(episode_play_id, user_id)` 외래키를 정확히 덮는 색인은 두지 않는다. Supabase
-- advisor가 `unindexed_foreign_keys`를 INFO로 보고하지만, 앞자리 일치로 충분하고
-- 이 데이터베이스는 `retired_usernames_retired_by_fkey`에서 같은 보고를 이미 받아
-- 두고 있다(2026-08-29 `supabase db advisors --local`로 확인).
create index episode_messages_episode_play_id_created_at_idx
  on public.episode_messages (episode_play_id, created_at);

create index episode_messages_user_id_idx
  on public.episode_messages (user_id);

comment on table public.episode_messages is
  'One AI SDK UI message per row, ordered inside a play by created_at.';

comment on column public.episode_messages.id is
  'The id the AI SDK gave this message. Shared by the app, the server and this row.';

comment on column public.episode_messages.created_at is
  'When the row landed, and the order the conversation is read in. Written by the database, never by a client.';

comment on column public.episode_messages.parts is
  'AI SDK UI message parts, kept as one JSON document. Limited to 256 KiB per message.';

-- 학습한 사실은 대화 원본과 수명이 다르다. 출처 ID는 중복 기록을 막는 키로만
-- 남기며 외래키를 두지 않는다. 회차를 지워도 날짜와 횟수는 남고 본문과 결말은
-- 이 테이블에서 되찾을 수 없다. 계정을 지울 때는 함께 지운다.
create table public.learning_events (
  kind text not null check (kind in ('english_message', 'episode_completed')),
  source_id uuid not null,
  user_id uuid not null references public.profiles (id) on delete cascade,
  occurred_at timestamptz not null,
  primary key (kind, source_id)
);

create index learning_events_user_time_idx
  on public.learning_events (user_id, occurred_at);

comment on table public.learning_events is
  'Permanent study facts without conversation text or endings; run deletion does not erase them.';

-- 사용자가 쓰는 영어의 수준. 시즌이 아니라 계정에 붙는다.
--
-- 이야기 기억은 시즌이 끝나면 함께 끝나지만 이 사람의 영어는 이어진다. 그래서
-- 같은 행에 두지 않고 계정마다 한 줄로 둔다. 화가 끝날 때마다 그 시점의 관찰로
-- 덮어쓴다. 지난 수준의 역사는 남기지 않는다.
create table public.language_levels (
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
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

-- 운영자가 Dashboard에서 바꾸는 설치 버전 정책. 배포 대상별로 최소값은 하나뿐이다.
-- 앱은 다른 대상의 값을 읽지 않아 내부 테스터와 공개 사용자를 따로 관리한다.
create table public.app_version_policies (
  platform text not null check (platform in ('ios', 'android')),
  distribution text not null check (distribution in ('internal', 'public')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  minimum_version text check (
    minimum_version is null
    or minimum_version ~ '^(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$'
  ),
  install_url text check (
    install_url is null
    or (length(install_url) <= 2048 and install_url ~ '^https://[^[:space:]/]+/[^[:space:]]+$')
  ),
  primary key (platform, distribution),
  constraint app_version_policies_install_url_required check (
    minimum_version is null or install_url is not null
  )
);

comment on table public.app_version_policies is
  'Minimum installed app version and installation URL for each platform and distribution. Edit in Dashboard after verifying the destination.';
comment on column public.app_version_policies.minimum_version is
  'Set x.y.z to block older installed apps; set NULL to disable the block.';
comment on column public.app_version_policies.install_url is
  'Verified TestFlight or public store HTTPS URL. Required before enabling minimum_version.';
