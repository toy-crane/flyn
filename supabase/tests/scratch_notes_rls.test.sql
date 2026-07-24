-- RLS 증명 (pgTAP): scratch_notes에서 "본인 행만 보인다"를 검증한다.
-- 실행: bun run db:test  (내부적으로 supabase test db). begin…rollback으로 격리되고,
-- 프레시 유저를 만들어 쓰므로 시드 데이터가 있어도 RLS가 걸러 카운트가 흔들리지 않는다.

begin;
select plan(5);

select tests.create_supabase_user('alice');
select tests.create_supabase_user('bob');

-- alice: 자기 행 insert 후 본인 행만 조회된다.
select tests.authenticate_as('alice');
insert into public.scratch_notes (body) values ('alice note');
select is(
  (select count(*)::int from public.scratch_notes),
  1,
  'alice는 자기 행 1개를 본다'
);

-- bob: alice 행은 안 보인다 (select RLS 차단).
select tests.authenticate_as('bob');
select is(
  (select count(*)::int from public.scratch_notes),
  0,
  'bob은 alice 행을 못 본다'
);

-- bob: 자기 행 insert 후 자기 것만 보인다.
insert into public.scratch_notes (body) values ('bob note');
select is(
  (select count(*)::int from public.scratch_notes),
  1,
  'bob은 자기 행만 본다'
);

-- bob이 alice 행 update 시도 → RLS로 걸러져 0행 영향.
select is(
  (
    with updated as (
      update public.scratch_notes
      set body = 'hacked'
      where user_id = tests.get_supabase_uid('alice')
      returning 1
    )
    select count(*)::int from updated
  ),
  0,
  'bob은 alice 행을 수정할 수 없다'
);

-- 미인증(anon): 아무 행도 안 보인다.
select tests.clear_authentication();
select is(
  (select count(*)::int from public.scratch_notes),
  0,
  '미인증은 아무 행도 못 본다'
);

select * from finish();
rollback;
