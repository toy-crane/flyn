-- AI 채팅의 영구 저장소. 채팅방은 앱이 RLS 안에서 직접 만들고 읽고 지우지만,
-- 제목과 메시지 쓰기는 인증된 Hono 경계가 service role로 맡는다.
-- 이 파일을 고친 뒤 bun run db:diff <name>으로 마이그레이션을 생성한다.

create table public.chat_rooms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid()
    references auth.users (id) on delete cascade,
  title text not null default '새 채팅',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 40 grapheme 제목 규칙은 Hono가 적용한다. DB는 단위가 다른 char_length로
  -- UX 상한을 흉내 내지 않고 터무니없는 저장만 막는 넉넉한 backstop을 둔다.
  constraint chat_rooms_title_length
    check (char_length(title) between 1 and 500)
);

create index chat_rooms_user_updated_idx
  on public.chat_rooms (user_id, updated_at desc);

create table public.chat_messages (
  -- AI SDK가 만든 ID를 그대로 받아 재요청의 멱등 키로 쓴다. 방 안에서만
  -- 유일하면 충분하고, 한 방의 같은 ID·다른 본문은 Hono가 409로 구분한다.
  id text not null,
  chat_room_id uuid not null
    references public.chat_rooms (id) on delete cascade,
  role text not null,
  content text not null,
  status text not null default 'complete',
  created_at timestamptz not null default now(),
  primary key (chat_room_id, id),
  constraint chat_messages_id_length
    check (char_length(id) between 1 and 128),
  constraint chat_messages_role
    check (role in ('user', 'assistant')),
  constraint chat_messages_content_length
    check (char_length(content) between 1 and 20000),
  constraint chat_messages_status
    check (status in ('complete', 'stopped'))
);

create index chat_messages_room_created_idx
  on public.chat_messages (chat_room_id, created_at, id);

-- 제목 변경 시각은 클라이언트가 보낼 수 없고 DB가 정한다.
create function public.chat_rooms_touch()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger chat_rooms_touch
  before update on public.chat_rooms
  for each row execute function public.chat_rooms_touch();

-- 새 사용자·AI 메시지 모두 방을 최근 목록 위로 올린다.
create function public.chat_messages_touch_room()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  update public.chat_rooms
  set updated_at = now()
  where id = new.chat_room_id;
  return new;
end;
$$;

create trigger chat_messages_touch_room
  after insert on public.chat_messages
  for each row execute function public.chat_messages_touch_room();

alter table public.chat_rooms enable row level security;
alter table public.chat_messages enable row level security;

create policy "own chat rooms readable" on public.chat_rooms
  for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "own chat rooms creatable" on public.chat_rooms
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "own chat rooms deletable" on public.chat_rooms
  for delete to authenticated
  using ((select auth.uid()) = user_id);

create policy "own chat messages readable" on public.chat_messages
  for select to authenticated
  using (
    exists (
      select 1
      from public.chat_rooms
      where chat_rooms.id = chat_messages.chat_room_id
        and chat_rooms.user_id = (select auth.uid())
    )
  );

-- 정책은 행만 가른다. 열 권한으로 생성 시 앱이 정할 수 있는 값을 방 ID와
-- 소유자 ID로 한정해 제목은 항상 '새 채팅'에서 시작하게 한다.
revoke all on table public.chat_rooms from anon, authenticated;
grant select, delete on table public.chat_rooms to authenticated;
grant insert (id, user_id) on table public.chat_rooms to authenticated;

-- 메시지는 select만 준다. user 역할도 앱이 직접 쓰지 못하며 Hono가 사용자
-- 메시지 저장과 모델 스트림을 하나의 경계에서 처리한다.
revoke all on table public.chat_messages from anon, authenticated;
grant select on table public.chat_messages to authenticated;

grant select, insert, update, delete
  on table public.chat_rooms to service_role;
grant select, insert, update, delete
  on table public.chat_messages to service_role;
