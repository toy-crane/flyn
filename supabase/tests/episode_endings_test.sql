-- Declared access surface of public.episode_endings, and the rule that only
-- public.finish_episode can write it. The catalog checks fail on a grant that
-- widens by accident; the behavioural ones fail on a rule that stops holding.
BEGIN;
SELECT plan(41);

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
  ARRAY['smallint', 'smallint', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'anon', ARRAY[]::text[],
  'anon cannot record an ending'
);

SELECT function_privs_are(
  'public', 'finish_episode',
  ARRAY['smallint', 'smallint', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'authenticated', ARRAY['EXECUTE'],
  'a signed-in user can record an ending'
);

SELECT has_table(
  'public', 'language_levels', 'public.language_levels exists'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.language_levels'::regclass),
  'row level security is enabled on language_levels'
);

SELECT policies_are(
  'public', 'language_levels',
  ARRAY['language_levels_select_own'],
  'language_levels carries only the select policy'
);

SELECT table_privs_are(
  'public', 'language_levels', 'anon', ARRAY[]::text[],
  'anon holds no privilege on language_levels'
);

SELECT table_privs_are(
  'public', 'language_levels', 'authenticated', ARRAY['SELECT'],
  'a person may read their own level but not declare it'
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

-- 이야기 기억과 언어 수준은 결말과 같은 호출에 실려 온다. 장면을 닫은 모델이
-- 한 번의 출력에 함께 썼으므로 서로 어긋날 여지가 없다.
SELECT lives_ok(
  $$select public.finish_episode(
      1::smallint, 2::smallint, '타협', '더 싼 음료로 바꿔 계산을 끝냈다.',
      '카드가 막히자 더 싼 음료로 바꿨다.',
      'Mia가 방법을 같이 찾아 줬다.',
      '다음에는 폰 결제를 준비해 둘지.',
      '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.'
    )$$,
  'the next episode can be finished once the one before it is done'
);

SELECT is(
  (SELECT memory_choice FROM public.episode_endings WHERE episode = 2),
  '카드가 막히자 더 싼 음료로 바꿨다.',
  'the story memory is stored with the ending'
);

SELECT is(
  (SELECT level FROM public.language_levels),
  '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.',
  'the language level is stored for the account'
);

-- 장면이 기억 줄을 쓰지 않았어도 그 화는 끝난다. 기억만 빈 채로 남는다.
SELECT is(
  (SELECT memory_choice FROM public.episode_endings WHERE episode = 1),
  NULL,
  'an episode closed without memory lines is still finished, with no memory'
);

-- 지난 관찰을 지우지 않는다. 이번 장면이 수준을 말하지 않았을 뿐이다.
SELECT lives_ok(
  $$select public.finish_episode(1::smallint, 3::smallint, '실패', '자리를 잃고 나왔다.')$$,
  'an episode that says nothing about the level still finishes'
);

SELECT is(
  (SELECT level FROM public.language_levels),
  '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.',
  'and the level observed earlier is left standing'
);

-- 2화부터는 매번 지나가는 길이다. 새 관찰이 오면 지난 줄을 덮어쓰고 계정마다
-- 한 줄로 남는다.
SELECT lives_ok(
  $$select public.finish_episode(
      1::smallint, 4::smallint, '성공', '솔직한 감상을 전했다.',
      null, null, null,
      '중급 중반. 이유를 덧붙인 문장을 쓴다.'
    )$$,
  'a later episode may observe the level again'
);

SELECT results_eq(
  $$select level, count(*) over () from public.language_levels$$,
  $$values ('중급 중반. 이유를 덧붙인 문장을 쓴다.'::text, 1::bigint)$$,
  'the newest observation replaces the old one instead of adding a row'
);

SELECT is(
  (SELECT count(*) FROM public.episode_endings),
  4::bigint,
  'the player sees all of their finished episodes'
);

SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.episode_endings),
  0::bigint,
  'another account sees none of them'
);

SELECT is(
  (SELECT count(*) FROM public.language_levels),
  0::bigint,
  'and none of the first account''s language level'
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
  4::bigint,
  'and it still holds all of its own episodes'
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
