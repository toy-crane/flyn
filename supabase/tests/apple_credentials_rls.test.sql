-- Apple 취소 token 보관소가 모바일에서 닿지 않는지 증명한다(§6).
--
-- 자물쇠가 셋이고 여기서 검증할 수 있는 것은 둘이다 — 함수 EXECUTE 권한과
-- 스키마 USAGE. 첫 번째 자물쇠(PostgREST가 private 스키마를 아예 서비스하지
-- 않는다)는 DB 밖의 성질이라 여기서 볼 수 없고, `Accept-Profile: private`
-- 요청이 PGRST106으로 거절되는 것으로 확인했다.
--
-- 차단 주장만 있으면 표가 그저 죽어 있어도 참이다. **service_role은 쓸 수
-- 있다**는 양성 대조를 함께 둔다.

begin;
select plan(7);

select tests.create_supabase_user('alice');

set local role service_role;
select public.store_apple_refresh_token(
  tests.get_supabase_uid('alice'),
  'apple-refresh-token'
);

select is(
  public.read_apple_refresh_token(tests.get_supabase_uid('alice')),
  'apple-refresh-token',
  'service_role은 token을 보관하고 읽을 수 있다'
);

-- 같은 사용자가 다시 Apple로 로그인하는 경우.
select public.store_apple_refresh_token(
  tests.get_supabase_uid('alice'),
  'rotated-token'
);

select is(
  public.read_apple_refresh_token(tests.get_supabase_uid('alice')),
  'rotated-token',
  '다시 보관하면 새 token으로 갈아끼운다'
);

select tests.authenticate_as('alice');

-- create function이 EXECUTE를 PUBLIC에 기본으로 준다. 마이그레이션의 revoke가
-- 빠지면 아래 둘이 통과해 버린다 — db diff가 그 revoke를 만들어 주지 않았다.
select throws_ok(
  $$select public.read_apple_refresh_token(tests.get_supabase_uid('alice'))$$,
  '42501',
  'permission denied for function read_apple_refresh_token',
  '본인도 자기 token을 읽을 수 없다'
);

select throws_ok(
  $$select public.store_apple_refresh_token(tests.get_supabase_uid('alice'), 'forged')$$,
  '42501',
  'permission denied for function store_apple_refresh_token',
  '인증 사용자는 token을 넣을 수 없다'
);

-- 함수를 우회해 표에 직접 가려 해도 스키마 USAGE가 없다.
select throws_ok(
  $$select refresh_token from private.apple_credentials$$,
  '42501',
  'permission denied for schema private',
  '인증 사용자는 private 스키마에 들어갈 수 없다'
);

select tests.clear_authentication();
select throws_ok(
  $$select public.read_apple_refresh_token(tests.get_supabase_uid('alice'))$$,
  '42501',
  'permission denied for function read_apple_refresh_token',
  '미인증도 함수를 부를 수 없다'
);

-- 계정 삭제 순서(§5)의 5단계. token이 남으면 지운 계정의 Apple 승인 흔적이
-- 서버에 남는다.
set local role postgres;
delete from auth.users where id = tests.get_supabase_uid('alice');
select is(
  (select count(*)::int from private.apple_credentials),
  0,
  'auth 사용자를 지우면 token도 함께 사라진다'
);

select * from finish();
rollback;
