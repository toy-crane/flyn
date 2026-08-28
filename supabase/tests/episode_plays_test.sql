-- public.episode_plays의 공개 범위와, 결말을 남기는 길이 public.finish_episode
-- 하나라는 규칙을 확인한다. 플레이를 여는 것은 사람이 하고, 그때 지키는 규칙은
-- "지금 플레이할 화인가" 하나다.
BEGIN;
SELECT plan(53);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'story-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'story-b@example.test');

SELECT has_table('public', 'episode_plays', 'public.episode_plays exists');

SELECT col_is_pk(
  'public', 'episode_plays', ARRAY['id'],
  'a play has a stable key its messages hang from'
);

SELECT col_is_unique(
  'public', 'episode_plays', ARRAY['user_id', 'episode_id'],
  'an account holds at most one play per episode'
);

SELECT col_is_unique(
  'public', 'episode_plays', ARRAY['id', 'user_id'],
  'the pair a message carries is unique, so a message cannot claim another owner'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.episode_plays'::regclass),
  'row level security is enabled'
);

SELECT policies_are(
  'public', 'episode_plays',
  ARRAY['episode_plays_select_own', 'episode_plays_start_own'],
  'a person may read their own plays and open one, and nothing else'
);

-- These pin the privileges PostgREST can act on, and only those. A new table in
-- `public` also arrives with REFERENCES, TRIGGER, TRUNCATE and MAINTAIN for both roles;
-- the Data API has no route to any of them, so they are accepted rather than
-- asserted away. See docs/decisions/supabase-schema-workflow.md.
SELECT ok(
  NOT (
    SELECT bool_or(has_table_privilege('anon', 'public.episode_plays', p))
    FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'anon cannot reach episode_plays through the Data API'
);

SELECT ok(
  (SELECT has_table_privilege('authenticated', 'public.episode_plays', 'SELECT'))
  AND NOT (
    SELECT bool_or(has_table_privilege('authenticated', 'public.episode_plays', p))
    FROM unnest(ARRAY['UPDATE', 'DELETE']) AS p
  ),
  'authenticated may read episode_plays and neither rewrite nor remove a row'
);

-- The insert grant names two columns, so a client can open a play and cannot
-- write an ending into the same statement. `has_table_privilege` answers about
-- the table, which is why the whole-table INSERT reads false here.
SELECT ok(
  NOT (SELECT has_table_privilege('authenticated', 'public.episode_plays', 'INSERT'))
  AND (
    SELECT bool_and(
      has_column_privilege('authenticated', 'public.episode_plays', c, 'INSERT')
    )
    FROM unnest(ARRAY['user_id', 'episode_id']) AS c
  )
  AND NOT (
    SELECT bool_or(
      has_column_privilege('authenticated', 'public.episode_plays', c, 'INSERT')
    )
    FROM unnest(ARRAY[
      'ending_kind', 'ending_outcome', 'finished_at',
      'memory_choice', 'memory_relationship', 'memory_question'
    ]) AS c
  ),
  'a client may open a play and may not write an ending into it'
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

-- The insert policy calls this, and a policy is evaluated with the caller's
-- privileges rather than the policy author's.
SELECT function_privs_are(
  'public', 'episode_is_current', ARRAY['uuid']::name[],
  'authenticated', ARRAY['EXECUTE'],
  'the start policy can ask whether an episode is the current one'
);

SELECT function_privs_are(
  'public', 'episode_is_current', ARRAY['uuid']::name[],
  'anon', ARRAY[]::text[], 'anon cannot ask about anybody''s progress'
);

-- 어느 함수가 소유자 권한을 갖는지는 눈으로 읽히지 않으므로 여기에 고정한다.
-- `finish_episode`는 결말 열에 grant가 없어 소유자로 돌아야 하고,
-- `episode_is_current`는 호출자가 이미 읽을 수 있는 것만 읽으므로 그럴 필요가
-- 없다.
SELECT is_definer(
  'public', 'finish_episode',
  ARRAY['uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'only finish_episode runs with the privileges to write an ending'
);

SELECT isnt_definer(
  'public', 'episode_is_current', ARRAY['uuid']::name[],
  'asking whether an episode is current needs no privileges of its own'
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

SELECT ok(
  NOT (
    SELECT bool_or(has_table_privilege('anon', 'public.language_levels', p))
    FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'anon cannot reach language_levels through the Data API'
);

SELECT ok(
  (SELECT has_table_privilege('authenticated', 'public.language_levels', 'SELECT'))
  AND NOT (
    SELECT bool_or(has_table_privilege('authenticated', 'public.language_levels', p))
    FROM unnest(ARRAY['INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'a person may read their own level but not declare it'
);

SET LOCAL ROLE anon;

SELECT throws_ok(
  $$select * from public.episode_plays$$,
  '42501', NULL, 'anon cannot read anyone''s story progress'
);

RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

-- 플레이를 여는 길. 결말은 아직 없다.
SELECT lives_ok(
  $$insert into public.episode_plays (user_id, episode_id)
    values (
      '11111111-1111-4111-8111-111111111111',
      '11000000-0000-4000-8000-000000000001'
    )$$,
  'a person opens the first episode of a story'
);

SELECT is(
  (SELECT finished_at FROM public.episode_plays
   WHERE episode_id = '11000000-0000-4000-8000-000000000001'),
  NULL, 'an opened play carries no ending yet'
);

SELECT throws_ok(
  $$insert into public.episode_plays (user_id, episode_id)
    values (
      '11111111-1111-4111-8111-111111111111',
      '11000000-0000-4000-8000-000000000003'
    )$$,
  '42501', NULL,
  'an episode cannot be opened before the one in front of it is finished'
);

SELECT throws_ok(
  $$insert into public.episode_plays (user_id, episode_id)
    values (
      '22222222-2222-4222-8222-222222222222',
      '11000000-0000-4000-8000-000000000001'
    )$$,
  '42501', NULL, 'a person cannot open a play in somebody else''s name'
);

SELECT throws_ok(
  $$update public.episode_plays
    set finished_at = now(), ending_kind = '성공', ending_outcome = '직접 쓴 결말.'
    where episode_id = '11000000-0000-4000-8000-000000000001'$$,
  '42501', NULL, 'a signed-in user cannot close their own play by hand'
);

SELECT is(
  (select public.finish_episode(
      '11000000-0000-4000-8000-000000000001'::uuid,
      '성공', '새 아이스 아메리카노를 받아냈다.'
    )),
  true,
  'the play that is already open can be finished'
);

SELECT is(
  (SELECT ending_kind FROM public.episode_plays
   WHERE episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'the ending is stored as it was judged'
);

SELECT isnt(
  (SELECT finished_at FROM public.episode_plays
   WHERE episode_id = '11000000-0000-4000-8000-000000000001'),
  NULL, 'and the play is closed from that moment'
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
  (SELECT ending_kind FROM public.episode_plays
   WHERE episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'and it does not overwrite the ending that already happened'
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

-- 플레이를 열지 않은 채 결말이 도착해도 같은 한 문장이 플레이를 만들며 닫는다.
SELECT lives_ok(
  $$select public.finish_episode(
      '11000000-0000-4000-8000-000000000002'::uuid,
      '타협', '더 싼 음료로 바꿔 계산을 끝냈다.',
      '카드가 막히자 더 싼 음료로 바꿨다.',
      'Mia가 방법을 같이 찾아 줬다.',
      '다음에는 폰 결제를 준비해 둘지.',
      '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.'
    )$$,
  'the next episode can be finished without opening a play first'
);

SELECT is(
  (SELECT memory_choice FROM public.episode_plays
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
  (SELECT memory_choice FROM public.episode_plays
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
  (SELECT count(*) FROM public.episode_plays), 4::bigint,
  'the player sees all of their plays'
);

-- 앞의 네 화가 끝났으므로 5화는 이제 열 수 있다.
SELECT lives_ok(
  $$insert into public.episode_plays (user_id, episode_id)
    values (
      '11111111-1111-4111-8111-111111111111',
      '11000000-0000-4000-8000-000000000005'
    )$$,
  'the next episode opens once every earlier one is finished'
);

SELECT throws_ok(
  $$insert into public.episode_plays (user_id, episode_id)
    values (
      '11111111-1111-4111-8111-111111111111',
      '11000000-0000-4000-8000-000000000005'
    )$$,
  '23505', NULL, 'the same episode cannot be opened twice'
);

SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.episode_plays), 0::bigint,
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
  (SELECT count(*) FROM public.episode_plays), 1::bigint,
  'and sees only the row it just wrote'
);

RESET ROLE;

SELECT is(
  (SELECT ending_kind FROM public.episode_plays
   WHERE user_id = '11111111-1111-4111-8111-111111111111'
     AND episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'the first account''s ending is untouched by the second'
);

SELECT * FROM finish();
ROLLBACK;
