-- 공식 콘텐츠가 코드 없이도 같은 순서로 다시 만들어지는지 확인한다.
BEGIN;
SELECT plan(14);

SELECT has_column(
  'public',
  'stories',
  'position',
  'a story carries its order among official content'
);

-- 다섯 편이 정해진 순서로 서고, 표지 그림의 자리도 함께 실린다.
SELECT results_eq(
  $$
    select position, slug, title, cover_emoji, cover_image_path
    from public.stories
    order by position
  $$,
  $$
    values
      (1::smallint, 'mia-cafe'::text, '우리 동네 카페'::text, '☕'::text, 'mia-cafe.png'::text),
      (2::smallint, 'business-trip'::text, '출장 일주일'::text, '✈️'::text, 'business-trip.png'::text),
      (3::smallint, 'roommate-month'::text, '룸메이트 구함'::text, '🏠'::text, 'roommate-month.png'::text),
      (4::smallint, 'first-week-office'::text, '첫 주의 사무실'::text, '🏢'::text, 'first-week-office.png'::text),
      (5::smallint, 'upstairs-neighbor'::text, '윗집 사람'::text, '🌙'::text, 'upstairs-neighbor.png'::text)
  $$,
  'every official story stands in its own place with a cover'
);

SELECT results_eq(
  $$
    select title, hook, intro, cover_emoji,
           target_language, completion_title, completion_copy
    from public.stories
    where slug = 'mia-cafe'
  $$,
  $$
    values (
      '우리 동네 카페'::text,
      '늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요'::text,
      '매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건. 바리스타 Mia와 조금씩 가까워져요.'::text,
      '☕'::text,
      'en'::text,
      '첫 이야기를 끝냈어요'::text,
      '잘못 나온 커피 한 잔에서 Mia의 새 출발까지, 다섯 번의 사건을 영어로 지나왔어요.'::text
    )
  $$,
  'the first story carries its own title, hook, intro, cover and completion copy'
);

-- 다섯 편 모두 다섯 화씩이다. 한 편이라도 화가 비면 홈과 상세의 진행 바가 어긋난다.
SELECT results_eq(
  $$
    select s.position, count(e.id)
    from public.stories s
    join public.episodes e on e.story_id = s.id
    group by s.position
    order by s.position
  $$,
  $$
    values
      (1::smallint, 5::bigint),
      (2::smallint, 5::bigint),
      (3::smallint, 5::bigint),
      (4::smallint, 5::bigint),
      (5::smallint, 5::bigint)
  $$,
  'each official story owns five authored episodes'
);

SELECT throws_ok(
  $$insert into public.stories (
      id, position, slug, title, hook, intro, cover_emoji,
      target_language, completion_title, completion_copy
    ) values (
      '10000000-0000-4000-8000-000000000009', 1, 'another-story',
      '다른 이야기', '한 줄 소개예요', '소개 문단이에요.', '📘',
      'en', '끝', '끝냈어요.'
    )$$,
  '23505',
  null,
  'two official stories cannot occupy the same position'
);

SELECT throws_ok(
  $$insert into public.stories (
      id, position, slug, title, hook, intro, cover_emoji,
      target_language, completion_title, completion_copy
    ) values (
      '10000000-0000-4000-8000-00000000000a', 0, 'invalid-story',
      '순서가 없는 이야기', '한 줄 소개예요', '소개 문단이에요.', '📘',
      'en', '끝', '끝냈어요.'
    )$$,
  '23514',
  null,
  'an official story position starts at one'
);

SELECT results_eq(
  $$
    select e.number, e.title
    from public.stories s
    join public.episodes e on e.story_id = s.id
    where s.slug = 'mia-cafe'
    order by e.number
  $$,
  $$
    values
      (1::smallint, '잘못 나온 첫 잔'::text),
      (2::smallint, '계산이 꼬인 아침'::text),
      (3::smallint, '창가 자리의 남자'::text),
      (4::smallint, '이름 없는 신메뉴'::text),
      (5::smallint, '마지막 잔'::text)
  $$,
  'the first story owns the five authored episodes in order'
);

-- 첫 스토리의 사용자에게 보이는 각본 필드를 같은 순서로 이어 계산한 값이다.
-- 각본 한 글자나 등장인물·결말 기준이 달라져도 실패한다.
SELECT is(
  (
    select md5(
      string_agg(
        concat_ws(
          chr(31),
          e.number::text,
          e.title,
          e.preview,
          e.situation,
          e.situation_emoji,
          e.opening,
          e.stage,
          array_to_string(e.cast_names, chr(29)),
          e.ending_success,
          e.ending_compromise,
          e.ending_failure
        ),
        chr(30)
        order by e.number
      )
    )
    from public.stories s
    join public.episodes e on e.story_id = s.id
    where s.slug = 'mia-cafe'
  ),
  'aed9d0b1502851b7eded919fd1212a55',
  'the database preserves every authored episode field byte for byte'
);

SELECT ok(
  (select relrowsecurity from pg_class where oid = 'public.stories'::regclass),
  'row level security is enabled on stories'
);

SELECT ok(
  (select relrowsecurity from pg_class where oid = 'public.episodes'::regclass),
  'row level security is enabled on episodes'
);

SELECT policies_are(
  'public',
  'stories',
  array['stories_select_authenticated'],
  'stories carries only the signed-in read policy'
);

SELECT policies_are(
  'public',
  'episodes',
  array['episodes_select_authenticated'],
  'episodes carries only the signed-in read policy'
);

-- Only the privileges PostgREST can act on are pinned. The REFERENCES, TRIGGER,
-- TRUNCATE and MAINTAIN a new table arrives with have no Data API route, and are accepted.
-- See docs/decisions/supabase-schema-workflow.md.
SELECT ok(
  (SELECT has_table_privilege('authenticated', 'public.stories', 'SELECT'))
  AND NOT (
    SELECT bool_or(has_table_privilege('authenticated', 'public.stories', p))
    FROM unnest(array['INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'authenticated can only read stories'
);

SELECT ok(
  (SELECT has_table_privilege('authenticated', 'public.episodes', 'SELECT'))
  AND NOT (
    SELECT bool_or(has_table_privilege('authenticated', 'public.episodes', p))
    FROM unnest(array['INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'authenticated can only read episodes'
);

SELECT * FROM finish();
ROLLBACK;
