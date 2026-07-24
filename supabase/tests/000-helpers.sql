-- 최소 테스트 헬퍼 (basejump supabase_test_helpers의 축소 self-contained 버전).
--
-- auth.users 삽입과 인증 컨텍스트(role + request.jwt.claims) 설정을 한 곳에 모은다.
-- auth.users 스키마가 CLI 버전에 따라 흔들리면 여기 한 파일만 고치면 된다. 파일명이
-- `000-`이라 `supabase test db`가 다른 테스트보다 먼저 로드한다.

create schema if not exists tests;

-- 테스트용 유저를 만들고 uid를 돌려준다. identifier는 raw_user_meta_data에 심어
-- get_supabase_uid로 되찾는다.
create or replace function tests.create_supabase_user(identifier text)
returns uuid
language plpgsql
as $$
declare
  uid uuid;
begin
  uid := gen_random_uuid();
  insert into auth.users (
    instance_id, id, aud, role, email, raw_user_meta_data, created_at, updated_at
  )
  values (
    '00000000-0000-0000-0000-000000000000',
    uid,
    'authenticated',
    'authenticated',
    identifier || '@test.example',
    jsonb_build_object('test_identifier', identifier),
    now(),
    now()
  );
  return uid;
end;
$$;

create or replace function tests.get_supabase_uid(identifier text)
returns uuid
language sql
stable
as $$
  select id
  from auth.users
  where raw_user_meta_data ->> 'test_identifier' = identifier
  limit 1;
$$;

-- 이후 쿼리를 해당 유저로 실행: authenticated 롤 + request.jwt.claims.sub 설정.
-- auth.uid()가 claims의 sub를 읽으므로 RLS 정책이 이 유저 기준으로 적용된다.
create or replace function tests.authenticate_as(identifier text)
returns void
language plpgsql
as $$
declare
  uid uuid;
begin
  uid := tests.get_supabase_uid(identifier);
  if uid is null then
    raise exception 'test user not found: %', identifier;
  end if;
  perform set_config('role', 'authenticated', true);
  perform set_config(
    'request.jwt.claims',
    json_build_object('sub', uid::text, 'role', 'authenticated')::text,
    true
  );
end;
$$;

-- 인증 해제: anon 롤로 되돌리고 claims를 비운다.
create or replace function tests.clear_authentication()
returns void
language plpgsql
as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', null, true);
end;
$$;
