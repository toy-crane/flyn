-- Apple 취소 token 보관소가 모바일에서 닿지 않는지 증명한다(§6).
--
-- 이 표는 정책이 하나도 없다. 그러면 "아무도 못 쓴다"는 주장은 자동으로 참이라
-- 증명 가치가 없어 보이지만, 여기서 지켜야 할 것이 정확히 그것이다 — 대신
-- **service_role은 쓸 수 있다**는 양성 대조를 함께 둬서, 표가 그저 죽어 있는
-- 것과 구분한다.

begin;
select plan(5);

select tests.create_supabase_user('alice');

set local role service_role;
insert into public.apple_credentials (user_id, refresh_token)
values (tests.get_supabase_uid('alice'), 'apple-refresh-token');

select is(
  (select refresh_token from public.apple_credentials),
  'apple-refresh-token',
  'service_role은 token을 보관하고 읽을 수 있다'
);

select tests.authenticate_as('alice');

select throws_ok(
  $$select refresh_token from public.apple_credentials$$,
  '42501',
  'permission denied for table apple_credentials',
  '본인도 자기 token을 읽을 수 없다'
);

select throws_ok(
  $$insert into public.apple_credentials (user_id, refresh_token)
    values (tests.get_supabase_uid('alice'), 'forged')$$,
  '42501',
  'permission denied for table apple_credentials',
  '인증 사용자는 token을 넣을 수 없다'
);

select tests.clear_authentication();
select throws_ok(
  $$select refresh_token from public.apple_credentials$$,
  '42501',
  'permission denied for table apple_credentials',
  '미인증은 테이블 접근 자체가 거부된다'
);

-- 계정 삭제 순서(§5)의 5단계. token이 남으면 지운 계정의 Apple 승인 흔적이
-- 서버에 남는다.
set local role postgres;
delete from auth.users where id = tests.get_supabase_uid('alice');
select is(
  (select count(*)::int from public.apple_credentials),
  0,
  'auth 사용자를 지우면 token도 함께 사라진다'
);

select * from finish();
rollback;
