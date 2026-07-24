-- 최소 pgTAP 테스트 헬퍼. 함수는 SECURITY DEFINER라 호출자 role이 authenticated로 바뀐
-- 뒤에도 auth.users 접근·role 전환이 되고, tests 스키마엔 USAGE를 열어 호출 가능하다.
-- 파일명 000-이라 다른 테스트보다 먼저 로드된다.

create schema if not exists tests;
grant usage on schema tests to public;

create or replace function tests.create_supabase_user(identifier text)
returns uuid
language plpgsql
security definer
set search_path = ''
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
security definer
set search_path = ''
as $$
  select id
  from auth.users
  where raw_user_meta_data ->> 'test_identifier' = identifier
  limit 1;
$$;

create or replace function tests.authenticate_as(identifier text)
returns void
language plpgsql
security definer
set search_path = ''
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

create or replace function tests.clear_authentication()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform set_config('role', 'anon', true);
  perform set_config('request.jwt.claims', null, true);
end;
$$;
