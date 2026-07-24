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

select is(
  (
    with updated as (
      update public.scratch_notes
      set body = 'hacked'
      where user_id = tests.get_supabase_uid('bob')
      returning 1
    )
    select count(*)::int from updated
  ),
  0,
  'alice는 bob 행을 수정할 수 없다'
);

select is(
  (
    with deleted as (
      delete from public.scratch_notes
      where user_id = tests.get_supabase_uid('bob')
      returning 1
    )
    select count(*)::int from deleted
  ),
  0,
  'alice는 bob 행을 삭제할 수 없다'
);

select tests.authenticate_as('bob');
select is(
  (select count(*)::int from public.scratch_notes),
  1,
  'bob은 자기 행만 본다'
);

select tests.clear_authentication();
select is(
  (select count(*)::int from public.scratch_notes),
  0,
  '미인증은 아무 행도 못 본다'
);

select * from finish();
rollback;
