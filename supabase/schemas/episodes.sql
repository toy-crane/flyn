-- 롤플레잉 에피소드의 영구 저장소. 에피소드는 첫 행부터 모델 호출의 산물이라
-- 앱에는 조회와 자기 에피소드 삭제만 준다. 생성과 갱신은 Hono가 service role로
-- 맡는다(docs/decisions/hybrid-data-access.md).
-- 이 파일을 고친 뒤 bun run db:diff <name>으로 마이그레이션을 생성한다.

create table public.episodes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null
    references auth.users (id) on delete cascade,
  scenario_title text not null,
  scenario_description text not null,
  partner_role text not null,
  user_role text not null,
  -- active는 여러 개일 수 있고 홈이 그중 가장 최근 것을 앞세운다.
  status text not null default 'active',
  -- **생성 시점의 상수를 복사해 둔다.** 코드의 상한을 바꿔도 이미 끝난
  -- 에피소드의 종료 사유가 흔들리지 않아야 한다. 사용자가 정하는 값이 아니라서
  -- 기본값을 두지 않는다 — 값을 넣는 것은 언제나 서버다.
  turn_limit integer not null,
  -- 결과 화면의 총평. 대화가 끝날 때 채워진다.
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 길이 제약은 UX 규칙이 아니라 남용 방지 backstop이다. 사람이 보는 길이는
  -- 생성 경계가 정하고, DB는 터무니없는 저장만 막는다.
  constraint episodes_scenario_title_length
    check (char_length(scenario_title) between 1 and 200),
  constraint episodes_scenario_description_length
    check (char_length(scenario_description) between 1 and 2000),
  constraint episodes_partner_role_length
    check (char_length(partner_role) between 1 and 200),
  constraint episodes_user_role_length
    check (char_length(user_role) between 1 and 200),
  constraint episodes_summary_length
    check (char_length(summary) between 1 and 4000),
  constraint episodes_status
    check (status in ('active', 'goals_met', 'turns_exhausted')),
  constraint episodes_turn_limit_range
    check (turn_limit between 1 and 200)
);

create index episodes_user_updated_idx
  on public.episodes (user_id, updated_at desc);

-- 목표는 에피소드당 3행이다. 사용자가 고칠 수 없으므로 앱에는 select만 준다.
-- 달성한 메시지 참조는 episode_messages와 함께 붙인다.
create table public.episode_goals (
  episode_id uuid not null
    references public.episodes (id) on delete cascade,
  position smallint not null,
  sentence text not null,
  achieved_at timestamptz,
  primary key (episode_id, position),
  constraint episode_goals_position_range
    check (position between 1 and 3),
  constraint episode_goals_sentence_length
    check (char_length(sentence) between 1 and 500)
);

-- 갱신 시각은 클라이언트가 보낼 수 없고 DB가 정한다.
create function public.episodes_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger episodes_touch
  before update on public.episodes
  for each row execute function public.episodes_touch();

alter table public.episodes enable row level security;
alter table public.episode_goals enable row level security;

create policy "own episodes readable" on public.episodes
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- 앱이 가진 유일한 쓰기 권한이다. 지우면 목표도 cascade로 함께 사라진다.
create policy "own episodes deletable" on public.episodes
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "own episode goals readable" on public.episode_goals
  for select to authenticated
  using (
    exists (
      select 1
      from public.episodes
      where episodes.id = episode_goals.episode_id
        and episodes.user_id = (select auth.uid())
    )
  );

-- 정책은 어느 행을 만지는지만 가른다. 앱이 AI가 만든 값을 직접 쓰지 못하게 막는
-- 것은 아래 grant다.
revoke all on table public.episodes from anon, authenticated;
grant select, delete on table public.episodes to authenticated;

revoke all on table public.episode_goals from anon, authenticated;
grant select on table public.episode_goals to authenticated;

grant select, insert, update, delete
  on table public.episodes to service_role;
grant select, insert, update, delete
  on table public.episode_goals to service_role;
