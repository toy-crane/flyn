-- public.story_runs의 공개 범위와, 최근 대화 순서를 무엇이 움직이는지 확인한다.
--
-- 회차는 사람이 연다. 지킬 규칙은 "내 이름으로 여는가" 하나뿐이라, 정책도 그
-- 한 줄이다. 대신 시각을 쓰는 길은 좁다. `last_user_message_at`은 사용자
-- 메시지가 앉을 때 트리거가 밀고, 클라이언트는 그 열에 닿지 못한다. 기록을 열어
-- 보는 것만으로 스토리 탭의 순서가 바뀌지 않는다는 약속이 그 좁은 길에서 나온다.
BEGIN;
SELECT plan(22);

INSERT INTO auth.users (id, email)
VALUES
  ('11111111-1111-4111-8111-111111111111', 'run-a@example.test'),
  ('22222222-2222-4222-8222-222222222222', 'run-b@example.test');

SELECT has_table('public', 'story_runs', 'public.story_runs exists');

SELECT col_is_pk(
  'public', 'story_runs', ARRAY['id'],
  'a run has a stable key its plays hang from'
);

SELECT col_is_unique(
  'public', 'story_runs', ARRAY['id', 'user_id'],
  'the pair a play carries is unique, so a play cannot claim another owner'
);

SELECT ok(
  (SELECT relrowsecurity FROM pg_class WHERE oid = 'public.story_runs'::regclass),
  'row level security is enabled'
);

SELECT policies_are(
  'public', 'story_runs',
  ARRAY['story_runs_select_own', 'story_runs_start_own'],
  'a person may read their own runs and start one, and nothing else'
);

SELECT ok(
  NOT (
    SELECT bool_or(has_table_privilege('anon', 'public.story_runs', p))
    FROM unnest(ARRAY['SELECT', 'INSERT', 'UPDATE', 'DELETE']) AS p
  ),
  'anon cannot reach story_runs through the Data API'
);

SELECT ok(
  (SELECT has_table_privilege('authenticated', 'public.story_runs', 'SELECT'))
  AND NOT (
    SELECT bool_or(has_table_privilege('authenticated', 'public.story_runs', p))
    FROM unnest(ARRAY['UPDATE', 'DELETE']) AS p
  ),
  'authenticated may read runs and neither rewrite nor remove one'
);

-- 회차 삭제와 이름 변경은 제품에서 제외한 기능이다. UPDATE 권한이 없으므로
-- `last_user_message_at`을 클라이언트가 고쳐 순서를 앞당길 길도 함께 닫힌다.
SELECT ok(
  NOT (SELECT has_table_privilege('authenticated', 'public.story_runs', 'INSERT'))
  AND (
    SELECT has_column_privilege(
      'authenticated', 'public.story_runs', 'story_id', 'INSERT'
    )
  )
  AND NOT (
    SELECT bool_or(
      has_column_privilege('authenticated', 'public.story_runs', c, 'INSERT')
    )
    FROM unnest(ARRAY[
      'id', 'user_id', 'started_at', 'last_user_message_at'
    ]) AS c
  ),
  'a client may name only the story, so it cannot choose its own recency'
);

SELECT is_definer(
  'public', 'touch_story_run', ARRAY[]::name[],
  'the trigger writes a column no role may write, so it runs as owner'
);

SELECT function_privs_are(
  'public', 'touch_story_run', ARRAY[]::name[],
  'authenticated', ARRAY[]::text[],
  'and nobody may call it directly'
);

SET LOCAL ROLE anon;

SELECT throws_ok(
  $$select * from public.story_runs$$,
  '42501', NULL, 'anon cannot read anyone''s runs'
);

RESET ROLE;

SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"11111111-1111-4111-8111-111111111111","role":"authenticated"}';

SELECT lives_ok(
  $$insert into public.story_runs (story_id)
    values ('10000000-0000-4000-8000-000000000001')$$,
  'a person starts a run by naming the story'
);

SELECT is(
  (SELECT last_user_message_at FROM public.story_runs), NULL,
  'a new run has not been spoken in yet, so it carries no recency'
);

-- 같은 스토리를 다시 시작한다. 앞의 회차를 지우거나 덮어쓰지 않는다.
SELECT lives_ok(
  $$insert into public.story_runs (story_id)
    values ('10000000-0000-4000-8000-000000000001')$$,
  'the same story starts again beside the run that is already there'
);

SELECT is(
  (SELECT count(*) FROM public.story_runs), 2::bigint,
  'and both runs stand'
);

SELECT throws_ok(
  $$insert into public.story_runs (user_id, story_id)
    values (
      '22222222-2222-4222-8222-222222222222',
      '10000000-0000-4000-8000-000000000001'
    )$$,
  '42501', NULL, 'a person cannot start a run in somebody else''s name'
);

-- 사용자 메시지가 앉으면 그 회차의 최근 대화 시각이 밀린다. 상대의 장면은
-- 밀지 않는다.
RESET ROLE;

-- 소유자 권한으로 도는 문장이라 RLS가 걸리지 않는다. 이 계정의 회차로 좁히지
-- 않으면 데이터베이스에 이미 있던 남의 회차를 골라 엉뚱한 곳에 플레이를 매단다.
INSERT INTO public.episode_plays (id, user_id, run_id, episode_id)
SELECT
  '1c000000-0000-4000-8000-000000000001',
  '11111111-1111-4111-8111-111111111111',
  run.id,
  '11000000-0000-4000-8000-000000000001'
FROM public.story_runs run
WHERE run.user_id = '11111111-1111-4111-8111-111111111111'
ORDER BY run.started_at
LIMIT 1;

SET LOCAL ROLE authenticated;

SELECT lives_ok(
  $$insert into public.episode_messages (id, play_id, role, parts)
    values (
      '1d000000-0000-4000-8000-000000000001',
      '1c000000-0000-4000-8000-000000000001',
      'assistant',
      '[{"type":"text","text":"Mia가 웃는다."}]'::jsonb
    )$$,
  'the scene the app did not write lands in the record'
);

SELECT is(
  (SELECT last_user_message_at FROM public.story_runs
   WHERE id = (SELECT run_id FROM public.episode_plays
               WHERE id = '1c000000-0000-4000-8000-000000000001')),
  NULL,
  'and a scene alone does not make the story recent'
);

SELECT lives_ok(
  $$insert into public.episode_messages (id, play_id, role, parts)
    values (
      '1d000000-0000-4000-8000-000000000002',
      '1c000000-0000-4000-8000-000000000001',
      'user',
      '[{"type":"text","text":"Can I change my drink?"}]'::jsonb
    )$$,
  'the person says something'
);

SELECT is(
  (SELECT last_user_message_at FROM public.story_runs
   WHERE id = (SELECT run_id FROM public.episode_plays
               WHERE id = '1c000000-0000-4000-8000-000000000001')),
  (SELECT created_at FROM public.episode_messages
   WHERE id = '1d000000-0000-4000-8000-000000000002'),
  'and that moment becomes the run''s place in the recent list'
);

-- 다른 회차는 움직이지 않았다. 한 회차에서 말한 것이 다른 회차의 순서를 바꾸지
-- 않는다.
SELECT is(
  (SELECT count(*) FROM public.story_runs WHERE last_user_message_at IS NULL),
  1::bigint,
  'the other run of the same story is left where it was'
);

SET LOCAL request.jwt.claims TO '{"sub":"22222222-2222-4222-8222-222222222222","role":"authenticated"}';

SELECT is(
  (SELECT count(*) FROM public.story_runs), 0::bigint,
  'another account sees none of those runs'
);

SELECT * FROM finish();
ROLLBACK;
