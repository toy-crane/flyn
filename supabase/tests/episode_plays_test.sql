-- public.episode_plays의 공개 범위와, 결말을 남기는 길이 public.finish_episode
-- 하나라는 규칙을 확인한다. 플레이를 여는 것은 사람이 하고, 그때 지키는 규칙은
-- "이 회차에서 지금 플레이할 화인가" 하나다.
--
-- 회차가 기준이라는 것이 이 파일에서 가장 중요한 사실이다. 같은 화를 두 회차에서
-- 각각 플레이할 수 있고, 한 회차의 결말과 이야기 기억이 다른 회차로 넘어가지
-- 않는다.
BEGIN;
SELECT plan(59);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'story-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'story-b@example.test');

-- 회차는 소유자 권한으로 미리 만들어 둔다. 클라이언트가 여는 길은
-- story_plays_test.sql이 따로 확인한다. 여기서 필요한 것은 뒤이은 플레이가
-- 가리킬 안정된 id다.
INSERT INTO public.story_plays (id, user_id, story_id)
VALUES
  -- 첫 계정이 미아 카페를 두 번 진행한다.
  (
    '1a000000-0000-4000-8000-000000000001',
    '11111111-1111-4111-8111-111111111111',
    '10000000-0000-4000-8000-000000000001'
  ),
  (
    '1a000000-0000-4000-8000-000000000002',
    '11111111-1111-4111-8111-111111111111',
    '10000000-0000-4000-8000-000000000001'
  ),
  -- 둘째 계정의 회차. 첫 계정이 여기에 손대지 못해야 한다.
  (
    '1b000000-0000-4000-8000-000000000001',
    '22222222-2222-4222-8222-222222222222',
    '10000000-0000-4000-8000-000000000001'
  );

SELECT has_table('public', 'episode_plays', 'public.episode_plays exists');

SELECT col_is_pk(
  'public', 'episode_plays', ARRAY['id'],
  'a play has a stable key its messages hang from'
);

SELECT col_is_unique(
  'public', 'episode_plays', ARRAY['story_play_id', 'episode_id'],
  'a run holds at most one play per episode, so another run may play it again'
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

-- The insert grant names two columns, so a client can open a play in one of its
-- own runs and cannot write an ending or another account's id into the same
-- statement. `has_table_privilege` answers about the table, which is why the
-- whole-table INSERT reads false here.
SELECT ok(
  NOT (SELECT has_table_privilege('authenticated', 'public.episode_plays', 'INSERT'))
  AND (
    SELECT bool_and(
      has_column_privilege('authenticated', 'public.episode_plays', c, 'INSERT')
    )
    FROM unnest(ARRAY['episode_id', 'story_play_id']) AS c
  )
  AND NOT (
    SELECT bool_or(
      has_column_privilege('authenticated', 'public.episode_plays', c, 'INSERT')
    )
    FROM unnest(ARRAY[
      'user_id', 'ending_kind', 'ending_outcome', 'finished_at',
      'memory_choice', 'memory_relationship', 'memory_question'
    ]) AS c
  ),
  'a client may open a play in a run and may not write an ending or another owner into it'
);

SELECT function_privs_are(
  'public', 'finish_episode',
  ARRAY['uuid', 'uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'anon', ARRAY[]::text[], 'anon cannot record an ending'
);

SELECT function_privs_are(
  'public', 'finish_episode',
  ARRAY['uuid', 'uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'authenticated', ARRAY['EXECUTE'],
  'a signed-in user can record an ending'
);

-- The insert policy calls this, and a policy is evaluated with the caller's
-- privileges rather than the policy author's.
SELECT function_privs_are(
  'public', 'episode_is_current', ARRAY['uuid', 'uuid']::name[],
  'authenticated', ARRAY['EXECUTE'],
  'the start policy can ask whether an episode is the current one in a run'
);

SELECT function_privs_are(
  'public', 'episode_is_current', ARRAY['uuid', 'uuid']::name[],
  'anon', ARRAY[]::text[], 'anon cannot ask about anybody''s progress'
);

-- 어느 함수가 소유자 권한을 갖는지는 눈으로 읽히지 않으므로 여기에 고정한다.
-- `finish_episode`는 결말 열에 grant가 없어 소유자로 돌아야 하고,
-- `episode_is_current`는 호출자가 이미 읽을 수 있는 것만 읽으므로 그럴 필요가
-- 없다.
SELECT is_definer(
  'public', 'finish_episode',
  ARRAY['uuid', 'uuid', 'text', 'text', 'text', 'text', 'text', 'text']::name[],
  'only finish_episode runs with the privileges to write an ending'
);

SELECT isnt_definer(
  'public', 'episode_is_current', ARRAY['uuid', 'uuid']::name[],
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
  $$insert into public.episode_plays (story_play_id, episode_id)
    values (
      '1a000000-0000-4000-8000-000000000001',
      '11000000-0000-4000-8000-000000000001'
    )$$,
  'a person opens the first episode of a story in one of their runs'
);

SELECT is(
  (SELECT finished_at FROM public.episode_plays
   WHERE story_play_id = '1a000000-0000-4000-8000-000000000001'
     AND episode_id = '11000000-0000-4000-8000-000000000001'),
  NULL, 'an opened play carries no ending yet'
);

SELECT throws_ok(
  $$insert into public.episode_plays (story_play_id, episode_id)
    values (
      '1a000000-0000-4000-8000-000000000001',
      '11000000-0000-4000-8000-000000000003'
    )$$,
  '42501', NULL,
  'an episode cannot be opened before the one in front of it is finished'
);

-- 회차의 스토리와 다른 스토리의 화는 그 회차에 매달 수 없다.
SELECT throws_ok(
  $$insert into public.episode_plays (story_play_id, episode_id)
    values (
      '1a000000-0000-4000-8000-000000000001',
      '12000000-0000-4000-8000-000000000001'
    )$$,
  '42501', NULL,
  'an episode of another story cannot be hung on this run'
);

-- 남의 회차는 정책이 막는다. 그 회차는 읽히지도 않으므로 함수가 false를 답한다.
SELECT throws_ok(
  $$insert into public.episode_plays (story_play_id, episode_id)
    values (
      '1b000000-0000-4000-8000-000000000001',
      '11000000-0000-4000-8000-000000000001'
    )$$,
  '42501', NULL, 'a person cannot open a play inside somebody else''s run'
);

-- 열 단위 grant가 막으므로 정책까지 가지도 않는다.
SELECT throws_ok(
  $$insert into public.episode_plays (user_id, story_play_id, episode_id)
    values (
      '22222222-2222-4222-8222-222222222222',
      '1a000000-0000-4000-8000-000000000001',
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
      '1a000000-0000-4000-8000-000000000001'::uuid,
      '11000000-0000-4000-8000-000000000001'::uuid,
      '성공', '새 아이스 아메리카노를 받아냈다.',
      '바꿔 달라고 다시 말했다.'
    )),
  true,
  'the play that is already open can be finished'
);

SELECT is(
  (SELECT ending_kind FROM public.episode_plays
   WHERE story_play_id = '1a000000-0000-4000-8000-000000000001'
     AND episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'the ending is stored as it was judged'
);

SELECT isnt(
  (SELECT finished_at FROM public.episode_plays
   WHERE story_play_id = '1a000000-0000-4000-8000-000000000001'
     AND episode_id = '11000000-0000-4000-8000-000000000001'),
  NULL, 'and the play is closed from that moment'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '1a000000-0000-4000-8000-000000000001'::uuid,
      '11000000-0000-4000-8000-000000000003'::uuid,
      '성공', '건너뛴 화.'
    )$$,
  '22023', NULL,
  'an episode cannot be finished before the one in front of it'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '1b000000-0000-4000-8000-000000000001'::uuid,
      '11000000-0000-4000-8000-000000000001'::uuid,
      '성공', '남의 회차.'
    )$$,
  '22023', NULL,
  'an ending cannot be written into somebody else''s run'
);

SELECT is(
  (select public.finish_episode(
      '1a000000-0000-4000-8000-000000000001'::uuid,
      '11000000-0000-4000-8000-000000000001'::uuid,
      '실패', '다시 쓴 결말.'
    )),
  false,
  'recording the same episode again reports that it lost the race'
);

SELECT is(
  (SELECT ending_kind FROM public.episode_plays
   WHERE story_play_id = '1a000000-0000-4000-8000-000000000001'
     AND episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'and it does not overwrite the ending that already happened'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '1a000000-0000-4000-8000-000000000001'::uuid,
      '11000000-0000-4000-8000-000000000002'::uuid,
      '보류', '없는 결말.'
    )$$,
  '23514', NULL, 'an ending outside the three words is refused'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '1a000000-0000-4000-8000-000000000001'::uuid,
      '11000000-0000-4000-8000-000000000002'::uuid,
      '성공', '   '
    )$$,
  '23514', NULL, 'an ending with no outcome line is refused'
);

SELECT throws_ok(
  $$select public.finish_episode(
      '1a000000-0000-4000-8000-000000000001'::uuid,
      '11999999-9999-4999-8999-999999999999'::uuid,
      '성공', '없는 화.'
    )$$,
  '22023', NULL, 'an unknown episode id is refused'
);

-- 플레이를 열지 않은 채 결말이 도착해도 같은 한 문장이 플레이를 만들며 닫는다.
SELECT lives_ok(
  $$select public.finish_episode(
      '1a000000-0000-4000-8000-000000000001'::uuid,
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
   WHERE story_play_id = '1a000000-0000-4000-8000-000000000001'
     AND episode_id = '11000000-0000-4000-8000-000000000002'),
  '카드가 막히자 더 싼 음료로 바꿨다.',
  'the story memory is stored with the ending'
);

SELECT is(
  (SELECT level FROM public.language_levels),
  '중급 초반. 짧은 문장을 쓰고 시제를 가끔 놓친다.',
  'the language level is stored for the account'
);

-- 같은 화를 다른 회차에서 다시 연다. 회차가 기준이 되면서 열리는 문이다.
SELECT lives_ok(
  $$insert into public.episode_plays (story_play_id, episode_id)
    values (
      '1a000000-0000-4000-8000-000000000002',
      '11000000-0000-4000-8000-000000000001'
    )$$,
  'the same episode opens again in a second run of the same story'
);

SELECT throws_ok(
  $$insert into public.episode_plays (story_play_id, episode_id)
    values (
      '1a000000-0000-4000-8000-000000000002',
      '11000000-0000-4000-8000-000000000002'
    )$$,
  '42501', NULL,
  'the second run does not inherit the first run''s finished episodes'
);

SELECT is(
  (select public.finish_episode(
      '1a000000-0000-4000-8000-000000000002'::uuid,
      '11000000-0000-4000-8000-000000000001'::uuid,
      '실패', '이번에는 그냥 받아 나왔다.',
      '아무 말도 못 하고 나왔다.'
    )),
  true,
  'the second run reaches its own ending for the same episode'
);

SELECT results_eq(
  $$select ending_kind, memory_choice
    from public.episode_plays
    where episode_id = '11000000-0000-4000-8000-000000000001'
    order by story_play_id$$,
  $$values
    ('성공'::text, '바꿔 달라고 다시 말했다.'::text),
    ('실패'::text, '아무 말도 못 하고 나왔다.'::text)$$,
  'each run keeps its own ending and story memory for the same episode'
);

SELECT throws_ok(
  $$insert into public.episode_plays (story_play_id, episode_id)
    values (
      '1a000000-0000-4000-8000-000000000002',
      '11000000-0000-4000-8000-000000000001'
    )$$,
  '23505', NULL, 'the same episode cannot be opened twice inside one run'
);

SELECT lives_ok(
  $$select public.finish_episode(
      '1a000000-0000-4000-8000-000000000001'::uuid,
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

SELECT lives_ok(
  $$select public.finish_episode(
      '1a000000-0000-4000-8000-000000000001'::uuid,
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
      '1a000000-0000-4000-8000-000000000001'::uuid,
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

-- 첫 회차의 네 화와 둘째 회차의 한 화.
SELECT is(
  (SELECT count(*) FROM public.episode_plays), 5::bigint,
  'the player sees all of their plays across both runs'
);

-- 앞의 네 화가 끝났으므로 첫 회차의 5화는 이제 열 수 있다.
SELECT lives_ok(
  $$insert into public.episode_plays (story_play_id, episode_id)
    values (
      '1a000000-0000-4000-8000-000000000001',
      '11000000-0000-4000-8000-000000000005'
    )$$,
  'the next episode opens once every earlier one in that run is finished'
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
      '1b000000-0000-4000-8000-000000000001'::uuid,
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
   WHERE story_play_id = '1a000000-0000-4000-8000-000000000001'
     AND episode_id = '11000000-0000-4000-8000-000000000001'),
  '성공', 'the first account''s ending is untouched by the second'
);

SELECT * FROM finish();
ROLLBACK;
