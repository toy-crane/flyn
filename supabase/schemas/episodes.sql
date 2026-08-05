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
  -- 대화 흐름에 남는 완료 줄의 자리를 정하는 값이다. 시각만으로는 어느 발화
  -- 뒤에 끼울지 알 수 없다. 판정이 채우기 전에는 둘 다 비어 있다.
  achieved_message_id text,
  primary key (episode_id, position),
  constraint episode_goals_position_range
    check (position between 1 and 3),
  constraint episode_goals_sentence_length
    check (char_length(sentence) between 1 and 500),
  constraint episode_goals_achieved_together
    check ((achieved_at is null) = (achieved_message_id is null))
);

-- 대화에 남는 메시지. **전달된 문장만** 담는다 — 한글로 썼을 때 사용자가 친
-- 원문은 여기가 아니라 판정 행이 갖는다. 말풍선에 남는 것과 모델이 본 것이
-- 같아야 "내 영어가 실제로 통하는가"를 이 기록으로 되짚을 수 있다.
create table public.episode_messages (
  -- AI SDK가 만든 ID를 그대로 받아 재요청의 멱등 키로 쓴다. 에피소드 안에서만
  -- 유일하면 충분하다.
  id text not null,
  episode_id uuid not null
    references public.episodes (id) on delete cascade,
  role text not null,
  content text not null,
  status text not null default 'complete',
  created_at timestamptz not null default now(),
  primary key (episode_id, id),
  constraint episode_messages_id_length
    check (char_length(id) between 1 and 128),
  constraint episode_messages_role
    check (role in ('user', 'assistant')),
  constraint episode_messages_content_length
    check (char_length(content) between 1 and 20000),
  constraint episode_messages_status
    check (status in ('complete', 'stopped'))
);

create index episode_messages_episode_created_idx
  on public.episode_messages (episode_id, created_at, id);

-- 목표를 선언한 자리에서는 episode_messages가 아직 없다. 참조만 여기로 미룬다.
alter table public.episode_goals
  add constraint episode_goals_achieved_message_fkey
  foreign key (episode_id, achieved_message_id)
  references public.episode_messages (episode_id, id);

-- 판정 한 번이 남기는 행. **행이 없음이 곧 판정 전**이므로 판정 전 상태를
-- 나타내는 빈 행을 미리 만들지 않는다. AI 메시지는 판정 대상이 아니라 행이
-- 아예 생기지 않고, 늦게 도착하는 판정도 도착한 순간에 처음 나타난다.
create table public.message_feedback (
  episode_id uuid not null,
  message_id text not null,
  -- 사용자가 실제로 친 말. 한글로 썼으면 여기 한글이 남는다. 전달된 영어는
  -- episode_messages가 갖는다.
  source_text text not null,
  -- 그대로 잘 통했는지(clear), 더 자연스럽게 쓸 여지가 있는지(improvable).
  verdict text not null,
  -- 판정 호출 하나가 판정·개선문·이유를 함께 낸다. 시트를 열 때 따로 부르지
  -- 않으므로 여기 없으면 화면에도 없다.
  improved_sentence text,
  reasons text[] not null default '{}',
  created_at timestamptz not null default now(),
  primary key (episode_id, message_id),
  constraint message_feedback_message_fkey
    foreign key (episode_id, message_id)
    references public.episode_messages (episode_id, id) on delete cascade,
  constraint message_feedback_verdict
    check (verdict in ('clear', 'improvable')),
  -- 그대로 통한 문장에는 고칠 것이 없고, 고칠 것이 있다고 판정했으면 개선문이
  -- 반드시 있다. 표시와 시트가 이 둘을 따로 확인하지 않아도 되게 못박는다.
  constraint message_feedback_improvable_has_sentence
    check ((verdict = 'improvable') = (improved_sentence is not null)),
  constraint message_feedback_source_text_length
    check (char_length(source_text) between 1 and 20000),
  constraint message_feedback_improved_sentence_length
    check (char_length(improved_sentence) between 1 and 20000),
  constraint message_feedback_reasons_count
    check (cardinality(reasons) between 0 and 10)
);

-- 문장 질문에서 주고받은 말. **부모 발화를 참조한다** — 문장 질문은 문장당
-- 하나뿐이라 방 테이블을 따로 두지 않는다. 롤플레잉이 아니라 학습 질문을
-- 주고받는 자리라 episode_messages와 섞이지 않고 턴으로도 세지 않는다.
create table public.sentence_question_messages (
  -- AI SDK가 만든 ID를 그대로 받아 재요청의 멱등 키로 쓴다. 한 문장 안에서만
  -- 유일하면 충분하다.
  id text not null,
  episode_id uuid not null,
  message_id text not null,
  role text not null,
  content text not null,
  status text not null default 'complete',
  created_at timestamptz not null default now(),
  primary key (episode_id, message_id, id),
  -- 물어본 문장이 사라지면 그 문장에 대한 질문도 남을 자리가 없다.
  constraint sentence_question_messages_parent_fkey
    foreign key (episode_id, message_id)
    references public.episode_messages (episode_id, id) on delete cascade,
  constraint sentence_question_messages_id_length
    check (char_length(id) between 1 and 128),
  constraint sentence_question_messages_role
    check (role in ('user', 'assistant')),
  constraint sentence_question_messages_content_length
    check (char_length(content) between 1 and 20000),
  constraint sentence_question_messages_status
    check (status in ('complete', 'stopped'))
);

-- 같은 문장에서 다시 열면 지난 내용이 이어서 나온다. 읽는 순서가 곧 이 인덱스다.
create index sentence_question_messages_thread_idx
  on public.sentence_question_messages (episode_id, message_id, created_at, id);

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

-- 대화를 이어간 에피소드가 홈에서 가장 최근이 된다. 홈 카드가 "가장 최근에
-- 진행 중인 하나"를 고르므로 메시지가 시각을 올려야 방금 하던 대화가 앞에 선다.
create function public.episode_messages_touch_episode()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.episodes
  set updated_at = now()
  where id = new.episode_id;
  return new;
end;
$$;

create trigger episode_messages_touch_episode
  after insert on public.episode_messages
  for each row execute function public.episode_messages_touch_episode();

alter table public.episodes enable row level security;
alter table public.episode_goals enable row level security;
alter table public.episode_messages enable row level security;
alter table public.message_feedback enable row level security;
alter table public.sentence_question_messages enable row level security;

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

create policy "own episode messages readable" on public.episode_messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.episodes
      where episodes.id = episode_messages.episode_id
        and episodes.user_id = (select auth.uid())
    )
  );

create policy "own message feedback readable" on public.message_feedback
  for select to authenticated
  using (
    exists (
      select 1
      from public.episodes
      where episodes.id = message_feedback.episode_id
        and episodes.user_id = (select auth.uid())
    )
  );

create policy "own sentence question messages readable"
  on public.sentence_question_messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.episodes
      where episodes.id = sentence_question_messages.episode_id
        and episodes.user_id = (select auth.uid())
    )
  );

-- 정책은 어느 행을 만지는지만 가른다. 앱이 AI가 만든 값을 직접 쓰지 못하게 막는
-- 것은 아래 grant다.
revoke all on table public.episodes from anon, authenticated;
grant select, delete on table public.episodes to authenticated;

revoke all on table public.episode_goals from anon, authenticated;
grant select on table public.episode_goals to authenticated;

-- 메시지는 select만 준다. user 역할도 앱이 직접 쓰지 못하며, 사용자 메시지
-- 저장과 모델 스트림을 Hono가 한 경계에서 처리한다. 전달된 문장을 앱이 쓸 수
-- 있으면 번역 없이 아무 문장이나 남길 수 있다.
revoke all on table public.episode_messages from anon, authenticated;
grant select on table public.episode_messages to authenticated;

-- 판정도 AI가 낸 값이라 앱은 읽기만 한다. revoke를 빼면 새 테이블에 딸려 오는
-- 기본 권한으로 앱 역할이 판정을 통째로 truncate할 수 있다 — RLS는 그것을
-- 가르지 않는다.
revoke all on table public.message_feedback from anon, authenticated;
grant select on table public.message_feedback to authenticated;

-- 문장 질문의 답도 모델이 낸다. 앱이 쓸 수 있으면 오가지 않은 말을 남길 수
-- 있고, revoke를 빼면 기본 권한으로 지난 질문을 통째로 truncate할 수 있다.
revoke all on table public.sentence_question_messages from anon, authenticated;
grant select on table public.sentence_question_messages to authenticated;

grant select, insert, update, delete
  on table public.episodes to service_role;
grant select, insert, update, delete
  on table public.episode_goals to service_role;
grant select, insert, update, delete
  on table public.episode_messages to service_role;
grant select, insert, update, delete
  on table public.message_feedback to service_role;
grant select, insert, update, delete
  on table public.sentence_question_messages to service_role;
