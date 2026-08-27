-- public.episode_endings의 공개 범위와 public.finish_episode만 결말을 쓸 수
-- 있다는 규칙을 확인한다.
BEGIN;
SELECT plan(40);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'story-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'story-b@example.test');

SELECT has_table('public', 'episode_endings', 'public.episode_endings exists');

SELECT col_is_pk(
  'public', 'episode_endings', ARRAY['user_id', 'episode_id'],
  'an account holds at most one ending per episode'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.episode_endings'::regclass),
  'row level security is enabled'
);

SELECT policies_are(
  'public', 'episode_endings', ARRAY['episode_endings_select_own'],
  'episode_endings carries only the select policy'
);

SELECT table_privs_are(
  'public', 'episode_endings', 'anon', ARRAY[]::text[],
  'anon holds no privilege on episode_endings'
);

SELECT table_privs_are(
  'public', 'episode_endings', 'authenticated', ARRAY['SELECT'],
  'authenticated holds SELECT and nothing else'
);

SELECT function_privs_are(
  'public', 'finish_episode',
  ARRAY['uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'anon', ARRAY[]::text[], 'anon cannot record an ending'
);

SELECT function_privs_are(
  'public', 'finish_episode',
  ARRAY['uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'authenticated', ARRAY['EXECUTE'],
  'a signed-in user can record an ending'
);

SELECT has_table('public', 'language_levels', 'public.language_levels exists');

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.language_levels'::regclass),
  'row level security is enabled on language_levels'
);

SELECT policies_are(
  'public', 'language_levels', ARRAY['language_levels_select_own'],
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
  '42501', NULL, 'anon cannot read anyone''s story progress'
);

RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT is(
  (select public.finish_episode(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '성공', '새 아이스 아메리카노를 받아냈다.'
    )),
  true,
  'the first episode of a story can be finished'
);

SELECT is(
  (SELECT kind FROM public.episode_endings
   WHERE episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'the ending is stored as it was judged'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000003'::uuid,
      '성공', '건너뛴 화.'
    )$$,
  '22023', NULL,
  'an episode cannot be finished before the one in front of it'
);

SELECT is(
  (select public.finish_episode(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '실패', '다시 쓴 결말.'
    )),
  false,
  'recording the same episode again reports that it lost the race'
);

SELECT is(
  (SELECT kind FROM public.episode_endings
   WHERE episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'and it does not overwrite the ending that already happened'
);

SELECT throws_ok(
  $$insert into public.episode_endings (user_id, episode_id, kind, outcome)
    values (
      '11111111-1111-4111-8111-111111111111',
      '11000000-0000-4000-8000-000000000005',
      '성공', '직접 쓴 결말.'
    )$$,
  '42501', NULL, 'a signed-in user cannot write the table directly'
);

SELECT throws_ok(
  $$truncate public.episode_endings$$,
  '42501', NULL, 'a signed-in user cannot empty everyone''s progress'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '보류', '없는 결말.'
    )$$,
  '23514', NULL, 'an ending outside the three words is refused'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '성공', '   '
    )$$,
  '23514', NULL, 'an ending with no outcome line is refused'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '11999999-9999-4999-8999-999999999999'::uuid,
      '성공', '없는 화.'
    )$$,
  '22023', NULL, 'an unknown episode id is refused'
);

SELECT lives_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '타협', '더 싼 음료로 바꿔 계산을 끝냈다.',
      '카드가 막히자 더 싼 음료로 바꿨다.',
      'Mia가 방법을 같이 찾아 줬다.',
      '다음에는 폰 결제를 준비해 둘지.',
      '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.'
    )$$,
  'the next episode can be finished once the one before it is done'
);

SELECT is(
  (SELECT memory_choice FROM public.episode_endings
   WHERE episode_id = '11000000-0000-4000-8000-000000000002'),
  '카드가 막히자 더 싼 음료로 바꿨다.',
  'the story memory is stored with the ending'
);

SELECT is(
  (SELECT level FROM public.language_levels),
  '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.',
  'the language level is stored for the account'
);

SELECT lives_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '실패', '나중에 도착한 다른 결말.',
      null, null, null,
      '고급. 나중 호출이 쓴 다른 관찰.'
    )$$,
  'a repeated ending with a different language observation raises nothing'
);

SELECT is(
  (SELECT level FROM public.language_levels),
  '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.',
  'a repeated ending cannot change the language observation either'
);

SELECT is(
  (SELECT memory_choice FROM public.episode_endings
   WHERE episode_id = '11000000-0000-4000-8000-000000000001'),
  NULL,
  'an episode closed without memory lines is still finished, with no memory'
);

SELECT lives_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000003'::uuid,
      '실패', '자리를 잃고 나왔다.'
    )$$,
  'an episode that says nothing about the level still finishes'
);

SELECT is(
  (SELECT level FROM public.language_levels),
  '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.',
  'and the level observed earlier is left standing'
);

SELECT lives_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000004'::uuid,
      '성공', '솔직한 감상을 전했다.',
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
  (SELECT count(*) FROM public.episode_endings), 4::bigint,
  'the player sees all of their finished episodes'
);

SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.episode_endings), 0::bigint,
  'another account sees none of them'
);

SELECT is(
  (SELECT count(*) FROM public.language_levels), 0::bigint,
  'and none of the first account''s language level'
);

SELECT lives_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '실패', '다른 계정의 1화.'
    )$$,
  'another account starts the story at its own first episode'
);

SELECT is(
  (SELECT count(*) FROM public.episode_endings), 1::bigint,
  'and sees only the row it just wrote'
);

RESET ROLE;

SELECT is(
  (SELECT kind FROM public.episode_endings
   WHERE user_id = '11111111-1111-4111-8111-111111111111'
     AND episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'the first account''s ending is untouched by the second'
);

SELECT * FROM finish();
ROLLBACK;
