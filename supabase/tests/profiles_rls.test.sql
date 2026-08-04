-- 프로필 경계 증명 (pgTAP). 실행: bun run db:test.
--
-- 여기서 지키는 것은 셋이다 — 트리거가 만드는 1:1 관계, RLS가 가르는 **행**,
-- 열 권한이 가르는 **열**. 정책만으로는 "내 행의 email을 내가 고치는 것"을 막지
-- 못하므로 세 번째가 따로 필요하고, 그래서 따로 검증한다.
--
-- 차단 주장은 정책이 통째로 사라져 아무도 못 쓰게 돼도 참이다. 그래서 소유자가
-- 자기 표시 이름을 바꿀 수 있다는 양성 대조를 함께 둔다.

begin;
select plan(44);

select tests.create_supabase_user('alice');
select tests.create_supabase_user('bob');

-- 세션이 앱에 돌아왔을 때 행은 이미 존재해야 한다.
--
-- 개수는 이 테스트가 만든 둘로 한정한다. seed.sql의 데모 사용자에게도 같은
-- 트리거가 프로필을 만들어, 전체 개수로 세면 시드가 바뀔 때마다 깨진다.
select is(
  (select count(*)::int from public.profiles
   where id in (tests.get_supabase_uid('alice'), tests.get_supabase_uid('bob'))),
  2,
  '트리거가 새 사용자마다 프로필을 만든다'
);

select is(
  (select email from public.profiles where id = tests.get_supabase_uid('alice')),
  'alice@test.example',
  '프로필 email은 auth.users에서 복사된다'
);

select ok(
  (select display_name is null from public.profiles
   where id = tests.get_supabase_uid('alice')),
  '새 프로필의 display_name은 null이다 — 이것이 곧 온보딩 전 상태다'
);

select ok(
  (select username is null from public.profiles
   where id = tests.get_supabase_uid('alice')),
  '새 프로필의 username도 null이다 — 두 값이 모두 채워져야 온보딩이 끝난다'
);

select tests.authenticate_as('alice');

select is(
  (select count(*)::int from public.profiles),
  1,
  'alice는 bob 행이 있어도 자기 행만 본다'
);

-- 변경 시도는 alice로 하고 결과는 bob 관점에서 본다. RLS가 막으면 에러가 아니라
-- 0행 갱신이라, 시도한 쪽에서는 성공과 구분되지 않는다.
update public.profiles set display_name = 'hacked'
where id = tests.get_supabase_uid('bob');

select tests.authenticate_as('bob');
select ok(
  (select display_name is null from public.profiles),
  'alice는 bob의 표시 이름을 바꿀 수 없다'
);

-- 양성 대조: UPDATE 정책이나 display_name 열 권한이 사라지면 여기서 걸린다.
update public.profiles set display_name = 'bob name';
select is(
  (select display_name from public.profiles),
  'bob name',
  'bob은 자기 표시 이름을 바꿀 수 있다'
);

update public.profiles set username = 'Bob_User';
select is(
  (select username from public.profiles),
  'bob_user',
  'bob은 자기 아이디를 바꿀 수 있고 대문자는 소문자로 저장된다'
);

select tests.authenticate_as('alice');
update public.profiles set username = 'hacked'
where id = tests.get_supabase_uid('bob');

select tests.authenticate_as('bob');
select is(
  (select username from public.profiles),
  'bob_user',
  'alice는 bob의 아이디를 바꿀 수 없다'
);

select tests.authenticate_as('alice');

update public.profiles set display_name = '  hoon  ';
select is(
  (select display_name from public.profiles),
  'hoon',
  '유효한 이름은 앞뒤 공백이 제거돼 저장된다'
);

select throws_ok(
  $$update public.profiles set display_name = ''$$,
  '23514',
  null,
  '빈 문자열은 거부된다'
);

-- 보이지 않는 문자만 남은 이름은 트리거가 ''로 만들고 check가 거부한다. null로
-- 조용히 바꾸지 않는다 — 그러면 사용자가 영문도 모른 채 온보딩으로 되돌아간다.
--
-- **스페이스 하나만 보면 안 된다.** 예전 btrim(x)는 ASCII 스페이스만 지워서
-- 아래 넷을 전부 통과시켰고, 그중 제로폭 공백은 앱 UI로도 저장됐다. 그때도 이
-- 파일은 초록이었다 — 스페이스 케이스 하나만 있었기 때문이다.
select throws_ok(
  $$update public.profiles set display_name = '   '$$,
  '23514',
  null,
  '스페이스뿐인 이름은 거부된다'
);

select throws_ok(
  $$update public.profiles set display_name = E'\t\t\t'$$,
  '23514',
  null,
  '탭뿐인 이름은 거부된다'
);

select throws_ok(
  $$update public.profiles set display_name = U&'\00a0\00a0'$$,
  '23514',
  null,
  'NBSP뿐인 이름은 거부된다'
);

select throws_ok(
  $$update public.profiles set display_name = U&'\3000'$$,
  '23514',
  null,
  '전각 공백뿐인 이름은 거부된다'
);

select throws_ok(
  $$update public.profiles set display_name = U&'\200b\feff'$$,
  '23514',
  null,
  '제로폭 문자뿐인 이름은 거부된다'
);

-- 양성 대조 1: 잘라내기가 과하면 여기서 걸린다. 앞뒤에 보이지 않는 문자를
-- 두르고도 알맹이는 그대로 남아야 한다.
update public.profiles set display_name = U&'\00a0' || '김 한울' || E'\t';
select is(
  (select display_name from public.profiles),
  '김 한울',
  '앞뒤만 잘라내고 가운데 공백은 보존한다'
);

-- 양성 대조 2: U+200D(ZWJ)를 가운데에서까지 걷어내면 가족 이모지가 쪼개진다.
update public.profiles set display_name = '👨‍👩‍👧';
select is(
  (select display_name from public.profiles),
  '👨‍👩‍👧',
  'ZWJ로 이어진 이모지는 쪼개지지 않는다'
);

-- 상한은 UX 규칙이 아니라 남용 방지 backstop이다. 사람이 보는 길이는 입력칸이
-- grapheme 단위로 막으므로, 여기서는 터무니없는 크기만 거른다.
select throws_ok(
  $$update public.profiles set display_name = repeat('a', 501)$$,
  '23514',
  null,
  '상한을 넘는 이름은 거부된다'
);

-- 아이디는 검색·멘션에 쓰이는 정규화된 식별자라 DB도 UX 규칙을 그대로
-- 강제한다. 앱 검증은 빠른 피드백이고, 이 제약과 고유 인덱스가 최종 방어다.
update public.profiles set username = 'alice.id_7';
select is(
  (select username from public.profiles),
  'alice.id_7',
  '영문 소문자·숫자·마침표·밑줄 조합은 저장된다'
);

select throws_ok(
  $$update public.profiles set username = 'abc'$$,
  '23514',
  null,
  '4자보다 짧은 아이디는 거부된다'
);

select throws_ok(
  $$update public.profiles set username = repeat('a', 21)$$,
  '23514',
  null,
  '20자보다 긴 아이디는 거부된다'
);

select throws_ok(
  $$update public.profiles set username = '.alice'$$,
  '23514',
  null,
  '마침표로 시작하는 아이디는 거부된다'
);

select throws_ok(
  $$update public.profiles set username = 'alice_'$$,
  '23514',
  null,
  '밑줄로 끝나는 아이디는 거부된다'
);

select throws_ok(
  $$update public.profiles set username = 'alice-id'$$,
  '23514',
  null,
  '허용 문자 밖의 문자가 든 아이디는 거부된다'
);

select throws_ok(
  $$update public.profiles set username = 'alice..id'$$,
  '23514',
  null,
  '마침표를 연달아 쓴 아이디는 거부된다'
);

select throws_ok(
  $$update public.profiles set username = 'support'$$,
  '23514',
  null,
  '예약 아이디는 거부된다'
);

select throws_ok(
  $$update public.profiles set username = 'bob_user'$$,
  '23505',
  null,
  '다른 사용자가 쓰는 아이디는 대소문자와 관계없이 중복 저장할 수 없다'
);

select ok(
  public.is_username_available('fresh.user'),
  '사용할 수 있는 아이디는 가용하다고 답한다'
);

select ok(
  not public.is_username_available('BOB_USER'),
  '대소문자를 바꿔도 이미 쓰는 아이디는 가용하지 않다'
);

select ok(
  public.is_username_available('ALICE.ID_7'),
  '현재 사용자의 기존 아이디는 가용하다고 답한다'
);

select ok(
  not public.is_username_available('bad-id'),
  '형식이 잘못된 후보는 가용하지 않다'
);

select ok(
  not public.is_username_available('official'),
  '예약된 후보는 가용하지 않다'
);

-- 열 권한 — 정책은 행만 가르고, 여기서부터는 grant가 막는다.
select throws_ok(
  $$update public.profiles set email = 'hacked@test.example'$$,
  '42501',
  'permission denied for table profiles',
  '본인도 자기 email을 바꿀 수 없다'
);

select throws_ok(
  $$update public.profiles set updated_at = now()$$,
  '42501',
  'permission denied for table profiles',
  '클라이언트는 updated_at을 보낼 수 없다'
);

select throws_ok(
  $$insert into public.profiles (id, email) values (gen_random_uuid(), 'x@test.example')$$,
  '42501',
  'permission denied for table profiles',
  '프로필 생성은 클라이언트 권한이 아니다'
);

select throws_ok(
  $$delete from public.profiles$$,
  '42501',
  'permission denied for table profiles',
  '프로필 삭제는 클라이언트 권한이 아니다'
);

select tests.clear_authentication();
select throws_ok(
  $$select public.is_username_available('fresh.user')$$,
  '42501',
  'permission denied for function is_username_available',
  '미인증은 아이디 가용성 함수도 실행할 수 없다'
);

select throws_ok(
  $$select count(*) from public.profiles$$,
  '42501',
  'permission denied for table profiles',
  '미인증은 테이블 접근 자체가 거부된다'
);

-- 아래 셋은 DB 소유자만 할 수 있는 일이다. 세션 사용자가 슈퍼유저라 되돌아온다.
set local role postgres;

-- now()는 트랜잭션 시작 시각이라 같은 트랜잭션 안에서 created_at과 구분되지
-- 않는다. "나중이다"가 아니라 **보낸 값을 트리거가 덮는다**로 증명한다.
update public.profiles set updated_at = 'epoch'
where id = tests.get_supabase_uid('alice');
select is(
  (select updated_at from public.profiles where id = tests.get_supabase_uid('alice')),
  now(),
  'updated_at은 보낸 값이 아니라 DB가 정한다'
);

update auth.users set email = 'alice2@test.example'
where id = tests.get_supabase_uid('alice');
select is(
  (select email from public.profiles where id = tests.get_supabase_uid('alice')),
  'alice2@test.example',
  'Auth 이메일이 바뀌면 프로필 복제본이 따라간다'
);

-- auth.users.email은 nullable인데 profiles.email은 not null이다. 트리거가
-- 그대로 따라가면 23502로 **auth 작업 전체가 실패한다** — 마지막 이메일 신원을
-- 푸는 것 같은 흐름이 정체불명의 "Database error"로 막힌다.
update auth.users set email = null
where id = tests.get_supabase_uid('alice');
select is(
  (select email from public.profiles where id = tests.get_supabase_uid('alice')),
  'alice2@test.example',
  'Auth 이메일이 null이 돼도 트랜잭션을 깨지 않고 직전 값을 남긴다'
);

-- 계정 삭제가 프로필을 남기지 않는다는 뜻이다. 지운 뒤에는
-- get_supabase_uid가 null을 돌려주므로 동기화된 email로 찾는다.
delete from auth.users where id = tests.get_supabase_uid('alice');
select is(
  (select count(*)::int from public.profiles where email = 'alice2@test.example'),
  0,
  'auth 사용자를 지우면 프로필도 함께 사라진다'
);

-- 양성 대조: cascade가 남의 행까지 쓸어가면 여기서 걸린다.
select is(
  (select count(*)::int from public.profiles
   where id = tests.get_supabase_uid('bob')),
  1,
  '한 사용자의 삭제는 다른 사용자의 프로필을 건드리지 않는다'
);

select * from finish();
rollback;
