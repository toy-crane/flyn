-- 이야기 계층과 각본을 데이터로 옮기고, 번호 기반 결말 기록을 안정된
-- episode_id 참조로 보존 이관한다.
set check_function_bodies = false;

create table public.stories (
  id uuid primary key,
  position smallint not null unique,
  slug text not null unique,
  title text not null,
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

alter table public.stories enable row level security;

create policy stories_select_authenticated on public.stories
  for select
  to authenticated
  using (true);

revoke all on table public.stories from anon, authenticated, service_role;
grant select on table public.stories to authenticated;
grant all on table public.stories to service_role;

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

alter table public.episodes enable row level security;

create policy episodes_select_authenticated on public.episodes
  for select
  to authenticated
  using (true);

revoke all on table public.episodes from anon, authenticated, service_role;
grant select on table public.episodes to authenticated;
grant all on table public.episodes to service_role;

insert into public.stories (
  id,
  position,
  slug,
  title,
  target_language,
  completion_title,
  completion_copy
)
values (
  '10000000-0000-4000-8000-000000000001',
  1,
  'mia-cafe',
  'Mia의 카페',
  'en',
  '첫 이야기를 끝냈어요',
  '다섯 번의 사건을 영어로 지나왔어요.'
);

insert into public.episodes (
  id,
  story_id,
  number,
  title,
  preview,
  situation,
  situation_emoji,
  opening,
  stage,
  cast_names,
  ending_success,
  ending_compromise,
  ending_failure
)
values
  (
    '11000000-0000-4000-8000-000000000001',
    '10000000-0000-4000-8000-000000000001',
    1,
    $content$카페에서 생긴 일$content$,
    $content$주문과 다른 커피가 나왔는데, 직원은 벌써 다음 손님을 부르고 있어요.$content$,
    $content$잘못 나온 커피를 원하는 커피로 바꿔 보세요$content$,
    $content$☕$content$,
    $content$카페 카운터 앞이다. 아이스 아메리카노를 시켰는데, 손에 쥔 잔은 뜨겁고 위에 우유 거품이 얹혀 있다.
Mia: Next in line, please!
직원은 벌써 뒤에 선 손님을 부른다. 뒤로 줄이 길다.$content$,
    $content$상황:
- 붐비는 카페의 카운터다. 사용자는 아이스 아메리카노를 주문했는데 뜨거운 라떼를 받았다.
- 직원 Mia는 이미 다음 손님을 부르고 있었고, 뒤에는 줄이 서 있다.
- 사용자가 말을 걸어야 이 일이 풀린다.

등장인물은 Mia 한 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 바쁘고 말이 빠르지만 나쁜 사람은 아니다. 자기가 틀렸다고 확인되면 고쳐 준다.$content$,
    array[$content$Mia$content$],
    $content$사용자가 원한 것을 얻어냈을 때$content$,
    $content$다른 음료를 받거나 일부만 해결하고 자리를 떴을 때$content$,
    $content$아무것도 얻지 못했거나 사용자가 그만뒀을 때$content$
  ),
  (
    '11000000-0000-4000-8000-000000000002',
    '10000000-0000-4000-8000-000000000001',
    2,
    $content$계산이 꼬인 아침$content$,
    $content$다음 날 아침이에요. 계산대 앞에서 카드가 자꾸 튕기는데, 뒤로 줄이 길어져요.$content$,
    $content$다른 방법을 찾아 계산을 끝내 보세요$content$,
    $content$💳$content$,
    $content$다음 날 아침, 같은 카페다. 아메리카노를 시키고 카드를 댔는데 단말기가 짧은 오류음을 낸다. 한 번 더 대도 마찬가지다.
Mia: Hmm, it says declined. Do you want to try it again?
뒤에 선 사람들이 하나둘 이쪽을 본다.$content$,
    $content$상황:
- 아침의 붐비는 카페 계산대다. 사용자는 아메리카노를 주문했고 결제만 남았다.
- 카드가 계속 거절된다. 카드 쪽 문제라서 몇 번을 다시 대도 되지 않는다.
- 사용자가 가진 현금은 음료값에 조금 모자란다. 이 카페는 폰 결제와 기프트 카드도 받는다.
- Mia는 방법을 같이 찾아 주려 하지만 외상은 규정상 해 줄 수 없고, 뒤에 줄이 길어지고 있다.
- 사용자가 다른 방법을 말해야 이 일이 풀린다.

등장인물은 Mia 한 명뿐이다. 새 인물을 만들지 않는다. 뒤에 선 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 어제 사용자의 주문을 처리한 그 직원이다. 바쁘지만 손님이 곤란해하면 방법을 같이 찾는다.$content$,
    array[$content$Mia$content$],
    $content$다른 결제 방법을 찾아내 주문한 음료를 받았을 때$content$,
    $content$더 싼 음료로 바꾸거나 일부만 해결하고 자리를 떴을 때$content$,
    $content$결제하지 못하고 아무것도 받지 못한 채 물러났을 때$content$
  ),
  (
    '11000000-0000-4000-8000-000000000003',
    '10000000-0000-4000-8000-000000000001',
    3,
    $content$자리를 맡아 둔 사이에$content$,
    $content$잠깐 자리를 비운 사이, 창가 자리에 다른 사람이 앉아 있어요.$content$,
    $content$맡아 둔 자리를 되찾아 보세요$content$,
    $content$🪑$content$,
    $content$전화를 받느라 오 분쯤 나갔다 온 참이다. 늘 앉던 창가 자리에 낯선 남자가 앉아 노트북을 펴고 있고, 가방은 옆 테이블 위에 올려져 있다.
Owen: Oh, is this yours? Sorry, the table looked empty when I sat down.
카운터에 있던 Mia가 이쪽을 보다가 눈이 마주친다.$content$,
    $content$상황:
- 오후의 카페다. 사용자는 창가 자리에 가방을 두고 잠깐 나갔다 왔다.
- 돌아와 보니 Owen이 그 자리에 앉아 있고, 사용자의 가방은 옆 테이블로 옮겨져 있다.
- Owen은 자리를 뺏을 생각이 없었지만 이미 짐을 펼쳐 놓았다. 곧 화상 회의가 있어서 콘센트가 있는 이 자리가 필요하다.
- Mia는 사용자를 단골로 알아본다. 부탁을 받으면 도와주지만 손님끼리의 일에 먼저 끼어들지는 않는다.
- 사용자가 말을 걸어야 자리 문제가 정리된다.

등장인물은 Mia와 Owen 두 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 사용자를 알아보고 반가워한다. 부탁받으면 자리를 찾아봐 주지만 누가 앉을지를 대신 정해 주지는 않는다.
- Owen: 30대 초반의 손님. 예의는 있지만 그냥 물러서지도 않는다. 사정을 구체적으로 설명하면 조정할 여지가 있다.$content$,
    array[$content$Mia$content$, $content$Owen$content$],
    $content$맡아 뒀던 자리를 돌려받았을 때$content$,
    $content$다른 자리나 나눠 앉는 것으로 정리됐을 때$content$,
    $content$자리를 잃고 아무것도 정리하지 못한 채 물러났을 때$content$
  ),
  (
    '11000000-0000-4000-8000-000000000004',
    '10000000-0000-4000-8000-000000000001',
    4,
    $content$이름 없는 신메뉴$content$,
    $content$Mia가 아직 이름도 없는 새 메뉴를 내밀며 솔직한 감상을 물어요.$content$,
    $content$맛에 대한 생각을 솔직하게 전해 보세요$content$,
    $content$🥤$content$,
    $content$카운터에 서자 Mia가 처음 보는 음료를 잔에 담아 내민다. 메뉴판에는 없는 것이다.
Mia: Try this one. I made it myself. Be honest, okay?
한 모금 마셔 본다. 향은 좋은데 뒷맛이 꽤 쓰고, 단맛이 겉돈다.$content$,
    $content$상황:
- 한산한 오후의 카페 카운터다. Mia가 직접 만든 시제품 음료를 사용자에게 시음시킨다.
- 이 음료는 향은 좋지만 뒷맛이 쓰고 단맛이 겉돈다. 사용자는 이미 한 모금 마셨다.
- Mia는 다음 주에 이 음료를 매니저에게 보여 줄 생각이다. 솔직한 말을 듣고 싶어 하면서도 자기가 만든 것이라 조심스럽다.
- 사용자가 무엇을 어떻게 말하느냐에 따라 Mia가 얻어 가는 것이 달라진다.

등장인물은 Mia 한 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 사용자를 단골로 안다. 칭찬만 들으면 실망하고, 근거 없이 깎아내리면 방어적으로 변한다. 구체적인 말에는 고마워한다.$content$,
    array[$content$Mia$content$],
    $content$솔직한 감상이 구체적으로 전해져 Mia가 고칠 지점을 얻었을 때$content$,
    $content$좋은 말만 하거나 두루뭉술하게 넘겨 Mia가 얻은 것이 없을 때$content$,
    $content$말이 상처가 되거나 대화를 피해 Mia가 마음을 닫았을 때$content$
  ),
  (
    '11000000-0000-4000-8000-000000000005',
    '10000000-0000-4000-8000-000000000001',
    5,
    $content$마지막 잔$content$,
    $content$오늘이 Mia의 마지막 근무예요. 문 닫기까지 십 분 남았어요.$content$,
    $content$문 닫기 전에 하고 싶은 말을 건네 보세요$content$,
    $content$👋$content$,
    $content$저녁 여덟 시, 문 닫기 직전의 카페다. 카운터 옆에 종이 상자가 하나 놓여 있고 그 위에 앞치마가 개어져 있다.
Mia: Oh, you came. Today is my last shift here. I'm moving to the new branch.
Mia가 마지막 잔을 내리며 시계를 한 번 본다. 십 분 뒤면 문을 닫는다.$content$,
    $content$상황:
- 문 닫기 십 분 전의 카페다. 오늘이 Mia의 마지막 근무이고, Mia는 다음 주부터 다른 지점으로 옮긴다.
- 사용자는 방금 그 사실을 알았다. 지금 말하지 않으면 할 기회가 없다.
- Mia는 마감 정리를 하면서도 대화를 이어 갈 여유가 있다. 다만 십 분이 지나면 인사하고 나가야 한다.
- 사용자가 무엇을 말하느냐에 따라 이 관계가 어떻게 끝나는지 달라진다.

등장인물은 Mia 한 명뿐이다. 새 인물을 만들지 않는다. 다른 손님과 주변 상황은 지문으로 전한다.
- Mia: 20대 후반의 바리스타. 그동안 사용자를 단골로 봐 왔다. 담담한 척하지만 인사를 받으면 반가워한다.$content$,
    array[$content$Mia$content$],
    $content$하고 싶은 말을 전하고 다시 만날 약속까지 이어졌을 때$content$,
    $content$짧은 인사만 주고받고 헤어졌을 때$content$,
    $content$하고 싶은 말을 전하지 못한 채 Mia가 나갔을 때$content$
  );

-- 옛 기록은 첫 스토리의 같은 화로 옮긴 뒤에만 번호 열을 지운다. 알 수 없는
-- 시즌이나 화가 한 행이라도 있으면 마이그레이션을 멈춰 기록 손실을 막는다.
alter table public.episode_endings add column episode_id uuid;

update public.episode_endings ending
set episode_id = authored.id
from public.episodes authored
where authored.story_id = '10000000-0000-4000-8000-000000000001'
  and ending.season = 1
  and ending.episode = authored.number;

do $$
begin
  if exists (
    select 1
    from public.episode_endings
    where episode_id is null
  ) then
    raise exception
      'Some episode endings could not be mapped to the first story.';
  end if;
end;
$$;

alter table public.episode_endings
  alter column episode_id set not null,
  drop constraint episode_endings_pkey,
  drop constraint episode_endings_season_usable,
  drop constraint episode_endings_episode_usable,
  add constraint episode_endings_pkey primary key (user_id, episode_id),
  add constraint episode_endings_episode_id_fkey
    foreign key (episode_id) references public.episodes (id) on delete restrict,
  drop column season,
  drop column episode;

create index episode_endings_episode_id_idx
  on public.episode_endings (episode_id);

comment on table public.episode_endings is
  'One immutable ending and story memory per account and stable episode id.';

comment on column public.episode_endings.episode_id is
  'Stable episode reference. Numbers are only ordering inside a story.';

create table public.episode_runs (
  user_id uuid not null references public.profiles (id) on delete cascade,
  episode_id uuid not null references public.episodes (id) on delete restrict,
  messages jsonb not null,
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, episode_id),
  constraint episode_runs_messages_array check (jsonb_typeof(messages) = 'array'),
  constraint episode_runs_messages_size check (
    octet_length(messages::text) <= 1048576
  )
);

create index episode_runs_episode_id_idx on public.episode_runs (episode_id);

alter table public.episode_runs enable row level security;

create policy episode_runs_select_own on public.episode_runs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.episode_runs from anon, authenticated, service_role;
grant select on table public.episode_runs to authenticated;
grant all on table public.episode_runs to service_role;

comment on table public.episode_runs is
  'One server-saved UI message list per account and episode, active or completed.';

comment on column public.episode_runs.messages is
  'AI SDK UI messages with stable message ids. Limited to one MiB per episode.';

comment on column public.episode_runs.completed_at is
  'Set after an ending exists. Completed messages are immutable and read-only.';

drop function public.finish_episode(
  smallint,
  smallint,
  text,
  text,
  text,
  text,
  text,
  text
);

create function public.finish_episode(
  episode_id uuid,
  kind text,
  outcome text,
  memory_choice text default null,
  memory_relationship text default null,
  memory_question text default null,
  language_level text default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  player uuid := (select auth.uid());
  recorded integer;
  target_story uuid;
  target_number smallint;
begin
  if player is null then
    raise exception 'A signed-in user is required to finish an episode.'
      using errcode = '28000';
  end if;

  select authored.story_id, authored.number
  into target_story, target_number
  from public.episodes authored
  where authored.id = finish_episode.episode_id;

  if target_story is null then
    raise exception 'Episode % does not exist.', finish_episode.episode_id
      using errcode = '22023';
  end if;

  if not exists (
    select 1
    from public.episode_endings ending
    where ending.user_id = player
      and ending.episode_id = finish_episode.episode_id
  ) and exists (
    select 1
    from public.episodes earlier
    left join public.episode_endings ending
      on ending.user_id = player
      and ending.episode_id = earlier.id
    where earlier.story_id = target_story
      and earlier.number < target_number
      and ending.episode_id is null
  ) then
    raise exception 'Episode % is not the next episode in its story.',
      finish_episode.episode_id
      using errcode = '22023';
  end if;

  insert into public.episode_endings (
    user_id,
    episode_id,
    kind,
    outcome,
    memory_choice,
    memory_relationship,
    memory_question
  )
  values (
    player,
    finish_episode.episode_id,
    finish_episode.kind,
    finish_episode.outcome,
    finish_episode.memory_choice,
    finish_episode.memory_relationship,
    finish_episode.memory_question
  )
  on conflict on constraint episode_endings_pkey do nothing;

  get diagnostics recorded = row_count;

  if recorded = 1 and finish_episode.language_level is not null then
    insert into public.language_levels (user_id, level)
    values (player, finish_episode.language_level)
    on conflict on constraint language_levels_pkey do update
    set level = excluded.level,
        observed_at = now();
  end if;

  return recorded = 1;
end;
$$;

comment on function public.finish_episode(uuid, text, text, text, text, text, text) is
  'Records the ending and story memory of the caller''s current episode. Returns true only to the request that inserted the permanent ending.';

revoke all on function public.finish_episode(uuid, text, text, text, text, text, text)
  from public, anon;
grant execute on function public.finish_episode(uuid, text, text, text, text, text, text)
  to authenticated;

create function public.save_episode_run(episode_id uuid, messages jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  player uuid := (select auth.uid());
  target_story uuid;
  target_number smallint;
begin
  if player is null then
    raise exception 'A signed-in user is required to save an episode.'
      using errcode = '28000';
  end if;

  if jsonb_typeof(save_episode_run.messages) is distinct from 'array' then
    raise exception 'Episode messages must be a JSON array.'
      using errcode = '22023';
  end if;

  if octet_length(save_episode_run.messages::text) > 1048576 then
    raise exception 'Episode messages exceed the one MiB limit.'
      using errcode = '22001';
  end if;

  select authored.story_id, authored.number
  into target_story, target_number
  from public.episodes authored
  where authored.id = save_episode_run.episode_id;

  if target_story is null then
    raise exception 'Episode % does not exist.', save_episode_run.episode_id
      using errcode = '22023';
  end if;

  if exists (
    select 1
    from public.episode_endings ending
    where ending.user_id = player
      and ending.episode_id = save_episode_run.episode_id
  ) then
    return;
  end if;

  if exists (
    select 1
    from public.episodes earlier
    left join public.episode_endings ending
      on ending.user_id = player
      and ending.episode_id = earlier.id
    where earlier.story_id = target_story
      and earlier.number < target_number
      and ending.episode_id is null
  ) then
    raise exception 'Episode % is not the current episode in its story.',
      save_episode_run.episode_id
      using errcode = '22023';
  end if;

  insert into public.episode_runs (user_id, episode_id, messages)
  values (player, save_episode_run.episode_id, save_episode_run.messages)
  on conflict on constraint episode_runs_pkey do update
  set messages = excluded.messages,
      updated_at = now()
  where public.episode_runs.completed_at is null;
end;
$$;

comment on function public.save_episode_run(uuid, jsonb) is
  'Upserts the caller''s current episode messages. Completed runs remain immutable.';

revoke all on function public.save_episode_run(uuid, jsonb) from public, anon;
grant execute on function public.save_episode_run(uuid, jsonb) to authenticated;

create function public.complete_episode_run(episode_id uuid, messages jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  ending_count integer;
  matching_ending_count integer;
  player uuid := (select auth.uid());
  recorded_kind text;
  recorded_outcome text;
begin
  if player is null then
    raise exception 'A signed-in user is required to complete an episode run.'
      using errcode = '28000';
  end if;

  if jsonb_typeof(complete_episode_run.messages) is distinct from 'array' then
    raise exception 'Episode messages must be a JSON array.'
      using errcode = '22023';
  end if;

  if octet_length(complete_episode_run.messages::text) > 1048576 then
    raise exception 'Episode messages exceed the one MiB limit.'
      using errcode = '22001';
  end if;

  select ending.kind, ending.outcome
  into recorded_kind, recorded_outcome
  from public.episode_endings ending
  where ending.user_id = player
    and ending.episode_id = complete_episode_run.episode_id;

  if not found then
    raise exception 'Episode % has no ending.', complete_episode_run.episode_id
      using errcode = '22023';
  end if;

  select
    count(*),
    count(*) filter (
      where part #>> '{data,kind}' = recorded_kind
        and part #>> '{data,outcome}' = recorded_outcome
    )
  into ending_count, matching_ending_count
  from jsonb_array_elements(complete_episode_run.messages) message
  cross join lateral jsonb_array_elements(
    case
      when jsonb_typeof(message -> 'parts') = 'array' then message -> 'parts'
      else '[]'::jsonb
    end
  ) part
  where part ->> 'type' = 'data-ending';

  if ending_count <> 1 or matching_ending_count <> 1 then
    raise exception 'Episode % transcript does not match its ending.',
      complete_episode_run.episode_id
      using errcode = '22023';
  end if;

  insert into public.episode_runs (
    user_id,
    episode_id,
    messages,
    completed_at
  )
  values (
    player,
    complete_episode_run.episode_id,
    complete_episode_run.messages,
    now()
  )
  on conflict on constraint episode_runs_pkey do update
  set messages = excluded.messages,
      completed_at = excluded.completed_at,
      updated_at = now()
  where public.episode_runs.completed_at is null;
end;
$$;

comment on function public.complete_episode_run(uuid, jsonb) is
  'Marks the caller''s matching ended episode messages complete. A completed transcript is immutable.';

revoke all on function public.complete_episode_run(uuid, jsonb) from public, anon;
grant execute on function public.complete_episode_run(uuid, jsonb) to authenticated;
