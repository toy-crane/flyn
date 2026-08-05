-- 에피소드의 저장·소유권 경계 증명 (pgTAP). 실행: bun run db:test.
--
-- 에피소드는 첫 행부터 모델 호출의 산물이라 앱은 읽기와 자기 에피소드 삭제만
-- 한다. 목표와 메시지는 읽기만 한다. 차단 테스트만 두면 테이블 권한을 전부
-- 없애도 초록이 되므로, 각 경계의 양성 대조도 함께 둔다.

begin;
select plan(30);

select tests.create_supabase_user('episode-alice');
select tests.create_supabase_user('episode-bob');

select has_table('public', 'episodes', '에피소드 테이블이 존재한다');
select has_table('public', 'episode_goals', '에피소드 목표 테이블이 존재한다');
select has_table('public', 'episode_messages', '에피소드 메시지 테이블이 존재한다');
select hasnt_table('public', 'chat_rooms', '채팅방 테이블은 남아 있지 않다');
select hasnt_table('public', 'chat_messages', '채팅 메시지 테이블은 남아 있지 않다');

set local role postgres;
-- 어제 만든 에피소드다. 한 트랜잭션 안에서는 now()가 고정이라, 어제로 심어야
-- 메시지가 시각을 올렸는지 아래에서 볼 수 있다.
insert into public.episodes (
  id, user_id, scenario_title, scenario_description,
  partner_role, user_role, turn_limit, created_at, updated_at
)
values (
  '00000000-0000-0000-0000-0000000000a1',
  tests.get_supabase_uid('episode-alice'),
  '포틀랜드 카페에서 첫 주문',
  '여행 중 들어간 작은 카페예요.',
  '바리스타 Maya',
  '처음 방문한 여행객',
  20,
  now() - interval '1 day',
  now() - interval '1 day'
);

insert into public.episode_goals (episode_id, position, sentence)
values
  ('00000000-0000-0000-0000-0000000000a1', 1, '오늘의 원두 추천 받기'),
  ('00000000-0000-0000-0000-0000000000a1', 2, '우유를 오트밀크로 바꿔 주문하기'),
  ('00000000-0000-0000-0000-0000000000a1', 3, '근처 가볼 만한 곳 물어보기');

insert into public.episode_messages (id, episode_id, role, content)
values
  ('user-1', '00000000-0000-0000-0000-0000000000a1', 'user',
   'Could you recommend today''s coffee?'),
  ('assistant-1', '00000000-0000-0000-0000-0000000000a1', 'assistant',
   'Today''s single origin is a natural Ethiopian.');

insert into public.episodes (
  id, user_id, scenario_title, scenario_description,
  partner_role, user_role, turn_limit
)
values (
  '00000000-0000-0000-0000-0000000000b1',
  tests.get_supabase_uid('episode-bob'),
  '공항에서 짐이 안 나왔을 때',
  '수하물 카운터 앞이에요.',
  '수하물 담당 직원',
  '짐을 잃어버린 여행객',
  20
);

select is(
  (select status from public.episodes
   where id = '00000000-0000-0000-0000-0000000000a1'),
  'active',
  '새 에피소드는 진행 중으로 시작한다'
);

select throws_ok(
  $$insert into public.episodes (
      user_id, scenario_title, scenario_description,
      partner_role, user_role, turn_limit
    )
    values (
      tests.get_supabase_uid('episode-alice'),
      '턴 상한이 빠진 에피소드', '설명', '상대', '나', null
    )$$,
  '23502',
  null,
  '턴 상한은 기본값 없이 저장 시점에 정해진다'
);

select throws_ok(
  $$insert into public.episodes (
      user_id, scenario_title, scenario_description,
      partner_role, user_role, turn_limit, status
    )
    values (
      tests.get_supabase_uid('episode-alice'),
      '알 수 없는 상태', '설명', '상대', '나', 20, 'finished'
    )$$,
  '23514',
  null,
  '상태는 active·goals_met·turns_exhausted 셋뿐이다'
);

select throws_ok(
  $$insert into public.episode_goals (episode_id, position, sentence)
    values ('00000000-0000-0000-0000-0000000000a1', 4, '네 번째 목표')$$,
  '23514',
  null,
  '목표는 3개를 넘을 수 없다'
);

select throws_ok(
  $$insert into public.episode_messages (id, episode_id, role, content)
    values ('system-1', '00000000-0000-0000-0000-0000000000a1',
            'system', '끼어든 지시')$$,
  '23514',
  null,
  '메시지 역할은 user·assistant 둘뿐이다'
);

-- 홈 카드가 가장 최근 진행 중 하나를 고르므로, 대화를 이어간 에피소드가 앞에
-- 서려면 메시지가 에피소드의 시각을 올려야 한다.
select ok(
  (select updated_at > created_at from public.episodes
   where id = '00000000-0000-0000-0000-0000000000a1'),
  '메시지가 들어오면 에피소드가 가장 최근이 된다'
);

select tests.authenticate_as('episode-alice');

select is(
  (select count(*)::int from public.episodes),
  1,
  '사용자는 자기 에피소드만 볼 수 있다'
);

select is(
  (select count(*)::int from public.episode_goals),
  3,
  '사용자는 자기 에피소드의 목표 3개를 볼 수 있다'
);

select is(
  (select count(*)::int from public.episode_messages),
  2,
  '사용자는 자기 에피소드의 지난 대화를 볼 수 있다'
);

select throws_ok(
  $$insert into public.episodes (
      user_id, scenario_title, scenario_description,
      partner_role, user_role, turn_limit
    )
    values (
      tests.get_supabase_uid('episode-alice'),
      '앱이 만든 에피소드', '설명', '상대', '나', 20
    )$$,
  '42501',
  'permission denied for table episodes',
  '앱은 에피소드를 만들 수 없다'
);

select throws_ok(
  $$update public.episodes set scenario_title = '내가 고친 제목'
    where id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501',
  'permission denied for table episodes',
  '앱은 에피소드를 고칠 수 없다'
);

select throws_ok(
  $$insert into public.episode_goals (episode_id, position, sentence)
    values ('00000000-0000-0000-0000-0000000000a1', 1, '내가 만든 목표')$$,
  '42501',
  'permission denied for table episode_goals',
  '앱은 목표를 만들 수 없다'
);

select throws_ok(
  $$update public.episode_goals set sentence = '내가 고친 목표'
    where episode_id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501',
  'permission denied for table episode_goals',
  '앱은 목표를 고칠 수 없다'
);

select throws_ok(
  $$delete from public.episode_goals
    where episode_id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501',
  'permission denied for table episode_goals',
  '앱은 목표만 따로 지울 수 없다'
);

-- 전달된 문장을 앱이 직접 쓸 수 있으면 번역을 거치지 않은 문장도 대화에 남는다.
select throws_ok(
  $$insert into public.episode_messages (id, episode_id, role, content)
    values ('user-2', '00000000-0000-0000-0000-0000000000a1',
            'user', '앱이 남긴 문장')$$,
  '42501',
  'permission denied for table episode_messages',
  '앱은 메시지를 남길 수 없다'
);

select throws_ok(
  $$update public.episode_messages set content = '내가 고친 문장'
    where episode_id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501',
  'permission denied for table episode_messages',
  '앱은 메시지를 고칠 수 없다'
);

select throws_ok(
  $$delete from public.episode_messages
    where episode_id = '00000000-0000-0000-0000-0000000000a1'$$,
  '42501',
  'permission denied for table episode_messages',
  '앱은 메시지만 따로 지울 수 없다'
);

delete from public.episodes
where id = '00000000-0000-0000-0000-0000000000b1';

set local role postgres;
select is(
  (select count(*)::int from public.episodes
   where id = '00000000-0000-0000-0000-0000000000b1'),
  1,
  '사용자는 다른 사람의 에피소드를 지울 수 없다'
);

select tests.authenticate_as('episode-alice');
delete from public.episodes
where id = '00000000-0000-0000-0000-0000000000a1';

select is(
  (select count(*)::int from public.episodes
   where id = '00000000-0000-0000-0000-0000000000a1'),
  0,
  '사용자는 자기 에피소드를 지울 수 있다'
);

set local role postgres;
select is(
  (select count(*)::int from public.episode_goals
   where episode_id = '00000000-0000-0000-0000-0000000000a1'),
  0,
  '에피소드를 지우면 목표도 cascade된다'
);

select is(
  (select count(*)::int from public.episode_messages
   where episode_id = '00000000-0000-0000-0000-0000000000a1'),
  0,
  '에피소드를 지우면 대화도 cascade된다'
);

select tests.clear_authentication();

select throws_ok(
  $$select count(*) from public.episodes$$,
  '42501',
  'permission denied for table episodes',
  '미로그인 사용자는 에피소드를 읽을 수 없다'
);

select throws_ok(
  $$select count(*) from public.episode_goals$$,
  '42501',
  'permission denied for table episode_goals',
  '미로그인 사용자는 목표를 읽을 수 없다'
);

select throws_ok(
  $$select count(*) from public.episode_messages$$,
  '42501',
  'permission denied for table episode_messages',
  '미로그인 사용자는 대화를 읽을 수 없다'
);

set local role postgres;
delete from auth.users where id = tests.get_supabase_uid('episode-bob');

select is(
  (select count(*)::int from public.episodes
   where id = '00000000-0000-0000-0000-0000000000b1'),
  0,
  '계정을 지우면 에피소드도 cascade된다'
);

select * from finish();
rollback;
