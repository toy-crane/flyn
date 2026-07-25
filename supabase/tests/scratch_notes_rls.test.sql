-- RLS 증명 (pgTAP). 실행: bun run db:test. bob 행을 먼저 만들어, 테이블에 2행이 있어도
-- alice에겐 1행만 보이는지로 SELECT RLS를 실제 검증한다(단일 행이면 tautology가 된다).

begin;
select plan(5);

select tests.create_supabase_user('alice');
select tests.create_supabase_user('bob');

select tests.authenticate_as('bob');
insert into public.scratch_notes (body) values ('bob note');

select tests.authenticate_as('alice');
insert into public.scratch_notes (body) values ('alice note');

select is(
  (select count(*)::int from public.scratch_notes),
  1,
  'alice는 bob 행이 있어도 자기 행만 본다'
);

-- 변경 시도는 alice로 실행하고, 결과는 bob 관점에서 검증한다.
-- (데이터 변경 CTE는 최상위 문에서만 허용되어 서브쿼리로 행 수를 셀 수 없다.)
update public.scratch_notes
set body = 'hacked'
where user_id = tests.get_supabase_uid('bob');

select tests.authenticate_as('bob');
select is(
  (select count(*)::int from public.scratch_notes where body = 'hacked'),
  0,
  'alice는 bob 행을 수정할 수 없다'
);

select tests.authenticate_as('alice');
delete from public.scratch_notes
where user_id = tests.get_supabase_uid('bob');

select tests.authenticate_as('bob');
select is(
  (select count(*)::int from public.scratch_notes),
  1,
  'alice는 bob 행을 삭제할 수 없다'
);

select is(
  (select body from public.scratch_notes),
  'bob note',
  'bob은 자기 행만 본다'
);

-- anon에는 GRANT 자체가 없다 — RLS 이전에 테이블 접근이 거부된다.
select tests.clear_authentication();
select throws_ok(
  'select count(*) from public.scratch_notes',
  '42501',
  'permission denied for table scratch_notes',
  '미인증은 테이블 접근 자체가 거부된다'
);

select * from finish();
rollback;
