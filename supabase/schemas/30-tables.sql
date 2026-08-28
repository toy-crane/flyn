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

-- 한 사람이 한 화를 플레이한 기록. 시작 시각과 결말과 이야기 기억이 여기 붙고,
-- 그 아래 오간 메시지가 대화 기록이 된다. 번호가 아니라 안정된 에피소드 id를
-- 참조하므로 스토리가 늘거나 순서를 고쳐도 지난 기록의 대상을 잃지 않는다.
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
  -- 한 사람은 한 화를 한 번 플레이한다. 옛 결말 테이블의 기본키였던 짝이 여기
  -- 그대로 남아 같은 규칙을 지킨다. 이름을 붙인 이유는 `public.finish_episode`가
  -- `on conflict on constraint`로 이 제약을 가리키기 때문이다. 열 이름으로 쓰면
  -- `episode_id`가 함수 파라미터와 컬럼 사이에서 모호해진다.
  constraint episode_plays_one_per_episode unique (user_id, episode_id),
  -- 메시지가 (play_id, user_id) 한 쌍으로 참조하기 위한 대상. 자식이 나르는
  -- user_id가 플레이의 주인과 어긋날 수 없게 만든다. 그래서 메시지 정책은
  -- 조인 없이 자기 열만 보고 끝난다.
  constraint episode_plays_owned_id unique (id, user_id),
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

comment on table public.episode_plays is
  'One account playing one episode: when it started, how it ended, and the story memory it left.';

comment on column public.episode_plays.id is
  'Stable key the messages and corrections of this play hang from.';

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

-- 사용자 메시지에 붙는 교정 한 건. 화면에서는 배울 표현으로 부른다.
--
-- 한 메시지에 여러 개가 붙고, 각 행이 원문의 어긋난 부분과 고친 문장과 이유를
-- 함께 담는다. 행으로 남기므로 한 계정이 지금까지 받은 교정 전체를 한 번의
-- 조회로 꺼낼 수 있다.
create table public.episode_corrections (
  id uuid primary key default gen_random_uuid(),
  message_id uuid not null,
  user_id uuid not null default auth.uid(),
  -- 원문에서 어긋난 부분.
  original text not null,
  -- 모든 교정을 반영한 고친 문장.
  corrected text not null,
  -- 왜 그런지 한국어 한 줄.
  reason text not null,
  created_at timestamptz not null default now(),
  foreign key (message_id, user_id)
    references public.episode_messages (id, user_id) on delete cascade,
  constraint episode_corrections_original_usable check (
    length(btrim(original)) between 1 and 1000
  ),
  constraint episode_corrections_corrected_usable check (
    length(btrim(corrected)) between 1 and 1000
  ),
  constraint episode_corrections_reason_usable check (
    length(btrim(reason)) between 1 and 300
  )
);

-- 한 메시지에 붙은 교정을 함께 읽고, 그 메시지가 사라질 때 함께 지운다. 외래키가
-- `(message_id, user_id)`인데 여기는 앞자리만 담는다. 위 `episode_messages`의
-- 색인 주석과 같은 이유다.
create index episode_corrections_message_id_idx
  on public.episode_corrections (message_id);

-- 계정에 쌓인 배울 표현을 한 번에 꺼내는 조회가 이 색인을 탄다.
create index episode_corrections_user_id_idx
  on public.episode_corrections (user_id);

comment on table public.episode_corrections is
  'One correction attached to a user message. Shown in the app as 배울 표현.';

comment on column public.episode_corrections.original is
  'The part of what the person wrote that was off.';

comment on column public.episode_corrections.corrected is
  'The corrected sentence, with every correction on this message applied.';

comment on column public.episode_corrections.reason is
  'One Korean line saying why.';

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
