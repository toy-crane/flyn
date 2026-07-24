-- RLS 증명 (pgTAP): scratch_notes에서 "본인 행만 보인다"를 검증한다.
-- 실행: bun run db:test (내부적으로 supabase test db). begin…rollback으로 격리된다.
-- 다른 소유자(bob)의 행을 먼저 만들어, alice의 카운트가 RLS로 실제로 걸러지는지 본다
-- (테이블에 2행이 있는데 alice에겐 1행만 보여야 의미 있는 검증이다).

begin;
select plan(5);

select tests.create_supabase_user('alice');
select tests.create_supabase_user('bob');

-- bob이 먼저 자기 행을 만든다 → 다른 소유자의 데이터가 존재하는 상태.
select tests.authenticate_as('bob');
insert into public.scratch_notes (body) values ('bob note');

-- alice가 자기 행을 만든다. 테이블엔 이제 2행(alice 1 + bob 1)이 있다.
select tests.authenticate_as('alice');
insert into public.scratch_notes (body) values ('alice note');

-- 총 2행이지만 alice에겐 자기 1행만 보인다 → SELECT RLS가 실제로 거른다.
select is(
  (select count(*)::int from public.scratch_notes),
  1,
  'alice는 bob 행이 있어도 자기 행만 본다'
);

-- alice는 bob 행을 수정할 수 없다(RLS로 걸러져 0행 영향).
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

-- alice는 bob 행을 삭제할 수 없다(0행 영향).
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

-- bob도 자기 행만 본다.
select tests.authenticate_as('bob');
select is(
  (select count(*)::int from public.scratch_notes),
  1,
  'bob은 자기 행만 본다'
);

-- 미인증(anon)은 아무 행도 못 본다.
select tests.clear_authentication();
select is(
  (select count(*)::int from public.scratch_notes),
  0,
  '미인증은 아무 행도 못 본다'
);

select * from finish();
rollback;
