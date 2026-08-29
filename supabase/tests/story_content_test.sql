-- 공식 콘텐츠가 코드 없이도 같은 순서로 다시 만들어지는지 확인한다.
BEGIN;
SELECT plan(12);

SELECT has_column(
  'public',
  'stories',
  'position',
  'a story carries its order among official content'
);

SELECT results_eq(
  $$
    select title, hook, intro, cover_emoji, cover_image_url,
           target_language, completion_title, completion_copy
    from public.stories
    where slug = 'mia-cafe'
  $$,
  $$
    values (
      'Mia의 카페'::text,
      '늘 가던 동네 카페인데, 오늘은 커피부터 잘못 나왔어요'::text,
      '매일 들르는 동네 카페에서 벌어지는 다섯 번의 사건. 바리스타 Mia와 조금씩 가까워져요.'::text,
      '☕'::text,
      null::text,
      'en'::text,
      '첫 이야기를 끝냈어요'::text,
      '다섯 번의 사건을 영어로 지나왔어요.'::text
    )
  $$,
  'the first story carries its own title, hook, intro, cover and completion copy'
);

SELECT throws_ok(
  $$insert into public.stories (
      id, position, slug, title, hook, intro, cover_emoji,
      target_language, completion_title, completion_copy
    ) values (
      '10000000-0000-4000-8000-000000000002', 1, 'another-story',
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
      '10000000-0000-4000-8000-000000000003', 0, 'invalid-story',
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
      (1::smallint, '카페에서 생긴 일'::text),
      (2::smallint, '계산이 꼬인 아침'::text),
      (3::smallint, '자리를 맡아 둔 사이에'::text),
      (4::smallint, '이름 없는 신메뉴'::text),
      (5::smallint, '마지막 잔'::text)
  $$,
  'the first story owns the five authored episodes in order'
);

-- 이 값은 이관 전 `SEASON_ONE`의 사용자에게 보이는 각본 필드를 같은 순서로
-- 이어 계산했다. 각본 한 글자나 등장인물·결말 기준이 달라져도 실패한다.
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
  'cd421faf9d74a57dba8d69aa86ccf708',
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
