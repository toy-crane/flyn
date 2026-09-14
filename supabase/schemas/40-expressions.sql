-- 대화와 노트가 같은 표현을 읽는다. 생성 중인 대사는 뜻과 저장 시각이 없다.
create table public.expressions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references public.profiles(id) on delete cascade,
  episode_id uuid not null references public.episodes(id) on delete no action deferrable initially deferred,
  message_id uuid,
  kind text not null check (kind in ('dialogue', 'correction', 'translation')),
  dialogue_index smallint check (dialogue_index between 0 and 100),
  text text not null check (length(btrim(text)) between 1 and 1000),
  meaning text check (meaning is null or length(btrim(meaning)) between 1 and 1000),
  speaker text check (speaker is null or length(btrim(speaker)) between 1 and 60),
  original text check (original is null or length(btrim(original)) between 1 and 1000),
  entries jsonb check (entries is null or (jsonb_typeof(entries) = 'array' and octet_length(entries::text) <= 65536)),
  situation text check (situation is null or length(btrim(situation)) between 1 and 160),
  example text check (example is null or length(btrim(example)) between 1 and 1000),
  example_meaning text check (example_meaning is null or length(btrim(example_meaning)) between 1 and 1000),
  saved_at timestamptz,
  claim_token uuid,
  expires_at timestamptz,
  created_at timestamptz not null default clock_timestamp(),
  updated_at timestamptz not null default clock_timestamp(),
  foreign key (message_id, user_id) references public.episode_messages(id, user_id)
    on delete set null (message_id),
  constraint expressions_source_shape check (
    (kind = 'dialogue') = (dialogue_index is not null)
    and (kind = 'dialogue') = (speaker is not null)
    and (kind <> 'dialogue') = (original is not null)
    and (kind <> 'dialogue') = (entries is not null)
  ),
  constraint expressions_generation_whole check (
    case when kind = 'dialogue' and meaning is null then
      claim_token is not null and expires_at is not null and saved_at is null
    else claim_token is null and expires_at is null end
  ),
  constraint expressions_learning_whole check (
    kind = 'dialogue' or (
      jsonb_array_length(entries) > 0
      -- 출처를 잃은 옛 노트에는 애초에 만들지 않은 돌아보기 필드가 있을 수 있다.
      and (message_id is null or num_nonnulls(meaning, situation, example, example_meaning) = 4)
    )
  )
);

create unique index expressions_one_per_source_idx
  on public.expressions(message_id, coalesce(dialogue_index, -1)) where message_id is not null;
create index expressions_user_id_saved_at_idx
  on public.expressions(user_id, saved_at desc) where saved_at is not null;
create index expressions_user_id_idx on public.expressions(user_id);
create index expressions_episode_id_idx on public.expressions(episode_id);
