-- 인물이 스토리에 살고, 화는 그 스토리의 인물만 가리키는지 확인한다.
BEGIN;
SELECT plan(23);

-- 두 상한은 범위 check와 고유 제약이 함께 있어야 성립하는데, 고유 쪽은 문장이
-- 아니라 COMMIT에서 확인한다. 이 테스트는 ROLLBACK으로 닫으므로 그대로 두면
-- 그 절반을 영영 확인하지 못한다. 이 트랜잭션에서만 즉시로 바꿔 확인한다.
SET CONSTRAINTS
  public.characters_story_id_position_key,
  public.episode_characters_episode_id_at_key
  IMMEDIATE;

-- 다섯 스토리가 저마다 인물을 소유한다.
SELECT results_eq(
  $$
    select s.slug, c.position, c.name
    from public.characters c
    join public.stories s on s.id = c.story_id
    order by s.position, c.position
  $$,
  $$
    values
      ('mia-cafe'::text, 1::smallint, 'Mia'::text),
      ('mia-cafe'::text, 2::smallint, 'Owen'::text),
      ('business-trip'::text, 1::smallint, 'Anna'::text),
      ('business-trip'::text, 2::smallint, 'Daniel'::text),
      ('roommate-month'::text, 1::smallint, 'Jamie'::text),
      ('roommate-month'::text, 2::smallint, 'Noah'::text),
      ('first-week-office'::text, 1::smallint, 'Dan'::text),
      ('first-week-office'::text, 2::smallint, 'Grace'::text),
      ('upstairs-neighbor'::text, 1::smallint, 'Nora'::text),
      ('upstairs-neighbor'::text, 2::smallint, 'Frank'::text)
  $$,
  '다섯 스토리가 저마다 인물을 순서대로 소유한다'
);

-- 같은 인물은 어느 화에서나 같은 번호다. 그 번호가 이름표 색이 된다.
SELECT is(
  (select count(distinct c.position) from public.characters c
   join public.stories s on s.id = c.story_id
   where s.slug = 'mia-cafe' and c.name = 'Mia'),
  1::bigint,
  'Mia의 순서는 스토리 안에서 하나뿐이다'
);

-- 인물 설명은 한 곳에만 있다. 화마다 다시 쓰지 않는다.
SELECT ok(
  (select bool_and(length(btrim(persona)) > 40) from public.characters),
  '인물마다 설명이 하나씩 있다'
);

-- 스물다섯 화가 모두 인물을 가리키고, 다른 스토리의 인물은 섞이지 않는다.
SELECT is(
  (select count(distinct episode_id) from public.episode_characters),
  25::bigint,
  '스물다섯 화가 모두 인물을 가리킨다'
);

SELECT is(
  (select count(*) from public.episode_characters ec
   join public.episodes e on e.id = ec.episode_id
   join public.characters c on c.id = ec.character_id
   where e.story_id <> c.story_id),
  0::bigint,
  '화는 자기 스토리의 인물만 가리킨다'
);

-- 이전 화자 목록과 새 구조가 같은 이름을 같은 차례로 담는다. 앞선 API가 아직
-- `cast_names`를 읽으므로 둘이 어긋나면 안 된다. 인물이 하나도 없는 화는 부분
-- 질의가 NULL을 돌려주므로 빈 배열로 바꿔 그 화도 불일치로 세게 한다.
SELECT is(
  (select count(*) from public.episodes e
   where e.cast_names <> coalesce((
     select array_agg(c.name order by ec.at)
     from public.episode_characters ec
     join public.characters c on c.id = ec.character_id
     where ec.episode_id = e.id
   ), '{}'::text[])),
  0::bigint,
  '이전 화자 목록과 새 구조가 같은 이름을 같은 차례로 담는다'
);

-- 무대 글에서 등장인물 문장과 인물 항목이 사라졌다. 그 문장은 이제 인물
-- 데이터에서 만든다.
SELECT is(
  (select count(*) from public.episodes
   where stage like '%등장인물은%' or stage like '%새 인물을 만들지 않는다%'),
  0::bigint,
  '무대 글에 등장인물 문장이 남아 있지 않다'
);

SELECT is(
  (select count(*) from public.episodes
   where stage ~ '(^|\n)- [A-Z][A-Za-z]*: '),
  0::bigint,
  '무대 글에 인물 항목이 남아 있지 않다'
);

-- 지문을 없앴으므로 무대가 지문으로 전하라고 시키지 않는다.
SELECT is(
  (select count(*) from public.episodes where stage like '%지문%'),
  0::bigint,
  '무대 글에 지문으로 전하라는 지시가 남아 있지 않다'
);

-- 도입은 한국어 장면 서술로 시작해 그 뒤로는 대사만 이어진다. 이름 없는 줄이
-- 먼저 서고, 첫 대사가 나온 뒤로는 이름 없는 줄이 다시 나오지 않는다.
SELECT is(
  (select count(*) from public.episodes e
   where exists (
     select 1
     from unnest(string_to_array(e.opening, E'\n')) with ordinality as line(text, at)
     join lateral (
       select min(spoken.at) as first_spoken
       from unnest(string_to_array(e.opening, E'\n')) with ordinality as spoken(text, at)
       where spoken.text ~ '^[A-Z][A-Za-z]*: '
     ) as said on true
     where line.text !~ '^[A-Z][A-Za-z]*: '
       and said.first_spoken is not null
       and line.at > said.first_spoken
   )),
  0::bigint,
  '도입은 첫 대사 뒤로 이름 없는 줄을 두지 않는다'
);

SELECT is(
  (select count(*) from public.episodes e
   where (
     select count(*)
     from unnest(string_to_array(e.opening, E'\n')) as line(text)
     where line.text !~ '^[A-Z][A-Za-z]*: '
   ) between 1 and 3
   and (
     select count(*)
     from unnest(string_to_array(e.opening, E'\n')) as line(text)
     where line.text ~ '^[A-Z][A-Za-z]*: '
   ) >= 1),
  25::bigint,
  '스물다섯 화의 도입이 장면 서술 세 줄 이하와 대사로 이루어진다'
);

-- 한 스토리 안에서 이름은 겹치지 않는다.
SELECT throws_ok(
  $$insert into public.characters (story_id, name, position, persona)
    values (
      (select id from public.stories where slug = 'mia-cafe'),
      'Mia', 3, '같은 이름을 다시 만들 수 없다는 것을 확인하는 인물 설명이다.'
    )$$,
  '23505', NULL, '한 스토리에 같은 이름의 인물을 두 번 만들 수 없다'
);

-- 스토리에 다섯째 인물이 생기지 않는다. 순서를 1..4로 묶어 세는 트리거 없이 막는다.
SELECT throws_ok(
  $$insert into public.characters (story_id, name, position, persona)
    values (
      (select id from public.stories where slug = 'mia-cafe'),
      'Fifth', 5, '다섯째 자리를 만들 수 없다는 것을 확인하는 인물 설명이다.'
    )$$,
  '23514', NULL, '스토리의 인물 순서는 넷을 넘지 못한다'
);

-- 화에 넷째 인물이 서지 않는다.
SELECT throws_ok(
  $$insert into public.episode_characters (episode_id, character_id, story_id, at)
    select e.id, c.id, e.story_id, 4
    from public.episodes e
    join public.stories s on s.id = e.story_id
    join public.characters c on c.story_id = e.story_id and c.name = 'Owen'
    where s.slug = 'mia-cafe' and e.number = 1$$,
  '23514', NULL, '한 화에 넷째 인물을 세울 수 없다'
);

-- 다른 스토리의 인물을 이 화에 세울 수 없다.
SELECT throws_ok(
  $$insert into public.episode_characters (episode_id, character_id, story_id, at)
    select e.id, c.id, e.story_id, 3
    from public.episodes e
    join public.stories s on s.id = e.story_id
    join public.characters c
      on c.name = 'Jamie'
    where s.slug = 'mia-cafe' and e.number = 1$$,
  '23503', NULL, '다른 스토리의 인물을 이 화에 세울 수 없다'
);

-- 한 화에 같은 자리를 두 번 줄 수 없다. 이 고유 제약이 없으면 자리 번호가
-- 1..3이어도 인물이 넷까지 설 수 있다.
SELECT throws_ok(
  $$insert into public.episode_characters (episode_id, character_id, story_id, at)
    select e.id, c.id, e.story_id, 1
    from public.episodes e
    join public.stories s on s.id = e.story_id
    join public.characters c on c.story_id = e.story_id and c.name = 'Owen'
    where s.slug = 'mia-cafe' and e.number = 1$$,
  '23505', NULL, '한 화의 같은 자리에 두 인물을 세울 수 없다'
);

-- 한 스토리에 같은 순서를 두 번 줄 수 없다. 이름표 색이 겹치지 않는 근거다.
SELECT throws_ok(
  $$insert into public.characters (story_id, name, position, persona)
    values (
      (select id from public.stories where slug = 'mia-cafe'),
      'Third', 1, '같은 순서를 다시 쓸 수 없다는 것을 확인하는 인물 설명이다.'
    )$$,
  '23505', NULL, '한 스토리의 같은 순서에 두 인물을 둘 수 없다'
);

-- 콘텐츠는 로그인한 사람이 읽기만 한다. 기존 stories, episodes와 같은 자세다.
SELECT ok(
  (select relrowsecurity from pg_class where oid = 'public.characters'::regclass),
  'characters에 행 수준 보안이 켜져 있다'
);

SELECT ok(
  (select relrowsecurity from pg_class where oid = 'public.episode_characters'::regclass),
  'episode_characters에 행 수준 보안이 켜져 있다'
);

SELECT policies_are(
  'public',
  'characters',
  array['characters_select_visible_story'],
  'characters는 자기 스토리를 따라가는 읽기 정책 하나만 가진다'
);

SELECT policies_are(
  'public',
  'episode_characters',
  array['episode_characters_select_visible_story'],
  'episode_characters는 자기 스토리를 따라가는 읽기 정책 하나만 가진다'
);

-- PostgREST가 쓸 수 있는 권한만 고정한다. 새 테이블이 달고 오는 REFERENCES,
-- TRIGGER, TRUNCATE, MAINTAIN은 Data API에 경로가 없어 그대로 둔다.
-- docs/decisions/supabase-schema-workflow.md를 따른다.
SELECT ok(
  (SELECT has_table_privilege('authenticated', 'public.characters', 'SELECT'))
  AND NOT (
    SELECT bool_or(has_table_privilege('authenticated', 'public.characters', p))
    FROM unnest(array['INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'authenticated는 인물을 읽기만 한다'
);

SELECT ok(
  (SELECT has_table_privilege('authenticated', 'public.episode_characters', 'SELECT'))
  AND NOT (
    SELECT bool_or(
      has_table_privilege('authenticated', 'public.episode_characters', p)
    )
    FROM unnest(array['INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'authenticated는 화의 인물 연결을 읽기만 한다'
);

SELECT * FROM finish();
ROLLBACK;
