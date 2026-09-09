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
  id uuid primary key default gen_random_uuid(),
  position smallint not null unique,
  slug text not null unique,
  title text not null,
  -- 목록 행에 쓰는 한 줄 소개. 사용자에게 벌어진 사건을 1인칭 한국어로 쓴다.
  hook text not null,
  -- 스토리 상세가 여는 소개 문단. 훅보다 길고, 세계와 인물을 함께 말한다.
  intro text not null,
  -- 기존 콘텐츠 호환을 위해 보존한다. 표지 화면에서는 표시하지 않는다.
  cover_emoji text not null,
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
  id uuid primary key default gen_random_uuid(),
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
  id uuid primary key default gen_random_uuid(),
  -- `episode_plays`와 같은 이유로 부르는 사람이 채운다. insert grant에서 빠져
  -- 있어 남의 이름으로 회차를 여는 문장은 정책에 닿기 전에 권한에서 막힌다.
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  story_id uuid not null references public.stories (id) on delete restrict,
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
  episode_id uuid not null references public.episodes (id) on delete restrict,
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
  -- 메시지가 (play_id, user_id) 한 쌍으로 참조하기 위한 대상. 자식이 나르는
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
  -- AI SDK가 이 메시지에 붙인 식별자를 그대로 쓴다. 앱과 서버와 데이터베이스가
  -- 같은 이름으로 같은 메시지를 가리켜야, 다시 받기가 "이 메시지부터"를 말할 수
  -- 있다. uuid로 좁혀 두면 앱이 아무 문자열이나 실어 보낼 수 없다.
  id uuid primary key,
  play_id uuid not null,
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
  -- 교정이 (message_id, user_id) 한 쌍으로 참조하기 위한 대상.
  constraint episode_messages_owned_id unique (id, user_id),
  foreign key (play_id, user_id)
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
-- 탄다. 앞자리가 `play_id`이므로 부모를 지울 때 도는 조회도 함께 받는다.
--
-- `(play_id, user_id)` 외래키를 정확히 덮는 색인은 두지 않는다. Supabase
-- advisor가 `unindexed_foreign_keys`를 INFO로 보고하지만, 앞자리 일치로 충분하고
-- 이 데이터베이스는 `retired_usernames_retired_by_fkey`에서 같은 보고를 이미 받아
-- 두고 있다(2026-08-29 `supabase db advisors --local`로 확인).
create index episode_messages_play_id_created_at_idx
  on public.episode_messages (play_id, created_at);

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

-- 메시지별 확인 완료 결과. 행이 없으면 아직 완료 결과가 없는 것이다.
-- 판정과 카드 내용을 한 행에 담아 일부만 저장되는 상태를 만들지 않는다.
-- 먼저 저장한 결과는 바꾸지 않으며, 메시지가 삭제되면 함께 사라진다.
create table public.episode_expression_results (
  message_id uuid primary key,
  user_id uuid not null default auth.uid(),
  status text not null,
  fixed text,
  entries jsonb,
  situation text,
  meaning text,
  example text,
  example_meaning text,
  foreign key (message_id, user_id)
    references public.episode_messages (id, user_id) on delete cascade,
  constraint episode_expression_results_status_known check (status in ('corrected', 'natural', 'unclear')),
  constraint episode_expression_results_complete check (
    case when status = 'corrected' then
      num_nonnulls(fixed, entries, situation, meaning, example, example_meaning) = 6
      and length(btrim(fixed)) >= 1 and length(btrim(fixed)) <= 1000
      and jsonb_typeof(entries) = 'array'
      and jsonb_array_length(entries) > 0
      and octet_length(entries::text) <= 65536
      and length(btrim(situation)) >= 1 and length(btrim(situation)) <= 160
      and length(btrim(meaning)) >= 1 and length(btrim(meaning)) <= 1000
      and length(btrim(example)) >= 1 and length(btrim(example)) <= 1000
      and length(btrim(example_meaning)) >= 1 and length(btrim(example_meaning)) <= 1000
    else num_nonnulls(fixed, entries, situation, meaning, example, example_meaning) = 0 end
  )
);

create index episode_expression_results_user_id_idx
  on public.episode_expression_results (user_id);

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

-- 사용자가 대화에서 손으로 담아 둔 영어 문장 하나. 화면에서는 표현 노트로 부른다.
--
-- 세 출처가 한 테이블을 나눠 쓴다. 표현 노트가 셋을 같은 목록에 같은 카드로
-- 그리므로 공통 열은 한 벌이어야 하고, 인물 대사에만 있는 화자나 교정에만 있는
-- 이유는 그 종류에서만 찬다.
--
-- 항목은 원본과 별개로 남는다. 교정은 메시지를 따라 지워지지만 저장은 사용자가
-- 직접 한 행동이라, 다시 받기로 사라지면 잃어버린 것이 된다. 그래서 메시지가
-- 지워지면 참조만 끊고 행은 남긴다.
create table public.saved_expressions (
  id uuid primary key default gen_random_uuid(),
  -- 앞의 테이블들과 같은 이유로 부르는 사람이 채운다. insert grant에서 빠져 있어
  -- 남의 이름으로 담는 문장은 정책에 닿기 전에 권한에서 막힌다.
  user_id uuid not null default auth.uid()
    references public.profiles (id) on delete cascade,
  -- 무엇에서 담았는지. 카드의 모양과 어느 열이 차는지를 이 값이 가른다. 화면에
  -- 그대로 보이지 않으므로 영어 키를 쓴다.
  kind text not null,
  -- 이 표현이 나온 화. 카드가 스토리 제목과 화 번호를 여기서 읽는다. 플레이가
  -- 아니라 각본을 가리키므로 회차를 지워도 출처 표시가 남는다.
  episode_id uuid not null references public.episodes (id) on delete restrict,
  -- 담을 때 곁에 있던 메시지. 다시 받기나 수정으로 그 메시지가 사라지면 여기만
  -- 비고 항목은 남는다. 단일 열 참조라 주인을 나르는 `user_id`는 건드리지 않는다.
  message_id uuid references public.episode_messages (id) on delete set null,
  -- 장면 안에서 몇 번째 대사인지. 한 장면에 대사가 여럿이면 각각 따로 담기므로
  -- 메시지 id만으로는 어느 대사인지 가리키지 못한다. 인물 대사만 쓴다.
  utterance_at smallint,
  -- 담은 영어 문장. 인물 대사는 그 대사, 영어 교정은 모든 수정을 반영한 고친
  -- 문장, 한국어 안내는 안내한 영어 문장이다.
  english text not null,
  -- 인물 대사가 더하는 둘. 뜻은 담을 때 한 번 만들고 다시 만들지 않는다.
  meaning text,
  speaker text,
  -- 교정과 안내가 더하는 둘. `original`은 사용자가 쓴 문장 전체이고, `entries`는
  -- 그 안에서 어긋난 자리와 고친 자리와 이유를 짝지은 배열이다. 배열째 두는 것은
  -- 한 메시지의 교정이 여럿이어도 담기는 것은 문장 하나이기 때문이다.
  original text,
  entries jsonb,
  created_at timestamptz not null default now(),
  constraint saved_expressions_kind_known check (
    kind in ('utterance', 'correction', 'guidance')
  ),
  -- 인물 대사의 세 값은 함께 오거나 함께 없다. 화자만 있고 뜻이 없는 반쪽 항목은
  -- 카드가 읽을 수 없다.
  constraint saved_expressions_utterance_whole check (
    (kind = 'utterance') = (meaning is not null)
    and (kind = 'utterance') = (speaker is not null)
    and (kind = 'utterance') = (utterance_at is not null)
  ),
  -- 교정과 안내의 두 값도 마찬가지다.
  constraint saved_expressions_learning_whole check (
    (kind <> 'utterance') = (original is not null)
    and (kind <> 'utterance') = (entries is not null)
  ),
  constraint saved_expressions_utterance_at_usable check (
    utterance_at is null or utterance_at between 0 and 100
  ),
  constraint saved_expressions_english_usable check (
    length(btrim(english)) between 1 and 1000
  ),
  constraint saved_expressions_meaning_usable check (
    meaning is null or length(btrim(meaning)) between 1 and 1000
  ),
  constraint saved_expressions_speaker_usable check (
    speaker is null or length(btrim(speaker)) between 1 and 60
  ),
  constraint saved_expressions_original_usable check (
    original is null or length(btrim(original)) between 1 and 1000
  ),
  constraint saved_expressions_entries_array check (
    entries is null or jsonb_typeof(entries) = 'array'
  ),
  constraint saved_expressions_entries_size check (
    entries is null or octet_length(entries::text) <= 8192
  )
);

-- 같은 자리를 두 번 담지 못하게 한다. 인물 대사는 메시지 안의 대사 자리까지
-- 봐야 갈리고, 교정과 안내는 메시지 하나에 종류마다 하나뿐이다.
--
-- 참조가 끊긴 행은 여기서 빠진다. 원본을 잃은 항목끼리는 같은 자리를 가리키지
-- 않으므로 서로 부딪힐 이유가 없다. `message_id`가 앞자리라 그 메시지가 지워질 때
-- 참조를 끊으러 도는 조회도 이 색인을 탄다.
create unique index saved_expressions_one_per_source_idx
  on public.saved_expressions (message_id, kind, coalesce(utterance_at, -1))
  where message_id is not null;

-- 표현 노트가 "내가 담은 것을 최근순으로"를 묻는다. 두 열이 그 순서대로 앉아
-- 있으면 그 질문 하나가 이 색인만 탄다.
create index saved_expressions_user_id_created_at_idx
  on public.saved_expressions (user_id, created_at desc);

-- 한 화를 다시 열 때 그 화에서 담은 것을 모아 읽고, 각본을 지울 때 도는 조회도
-- 함께 받는다.
create index saved_expressions_episode_id_idx
  on public.saved_expressions (episode_id);

comment on table public.saved_expressions is
  'One English sentence the person saved by hand. Shown in the app as 표현 노트.';

comment on column public.saved_expressions.kind is
  'Where it was saved from: utterance, correction or guidance. Decides which columns are filled.';

comment on column public.saved_expressions.episode_id is
  'The script this came from. Survives deleting the run, so the card keeps its story and number.';

comment on column public.saved_expressions.message_id is
  'The message it sat next to. Null once that message is gone; the row stays.';

comment on column public.saved_expressions.utterance_at is
  'Which utterance inside the scene, for character lines only.';

comment on column public.saved_expressions.english is
  'The saved English sentence.';

comment on column public.saved_expressions.meaning is
  'One Korean line saying what the character said. Made once when saved, for character lines only.';

comment on column public.saved_expressions.speaker is
  'Who said it, for character lines only.';

comment on column public.saved_expressions.original is
  'What the person wrote, for corrections and guidance only.';

comment on column public.saved_expressions.entries is
  'Which parts were off, what replaced them and why, as one JSON array. Corrections and guidance only.';
