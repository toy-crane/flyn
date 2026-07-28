-- AI 채팅의 저장·소유권 경계 증명 (pgTAP). 실행: bun run db:test.
--
-- 채팅방은 앱이 RLS 안에서 직접 만들고 읽고 지운다. 메시지는 앱이 읽기만 하며,
-- 사용자·AI 역할 모두 Hono의 service role 경계에서만 쓴다. 차단 테스트만 두면
-- 테이블 권한을 전부 없애도 초록이 되므로, 각 경계의 양성 대조도 함께 둔다.

begin;
select plan(30);

select tests.create_supabase_user('chat-alice');
select tests.create_supabase_user('chat-bob');

select has_table('public', 'chat_rooms', '채팅방 테이블이 존재한다');
select has_table('public', 'chat_messages', '메시지 테이블이 존재한다');

select tests.authenticate_as('chat-alice');

select lives_ok(
  $$insert into public.chat_rooms (id, user_id)
    values (
      '00000000-0000-0000-0000-00000000a001',
      tests.get_supabase_uid('chat-alice')
    )$$,
  '인증 사용자는 자기 채팅방을 만든다'
);

select is(
  (select title from public.chat_rooms
   where id = '00000000-0000-0000-0000-00000000a001'),
  '새 채팅',
  '새 채팅방은 고정 기본 제목으로 시작한다'
);

select throws_ok(
  $$insert into public.chat_rooms (id, user_id)
    values (
      '00000000-0000-0000-0000-00000000a099',
      tests.get_supabase_uid('chat-bob')
    )$$,
  '42501',
  null,
  '다른 사용자 소유의 채팅방은 만들 수 없다'
);

select throws_ok(
  $$insert into public.chat_rooms (id, user_id, title)
    values (
      '00000000-0000-0000-0000-00000000a098',
      tests.get_supabase_uid('chat-alice'),
      '클라이언트가 정한 제목'
    )$$,
  '42501',
  'permission denied for table chat_rooms',
  '첫 메시지 제목은 서버만 정한다'
);

set local role postgres;
insert into public.chat_rooms (id, user_id)
values (
  '00000000-0000-0000-0000-00000000b001',
  tests.get_supabase_uid('chat-bob')
);

select tests.authenticate_as('chat-alice');
select is(
  (select count(*)::int from public.chat_rooms),
  1,
  '사용자는 다른 사람의 채팅방을 볼 수 없다'
);

delete from public.chat_rooms
where id = '00000000-0000-0000-0000-00000000b001';

set local role postgres;
select is(
  (select count(*)::int from public.chat_rooms
   where id = '00000000-0000-0000-0000-00000000b001'),
  1,
  '사용자는 다른 사람의 채팅방을 지울 수 없다'
);

select tests.authenticate_as('chat-alice');
select throws_ok(
  $$update public.chat_rooms
    set title = '클라이언트 수정'
    where id = '00000000-0000-0000-0000-00000000a001'$$,
  '42501',
  'permission denied for table chat_rooms',
  '채팅방 제목 갱신은 서버 권한이다'
);

select tests.clear_authentication();
select throws_ok(
  $$select count(*) from public.chat_rooms$$,
  '42501',
  'permission denied for table chat_rooms',
  '미인증 사용자는 채팅방 테이블을 읽을 수 없다'
);

set local role postgres;
insert into public.chat_messages (
  id,
  chat_room_id,
  role,
  content
)
values
  (
    'alice-user-1',
    '00000000-0000-0000-0000-00000000a001',
    'user',
    '안녕'
  ),
  (
    'bob-user-1',
    '00000000-0000-0000-0000-00000000b001',
    'user',
    'hello'
  );

select tests.authenticate_as('chat-alice');
select is(
  (select count(*)::int from public.chat_messages),
  1,
  '사용자는 자기 채팅방의 메시지만 읽는다'
);

select throws_ok(
  $$insert into public.chat_messages (id, chat_room_id, role, content)
    values (
      'forged-user',
      '00000000-0000-0000-0000-00000000a001',
      'user',
      '클라이언트 쓰기'
    )$$,
  '42501',
  'permission denied for table chat_messages',
  '클라이언트는 사용자 메시지도 직접 쓰지 못한다'
);

select throws_ok(
  $$update public.chat_messages
    set content = '바꿈'
    where id = 'alice-user-1'$$,
  '42501',
  'permission denied for table chat_messages',
  '클라이언트는 메시지를 고치지 못한다'
);

select throws_ok(
  $$delete from public.chat_messages where id = 'alice-user-1'$$,
  '42501',
  'permission denied for table chat_messages',
  '클라이언트는 메시지를 직접 지우지 못한다'
);

select tests.clear_authentication();
select throws_ok(
  $$select count(*) from public.chat_messages$$,
  '42501',
  'permission denied for table chat_messages',
  '미인증 사용자는 메시지 테이블을 읽을 수 없다'
);

set local role postgres;

select throws_ok(
  $$insert into public.chat_rooms (user_id, title)
    values (tests.get_supabase_uid('chat-bob'), '')$$,
  '23514',
  null,
  '빈 채팅방 제목은 거부된다'
);

select throws_ok(
  $$insert into public.chat_rooms (user_id, title)
    values (tests.get_supabase_uid('chat-bob'), repeat('a', 501))$$,
  '23514',
  null,
  '채팅방 제목의 DB backstop은 500자다'
);

select throws_ok(
  $$insert into public.chat_messages (id, chat_room_id, role, content)
    values (
      'empty-content',
      '00000000-0000-0000-0000-00000000b001',
      'assistant',
      ''
    )$$,
  '23514',
  null,
  '빈 메시지 본문은 거부된다'
);

select throws_ok(
  $$insert into public.chat_messages (id, chat_room_id, role, content)
    values (
      'long-content',
      '00000000-0000-0000-0000-00000000b001',
      'assistant',
      repeat('a', 20001)
    )$$,
  '23514',
  null,
  '메시지 본문의 DB backstop은 20000자다'
);

select throws_ok(
  $$insert into public.chat_messages (id, chat_room_id, role, content)
    values (
      'bad-role',
      '00000000-0000-0000-0000-00000000b001',
      'system',
      '숨은 지침'
    )$$,
  '23514',
  null,
  '저장 메시지 역할은 user 또는 assistant뿐이다'
);

select throws_ok(
  $$insert into public.chat_messages (id, chat_room_id, role, content, status)
    values (
      'bad-status',
      '00000000-0000-0000-0000-00000000b001',
      'assistant',
      '응답',
      'streaming'
    )$$,
  '23514',
  null,
  '저장 메시지 상태는 complete 또는 stopped뿐이다'
);

select throws_ok(
  $$insert into public.chat_messages (id, chat_room_id, role, content)
    values (
      repeat('i', 129),
      '00000000-0000-0000-0000-00000000b001',
      'assistant',
      '응답'
    )$$,
  '23514',
  null,
  '메시지 ID의 DB backstop은 128자다'
);

select lives_ok(
  $$insert into public.chat_messages (
      id,
      chat_room_id,
      role,
      content,
      status
    )
    values (
      'bob-stopped-1',
      '00000000-0000-0000-0000-00000000b001',
      'assistant',
      '여기까지 생성',
      'stopped'
    )$$,
  '중단된 AI 부분 응답을 저장할 수 있다'
);

select is(
  (select status from public.chat_messages
   where chat_room_id = '00000000-0000-0000-0000-00000000a001'
     and id = 'alice-user-1'),
  'complete',
  '완료 상태가 기본값이다'
);

set local session_replication_role = replica;
update public.chat_rooms
set updated_at = 'epoch'
where id = '00000000-0000-0000-0000-00000000a001';
set local session_replication_role = origin;

insert into public.chat_messages (id, chat_room_id, role, content)
values (
  'alice-assistant-1',
  '00000000-0000-0000-0000-00000000a001',
  'assistant',
  '반가워요'
);

select is(
  (select updated_at from public.chat_rooms
   where id = '00000000-0000-0000-0000-00000000a001'),
  now(),
  '메시지가 저장되면 채팅방 갱신 시각이 바뀐다'
);

insert into public.chat_rooms (id, user_id)
values (
  '00000000-0000-0000-0000-00000000a002',
  tests.get_supabase_uid('chat-alice')
);
insert into public.chat_messages (id, chat_room_id, role, content)
values (
  'alice-delete-me',
  '00000000-0000-0000-0000-00000000a002',
  'user',
  '지워질 메시지'
);

select tests.authenticate_as('chat-alice');
select lives_ok(
  $$delete from public.chat_rooms
    where id = '00000000-0000-0000-0000-00000000a002'$$,
  '사용자는 자기 채팅방을 지울 수 있다'
);

set local role postgres;
select is(
  (select count(*)::int from public.chat_messages
   where chat_room_id = '00000000-0000-0000-0000-00000000a002'),
  0,
  '채팅방을 지우면 메시지도 cascade된다'
);

delete from auth.users where id = tests.get_supabase_uid('chat-alice');

select is(
  (select count(*)::int from public.chat_rooms
   where id = '00000000-0000-0000-0000-00000000a001'),
  0,
  '계정을 지우면 채팅방도 cascade된다'
);

select is(
  (select count(*)::int from public.chat_messages
   where chat_room_id = '00000000-0000-0000-0000-00000000a001'),
  0,
  '계정을 지우면 채팅방 메시지도 함께 사라진다'
);

select is(
  (select count(*)::int from public.chat_rooms
   where id = '00000000-0000-0000-0000-00000000b001'),
  1,
  '한 계정의 삭제는 다른 사람의 채팅방을 건드리지 않는다'
);

select * from finish();
rollback;
