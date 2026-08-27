-- Declared access surface of public.episode_endings, and the rule that only
-- public.finish_episode can write it. The catalog checks fail on a grant that
-- widens by accident; the behavioural ones fail on a rule that stops holding.
BEGIN;
SELECT plan(28);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'season-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'season-b@example.test');

SELECT has_table('public', 'episode_endings', 'public.episode_endings exists');

-- The key is the rule: one account, one season, one episode, one ending.
SELECT col_is_pk(
  'public', 'episode_endings',
  ARRAY['user_id', 'season', 'episode'],
  'an account holds at most one ending per episode of a season'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.episode_endings'::regclass),
  'row level security is enabled'
);

-- Reading is all a signed-in role may do here. No insert policy exists, so the
-- write path is the SECURITY DEFINER function and nothing else.
SELECT policies_are(
  'public', 'episode_endings',
  ARRAY['episode_endings_select_own'],
  'episode_endings carries only the select policy'
);

SELECT table_privs_are(
  'public', 'episode_endings', 'anon', ARRAY[]::text[],
  'anon holds no privilege on episode_endings'
);

-- TRUNCATE is the one RLS does not restrain, so it has to be missing here
-- rather than merely unreachable through a policy.
SELECT table_privs_are(
  'public', 'episode_endings', 'authenticated', ARRAY['SELECT'],
  'authenticated holds SELECT and nothing else'
);

SELECT function_privs_are(
  'public', 'finish_episode',
  ARRAY['smallint', 'smallint', 'text', 'text']::name[],
  'anon', ARRAY[]::text[],
  'anon cannot record an ending'
);

SELECT function_privs_are(
  'public', 'finish_episode',
  ARRAY['smallint', 'smallint', 'text', 'text']::name[],
  'authenticated', ARRAY['EXECUTE'],
  'a signed-in user can record an ending'
);

SET LOCAL ROLE anon;

SELECT throws_ok(
  $$select * from public.episode_endings$$,
  '42501',
  NULL,
  'anon cannot read anyone''s season progress'
);

RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT lives_ok(
  $$select public.finish_episode(1::smallint, 1::smallint, '성공', '새 아이스 아메리카노를 받아냈다.')$$,
  'the first episode of a season can be finished'
);

SELECT is(
  (SELECT kind FROM public.episode_endings WHERE episode = 1),
  '성공',
  'the ending is stored as it was judged'
);

-- Skipping ahead is what a client would do if it could write the table itself.
SELECT throws_ok(
  $$select public.finish_episode(1::smallint, 3::smallint, '성공', '건너뛴 화.')$$,
  '22023',
  NULL,
  'an episode cannot be finished before the one in front of it'
);

-- A retry, or a second ending line in the same scene, arrives here. The first
-- judgement is the season's fact and later ones pass through silently.
SELECT lives_ok(
  $$select public.finish_episode(1::smallint, 1::smallint, '실패', '다시 쓴 결말.')$$,
  'recording the same episode again raises nothing'
);

SELECT is(
  (SELECT kind FROM public.episode_endings WHERE episode = 1),
  '성공',
  'and it does not overwrite the ending that already happened'
);

SELECT throws_ok(
  $$insert into public.episode_endings (user_id, season, episode, kind, outcome)
    values ('11111111-1111-4111-8111-111111111111', 1, 5, '성공', '직접 쓴 결말.')$$,
  '42501',
  NULL,
  'a signed-in user cannot write the table directly'
);

SELECT throws_ok(
  $$truncate public.episode_endings$$,
  '42501',
  NULL,
  'a signed-in user cannot empty everyone''s progress'
);

-- The function takes what the caller sends straight to the table, so these
-- constraints are the whole of the input checking.
SELECT throws_ok(
  $$select public.finish_episode(1::smallint, 2::smallint, '보류', '없는 결말.')$$,
  '23514',
  NULL,
  'an ending outside the three words is refused'
);

SELECT throws_ok(
  $$select public.finish_episode(1::smallint, 2::smallint, '성공', '   ')$$,
  '23514',
  NULL,
  'an ending with no outcome line is refused'
);

-- The order rule is the first gate, so a wild episode number never reaches the
-- ceiling on the column. The ceiling is what stops a caller that climbed there
-- one episode at a time.
SELECT throws_ok(
  $$select public.finish_episode(1::smallint, 101::smallint, '성공', '있지도 않은 화.')$$,
  '22023',
  NULL,
  'an episode number far past the season is refused as out of order'
);

SELECT throws_ok(
  $$select public.finish_episode(0::smallint, 1::smallint, '성공', '없는 시즌.')$$,
  '23514',
  NULL,
  'a season number below the first season is refused'
);

SELECT lives_ok(
  $$select public.finish_episode(1::smallint, 2::smallint, '타협', '더 싼 음료로 바꿔 계산을 끝냈다.')$$,
  'the next episode can be finished once the one before it is done'
);

SELECT is(
  (SELECT count(*) FROM public.episode_endings),
  2::bigint,
  'the player sees both of their finished episodes'
);

SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.episode_endings),
  0::bigint,
  'another account sees none of them'
);

-- The function writes for whoever is calling, never for whoever is named. A
-- second account starts its own season at the first episode.
SELECT lives_ok(
  $$select public.finish_episode(1::smallint, 1::smallint, '실패', '다른 계정의 1화.')$$,
  'another account starts the season at its own first episode'
);

SELECT is(
  (SELECT count(*) FROM public.episode_endings),
  1::bigint,
  'and sees only the row it just wrote'
);

RESET ROLE;

SELECT is(
  (SELECT kind FROM public.episode_endings
   WHERE user_id = '11111111-1111-4111-8111-111111111111' AND episode = 1),
  '성공',
  'the first account''s ending is untouched by the second'
);

SELECT is(
  (SELECT count(*) FROM public.episode_endings
   WHERE user_id = '11111111-1111-4111-8111-111111111111'),
  2::bigint,
  'and it still holds both of its own episodes'
);

-- Signing out mid-request is not a way to write a row with no owner.
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"role":"authenticated"}';

SELECT throws_ok(
  $$select public.finish_episode(1::smallint, 1::smallint, '성공', '주인 없는 결말.')$$,
  '28000',
  NULL,
  'a request with no signed-in user cannot record anything'
);

RESET ROLE;

SELECT * FROM finish();
ROLLBACK;
