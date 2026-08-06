-- public 전체의 권한 불변식 (pgTAP). 실행: bun run db:test.
--
-- 여기서 지키는 것은 한 테이블의 규칙이 아니라 **모든 테이블에 걸리는 규칙**이다.
-- create table은 anon·authenticated에 Dxtm(TRUNCATE·REFERENCES·TRIGGER·MAINTAIN)을
-- 자동으로 붙이고, RLS는 테이블 전체에 적용되는 연산을 가르지 않는다. 그래서
-- 테이블마다 revoke를 적어야 하는데, 그 한 줄을 빠뜨려도 앱은 멀쩡히 돌아가고
-- 어디에서도 티가 나지 않는다.
--
-- **테이블을 열거하는 검사로는 이것을 막지 못한다.** 새 테이블은 검사 자체가
-- 없어서 그냥 통과하기 때문이다. profiles가 그렇게 빠져나갔다 — 리포에서 가장
-- 오래된 테이블이라 기본 권한이 무엇을 붙이는지 알기 전에 만들어졌고, 그 뒤로 어느
-- 테스트도 그것을 보지 않았다. 에피소드 계열은 테이블마다 revoke를 손으로 옮겨
-- 적어 막았지만, 그 방식은 다음에 옮겨 적는 것을 잊으면 그대로 뚫린다. 그래서
-- 여기서는 이름을 적지 않고 스키마를 통째로 훑는다. 앞으로 만드는 테이블은
-- 자동으로 이 검사에 들어온다.
--
-- 비어 있음을 주장하는 검사는 **훑는 대상이 0개여도 초록이 된다.** 그래서 대상이
-- 실제로 있다는 것과, 의도한 권한은 살아남았다는 양성 대조를 함께 둔다.

begin;
select plan(6);

select is_empty(
  $$
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and (has_table_privilege('anon', c.oid, 'TRUNCATE')
        or has_table_privilege('anon', c.oid, 'REFERENCES')
        or has_table_privilege('anon', c.oid, 'TRIGGER')
        or has_table_privilege('anon', c.oid, 'MAINTAIN'))
  $$,
  'anon은 public의 어떤 테이블에도 테이블 전체 권한을 갖지 않는다'
);

select is_empty(
  $$
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
      and (has_table_privilege('authenticated', c.oid, 'TRUNCATE')
        or has_table_privilege('authenticated', c.oid, 'REFERENCES')
        or has_table_privilege('authenticated', c.oid, 'TRIGGER')
        or has_table_privilege('authenticated', c.oid, 'MAINTAIN'))
  $$,
  'authenticated는 public의 어떤 테이블에도 테이블 전체 권한을 갖지 않는다'
);

-- 양성 대조 1: 위 두 검사가 빈 집합을 훑고 초록이 되는 것을 막는다.
select cmp_ok(
  (
    select count(*)::int
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public' and c.relkind in ('r', 'p')
  ),
  '>=',
  3,
  '검사가 실제로 public의 테이블들을 훑고 있다'
);

-- 양성 대조 2·3: revoke all이 의도한 권한까지 지웠다면 여기서 걸린다. 특히 열
-- 단위 grant는 테이블 단위 ACL에 안 잡혀서, 위 검사만으로는 사라져도 모른다.
select ok(
  has_table_privilege('authenticated', 'public.profiles', 'SELECT'),
  '앱 역할은 여전히 프로필을 읽을 수 있다'
);

select ok(
  has_any_column_privilege('authenticated', 'public.profiles', 'UPDATE'),
  '앱 역할은 여전히 프로필의 허용된 열을 고칠 수 있다'
);

-- 양성 대조 4: revoke 대상에서 service_role을 뺀 것은 의도된 결정이다. 서버가
-- 일하지 못하게 됐다면 여기서 걸린다.
select ok(
  has_table_privilege('service_role', 'public.profiles', 'DELETE'),
  '서버 역할은 프로필을 지울 수 있다'
);

select * from finish();
rollback;
